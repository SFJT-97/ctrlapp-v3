/* eslint-disable import/namespace */
// Bultin modules
import { useState, useEffect } from 'react'
import { View, ScrollView, Alert } from 'react-native'
import { useTheme, Button, Icon, Text } from 'react-native-paper'

// Custom modules
import CustomActivityIndicator from '../../../../../globals/components/CustomActivityIndicator'
import ActionConditionButton from './ActionConditionButton'
import CompanySectorDropdown from './CompanySectorDropdown'
import EventDescription from './EventDescription'
import EventSubtype from './EventSubtype'
import UrgentRiskQualification from './UrgentRiskQualification'
import ImageVideo from './ImageVideo'
import { useRouter } from 'expo-router'
import CameraComponent from './CameraComponent'

// Imports for save locally files and mutations when there are no connection available
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'

const PENDING_UPLOADS_KEY = 'PendingTickets-' + Date.now().toString()

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
  let { defaultValues } = args
  // const { ticketsAcount, name } = args
  const { name } = args
  defaultValues = JSON.parse(defaultValues)
  const router = useRouter()

  const {
    me, // Para saber a donde pertenezco y por lo tanto a quien notificar
    // myBusinessUnitsCompany, // Para, eventualmente, seleccionar a que unidad de negocio notificar... puede que esté al pedo
    // allRiskQualifications,
    // allSolutionsStates,
    allTicketNewClassification,
    allTicketNewSubType,
    myCompanySectors
  } = defaultValues

  // Armado de los useState para leer y setear el valor seleccionado de cada componente

  const [riskQualification, setRiskQualification] = useState(undefined)
  const [eventType, setEventType] = useState(undefined) // undefined para saber cuando no se seleccionó nada
  const [companySector, setCompanySector] = useState(undefined)
  const [eventSubType, setEventSubType] = useState(undefined)
  const [eventClassification, setEventClassification] = useState(undefined)
  const [image1, setImage1] = useState(undefined)
  const [image2, setImage2] = useState(undefined)
  const [image3, setImage3] = useState(undefined)
  const [video, SetVideo] = useState(undefined)
  const [description, setDescription] = useState(undefined)
  const [solutionState, SetSolutionState] = useState('Pending action')

  // Armo un estado load para saber cuando se está subiendo información
  const [load, setLoad] = useState(false)

  const theme = useTheme()
  // Estado para saber si se activó la camara o no
  const [isCameraActive, setIsCameraActive] = useState(false)

  // Estado para saber desde la cámara nueva, cual SetImage usar
  const [cameraSelected, setCameraSelected] = useState(1)

  // en handleSubmit llenaremos los datos que se le pasarán a la colección de MongoDB
  const handleSubmit = async () => {
    // Primero hay que validar que estén todos los datos llenados

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

    // Segundo hay que verificar que archivos multimedia se cargaron para subirlos de a uno
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
      dateTimeEvent: new Date(), // en este tipo de eventos se asume que es en el momento,
      classification: eventClassification.slice(0, 3),
      classificationDescription: eventClassification.slice(6),
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

  // Este useEffect se lo utiliza para cargar los datos por defecto que se asumen en un caso de urgencia
  useEffect(() => {
    // Llenaremos la hora y fecha con los valores del momento en que se abre el formulario, directamente en el useMutation

    // Llenaremos "Solution State" por defecto con 'pending state' por ser urgente se asume que no se ha realizado ninguna acción
    SetSolutionState('Pending action')

    // Llenaremos "Risk" con "Extremely Dangerous" por ser urgente se asume que el riesgo es muy elevado
    setRiskQualification('Extremely Dangerous')
  }, [])

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

        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Icon source='alert' size={40} color={theme.colors.error} />
        </View>

        {/* Esto debe ser en realidad un UrgentEventType */}
        <UrgentRiskQualification allTicketNewClassification={allTicketNewClassification} setEventClassification={setEventClassification} />

        <ActionConditionButton setEventType={setEventType} />

        <CompanySectorDropdown myCompanySectors={myCompanySectors} setCompanySector={setCompanySector} />

        <EventSubtype allTicketNewSubType={allTicketNewSubType} setEventSubType={setEventSubType} />

        {isCameraActive
          ? (
            <CameraComponent mode={modeSelected} setImageVideo={seterSelected} setIsCameraActive={setIsCameraActive} isCameraActive={isCameraActive} />
            )
          : (
            <ImageVideo setImage1={setImage1} setImage2={setImage2} setImage3={setImage3} setVideo={SetVideo} image1={image1} image2={image2} image3={image3} video={video} setIsCameraActive={setIsCameraActive} isCameraActive={isCameraActive} setCameraSelected={setCameraSelected} />
            )}
        <EventDescription setDescription={setDescription} />

        <Button compact style={{ padding: 5, marginTop: 30, backgroundColor: theme.colors.error }} mode='contained' onPress={handleSubmit}>
          Submit Urgent Event
        </Button>

        {load && <CustomActivityIndicator />}

        <Text style={{ color: theme.colors.error }}>
          Alert: Submiting this event report will notify all app users within the company
        </Text>
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Icon
            source='alert'
            size={40}
            color={theme.colors.error}
          />
        </View>

      </View>

    </ScrollView>
  )
}
