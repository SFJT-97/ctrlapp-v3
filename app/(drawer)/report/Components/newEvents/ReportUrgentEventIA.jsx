// Bultin modules
import { useState, useEffect } from 'react'
import { View, ScrollView, Alert, BackHandler } from 'react-native'
import { gql, useMutation } from '@apollo/client'
import { useTheme, Button, Icon, Text } from 'react-native-paper'
import NetInfo from '@react-native-community/netinfo'

// Custom modules
import CustomActivityIndicator from '../../../../../globals/components/CustomActivityIndicator'
import ActionConditionButton from './ActionConditionButton'
import CompanySectorDropdown from './CompanySectorDropdown'
import EventDescription from './EventDescription'
import EventSubtype from './EventSubtype'
import UrgentRiskQualification from './UrgentRiskQualification'
import MediaGrid from './MediaGrid'
import uploadFile from '../../../../../globals/uploadFile'
import { useRouter } from 'expo-router'

// global variables
import { API_URL } from '../../../../../globals/variables/globalVariables'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { saveFileLocally, savePendingTicket } from '../../../../../globals/utils/offlineTicketUtils'
import { useTranslation } from 'react-i18next'

// useMutation variables
const addNewTicketNewM = gql`
mutation AddNewTicketNew($idUser: ID!, $type: String!, $companyName: String!, $companyBusinessUnitDescription: String!, $companySectorDescription: String!, $dateTimeEvent: String!, $classification: String!, $classificationDescription: String!, $subType: String!, $riskQualification: String!, $ticketCustomDescription: String!, $ticketImage1: String, $ticketImage2: String, $ticketImage3: String, $ticketImage4: String, $ticketVideo: String, $ticketSolved: Boolean!, $ticketLike: Int!, $injuredPeople: Int!, $lostProduction: Int!, $lostProductionTotalTimeDuration: Int!, $ticketClosed: Boolean!, $solutionType: String, $costAsociated: Int) {
  addNewTicketNew(idUser: $idUser, type: $type, companyName: $companyName, companyBusinessUnitDescription: $companyBusinessUnitDescription, companySectorDescription: $companySectorDescription, dateTimeEvent: $dateTimeEvent, classification: $classification, classificationDescription: $classificationDescription, subType: $subType, riskQualification: $riskQualification, ticketCustomDescription: $ticketCustomDescription, ticketImage1: $ticketImage1, ticketImage2: $ticketImage2, ticketImage3: $ticketImage3, ticketImage4: $ticketImage4, ticketVideo: $ticketVideo, ticketSolved: $ticketSolved, ticketLike: $ticketLike, injuredPeople: $injuredPeople, lostProduction: $lostProduction, lostProductionTotalTimeDuration: $lostProductionTotalTimeDuration, ticketClosed: $ticketClosed, solutionType: $solutionType, costAsociated: $costAsociated) {
    idTicketNew
    idUser
    type
    companyName
    companyBusinessUnitDescription
    companySectorDescription
    dateTimeEvent
    classification
    classificationDescription
    subType
    riskQualification
    ticketCustomDescription
    ticketImage1
    ticketImage2
    ticketImage3
    ticketImage4
    ticketVideo
    ticketSolved
    ticketLike
    injuredPeople
    lostProduction
    lostProductionTotalTimeDuration
    dateTimeEventResolved
    ticketClosed
    solutionType
    costAsociated
    ticketExtraFile
  }
}

`

