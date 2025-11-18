// ==> 2024-10-02 - REMOVED NAVIGATION BUTTONS
// Builtin modules
import { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react'
import { View, ImageBackground, TouchableOpacity } from 'react-native'
import { useTheme, Text, Card, Chip, Divider, ActivityIndicator } from 'react-native-paper'
import { useMutation, gql, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useMe } from '../../../../context/hooks/userQH'
import { DataContext } from '../../../../context/DataContext'
import { getFormatedTime } from '../../../../globals/functions/functions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { useRouter } from 'expo-router'

// Global variables
import { API_URL } from '../../../../globals/variables/globalVariables'

// Fallback placeholder image
const DEFAULT_PLACEHOLDER = `${API_URL}uploads/ctrla-icon.png`

// Fallback color mappings for risk and solution dots
const colors = {
  risk: {
    0: '#FF0000', // Red for high risk (e.g., Dangerous)
    1: '#FFA500', // Orange for medium risk
    2: '#008000', // Green for low risk
    null: '#808080' // Gray for unknown
  },
  solution: {
    0: '#FF0000', // Red for critical solution (e.g., Pending action)
    1: '#FFA500', // Orange for moderate solution
    2: '#008000', // Green for resolved
    null: '#808080' // Gray for unknown
  }
}

// Fallback SkeletonCard component
const SkeletonCard = () => {
  const theme = useTheme()
  return (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <ActivityIndicator size='large' color={theme.colors.primary} />
    </View>
  )
}

const newNotificationM = gql`
mutation newNotification(
  $idUser: ID!, $idEmployee: ID!, $firstName: String!, $secondName: String!, $lastName: String!,
  $secondLastName: String!, $nickName: String!, $email: String!, $phone: String!, $companyName: String!,
  $idCompanyBusinessUnit: ID!, $companyBusinessUnitDescription: String!, $idCompanySector: ID!,
  $companySectorDescription: String!, $idcompanyJobRole: ID!, $companyJobRoleDescription: String!,
  $notificationTitle: String!, $notificationDescription: String!, $token: String!, $dateStamp: String!
) {
  newNotification(
    idUser: $idUser, idEmployee: $idEmployee, firstName: $firstName, secondName: $secondName,
    lastName: $lastName, secondLastName: $secondLastName, nickName: $nickName, email: $email,
    phone: $phone, companyName: $companyName, idCompanyBusinessUnit: $idCompanyBusinessUnit,
    companyBusinessUnitDescription: $companyBusinessUnitDescription, idCompanySector: $idCompanySector,
    companySectorDescription: $companySectorDescription, idcompanyJobRole: $idcompanyJobRole,
    companyJobRoleDescription: $companyJobRoleDescription, notificationTitle: $notificationTitle,
    notificationDescription: $notificationDescription, token: $token, dateStamp: $dateStamp
  ) {
    idNotification
    idUser
    dateStamp
    notificationTitle
    notificationDescription
    token
  }
}
`

const myLastNotificationQ = gql`
query MyLastNotification {
  myLastNotification {
    idNotification
  }
}
`

const getSignedUrlFromCacheQ = gql`
mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
  getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
    signedUrl
  }
}
`

const TicketCard = ({ item }) => {
  const theme = useTheme()
  const router = useRouter()
  const [getURL] = useMutation(getSignedUrlFromCacheQ)
  const [loaded, setLoaded] = useState(false)
  const [imageKeys, setImageKeys] = useState([])

  // Array of placeholder images
  const placeholders = [DEFAULT_PLACEHOLDER] // Use default placeholder; add more if defined

  // Memoized random placeholder
  const randomPlaceholder = useMemo(() => {
    return placeholders[Math.floor(Math.random() * placeholders.length)]
  }, [])

  // Custom date formatting function for dd/mm/yyyy hh:mm
  const formatDateTime = useCallback((timestamp) => {
    if (!timestamp && timestamp !== 0) return 'N/A'
    const date = new Date(Number(timestamp))
    if (isNaN(date.getTime())) return 'Invalid Date'
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }, [])

  useEffect(() => {
    const fetchImages = async () => {
      const temp = []
      let result
      if (item.result?.ticketImage1) {
        result = await getURL({ variables: { idSiMMediaURL: item.result.ticketImage1.split('/').pop() } })
        if (result?.data?.getSignedUrlFromCache?.signedUrl) {
          temp.push(result.data.getSignedUrlFromCache.signedUrl)
        }
      }
      if (item.result?.ticketImage2) {
        result = await getURL({ variables: { idSiMMediaURL: item.result.ticketImage2.split('/').pop() } })
        if (result?.data?.getSignedUrlFromCache?.signedUrl) {
          temp.push(result.data.getSignedUrlFromCache.signedUrl)
        }
      }
      if (item.result?.ticketImage3) {
        result = await getURL({ variables: { idSiMMediaURL: item.result.ticketImage3.split('/').pop() } })
        if (result?.data?.getSignedUrlFromCache?.signedUrl) {
          temp.push(result.data.getSignedUrlFromCache.signedUrl)
        }
      }
      setImageKeys(temp.length > 0 ? temp : [randomPlaceholder])
      setLoaded(true)
    }
    fetchImages()
  }, [item.result?.ticketImage1, item.result?.ticketImage2, item.result?.ticketImage3, getURL, randomPlaceholder])

  const renderImages = useCallback(() => {
    const imageStyle = {
      elevation: 2
    }

    if (imageKeys.length === 0) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <ImageBackground
            imageStyle={{ borderRadius: 10 }}
            style={{ ...imageStyle, width: 200, height: 305, borderRadius: 10 }}
            source={{ uri: randomPlaceholder }}
          />
        </View>
      )
    } else if (imageKeys.length === 1) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <ImageBackground
            imageStyle={{ borderRadius: 10 }}
            style={{ ...imageStyle, width: 200, height: 305, borderRadius: 10 }}
            source={{ uri: loaded ? imageKeys[0] : randomPlaceholder }}
          />
        </View>
      )
    } else if (imageKeys.length === 2) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, margin: 5 }}>
          <ImageBackground
            imageStyle={{ borderRadius: 10 }}
            style={{ ...imageStyle, width: 150, height: 305, borderRadius: 10 }}
            source={{ uri: loaded ? imageKeys[0] : randomPlaceholder }}
          />
          <ImageBackground
            imageStyle={{ borderRadius: 10 }}
            style={{ ...imageStyle, width: 150, height: 305, borderRadius: 10 }}
            source={{ uri: loaded ? imageKeys[1] : randomPlaceholder }}
          />
        </View>
      )
    } else {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <ImageBackground
            imageStyle={{ borderRadius: 10 }}
            style={{ ...imageStyle, width: 200, height: 305, borderRadius: 10 }}
            source={{ uri: loaded ? imageKeys[0] : randomPlaceholder }}
          />
          <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <ImageBackground
              imageStyle={{ borderRadius: 10 }}
              style={{ ...imageStyle, width: 100, height: 150, borderRadius: 10 }}
              source={{ uri: loaded ? imageKeys[1] : randomPlaceholder }}
            />
            <ImageBackground
              imageStyle={{ borderRadius: 10 }}
              style={{ ...imageStyle, width: 100, height: 150, borderRadius: 10 }}
              source={{ uri: loaded ? imageKeys[2] : randomPlaceholder }}
            />
          </View>
        </View>
      )
    }
  }, [imageKeys, loaded, randomPlaceholder])

  if (!loaded) {
    return <SkeletonCard />
  }

  return (
    <TouchableOpacity
      onPress={async () => {
        const nParams = item.result // Pass the entire item.result object
        nParams && router.navigate({ pathname: '/(drawer)/home/[event]', params: nParams })
      }}
    >
      <Card
        style={{
          borderRadius: 10,
          margin: 5
        }}
      >
        <Card.Title
          title={`${item.result?.classification || 'N/A'} - ${item.result?.classificationDescription || 'N/A'}`}
          titleStyle={{ fontWeight: 'bold', color: theme.colors.onBackground }}
          subtitle={item.result?.companySectorDescription || 'N/A'}
          subtitleStyle={{ color: theme.colors.onBackground }}
          right={() => (
            <Text variant='labelMedium' style={{ marginRight: 10, color: theme.colors.onBackground }}>
              {formatDateTime(item.result?.dateTimeEvent)}
            </Text>
          )}
        />
        <Card.Content>
          {renderImages()}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginVertical: 10,
              columnGap: 5
            }}
          >
            <Chip
              elevated
              compact
              textStyle={{ color: 'black' }}
              style={{
                backgroundColor:
                  item.result?.type === 'action'
                    ? theme.colors.primaryContainer
                    : theme.colors.secondaryContainer,
                width: 'auto'
              }}
            >
              {item.result?.type ? item.result.type.charAt(0).toUpperCase() + item.result.type.slice(1) : 'N/A'}
            </Chip>
            {item.risk.RiskDot !== null && (
              <Chip
                elevated
                compact
                textStyle={{ color: 'black' }}
                style={{ backgroundColor: colors.risk[item.risk.RiskDot], width: 'auto' }}
              >
                {item.result?.riskQualification || 'N/A'}
              </Chip>
            )}
            {item.risk.SolutionDot !== null && (
              <Chip
                elevated
                compact
                textStyle={{ color: 'black' }}
                style={{ backgroundColor: colors.solution[item.risk.SolutionDot], width: 'auto' }}
              >
                {item.result?.solutionType || 'N/A'}
              </Chip>
            )}
          </View>
          <Divider bold style={{ marginVertical: 10 }} />
          <Text style={{ marginBottom: 10, color: theme.colors.onBackground }} variant='bodyMedium'>
            {item.result?.ticketCustomDescription?.slice(0, 50) || 'No description'}...
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  )
}

