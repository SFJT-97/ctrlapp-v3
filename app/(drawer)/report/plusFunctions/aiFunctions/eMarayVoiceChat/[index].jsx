// Builtin modules
import { useState, useRef, useEffect } from 'react'
import { IconButton, Text, useTheme, Chip } from 'react-native-paper'
import NetInfo from '@react-native-community/netinfo'
import { View, Dimensions, ScrollView } from 'react-native'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import Voice from '@react-native-voice/voice'
import * as Speech from 'expo-speech'

// Custom modules
import MsgBubble from '../components/MsgBubble'
import { EMARAY_CAMERA_JPG, EMARAY_MOVILE_JPG, DEFAULT_IMAGE, EMARAY_MOVILE_GIF } from '../../../../../../globals/variables/globalVariables'
import { useAsyncStorage } from '../../../../../../context/hooks/ticketNewQH'

const LANG_CODE = 'es-US'

// Considerar que answer y query son arreglos
const AnswerGPT4Q = gql`
query Query($query: [String!]!, $companyName: String, $eMarayName: String, $answer: [String], $option: Int) {
  AnswerGPT4(query: $query, companyName: $companyName, eMarayName: $eMarayName, answer: $answer, option: $option)
}

`

const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
    getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
      signedUrl
    }
  }
`

const VoiceEmarayChat = () => {
  const theme = useTheme()
  const [text, setText] = useState('')
  const [consoleText, setConsoleText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [netState, setNetState] = useState(false) // Estado de la conexión a internet
  const { value: generalData = undefined, loading: loadingGeneralData, error: errorGeneralData } = useAsyncStorage('CTRLA_GENERAL_DATA')
  const [defaultValues, setDefaultValues] = useState({})
  const [me, setMe] = useState(null)
  const [option, setOption] = useState(1) // Este es el estado de las opciones que ofrece eMaray al principio, 1 es "procedimientos"
  const [dataLoaded, setDataLoaded] = useState(false)
  const [lastAnswer, setLastAnswer] = useState('')

  const [userImg, setUSerImg] = useState(DEFAULT_IMAGE)

  const isActiveRef = useRef(false)
  const listeningRef = useRef(false)
  const queries = useRef([])
  const answers = useRef([])

  // Apollo calls
  const [AnswerGPT4] = useLazyQuery(AnswerGPT4Q, { fetchPolicy: 'network-only' })
  const [getURL] = useMutation(getSignedUrlFromCacheQ)

  const speakEmaray = (text) => {
    setIsListening(false)
    Speech.speak(text, {
      language: 'es-US', // español latinoamericano
      pitch: 1.0,
      rate: 1.0,
      voice: 'es-US-x-jorge-local' // puede variar según dispositivo
    })
  }

  const handleSendQuery = async () => {
    console.log('queries.current\n', queries.current)
    const variables = {
      query: queries?.current,
      companyName: me?.companyName,
      eMarayName: 'eMaray-' + me?.companyName,
      answer: answers?.current,
      option: Number(option)
    }
    try {
      const result = await AnswerGPT4({
        variables
      }, { fetchPolicy: 'network-only' })
      const tempResult = answers.current
      tempResult.push(result?.data?.AnswerGPT4)
      setLastAnswer(result?.data?.AnswerGPT4)
      speakEmaray(result?.data?.AnswerGPT4)
      answers.current = tempResult
    } catch (error) {
      console.log('error\n', error)
    }
  }

  // --- Handlers ---
  const onSpeechResults = (e) => {
    const result = e.value?.[0] || ''
    setText(result) // resultado final
    setConsoleText('Final: ' + result)
    // En esta parte hay que generar una función que arme las "queries" y las "answers" del chatgpt para guardar coherencia en la conversación.
    const tempResult = queries.current
    tempResult.push(result)
    queries.current = tempResult
    try {
      handleSendQuery()
    } catch (error) {
      console.log(error)
    }
  }

  const onSpeechPartialResults = (e) => {
    const result = e.value?.[0] || ''
    setText(result) // resultado parcial en vivo
    setConsoleText('You: ' + result)
  }

  const onSpeechEnd = () => {
    setConsoleText('Reconocimiento terminó.')
    setIsListening(false)
    setLastAnswer('')
    listeningRef.current = false
  }

  const onSpeechError = (e) => {
    const code = e.error?.code
    const message = e.error?.message || 'Error desconocido'
    setConsoleText(`Error de voz [${code}]: ${message}`)
    listeningRef.current = false
    setIsListening(false)
  }

  // --- Iniciar reconocimiento ---
  const startListening = async () => {
    if (listeningRef.current) return
    try {
      await Voice.destroy()
      await Voice.removeAllListeners()

      setText('')
      setConsoleText('')
      isActiveRef.current = true
      setIsListening(true)
      listeningRef.current = true

      // asignar listeners
      Voice.onSpeechResults = onSpeechResults
      Voice.onSpeechPartialResults = onSpeechPartialResults
      Voice.onSpeechEnd = onSpeechEnd
      Voice.onSpeechError = onSpeechError

      await Voice.start(LANG_CODE)
    } catch (e) {
      console.error(e)
      listeningRef.current = false
      setConsoleText('Error al iniciar reconocimiento: ' + (e.message || 'Error desconocido'))
    }
  }

  // --- Detener reconocimiento ---
  const stopListening = async () => {
    try {
      isActiveRef.current = false
      setIsListening(false)
      listeningRef.current = false
      await Voice.destroy()
      await Voice.removeAllListeners()
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const checkNet = async () => {
      const state = await NetInfo.fetch()
      setNetState(state?.isConnected)
    }
    checkNet()
  }, [])
  const width = Dimensions.get('window').width
  useEffect(() => {
    const fetchUserImage = async () => {
      const result = await getURL({ variables: { idSiMMediaURL: generalData?.me?.userProfileImage?.split('/').pop() } })
      if (result?.data?.getSignedUrlFromCache?.signedUrl) {
        setUSerImg(result?.data?.getSignedUrlFromCache?.signedUrl)
      }
    }
    if (generalData && typeof generalData === 'object' && !loadingGeneralData) {
      setDefaultValues({ ...generalData })
      setMe({ ...generalData?.me })
      setDataLoaded(true)
      console.log('defaultValues\n', defaultValues?.me)
      fetchUserImage()
    } else {
      setDataLoaded(false)
    }
  }, [generalData, errorGeneralData, loadingGeneralData])

  return (
    <ScrollView>
      {
        netState
          ? dataLoaded
            ? (
              <View>
                <View style={{ paddingBottom: 20, paddingTop: 10 }}>
                  <MsgBubble
                    userToProfileImage={isListening ? EMARAY_MOVILE_GIF : EMARAY_CAMERA_JPG}
                    imageProfile={EMARAY_CAMERA_JPG}
                    isSender={false}
                    message={`Hola ${me?.firstName || ''}!\nQue bueno que estés acá.\n¿En que puedo ayudarte hoy?\n\nPor favor, selecciona una opción.`}
                    bigImage={85}
                  />
                </View>
                <View style={{ width, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 5, left: 10 }}>
                  <Chip
                    style={{ backgroundColor: option === 1 ? theme.colors.errorContainer : theme.colors.onSecondaryContainer }}
                    onPress={() => setOption(1)}
                  >
                    <Text style={{ color: option === 1 ? theme.colors.primary : theme.colors.secondary, fontWeight: option === 1 ? 'bold' : '500' }}>Procedimientos</Text>
                  </Chip>
                  <Chip
                    disabled // temporal hasta que llegue la versión 2
                    style={{ backgroundColor: option === 2 ? theme.colors.errorContainer : theme.colors.onSecondaryContainer }}
                    onPress={() => setOption(2)}
                  >
                    <Text style={{ color: option === 2 ? theme.colors.primary : theme.colors.secondary, fontWeight: option === 2 ? 'bold' : '500' }}>Estadísticas</Text>
                  </Chip>
                  <Chip
                    disabled // temporal hasta que llegue la versión 2
                    style={{ backgroundColor: option === 3 ? theme.colors.errorContainer : theme.colors.onSecondaryContainer }}
                    onPress={() => setOption(3)}
                  >
                    <Text style={{ color: option === 3 ? theme.colors.primary : theme.colors.secondary, fontWeight: option === 3 ? 'bold' : '500' }}>Ayuda sobre la aplicación</Text>
                  </Chip>
                </View>
                <View style={{ paddingTop: 20, paddingRight: 20 }}>
                  <IconButton
                    icon={isListening ? 'microphone' : 'microphone-outline'}
                    mode='contained-tonal'
                    size={85}
                    iconColor={theme.colors.primary}
                    containerColor={isListening ? theme.colors.tertiaryContainer : theme.colors.secondaryContainer}
                    animated
                    onPress={isListening ? stopListening : startListening}
                  />
                </View>
                <View style={{ paddingTop: 10, paddingLeft: 5 }}>
                  {/* <Text style={{ color: theme.colors.primary, fontSize: 16 }}>{text ? `${me?.firstName}: ${text}` : consoleText}</Text> */}
                  <MsgBubble
                    userToProfileImage={EMARAY_MOVILE_JPG}
                    imageProfile={userImg}
                    isSender
                    message={text ? `${me?.firstName}: ${text}` : consoleText}
                    bigImage={60}
                  />

                </View>
                {
                  lastAnswer && (
                    <View style={{ paddingBottom: 20, paddingTop: 10 }}>
                      <MsgBubble
                        userToProfileImage={EMARAY_MOVILE_JPG}
                        imageProfile={EMARAY_CAMERA_JPG}
                        isSender={false}
                        message={lastAnswer}
                        bigImage={60}
                      />
                    </View>
                  )
                }

              </View>
              )
            : (
              <Text>Lo siento, eMaray necesita conexión a internet...</Text>
              )
          : (
            <Text>cargando datos...</Text>
            )
      }
    </ScrollView>
  )
}

export default VoiceEmarayChat
