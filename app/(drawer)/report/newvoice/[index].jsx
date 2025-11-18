/*
*/
/* eslint-disable import/namespace */
// Builtin modules, original screen
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useTheme, IconButton, Button } from 'react-native-paper'
import { Stack, Link, useLocalSearchParams } from 'expo-router'

// Builtin modules added
import { Audio } from 'expo-av'
import { gql, useMutation, useLazyQuery } from '@apollo/client'
import * as FileSystem from 'expo-file-system'

// new builtin module
import NetInfo from '@react-native-community/netinfo'
// Custom modules
import HelpButton from '../../../../globals/components/HelpButton'
import TimerCircle from '../Components/newEvents/TimerCircle'
import VoiceToText from '../../../../globals/VoiceToText'

// PANTALLA AHORA

const gqlTranscribeAudioM = gql`
mutation TranscribeAudio($audio: AudioInput!, $languageCode: String) {
  transcribeAudio(audio: $audio, languageCode: $languageCode) {
    transcription
  }
}

`

const AnswerGPTQ = gql`
query Query($query: String!) {
  AnswerGPT(query: $query)
}

`

const languageCode = 'es-Ar'
const TIMER_LIMIT = 14 // max time in seconds

const NewVoice = () => {
  const params = useLocalSearchParams()
  const ticketsAcount = params?.ticketsAcount
  const name = params?.name
  let defaultValues = params?.defaultValues
  defaultValues = JSON.parse(defaultValues)
  const theme = useTheme()
  const [isRecording, setIsRecording] = useState(false) // for visualization purposes
  const [isUploading, setIsUploading] = useState(false) // for visualization purposes
  const [isDone, setIsDone] = useState(false) // for process
  const [recording, setRecording] = useState() // to handle record process
  const [transcribeAudio] = useMutation(gqlTranscribeAudioM, { fetchPolicy: 'network-only' })
  const [AnswerGPT] = useLazyQuery(AnswerGPTQ, { fetchPolicy: 'network-only' })
  const [urgentReport, setUrgenReport] = useState(false)
  const [error, setError] = useState('')
  const [responseJSON, setResponseJSON] = useState(null) // to load the next screen
  const [isOnline, setIsOnline] = useState(false)

  // const [record, setRecord] = useState(false)
  // my variables for IA module

  const lOfCS = '"' + defaultValues?.myCompanySectors?.map(el => el.companySectorDescription).join('", "') + '"' // myCompanySectors
  const lOfQR = '"' + defaultValues?.allRiskQualifications?.map(el => el.riskQualificationDescription).join('", "') + '"' // allRiskQualifications
  const lOfSS = '"' + defaultValues?.allSolutionsStates?.map(el => el.solutionStateDescription).join('", "') + '"' // allSolutionsStates
  const lOfTNClass = '"' + defaultValues?.allTicketNewClassification?.map(el => el.idClassification + ' - ' + el.classification).join('", "') + '"' // allTicketNewClassification
  const lOfNSType = '"' + defaultValues?.allTicketNewSubType?.map(el => el.subTypeDescription).join('", "') + '"' // allTicketNewSubType

  let IAJSONResponse = {}

  let record = false
  const handleRecordAudio = async () => {
    setIsRecording(!isRecording) // only for showing animation
    record = !isRecording // for start/stop recording
    if (record) {
      const recording = new Audio.Recording()
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: 0,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 2,
          playThroughEarpieceAndroid: false
        })
        await recording.prepareToRecordAsync({
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY = {
            isMeteringEnabled: true,
            android: {
              extension: '.m4a',
              outputFormat: Audio.AndroidOutputFormat.MPEG_4,
              audioEncoder: Audio.AndroidAudioEncoder.AAC,
              sampleRate: 16000, // 44100,
              numberOfChannels: 2,
              bitRate: 128000
            },
            ios: {
              extension: '.m4a',
              outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
              audioQuality: Audio.IOSAudioQuality.MAX,
              sampleRate: 16000, // 44100,
              numberOfChannels: 2,
              bitRate: 128000,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false
            },
            web: {
              mimeType: 'audio/webm',
              bitsPerSecond: 128000
            }
          }
        })
        // RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        await recording.startAsync()
        setRecording(recording)
        console.log('arrancó la grabación...')
      } catch (err) {
        setError(err)
        setIsRecording(false)
        setIsDone(false)
        setIsUploading(false)
        console.log('Error starting voice recognition:', err.message)
      }
    } else {
      if (!recording) return
      try {
        await recording.stopAndUnloadAsync()
        console.log('Se detuvo la grabación...')
        const uri = recording.getURI() // Obtener la URI del archivo grabado
        console.log('Audio recording URI:\n', uri)

        // Estas 2 lineas abajo, sirven para reproducir el archivo de audio generado.
        // const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true })
        // await sound.playAsync({ volume: 0.5 })

        // en esta parte se genera el archivo "stream" de audio que posteriormente se deberá descomponer en partes de no mas de 14s cada una
        const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
        const audioFile = {
          name: uri.split('/').pop(),
          contentType: 'audio/mpeg',
          content: base64Audio
        }

        // console.log('name\n', audioFile.name)

        try {
          const result = await transcribeAudio({
            variables: {
              audio: audioFile,
              languageCode
            }
          })

          // Acá se tiene una respuesta de Google STT, pero hay que verificar si es válida
          // console.log('result from Google STT', result) // result.data.transcribeAudio.transcription
          setIsUploading(true)
          const userQuery = await result?.data?.transcribeAudio?.transcription
          // console.log('userQuery\n', userQuery)
          if (!userQuery || userQuery === null) {
            // Acá entra si la respuesta no fue válida
            console.log('respuesta no valida desde Google STT')
            setRecording(null)
            return
          }
          // en este punto, ya se sabe que hay una respuesta válida de Google STT y hay que componer esa respuesta con las instrucciones
          const formatedQuery = buildQuery(userQuery, lOfCS, lOfQR, lOfSS, lOfTNClass, lOfNSType)

          // Acá se llama a la query de chatGPT en el BE, enviandole la respuesta de texto del usuario, mas las instrucciones
          try {
            const chatGPTResponse = await AnswerGPT({ variables: { query: formatedQuery } }, { fetchPolicy: 'network-only' })
            const response = await chatGPTResponse?.data?.AnswerGPT
            IAJSONResponse = JSON.parse(response)
            console.log('IAJSONResponse\n', IAJSONResponse)
            setResponseJSON(JSON.stringify(IAJSONResponse))
            // En este punto hay que ver si se trata de un evento tipo ARI o PEI y en función de eso, se llama a ReportEventIA o ReportUrgentEventIA
            if (IAJSONResponse?.eventClassification === 'ARI - High Risk' || IAJSONResponse?.eventClassification === 'PEI - IMMINENT DANGER') {
              console.log('evento urgente')
              setUrgenReport(true)
            } else {
              console.log('evento no urgente')
              setUrgenReport(false)
            }
            setIsDone(true)
            setIsUploading(false)
          } catch (errorIA) {
            console.log('===================================================')
            console.log('Error in chatGPT response...', errorIA)
            console.log('===================================================')
            console.log('urgentReport =', urgentReport)
            console.log('error =', error)
          }
        } catch (err) {
          console.log('Error sending audio file to server...\n', err)
        }

        setRecording(null)
      } catch (error) {
        console.error('Error stopping recording:', error)
      }
    }
  }

  // useEffect(() => {
  //   return () => {
  //     if (recording) {
  //       recording.stopAndUnloadAsync()
  //     }
  //   }
  // }, [recording])

  useEffect(() => {
    checkPermissions() // Verificar los permisos al cargar el componente
    const fetchConection = async () => {
      let state
      try {
        state = await NetInfo.fetch()
        setIsOnline(state.isConnected)
      } catch (error) {
        console.log('error\n', error)
      }
    }
    fetchConection()
  }, [])

  const strDefaultValues = JSON.stringify(defaultValues)
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen
        options={{
          title: `New Voice ${isOnline ? '' : 'Offline'} Event`,
          headerTitleStyle: {
            color: isOnline ? theme.colors.primary : theme.colors.error,
            fontWeight: isOnline ? '300' : '600'
          },
          headerRight: () => <HelpButton />
        }}
      />
      <>
        {isOnline
          ? (
            <>
              <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute' }}>
                <IconButton
                  icon={isRecording ? 'microphone' : 'microphone-outline'}
                  mode='contained-tonal'
                  size={65}
                  iconColor={theme.colors.primary}
                  containerColor={isRecording ? theme.colors.tertiaryContainer : theme.colors.secondaryContainer}
                  animated
                  onPress={handleRecordAudio}
                />
                <Link
                  href={{
                    pathname: '/report/newvoice/upload/[upload]',
                    params: { ticketsAcount, name, strDefaultValues, responseJSON }
                  }}
                  style={{ marginTop: 50 }}
                  disabled={!isDone}
                >
                  <Button
                    mode='contained'
                    icon='arrow-right'
                    contentStyle={{ flexDirection: 'row-reverse' }}
                    disabled={!isDone}
                    loading={isUploading}
                  >
                    Continue
                  </Button>
                </Link>
              </View>
              {
                isRecording && (
                  <View style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    bottom: 0,
                    marginBottom: 50
                  }}
                  >
                    <TimerCircle duration={TIMER_LIMIT} handleRecordAudio={handleRecordAudio} />
                  </View>
                )
              }
            </>
            )
          : (
            <>
              {/* Acá hay que llamar a algún componente que arme el "new voice offline report" */}
              <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute' }}>
                <VoiceToText />
              </View>
            </>
            )}
      </>
    </View>
  )
}

