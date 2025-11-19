import React, { useState } from 'react'
import { View, ScrollView, Alert } from 'react-native'
import { Button, useTheme } from 'react-native-paper'
import NetInfo from '@react-native-community/netinfo'
import { useTranslation } from 'react-i18next'

// Custom modules
import CustomActivityIndicator from '../../../../../globals/components/CustomActivityIndicator'
import ActionConditionButton from './ActionConditionButton'
import CompanySectorDropdown from './CompanySectorDropdown'
import DateTimeDialog from './DateTimeDialog'
import EventDescription from './EventDescription'
import EventSubtype from './EventSubtype'
import EventClassification from './EventClassification'
import RiskQualification from './RiskQualification'
import SolutionState from './SolutionState'
import MediaGrid from './MediaGrid'
import { useRouter } from 'expo-router'

// Imports for save locally files and mutations when there are no connection available
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { gql, useMutation } from '@apollo/client'
import { cleanupCameraFiles } from '../../../../../globals/utils/cameraUtils'

// FIXED: Use consistent key without timestamp
const PENDING_UPLOADS_KEY = 'PendingTickets'

interface MediaFile {
  uri: string
  mimeType?: string
  name?: string
}

interface PendingTicketData {
  data: Record<string, unknown>
  files: MediaFile[]
  fromVoiceOffLine?: boolean
}

// Function to save files locally to cache directory (not gallery)
// SECURITY: Using cacheDirectory ensures files are not accessible via gallery
const saveFileLocally = async (
  file: MediaFile
): Promise<MediaFile | null> => {
  const filename = file.uri.split('/').pop()
  if (!filename) return null

  // Use cacheDirectory instead of documentDirectory for better privacy
  // Cache directory is app-private and system may clear it when needed
  const newPath = `${FileSystem.cacheDirectory}${filename}`

  try {
    // If file is already in cache, no need to copy
    if (file.uri.startsWith(FileSystem.cacheDirectory || '')) {
      const fileInfo = await FileSystem.getInfoAsync(file.uri, { size: true })
      return {
        uri: file.uri,
        name: filename,
        mimeType: file.mimeType || null,
        size: fileInfo.size || null,
        filename: file.uri,
        lastModified: fileInfo.modificationTime || null
      } as MediaFile
    }

    // Copy to cache directory
    await FileSystem.copyAsync({ from: file.uri, to: newPath })

    const fileInfo = await FileSystem.getInfoAsync(newPath, { size: true })

    // Try to delete original if it's not in cache (security measure)
    try {
      if (!file.uri.startsWith(FileSystem.cacheDirectory || '')) {
        await FileSystem.deleteAsync(file.uri, { idempotent: true })
      }
    } catch (deleteError) {
      // Ignore deletion errors - file might be in system location
      console.warn('Could not delete original file:', deleteError)
    }

    return {
      uri: newPath,
      name: filename,
      mimeType: file.mimeType || null,
      size: fileInfo.size || null,
      filename: newPath,
      lastModified: fileInfo.modificationTime || null
    } as MediaFile
  } catch (error) {
    console.error('Error saving file locally:', error)
    return null
  }
}

// Save a pending ticket to AsyncStorage
const savePendingTicket = async (ticketData: PendingTicketData): Promise<void> => {
  try {
    const existingTickets = await AsyncStorage.getItem(PENDING_UPLOADS_KEY)
    const pendingTickets: PendingTicketData[] = existingTickets
      ? JSON.parse(existingTickets)
      : []
    pendingTickets.push(ticketData)
    await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pendingTickets))
  } catch (error) {
    console.error('Error saving pending ticket:', error)
  }
}