const multipleUploadS3M = gql`
mutation MultipleUploadS3($files: [Upload]) {
  multipleUploadS3(files: $files) {
    filename
    mimetype
    encoding
    success
    message
    location
    url
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

export default function ReportUrgentEventIA (args) {
  const { t } = useTranslation('report')
  let { defaultValues } = args
  const { ticketsAcount, name, responseJSON } = args
  defaultValues = JSON.parse(defaultValues)
  const router = useRouter()
  const {
    me, // Para saber a donde pertenezco y por lo tanto a quien notificar
    // myBusinessUnitsCompany, // Para, eventualmente, seleccionar a que unidad de negocio notificar... puede que esté al pedo
    // allRiskQualifications,
    // allSolutionsStates,
    allTicketNewClassification,
    allTicketNewSubType,
    myCompanySectors,
    ticketImage1: tempImg1,
    ticketImage2: tempImg2,
    ticketImage3: tempImg3,
    ticketVideo: tempVideo
  } = defaultValues

  // Llamo a los useMutation
  const [addNewTicketNew, dataaddNewTicketNew] = useMutation(addNewTicketNewM, { fetchedPolicy: 'network-only' })
  const [MultipleUploadS3] = useMutation(multipleUploadS3M, { fetchedPolicy: 'network-only' })

  // LLamado a los useLazyQueries
  const [getSignedImageURL] = useMutation(getSignedUrlFromCacheQ)

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

  // Un estado para saber si vino información desde el IA Report o no, en esta pantalla si, pero se reutilizan componentes con otra pantalla
  // de reportes manuales y este estado servirá para informar a dichos componentes cuando precargar info y cuando no
  const fromAIReport = Object.keys(responseJSON)?.length !== 0

  // Este estado es para saber cuando se terminó de subir información
  const [load, setLoad] = useState(false)

  // Estado para saber si hay conexión a internet o no
  const [netState, SetNetState] = useState(false)

  const theme = useTheme()

  // en handleSubmit llenaremos los datos que se le pasarán a la colección de MongoDB

  const handleSubmit = async () => {
    // Primero hay que validar que estén todos los datos llenados

    if (eventClassification === undefined || eventSubType === undefined || riskQualification === undefined || eventType === undefined ||
      description === undefined || description === '' || solutionState === undefined || companySector === undefined) {
      Alert.alert('Warning!', 'Please complete all the information needed.', [
        {
          text: 'Cancel ⛔',
          style: 'cancel'
        }
      ], 'cancelable')
      return
    }
    setLoad(true) // Colocamos el estado de carga en true

    try {
      // FIXED: Check network before attempting upload
      const netInfo = await NetInfo.fetch()
      const isOnline = netInfo.isConnected && netInfo.isInternetReachable

      // FIXED: Save files locally first (for offline support)
      const mediaFiles = []
      if (image1 !== undefined && image1 !== '') {
        const savedFile = await saveFileLocally({ uri: image1, mimeType: 'image/jpeg' })
        if (savedFile) mediaFiles.push(savedFile)
      }
      if (image2 !== undefined && image2 !== '') {
        const savedFile = await saveFileLocally({ uri: image2, mimeType: 'image/jpeg' })
        if (savedFile) mediaFiles.push(savedFile)
      }
      if (image3 !== undefined && image3 !== '') {
        const savedFile = await saveFileLocally({ uri: image3, mimeType: 'image/jpeg' })
        if (savedFile) mediaFiles.push(savedFile)
      }
      if (video !== undefined && video !== '') {
        const savedFile = await saveFileLocally({ uri: video, mimeType: 'video/mp4' })
        if (savedFile) mediaFiles.push(savedFile)
      }

      // Segundo hay que verificar que archivos multimedia se cargaron para subirlos de a uno
      let mMedia = []
      let locationImage1 = ''
      let locationImage2 = ''
      let locationImage3 = ''
      let locationImage4 = `${API_URL}uploads/ctrla-icon.png`
      let locationVideo = ''

      if (isOnline) {
        // Only try to upload if online
        if (image1 !== undefined) mMedia.push(uploadFile(image1))
        if (image2 !== undefined) mMedia.push(uploadFile(image2))
        if (image3 !== undefined) mMedia.push(uploadFile(image3))
        if (video !== undefined) mMedia.push(uploadFile(video, false))
        mMedia = await executeMultipleMutation(mMedia, MultipleUploadS3) // mMedia será un arreglo "asíncrono" con toda la info de los archivos subidos

        // Ahora se extrae de los nombres las ubicaciónes (location) en el bucket de AWS S3
        if (mMedia !== undefined && mMedia.length > 0) {
          for (let i = 0; i < mMedia?.length; i++) {
            if (mMedia[i]?.mimetype?.toString().includes('image')) {
              switch (i) {
                case 0:
                  locationImage1 = mMedia[i].location
                  try {
                    const tempImg = await getSignedImageURL({ variables: { idSiMMediaURL: locationImage1.split('/').pop() } })
                    if (tempImg && !tempImg.loading && !tempImg.error && tempImg !== 'Loading...') {
                      // console.log('tempImg?.data?.getSignedUrlFromCache?.signedUrl =', tempImg?.data?.getSignedUrlFromCache?.signedUrl)
                      locationImage4 = tempImg?.data?.getSignedUrlFromCache?.signedUrl
                      if (locationImage4 === undefined) locationImage4 = `${API_URL}uploads/ctrla-icon.png`
                    }
                  } catch (error) {
                    locationImage4 = `${API_URL}uploads/ctrla-icon.png`
                    console.log('error getting ImageVideoURL', error)
                  }
                  break
                case 1:
                  locationImage2 = mMedia[i].location; break
                case 2:
                  locationImage3 = mMedia[i].location; break
              }
            } else {
              locationVideo = mMedia[i].location
            }
          }
        }
      }

      // Ahora se está en condiciones de llamar a la mutación de llenado del ticket
      if (isOnline && mMedia !== undefined && mMedia.length > 0) {
        // Try to upload immediately if online
        try {
          const dataNewTicketAdded = await addNewTicketNew({
            variables: {
              idUser: me.idUser,
              type: eventType,
              companyName: me.companyName,
              companyBusinessUnitDescription: me.companyBusinessUnitDescription, // no se requiere la unidad de negocios en el ticket, se toma la del usuario
              companySectorDescription: companySector, // este se podría tratar de detectar con el gps del celu
              dateTimeEvent: new Date().toISOString(), // en este tipo de eventos se asume que es en el momento
              classification: eventClassification.slice(0, 3),
              classificationDescription: eventClassification.slice(6),
              subType: eventSubType,
              riskQualification,
              ticketCustomDescription: description,
              ticketImage1: locationImage1,
              ticketImage2: locationImage2,
              ticketImage3: locationImage3,
              ticketImage4: locationImage4,
              ticketVideo: locationVideo,
              ticketSolved: false, // Un evento de estas caracteristicas cargado por un usuario final está sin cerrar
              ticketLike: 0,
              injuredPeople: 0,
              lostProduction: 0,
              lostProductionTotalTimeDuration: 0,
              ticketClosed: false,
              solutionType: solutionState,
              costAsociated: 0
            }
          })
          // en este punto ya se subió el nuevo ticket a mongoDB y es el BE el que selecciona a que usuarios mandar las notitifaciones
          Alert.alert(
            `📢 Well done ${name}!`,
            `You successfully helped ${me.companyName} with safety.\nTicketId=${dataNewTicketAdded?.data?.addNewTicketNew?.idTicketNew}\n${Number(ticketsAcount) + 1} total tickets...`, [
              {
                text: 'Acept ✅',
                style: 'default'
              }
            ], 'cancelable')

          // Ahora entonces se coloca el valor de waiting_ticket_offLine en false, para que se pueda volver a llamar esta función si se hubiesen subido varios.
          await AsyncStorage.setItem('waiting_ticket_offLine', JSON.stringify(false))

          router.navigate({ pathname: 'report' })
          setLoad(false)
          return
        } catch (error) {
          console.error('Error uploading ticket:', error)
          // Fall through to save offline
        }
      }

      // Save offline (either we're offline, or upload failed)
      const ticketData = {
        idUser: me.idUser,
        type: eventType,
        companyName: me.companyName,
        companyBusinessUnitDescription: me.companyBusinessUnitDescription,
        companySectorDescription: companySector,
        dateTimeEvent: new Date().toISOString(),
        classification: eventClassification.slice(0, 3),
        classificationDescription: eventClassification.slice(6),
        subType: eventSubType,
        riskQualification,
        ticketCustomDescription: description,
        ticketImage1: image1 || '',
        ticketImage2: image2 || '',
        ticketImage3: image3 || '',
        ticketImage4: '',
        ticketVideo: video || '',
        ticketSolved: false,
        ticketLike: 0,
        injuredPeople: 0,
        lostProduction: 0,
        lostProductionTotalTimeDuration: 0,
        ticketClosed: false,
        solutionType: solutionState,
        costAsociated: 0
      }

      await savePendingTicket({
        data: ticketData,
        files: mediaFiles,
        fromVoiceOffLine: false
      })

      Alert.alert(
        t('alerts.savedOffline') || 'Saved Offline',
        t('alerts.offlineMessage') || 'Ticket saved offline and will be uploaded when connection is available.'
      )

      // Ahora entonces se coloca el valor de waiting_ticket_offLine en false, para que se pueda volver a llamar esta función si se hubiesen subido varios.
      await AsyncStorage.setItem('waiting_ticket_offLine', JSON.stringify(false))

      router.navigate({ pathname: 'report' })
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      Alert.alert(t('alerts.error') || 'Error', t('alerts.saveError') || 'Failed to save ticket. Please try again.')
    } finally {
      setLoad(false)
    }
  }

  const executeMultipleMutation = async (newFiles, MultipleUploadS3) => {
    try {
      const result = await MultipleUploadS3({
        variables: { files: newFiles },
        awaitRefetchQueries: true,
        refetchQueries: true
      })
      const data = result?.data?.multipleUploadS3
      console.log('result', data)
      return data
    } catch (error) {
      console.error('Error executing MultipleUploadS3:', error)
      return null // O manejar el error de otra forma según sea necesario
    }
  }

  // Este useEffect se lo utiliza para cargar los datos por defecto que se asumen en un caso de urgencia
  useEffect(() => {
    const checkNet = async () => {
      const state = await NetInfo.fetch()
      SetNetState(state?.isConnected)
    }

    if (responseJSON) {
      setRiskQualification(responseJSON.riskQualificationDescription)
      setCompanySector(responseJSON.companySectorDescription)
      setEventType(responseJSON.type)
      SetSolutionState(responseJSON.solutionStateDescription)
      setDescription(responseJSON.ticketCustomDescription)
      setEventClassification(responseJSON.eventClassification)
      setEventSubType(responseJSON.subType)

      setImage1(tempImg1)
      setImage2(tempImg2)
      setImage3(tempImg3)
      SetVideo(tempVideo)

      Alert.alert(
        '📢 CtrlA note:',
        'The AI has filled in some values based on what you said.\nCheck, correct or add what you consider necessary.')
    }
    checkNet()
  }, [])

  useEffect(() => {
    // Manejo del botón "atrás"
    const backAction = () => {
      Alert.alert('Salir', '¿Seguro desea cancelar el llenado del ticket?', [
        { text: 'Cancelar', onPress: () => null, style: 'cancel' },
        {
          text: 'Sí',
          onPress: async () => {
            await AsyncStorage.setItem('waiting_ticket_offLine', JSON.stringify(false))
            BackHandler.exitApp()
          }
        }
      ])
      return true // evita que el back cierre la pantalla automáticamente
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)

    return () => backHandler.remove() // limpieza al desmontar
  }, [])

  return (
    <ScrollView nestedScrollEnabled>
      <View style={{ rowGap: 30, marginHorizontal: 15, marginTop: 25, marginBottom: 60 }}>

        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Icon
            source='alert'
            size={40}
            color={theme.colors.error}
          />
        </View>

        <MediaGrid
          image1={image1}
          setImage1={setImage1}
          image2={image2}
          setImage2={setImage2}
          image3={image3}
          setImage3={setImage3}
          video={video}
          setVideo={SetVideo}
          netState={netState}
        />

        {/* Esto debe ser en realidad un UrgentEventType */}
        <UrgentRiskQualification allTicketNewClassification={allTicketNewClassification} setEventClassification={setEventClassification} eventClassificationData={eventClassification} fromAIReport={fromAIReport} />

        <ActionConditionButton setEventType={setEventType} eventType={eventType} fromAIReport={fromAIReport} />

        <CompanySectorDropdown myCompanySectors={myCompanySectors} setCompanySector={setCompanySector} companySectorValue={companySector} fromAIReport={fromAIReport} />

        <EventSubtype allTicketNewSubType={allTicketNewSubType} setEventSubType={setEventSubType} eventSubTypeValue={eventSubType} fromAIReport={fromAIReport} />

        <EventDescription setDescription={setDescription} descriptionValue={description} fromAIReport={fromAIReport} />

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