const checkPermissions = async () => {
  const { status } = await Audio.getPermissionsAsync() // Obtener el estado de los permisos
  if (status !== 'granted') {
    // Si los permisos no están concedidos, solicitarlos
    const { status: newStatus } = await Audio.requestPermissionsAsync()
    if (newStatus === 'granted') {
      console.log('Permisos de grabación concedidos')
    } else {
      console.log('Permisos de grabación no concedidos')
    }
  } else {
    // console.log('Permisos de grabación ya estaban concedidos')
  }
}

const buildQuery = (query, lOfCS, lOfQR, lOfSS, lOfTNClass, lOfNSType) => `
Considera el siguiente evento que es sobre inserguridad en empresas: "${query}".
Cuando un dato no aparezca, simplemente coloca "-".

En el caso de "Tipo de evento", sólo puede tener 2 resultados posibles. "Action", "Condition". "Action" es cuando una persona comete un acto inseguro para su persona, para otras personas,
o para la propia empresa, también está relacionado con las personas que no respetan las reglas de seguridad de la empresa. "Condition" es cuando existe infraestructura propia de la empresa que no es apta para el trabajo o está deteriorada o con falta de mantenimiento.
Si existe solapamiento de criterios respecto de "Tipo de evento", seleccionar "Condition".

"Sector de la empresa" es el sector de la empresa que es afectado por el evento de inseguridad. Este valor deberá ser uno de los siguientes posibles ${lOfCS}.

"Calificación de riesgo" es la medición del nivel de riesgo asociado al evento y puede tener uno de los siguientes valores posibles ${lOfQR}.

"Sub tipo" hace referencia a la intalación  que es causante o que está involucrada en el evento enunciado, también a tareas de las personas llevadas a cabo de forma riesgosa. Sus valores solo pueden ser uno de los siguientes posibles ${lOfNSType}.

"Estado de solución" hace referencia al estado de la solución al problema que se indica en la descripción del evento, sus valores solo puede ser uno de los siguientes ${lOfSS}.

"Clasificación de evento" hace referencia a un sistema de clasificación de los riesgos y puede estar relacionado tanto a cuestiones de actitud como de infraestructura. Sus valores solo pueden ser uno de los siguientes posibles ${lOfTNClass}

"Descripción del evento" será siempre en la lengua original en la que se realizó.

"Clasificación de evento", tener en cuenta que las opciones "ARI - High Risk" o "PEI - INMINENT RISK" solamente deberán ser consideradas en casos extremos de gran riesgo fisico para las personas.

Para la "Fecha y hora del evento", cuando no son proporcionadas en la descripción del evento, asignar la fecha y hora local del dispositivo, al momento de recibir esta consulta.
Respecto de lo que se mencione en el evento, ten como referencia que hoy es ${new Date()}. Por ejemplo, cuando en el evento se dice "ayer" es un dia menos que la fecha que debes considerar como hoy.

Considerar que toda la respuesta debe ser un objeto JSON como sigue:

type: <Tipo de evento>
companySectorDescription: <Sector de la empresa>
subType: <Sub tipo>
dateTimeEvent: <Fecha y hora del evento>
ticketCustomDescription: <Descripción del evento>
riskQualificationDescription: <Calificación de riesgo>
solutionStateDescription: <Estado de la solución>
eventClassification: <Clasificación de evento>
`

export default NewVoice