const HomeBottomSheetModal = ({ visible, setVisible, sectorEvent }) => {
  const { t } = useTranslation('banner')
  const [addNewNotification] = useMutation(newNotificationM)
  const myLastNotification = useQuery(myLastNotificationQ, { fetchPolicy: 'network-only', pollInterval: 60 * 1000 })
  const [getSignedImageURL] = useMutation(getSignedUrlFromCacheQ)
  const [image, setImage] = useState(`${API_URL}uploads/ctrla-icon.png`)
  const theme = useTheme()
  const [noEventCondition, setNoEventCondition] = useState(true)
  const { data } = useContext(DataContext)
  const lastIdNotification = useRef(null)
  const { me } = useMe()
  const bottomSheetRef = useRef(null)

  // Snap points for bottom sheet
  const snapPoints = useMemo(() => ['30%', '75%'], [])

  // Map sectorEvent to TicketCard item structure
  const ticketItem = {
    result: sectorEvent,
    risk: {
      RiskDot: sectorEvent.riskQualification ? 0 : null,
      SolutionDot: sectorEvent.solutionType ? 0 : null
    }
  }

  let tempImg

  // Handle visibility changes
  useEffect(() => {
    if (bottomSheetRef.current) {
      if (visible) {
        bottomSheetRef.current.snapToIndex(1) // Open to 50% snap point
      } else {
        bottomSheetRef.current.close() // Close the sheet
      }
    }
  }, [visible])

  // Handle sheet changes
  const handleSheetChanges = (index) => {
    if (index === -1) setVisible(false) // Update visibility when sheet is closed
  }

  useEffect(() => {
    if (myLastNotification && !myLastNotification.error && !myLastNotification.loading) {
      if (lastIdNotification.current?.idNotification !== myLastNotification?.data?.myLastNotification?.idNotification) {
        lastIdNotification.current = {
          idNotification: myLastNotification?.data?.myLastNotification?.idNotification,
          idTicketNew: sectorEvent.idTicketNew
        }
      }
    }
  }, [myLastNotification, myLastNotification.loading])

  useEffect(() => {
    async function fetchSignedImg (file) {
      if (file === `${API_URL}uploads/ctrla-icon.png`) {
        setImage(file)
      } else {
        try {
          tempImg = await getSignedImageURL({ variables: { idSiMMediaURL: file } })
          if (tempImg && !tempImg.loading && !tempImg.error) {
            tempImg = tempImg?.data?.getSignedUrlFromCache.signedUrl
          }
        } catch (error) {
          tempImg = file
        }
        setImage(tempImg)
      }
    }
    if (sectorEvent === '' || Object.keys(sectorEvent).length === 0) {
      setNoEventCondition(true)
    } else {
      setNoEventCondition(false)
      if (sectorEvent.ticketImage1 !== '') {
        tempImg = sectorEvent.ticketImage1.split('/').pop()
      } else {
        tempImg = `${API_URL}uploads/ctrla-icon.png`
      }
    }
    fetchSignedImg(tempImg)
  }, [sectorEvent, image])

  useEffect(() => {
    const checkAndSendNotification = async () => {
      const storedTicketId = await AsyncStorage.getItem('lastNotifiedTicket')
      if (
        !noEventCondition &&
        sectorEvent?.idTicketNew &&
        storedTicketId !== sectorEvent.idTicketNew &&
        me &&
        me !== 'Loading...' &&
        me !== 'ApolloError' &&
        data &&
        image
      ) {
        const temp = { ...me, password: '****' }
        const tempVariables = {
          ...temp,
          notificationTitle: `${sectorEvent.classificationDescription} event...|${image}`,
          notificationDescription: t('notificationDescription', {
            sector: sectorEvent.companySectorDescription,
            time: getFormatedTime(sectorEvent.dateTimeEvent, false, true, true),
            risk: sectorEvent.riskQualification,
            solution: sectorEvent.solutionType,
            description: sectorEvent.ticketCustomDescription.slice(0, 300)
          }),
          dateStamp: sectorEvent.dateTimeEvent,
          token: data.tokenDevice
        }

        await addNewNotification({ variables: tempVariables })
        await AsyncStorage.setItem('lastNotifiedTicket', sectorEvent.idTicketNew)
      } else {
        console.log('Notificación ya enviada')
      }
    }

    checkAndSendNotification()
  }, [noEventCondition, lastIdNotification, image, me, data, sectorEvent?.idTicketNew, t])

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible && !noEventCondition ? 1 : -1} // Only open if visible and there’s an event
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor:
          sectorEvent.classification === 'PEI' || sectorEvent.classification === 'ARI'
            ? theme.colors.errorContainer
            : theme.colors.surfaceVariant
      }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurface }}
    >
      <BottomSheetView style={{ padding: 16, flex: 1 }}>
        {noEventCondition
          ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.onSurface }}>
                {t('noEvents')}
              </Text>
            </View>
            )
          : (
            <TicketCard item={ticketItem} />
            )}
      </BottomSheetView>
    </BottomSheet>
  )
}

export default HomeBottomSheetModal
