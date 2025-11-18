// Builtin modules
/* eslint-disable import/namespace */
import { useState } from 'react'
import { View, ScrollView, Alert } from 'react-native'
import { Button, useTheme } from 'react-native-paper'

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
import ImageVideo from './ImageVideo'
import { useRouter } from 'expo-router'
import CameraComponent from './CameraComponent'

// Imports for save locally files and mutations when there are no connection available
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'

const PENDING_UPLOADS_KEY = 'PendingTickets-' + Date.now().toString()

// Función para guardar archivos localmente
const saveFileLocally = async (file) => {
  const filename = file.uri.split('/').pop()
  const newPath = `${FileSystem.documentDirectory}${filename}`

  try {
    await FileSystem.copyAsync({ from: file.uri, to: newPath })

    const fileInfo = await FileSystem.getInfoAsync(newPath, { size: true })

    return {
      uri: newPath,
      name: filename,
      mimeType: file.mimeType || null,
      size: fileInfo.size || null,
      filename: newPath,
      // Puedes agregar otras propiedades si sabés que están en el original
      lastModified: fileInfo.modificationTime || null
    }
  } catch (error) {
    console.log('Error saving file locally:', error)
    return null
  }
}

// Guardar un ticket pendiente en AsyncStorage
const savePendingTicket = async (ticketData) => {
  // console.log('ticketData\n', ticketData)
  try {
    const pendingTickets = JSON.parse(await AsyncStorage.getItem(PENDING_UPLOADS_KEY)) || []
    pendingTickets.push(ticketData)
    await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pendingTickets))
  } catch (error) {
    console.log('Error saving pending ticket:', error)
  }
}