const addNewTicketNewM = gql`
  mutation AddNewTicketNew(
    $idUser: ID!
    $type: String!
    $companyName: String!
    $companyBusinessUnitDescription: String!
    $companySectorDescription: String!
    $dateTimeEvent: String!
    $classification: String!
    $classificationDescription: String!
    $subType: String!
    $riskQualification: String!
    $ticketCustomDescription: String!
    $ticketImage1: String
    $ticketImage2: String
    $ticketImage3: String
    $ticketImage4: String
    $ticketVideo: String
    $ticketSolved: Boolean!
    $ticketLike: Int!
    $injuredPeople: Int!
    $lostProduction: Int!
    $lostProductionTotalTimeDuration: Int!
    $ticketClosed: Boolean!
    $solutionType: String
    $costAsociated: Int
  ) {
    addNewTicketNew(
      idUser: $idUser
      type: $type
      companyName: $companyName
      companyBusinessUnitDescription: $companyBusinessUnitDescription
      companySectorDescription: $companySectorDescription
      dateTimeEvent: $dateTimeEvent
      classification: $classification
      classificationDescription: $classificationDescription
      subType: $subType
      riskQualification: $riskQualification
      ticketCustomDescription: $ticketCustomDescription
      ticketImage1: $ticketImage1
      ticketImage2: $ticketImage2
      ticketImage3: $ticketImage3
      ticketImage4: $ticketImage4
      ticketVideo: $ticketVideo
      ticketSolved: $ticketSolved
      ticketLike: $ticketLike
      injuredPeople: $injuredPeople
      lostProduction: $lostProduction
      lostProductionTotalTimeDuration: $lostProductionTotalTimeDuration
      ticketClosed: $ticketClosed
      solutionType: $solutionType
      costAsociated: $costAsociated
    ) {
      idTicketNew
      idUser
      type
      companyName
      companySectorDescription
      dateTimeEvent
      classification
      classificationDescription
      subType
      riskQualification
      ticketCustomDescription
    }
  }
`

interface ReportEventProps {
  defaultValues: string | Record<string, unknown>
  name?: string
}