export default function ReportEvent (args) {
  const theme = useTheme()
  let { defaultValues } = args
  // const { ticketsAcount, name } = args
  const { name } = args
  defaultValues = JSON.parse(defaultValues)
  const {
    me, // Para saber a donde pertenezco y por lo tanto a quien notificar
    // myBusinessUnitsCompany, // Para, eventualmente, seleccionar a que unidad de negocio notificar... puede que esté al pedo
    allRiskQualifications,
    allTicketNewClassification,
    allTicketNewSubType,
    myCompanySectors,
    allSolutionsStates
  } = defaultValues
  const router = useRouter()
  // Armado de los useState para leer y setear el valor seleccionado de cada componente
  const [riskQualification, setRiskQualification] = useState(undefined)
  const [eventType, setEventType] = useState(undefined) // undefined para saber cuando no se seleccionó nada
  const [companySector, setCompanySector] = useState(undefined)
  const [dateTimeEvent, setDateTimeEvent] = useState(new Date())
  const [eventSubType, setEventSubType] = useState(undefined)
  const [eventClassification, setEventClassification] = useState(undefined)
  const [image1, setImage1] = useState('')
  const [image2, setImage2] = useState('')
  const [image3, setImage3] = useState('')
  const [video, SetVideo] = useState(undefined)
  const [description, setDescription] = useState(undefined)
  const [solutionState, SetSolutionState] = useState(undefined)

  // Armo un estado load para saber cuando se está subiendo información
  const [load, setLoad] = useState(false)

  // Estado para saber si se activó la camara o no
  const [isCameraActive, setIsCameraActive] = useState(false)

  // Estado para saber desde la cámara nueva, cual SetImage usar
  const [cameraSelected, setCameraSelected] = useState(1)

  const handleSubmit = async () => {
    // Primero hay que validar que estén todos los datos llenados en el formulario

    if (!eventClassification || !eventSubType || !riskQualification || !eventType || !description || !solutionState || !companySector) {
      Alert.alert('Warning!', 'Please complete all the information needed.', [
        {
          text: 'Cancel ⛔',
          style: 'cancel'
        }
      ], 'cancelable')
      return
    }
    setLoad(true) // Colocamos el estado de carga en true

    // Segundo hay que guardar localmente los archivos que se cargaron
    const mediaPaths = []
    if (image1) mediaPaths.push(await saveFileLocally(image1))
    if (image2) mediaPaths.push(await saveFileLocally(image2))
    if (image3) mediaPaths.push(await saveFileLocally(image3))
    if (video) mediaPaths.push(await saveFileLocally(video))

    const ticketData = {
      idUser: me.idUser,
      type: eventType,
      companyName: me.companyName,
      companyBusinessUnitDescription: me.companyBusinessUnitDescription,
      companySectorDescription: companySector,
      dateTimeEvent,
      classification: eventClassification.slice(0, 1),
      classificationDescription: eventClassification.slice(4),
      subType: eventSubType,
      riskQualification,
      ticketCustomDescription: description,
      ticketSolved: false,
      ticketLike: 0,
      ticketImage1: image1,
      ticketImage2: image2,
      ticketImage3: image3,
      ticketImage4: '',
      ticketVideo: video || '',
      injuredPeople: 0,
      lostProduction: 0,
      lostProductionTotalTimeDuration: 0,
      ticketClosed: false,
      solutionType: solutionState,
      costAsociated: 0
    }
    // Acá vamos a agregar {fromVoiceOffLine: false}, después en el "watchNewTickets" servirá para saber como subirlo
    await savePendingTicket({ data: ticketData, files: mediaPaths, fromVoiceOffLine: false })
    Alert.alert(`📢 Well done ${name}!`, `You successfully helped ${me.companyName} with safety.`)

    router.navigate({ pathname: 'report' })

    setLoad(false)
  }

  // console.log('eventType', eventType)
  let seterSelected = null
  let modeSelected = 'picture'
  if (isCameraActive) {
    switch (cameraSelected) {
      case 1:
        seterSelected = setImage1
        break
      case 2:
        seterSelected = setImage2
        break
      case 3:
        seterSelected = setImage3
        break
      case 4:
        modeSelected = 'video'
        seterSelected = SetVideo
        break
    }
  }

  return (
    <ScrollView nestedScrollEnabled>
      <View style={{ rowGap: 30, marginHorizontal: 15, marginTop: 25, marginBottom: 60 }}>
        <ActionConditionButton setEventType={setEventType} eventType={eventType} />

        <EventClassification allTicketNewClassification={allTicketNewClassification} setEventClassification={setEventClassification} eventType={eventType} />

        <CompanySectorDropdown myCompanySectors={myCompanySectors} setCompanySector={setCompanySector} />

        <DateTimeDialog dateTimeEvent={dateTimeEvent} setDateTimeEvent={setDateTimeEvent} />

        <EventSubtype allTicketNewSubType={allTicketNewSubType} setEventSubType={setEventSubType} />

        {isCameraActive
          ? (
            <CameraComponent mode={modeSelected} setImageVideo={seterSelected} setIsCameraActive={setIsCameraActive} isCameraActive={isCameraActive} />
            )
          : (
            <ImageVideo setImage1={setImage1} setImage2={setImage2} setImage3={setImage3} setVideo={SetVideo} image1={image1} image2={image2} image3={image3} video={video} setIsCameraActive={setIsCameraActive} isCameraActive={isCameraActive} setCameraSelected={setCameraSelected} />
            )}

        <EventDescription setDescription={setDescription} />

        <RiskQualification allRiskQualifications={allRiskQualifications} setRiskQualification={setRiskQualification} />

        <SolutionState allSolutionsStates={allSolutionsStates} SetSolutionState={SetSolutionState} />

        <Button
          compact
          style={{ padding: 5, marginTop: 30, backgroundColor: theme.colors.primary }}
          mode='contained'
          onPress={handleSubmit}
          textColor={theme.colors.onPrimary}
        >
          Submit Event
        </Button>
        {load && <CustomActivityIndicator />}

      </View>

    </ScrollView>
  )
}