export default function ReportEvent({ defaultValues, name }: ReportEventProps): React.JSX.Element {
  const { t } = useTranslation('report')
  const theme = useTheme()
  const router = useRouter()
  const [addNewTicketNew] = useMutation(addNewTicketNewM)

  // Parse default values - handle both string and object
  let parsedDefaults: Record<string, unknown>
  try {
    parsedDefaults = typeof defaultValues === 'string' ? JSON.parse(defaultValues) : defaultValues
  } catch (error) {
    console.error('Error parsing defaultValues:', error)
    parsedDefaults = {}
  }

  const {
    me,
    allRiskQualifications,
    allTicketNewClassification,
    allTicketNewSubType,
    myCompanySectors,
    allSolutionsStates
  } = parsedDefaults as {
    me?: Record<string, unknown>
    allRiskQualifications?: unknown[]
    allTicketNewClassification?: unknown[]
    allTicketNewSubType?: unknown[]
    myCompanySectors?: unknown[]
    allSolutionsStates?: unknown[]
  }

  // Form state
  const [riskQualification, setRiskQualification] = useState<string | undefined>(undefined)
  const [eventType, setEventType] = useState<string | undefined>(undefined)
  const [companySector, setCompanySector] = useState<string | undefined>(undefined)
  const [dateTimeEvent, setDateTimeEvent] = useState<Date>(new Date())
  const [eventSubType, setEventSubType] = useState<string | undefined>(undefined)
  const [eventClassification, setEventClassification] = useState<string | undefined>(undefined)
  const [image1, setImage1] = useState<MediaFile | undefined>(undefined)
  const [image2, setImage2] = useState<MediaFile | undefined>(undefined)
  const [image3, setImage3] = useState<MediaFile | undefined>(undefined)
  const [video, setVideo] = useState<MediaFile | undefined>(undefined)
  const [description, setDescription] = useState<string | undefined>(undefined)
  const [solutionState, setSolutionState] = useState<string | undefined>(undefined)

  const [load, setLoad] = useState<boolean>(false)

  const handleSubmit = async (): Promise<void> => {
    // Validate all required fields
    if (
      !eventClassification ||
      !eventSubType ||
      !riskQualification ||
      !eventType ||
      !description ||
      !solutionState ||
      !companySector
    ) {
      Alert.alert(t('alerts.warning'), t('alerts.incompleteForm'), [
        {
          text: t('alerts.cancel'),
          style: 'cancel'
        }
      ])
      return
    }

    setLoad(true)

    try {
      // FIXED: Check network before attempting upload
      const netInfo = await NetInfo.fetch()
      const isOnline = netInfo.isConnected && netInfo.isInternetReachable

      // FIXED: Parallelize file saving
      const mediaPromises: Promise<MediaFile | null>[] = []
      if (image1) mediaPromises.push(saveFileLocally(image1))
      if (image2) mediaPromises.push(saveFileLocally(image2))
      if (image3) mediaPromises.push(saveFileLocally(image3))
      if (video) mediaPromises.push(saveFileLocally(video))

      const mediaPaths = (await Promise.all(mediaPromises)).filter(
        (file): file is MediaFile => file !== null
      )

      // FIXED: Safer classification parsing
      const getClassificationParts = (classification: string): { code: string; description: string } => {
        if (!classification || classification.length < 5) {
          return { code: '', description: classification || '' }
        }
        return {
          code: classification.slice(0, 1),
          description: classification.slice(4)
        }
      }

      const { code: classificationCode, description: classificationDescription } =
        getClassificationParts(eventClassification || '')

      const meData = me as { idUser?: string; companyName?: string; companyBusinessUnitDescription?: string }
      
      const ticketData = {
        idUser: meData?.idUser || '',
        type: eventType || '',
        companyName: meData?.companyName || '',
        companyBusinessUnitDescription: meData?.companyBusinessUnitDescription || '',
        companySectorDescription: companySector || '',
        dateTimeEvent: dateTimeEvent.toISOString(),
        classification: classificationCode,
        classificationDescription,
        subType: eventSubType || '',
        riskQualification: riskQualification || '',
        ticketCustomDescription: description || '',
        ticketSolved: false,
        ticketLike: 0,
        ticketImage1: image1?.uri || '',
        ticketImage2: image2?.uri || '',
        ticketImage3: image3?.uri || '',
        ticketImage4: '',
        ticketVideo: video?.uri || '',
        injuredPeople: 0,
        lostProduction: 0,
        lostProductionTotalTimeDuration: 0,
        ticketClosed: false,
        solutionType: solutionState || '',
        costAsociated: 0
      }

      if (isOnline) {
        // Try to upload immediately
        try {
          await addNewTicketNew({
            variables: ticketData
          })
          
          // SECURITY: Clean up temporary camera files after successful upload
          const fileUris = mediaPaths.map(f => f.uri).filter(Boolean)
          if (fileUris.length > 0) {
            await cleanupCameraFiles(fileUris)
          }
          
          Alert.alert(t('alerts.success'), t('alerts.submitSuccess'))
          router.back()
        } catch (error) {
          console.error('Error uploading ticket:', error)
          // Fall through to save offline (don't cleanup yet - files needed for later upload)
          await savePendingTicket({
            data: ticketData,
            files: mediaPaths,
            fromVoiceOffLine: false
          })
          Alert.alert(
            t('alerts.savedOffline'),
            t('alerts.offlineMessage')
          )
          router.back()
        }
      } else {
        // Save offline (don't cleanup - files needed for later upload)
        await savePendingTicket({
          data: ticketData,
          files: mediaPaths,
          fromVoiceOffLine: false
        })
        Alert.alert(
          t('alerts.savedOffline'),
          t('alerts.offlineMessage')
        )
        router.back()
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      Alert.alert(t('alerts.error'), t('alerts.saveError'))
    } finally {
      setLoad(false)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView nestedScrollEnabled>
        <View style={{ rowGap: 30, marginHorizontal: 15, marginTop: 25, marginBottom: 60 }}>
          <CustomActivityIndicator visible={load} />
          <ActionConditionButton
            eventType={eventType}
            setEventType={setEventType}
            fromAIReport={false}
          />
          <EventClassification
            allTicketNewClassification={allTicketNewClassification}
            setEventClassification={setEventClassification}
            eventType={eventType}
            fromAIReport={false}
            eventClassificationValue={eventClassification}
          />
          <CompanySectorDropdown
            myCompanySectors={myCompanySectors}
            setCompanySector={setCompanySector}
            companySectorValue={companySector}
            fromAIReport={false}
          />
          <DateTimeDialog
            dateTimeEvent={dateTimeEvent}
            setDateTimeEvent={setDateTimeEvent}
            isIAEvent={false}
          />
          <EventSubtype
            allTicketNewSubType={allTicketNewSubType}
            setEventSubType={setEventSubType}
            eventSubTypeValue={eventSubType}
            fromAIReport={false}
          />
          <EventDescription
            setDescription={setDescription}
            descriptionValue={description}
            fromAIReport={false}
          />
          <RiskQualification
            allRiskQualifications={allRiskQualifications}
            setRiskQualification={setRiskQualification}
            riskQualificationValue={riskQualification}
            fromAIReport={false}
          />
          <SolutionState
            allSolutionsStates={allSolutionsStates}
            SetSolutionState={setSolutionState}
            solutionStateValue={solutionState}
            fromAIReport={false}
          />
          <MediaGrid
            image1={image1}
            setImage1={setImage1}
            image2={image2}
            setImage2={setImage2}
            image3={image3}
            setImage3={setImage3}
            video={video}
            setVideo={setVideo}
            netState={undefined}
          />
          <Button
            mode='contained'
            onPress={handleSubmit}
            style={{ padding: 5, marginTop: 30, backgroundColor: theme.colors.primary }}
            disabled={load}
            compact
          >
            Submit
          </Button>
        </View>
      </ScrollView>
    </View>
  )
}

