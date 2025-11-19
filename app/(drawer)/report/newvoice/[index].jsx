/*
*/
/* eslint-disable import/namespace */
// Builtin modules, original screen
import React, { useEffect, useState, useMemo } from 'react'
import { View } from 'react-native'
import { useTheme, IconButton, Button } from 'react-native-paper'
import { Stack, Link, useLocalSearchParams } from 'expo-router'

// Builtin modules added
import { Audio } from 'expo-av'
import { gql, useMutation, useLazyQuery } from '@apollo/client'
import * as FileSystem from 'expo-file-system'
import { Platform, Alert } from 'react-native'
import { PermissionsAndroid } from 'react-native'

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
  let defaultValuesParam = params?.defaultValues
  
  // Step 3: Add Data Validation and Error Handling
  let defaultValues = {}
  try {
    if (defaultValuesParam) {
      defaultValues = JSON.parse(defaultValuesParam)
    }
  } catch (parseError) {
    console.error('Error parsing defaultValues:', parseError)
    console.error('Raw defaultValues param:', defaultValuesParam)
    defaultValues = {}
  }
  
  // Step 5: Add Debug Logging - Log defaultValues structure
  console.log('defaultValues structure:', {
    hasMyCompanySectors: !!defaultValues?.myCompanySectors,
    myCompanySectorsLength: Array.isArray(defaultValues?.myCompanySectors) ? defaultValues.myCompanySectors.length : 0,
    hasAllRiskQualifications: !!defaultValues?.allRiskQualifications,
    allRiskQualificationsLength: Array.isArray(defaultValues?.allRiskQualifications) ? defaultValues.allRiskQualifications.length : 0,
    hasAllSolutionsStates: !!defaultValues?.allSolutionsStates,
    allSolutionsStatesLength: Array.isArray(defaultValues?.allSolutionsStates) ? defaultValues.allSolutionsStates.length : 0,
    hasAllTicketNewClassification: !!defaultValues?.allTicketNewClassification,
    allTicketNewClassificationLength: Array.isArray(defaultValues?.allTicketNewClassification) ? defaultValues.allTicketNewClassification.length : 0,
    hasAllTicketNewSubType: !!defaultValues?.allTicketNewSubType,
    allTicketNewSubTypeLength: Array.isArray(defaultValues?.allTicketNewSubType) ? defaultValues.allTicketNewSubType.length : 0
  })
  
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
  // Step 1: Fix List Construction with Validation using useMemo
  const lOfCS = useMemo(() => {
    const sectors = defaultValues?.myCompanySectors
    if (!Array.isArray(sectors) || sectors.length === 0) {
      console.warn('myCompanySectors is missing or empty, AI will infer values')
      return '""'
    }
    const descriptions = sectors.map(el => el?.companySectorDescription).filter(Boolean)
    if (descriptions.length === 0) {
      console.warn('myCompanySectors has no valid descriptions, AI will infer values')
      return '""'
    }
    const result = '"' + descriptions.join('", "') + '"'
    console.log('Company Sectors list constructed:', descriptions.length, 'items')
    return result
  }, [defaultValues?.myCompanySectors])

  const lOfQR = useMemo(() => {
    const qualifications = defaultValues?.allRiskQualifications
    if (!Array.isArray(qualifications) || qualifications.length === 0) {
      console.warn('allRiskQualifications is missing or empty, AI will infer values')
      return '""'
    }
    const descriptions = qualifications.map(el => el?.riskQualificationDescription).filter(Boolean)
    if (descriptions.length === 0) {
      console.warn('allRiskQualifications has no valid descriptions, AI will infer values')
      return '""'
    }
    const result = '"' + descriptions.join('", "') + '"'
    console.log('Risk Qualifications list constructed:', descriptions.length, 'items')
    return result
  }, [defaultValues?.allRiskQualifications])

  const lOfSS = useMemo(() => {
    const states = defaultValues?.allSolutionsStates
    if (!Array.isArray(states) || states.length === 0) {
      console.warn('allSolutionsStates is missing or empty, AI will infer values')
      return '""'
    }
    const descriptions = states.map(el => el?.solutionStateDescription).filter(Boolean)
    if (descriptions.length === 0) {
      console.warn('allSolutionsStates has no valid descriptions, AI will infer values')
      return '""'
    }
    const result = '"' + descriptions.join('", "') + '"'
    console.log('Solution States list constructed:', descriptions.length, 'items')
    return result
  }, [defaultValues?.allSolutionsStates])

  const lOfTNClass = useMemo(() => {
    const classifications = defaultValues?.allTicketNewClassification
    if (!Array.isArray(classifications) || classifications.length === 0) {
      console.warn('allTicketNewClassification is missing or empty, AI will infer values')
      return '""'
    }
    const formatted = classifications
      .map(el => {
        if (!el?.idClassification || !el?.classification) return null
        return `${el.idClassification} - ${el.classification}`
      })
      .filter(Boolean)
    if (formatted.length === 0) {
      console.warn('allTicketNewClassification has no valid entries, AI will infer values')
      return '""'
    }
    const result = '"' + formatted.join('", "') + '"'
    console.log('Event Classifications list constructed:', formatted.length, 'items')
    return result
  }, [defaultValues?.allTicketNewClassification])

  const lOfNSType = useMemo(() => {
    const subTypes = defaultValues?.allTicketNewSubType
    if (!Array.isArray(subTypes) || subTypes.length === 0) {
      console.warn('allTicketNewSubType is missing or empty, AI will infer values')
      return '""'
    }
    const descriptions = subTypes.map(el => el?.subTypeDescription).filter(Boolean)
    if (descriptions.length === 0) {
      console.warn('allTicketNewSubType has no valid descriptions, AI will infer values')
      return '""'
    }
    const result = '"' + descriptions.join('", "') + '"'
    console.log('Sub Types list constructed:', descriptions.length, 'items')
    return result
  }, [defaultValues?.allTicketNewSubType])

  let IAJSONResponse = {}

  const startRecording = async () => {
    try {
      // Check permissions before starting recording
      console.log('Checking permissions...')
      const hasPermission = await checkPermissions()
      if (!hasPermission) {
        console.log('Permission denied')
        setIsRecording(false)
        setError('Audio recording permission denied')
        Alert.alert('Permission Denied', 'Audio recording permission is required to record voice events.')
        return
      }
      
      // Clean up any existing recording first
      if (recording) {
        console.log('Cleaning up existing recording...')
        try {
          const status = await recording.getStatusAsync()
          if (status.canRecord) {
            await recording.stopAndUnloadAsync()
          }
        } catch (cleanupError) {
          console.log('Error cleaning up existing recording:', cleanupError)
        }
        setRecording(null)
      }
      
      console.log('Permissions granted, setting up audio...')
      
      // Set audio mode first, before creating recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      })
      
      // Small delay to ensure audio mode is fully set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('Audio mode set, creating recording...')
      const newRecording = new Audio.Recording()
      
      console.log('Preparing recording with options...')
      // Try using the preset first, which is more reliable
      try {
        await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
        console.log('Recording prepared successfully with preset')
      } catch (presetError) {
        console.log('Preset failed, trying custom options...', presetError)
        // Fallback to custom options if preset fails
        const recordingOptions = {
          isMeteringEnabled: true,
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
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
        await newRecording.prepareToRecordAsync(recordingOptions)
        console.log('Recording prepared successfully with custom options')
      }
      
      console.log('Recording prepared, starting...')
      await newRecording.startAsync()
      setRecording(newRecording)
      setError('')
      console.log('Recording started successfully - timer should be visible')
    } catch (err) {
      console.error('Error starting recording:', err)
      console.error('Error details:', JSON.stringify(err, null, 2))
      setError(err?.message || String(err) || 'Failed to start recording')
      setIsRecording(false)
      setIsDone(false)
      setIsUploading(false)
      Alert.alert('Recording Error', err?.message || String(err) || 'Failed to start audio recording. Please try again.')
    }
  }

  const stopRecording = async () => {
    const currentRecording = recording
    if (!currentRecording) {
      console.log('No recording to stop')
      return
    }
    
    try {
      await currentRecording.stopAndUnloadAsync()
      console.log('Recording stopped successfully')
      const uri = currentRecording.getURI() // Obtener la URI del archivo grabado
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
          setIsUploading(false)
          return
        }
        // en este punto, ya se sabe que hay una respuesta válida de Google STT y hay que componer esa respuesta con las instrucciones
        // Step 5: Add Debug Logging - Log final lists before sending to AI
        console.log('=== Lists for AI query (final) ===')
        console.log('Company Sectors:', lOfCS.substring(0, 100) + (lOfCS.length > 100 ? '...' : ''))
        console.log('Risk Qualifications:', lOfQR.substring(0, 100) + (lOfQR.length > 100 ? '...' : ''))
        console.log('Solution States:', lOfSS.substring(0, 100) + (lOfSS.length > 100 ? '...' : ''))
        console.log('Event Classifications:', lOfTNClass.substring(0, 100) + (lOfTNClass.length > 100 ? '...' : ''))
        console.log('Sub Types:', lOfNSType.substring(0, 100) + (lOfNSType.length > 100 ? '...' : ''))
        
        const formatedQuery = buildQuery(userQuery, lOfCS, lOfQR, lOfSS, lOfTNClass, lOfNSType)
        console.log('Formatted query length:', formatedQuery.length)

        // Acá se llama a la query de chatGPT en el BE, enviandole la respuesta de texto del usuario, mas las instrucciones
        try {
          const chatGPTResponse = await AnswerGPT({ variables: { query: formatedQuery } }, { fetchPolicy: 'network-only' })
          let response = await chatGPTResponse?.data?.AnswerGPT
          
          // Clean the response - remove markdown code blocks if present
          if (response) {
            // Remove markdown code blocks (```json ... ``` or ``` ... ```)
            response = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
            // Remove any leading/trailing whitespace
            response = response.trim()
            // Try to extract JSON if it's wrapped in other text
            const jsonMatch = response.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              response = jsonMatch[0]
            }
          }
          
          console.log('Raw ChatGPT response:', response)
          console.log('Raw ChatGPT response type:', typeof response)
          console.log('Raw ChatGPT response length:', response?.length)
          
          // Parse the JSON response
          try {
            IAJSONResponse = JSON.parse(response)
            console.log('Parsed IAJSONResponse:', IAJSONResponse)
          } catch (parseError) {
            console.error('Error parsing AI response as JSON:', parseError)
            console.error('Response that failed to parse:', response)
            throw new Error('AI response is not valid JSON')
          }
          
          // Step 4: Improve Response Cleaning - Preserve inferred values, only clean truly invalid responses
          const cleanedResponse = {
            type: (IAJSONResponse?.type && 
                   IAJSONResponse.type !== 'undefined' && 
                   IAJSONResponse.type !== 'null' && 
                   typeof IAJSONResponse.type === 'string' && 
                   IAJSONResponse.type.trim() !== '') 
                  ? IAJSONResponse.type.trim() 
                  : '-',
            companySectorDescription: (IAJSONResponse?.companySectorDescription && 
                                      IAJSONResponse.companySectorDescription !== 'undefined' && 
                                      IAJSONResponse.companySectorDescription !== 'null' && 
                                      typeof IAJSONResponse.companySectorDescription === 'string' && 
                                      IAJSONResponse.companySectorDescription.trim() !== '') 
                                     ? IAJSONResponse.companySectorDescription.trim() 
                                     : '-',
            subType: (IAJSONResponse?.subType && 
                     IAJSONResponse.subType !== 'undefined' && 
                     IAJSONResponse.subType !== 'null' && 
                     typeof IAJSONResponse.subType === 'string' && 
                     IAJSONResponse.subType.trim() !== '') 
                    ? IAJSONResponse.subType.trim() 
                    : '-',
            dateTimeEvent: (IAJSONResponse?.dateTimeEvent && 
                           IAJSONResponse.dateTimeEvent !== 'undefined' && 
                           IAJSONResponse.dateTimeEvent !== 'null' && 
                           typeof IAJSONResponse.dateTimeEvent === 'string' && 
                           IAJSONResponse.dateTimeEvent.trim() !== '') 
                          ? IAJSONResponse.dateTimeEvent.trim() 
                          : new Date().toString(),
            ticketCustomDescription: (IAJSONResponse?.ticketCustomDescription && 
                                     IAJSONResponse.ticketCustomDescription !== 'undefined' && 
                                     IAJSONResponse.ticketCustomDescription !== 'null' && 
                                     typeof IAJSONResponse.ticketCustomDescription === 'string' && 
                                     IAJSONResponse.ticketCustomDescription.trim() !== '') 
                                    ? IAJSONResponse.ticketCustomDescription.trim() 
                                    : (userQuery || '-'),
            riskQualificationDescription: (IAJSONResponse?.riskQualificationDescription && 
                                          IAJSONResponse.riskQualificationDescription !== 'undefined' && 
                                          IAJSONResponse.riskQualificationDescription !== 'null' && 
                                          typeof IAJSONResponse.riskQualificationDescription === 'string' && 
                                          IAJSONResponse.riskQualificationDescription.trim() !== '') 
                                         ? IAJSONResponse.riskQualificationDescription.trim() 
                                         : '-',
            solutionStateDescription: (IAJSONResponse?.solutionStateDescription && 
                                      IAJSONResponse.solutionStateDescription !== 'undefined' && 
                                      IAJSONResponse.solutionStateDescription !== 'null' && 
                                      typeof IAJSONResponse.solutionStateDescription === 'string' && 
                                      IAJSONResponse.solutionStateDescription.trim() !== '') 
                                     ? IAJSONResponse.solutionStateDescription.trim() 
                                     : '-',
            eventClassification: (IAJSONResponse?.eventClassification && 
                                  IAJSONResponse.eventClassification !== 'undefined' && 
                                  IAJSONResponse.eventClassification !== 'null' && 
                                  typeof IAJSONResponse.eventClassification === 'string' && 
                                  IAJSONResponse.eventClassification.trim() !== '') 
                                 ? IAJSONResponse.eventClassification.trim() 
                                 : '-'
          }
          
          IAJSONResponse = cleanedResponse
          console.log('IAJSONResponse (cleaned)\n', IAJSONResponse)
          setResponseJSON(JSON.stringify(IAJSONResponse))
          
          // En este punto hay que ver si se trata de un evento tipo ARI o PEI y en función de eso, se llama a ReportEventIA o ReportUrgentEventIA
          if (IAJSONResponse?.eventClassification === 'ARI - High Risk' || IAJSONResponse?.eventClassification === 'PEI - IMMINENT DANGER' || IAJSONResponse?.eventClassification === 'PEI - INMINENT RISK') {
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
          console.log('Raw response that failed to parse:', chatGPTResponse?.data?.AnswerGPT)
          console.log('===================================================')
          console.log('urgentReport =', urgentReport)
          console.log('error =', error)
          setIsUploading(false)
          Alert.alert('Error', 'Failed to process AI response. Please try recording again.')
        }
      } catch (err) {
        console.log('Error sending audio file to server...\n', err)
        setIsUploading(false)
        Alert.alert('Error', 'Failed to transcribe audio. Please try again.')
      }

      setRecording(null)
    } catch (error) {
      console.error('Error stopping recording:', error)
      Alert.alert('Error', 'Failed to stop recording. Please try again.')
      setIsRecording(false)
    }
  }

  const handleRecordAudio = async () => {
    // Use functional update to get current state
    setIsRecording((currentIsRecording) => {
      const shouldStartRecording = !currentIsRecording
      
      if (shouldStartRecording) {
        // Start recording
        startRecording().catch((error) => {
          console.error('Error in startRecording:', error)
          setIsRecording(false)
        })
      } else {
        // Stop recording
        stopRecording().catch((error) => {
          console.error('Error in stopRecording:', error)
        })
      }
      
      return shouldStartRecording
    })
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
  try {
    if (Platform.OS === 'android') {
      // Check Android permissions
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      )
      
      if (!hasPermission) {
        // Request permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Access to microphone',
            message: 'The app needs access to the microphone to make voice recordings for AI Reports.',
            buttonPositive: 'Accept',
            buttonNegative: 'Cancel'
          }
        )
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Microphone permission is required to record audio. Please enable it in your device settings.',
            [{ text: 'OK' }]
          )
          return false
        }
      }
    }
    
    // Check/Request expo-av audio permissions (works for both iOS and Android)
    const { status } = await Audio.getPermissionsAsync()
    if (status !== 'granted') {
      const { status: newStatus } = await Audio.requestPermissionsAsync()
      if (newStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Audio recording permission is required. Please enable it in your device settings.',
          [{ text: 'OK' }]
        )
        return false
      }
    }
    
    console.log('Audio recording permissions granted')
    return true
  } catch (error) {
    console.error('Error checking audio permissions:', error)
    Alert.alert('Error', 'Failed to check audio permissions. Please try again.')
    return false
  }
}

const buildQuery = (query, lOfCS, lOfQR, lOfSS, lOfTNClass, lOfNSType) => {
  // Step 2: Check if lists are empty and adjust prompt accordingly
  const hasCompanySectors = lOfCS !== '""' && lOfCS.length > 2
  const hasRiskQualifications = lOfQR !== '""' && lOfQR.length > 2
  const hasSolutionStates = lOfSS !== '""' && lOfSS.length > 2
  const hasClassifications = lOfTNClass !== '""' && lOfTNClass.length > 2
  const hasSubTypes = lOfNSType !== '""' && lOfNSType.length > 2
  
  const listsAvailable = hasCompanySectors || hasRiskQualifications || hasSolutionStates || hasClassifications || hasSubTypes
  
  // Prepare list strings - use empty string if list is not available to avoid showing '""' in prompt
  const companySectorsList = hasCompanySectors ? lOfCS : ''
  const riskQualificationsList = hasRiskQualifications ? lOfQR : ''
  const solutionStatesList = hasSolutionStates ? lOfSS : ''
  const classificationsList = hasClassifications ? lOfTNClass : ''
  const subTypesList = hasSubTypes ? lOfNSType : ''
  
  return `
Eres un experto en seguridad laboral. Analiza el siguiente evento de seguridad en una empresa y extrae TODA la información posible.

EVENTO: "${query}"

INSTRUCCIONES CRÍTICAS:
${listsAvailable 
  ? 'Tienes algunas listas de referencia disponibles. Úsalas como guía, pero SIEMPRE prioriza la inferencia inteligente basada en el contexto del evento. Si un valor no está exactamente en las listas pero puedes inferirlo del contexto, proporciona un valor razonable basado en tu conocimiento.' 
  : 'NO tienes listas de referencia disponibles. DEBES inferir TODOS los valores usando tu conocimiento experto sobre seguridad laboral y el contexto del evento descrito. Analiza en profundidad y proporciona valores apropiados basados en el tipo de evento, severidad, instalaciones mencionadas, etc.'}

IMPORTANTE: 
- Analiza el evento en PROFUNDIDAD y extrae TODA la información posible
- Busca palabras clave y contexto para inferir valores cuando sea lógico
- Usa tu conocimiento sobre seguridad laboral para proporcionar valores apropiados
- SOLO usa "-" cuando sea ABSOLUTAMENTE IMPOSIBLE determinar un valor incluso con inferencia profunda y análisis de contexto
- TÓMATE EL TIEMPO NECESARIO para analizar en profundidad antes de responder

En el caso de "Tipo de evento", sólo puede tener 2 resultados posibles. "Action", "Condition". "Action" es cuando una persona comete un acto inseguro para su persona, para otras personas,
o para la propia empresa, también está relacionado con las personas que no respetan las reglas de seguridad de la empresa. "Condition" es cuando existe infraestructura propia de la empresa que no es apta para el trabajo o está deteriorada o con falta de mantenimiento.
Si existe solapamiento de criterios respecto de "Tipo de evento", seleccionar "Condition".

"Sector de la empresa" es el sector de la empresa que es afectado por el evento de inseguridad.
${hasCompanySectors 
  ? `Valores posibles de referencia: ${companySectorsList}. Si el evento menciona un sector que coincide con la lista, úsalo. Si no coincide exactamente pero puedes inferir uno similar, úsalo.` 
  : 'NO hay lista de referencia. INFIERE el sector basándote en el contexto del evento: si menciona "producción", "almacén", "oficina", "mantenimiento", "planta", "logística", "calidad", "almacén", "patio", "cocina", "laboratorio", etc., proporciona un valor apropiado basado en tu conocimiento. Ejemplos: "Producción", "Almacén", "Oficina", "Mantenimiento", "Planta", etc.'}
Analiza el contexto del evento en profundidad. INFIERE un valor apropiado basado en las áreas o departamentos mencionados. Si no puedes determinar el sector incluso con inferencia profunda, usa "-".

"Calificación de riesgo" es la medición del nivel de riesgo asociado al evento.
${hasRiskQualifications 
  ? `Valores posibles de referencia: ${riskQualificationsList}. Si encuentras un valor que coincida con la severidad, úsalo. Si no coincide exactamente pero puedes inferir uno similar, úsalo.` 
  : 'NO hay lista de referencia. INFIERE la calificación de riesgo basándote en la SEVERIDAD del evento:'}
Analiza la SEVERIDAD del evento en profundidad:
- Lesión grave (fractura, hospitalización, pérdida de conciencia, lesión permanente, riesgo de muerte) → ${hasRiskQualifications ? 'busca en la lista valores relacionados con "ALTO", "GRAVE", "CRÍTICO", "SEVERO"' : 'INFERIR: "Alto", "Grave", "Crítico", "Severo", "Muy Alto" o similar'}
- Lesión moderada (herida que requiere atención médica, golpe significativo, incapacidad temporal, puntos de sutura) → ${hasRiskQualifications ? 'busca en la lista valores relacionados con "MEDIO", "MODERADO", "INTERMEDIO"' : 'INFERIR: "Medio", "Moderado", "Intermedio", "Medio-Alto" o similar'}
- Lesión menor (rasguño, golpe leve, contusión menor, moretón) o sin lesión pero con potencial peligro → ${hasRiskQualifications ? 'busca en la lista valores relacionados con "BAJO", "LEVE", "MÍNIMO"' : 'INFERIR: "Bajo", "Leve", "Mínimo", "Bajo-Medio" o similar'}
- Solo daño material sin lesión → ${hasRiskQualifications ? 'busca en la lista valores relacionados con "BAJO"' : 'INFERIR: "Bajo" o similar'}
Busca palabras clave como: "se rompió", "fractura", "hospital", "grave", "leve", "accidente", "lesión", "herida", "sangre", "dolor", "incapacidad", "moretón", "golpe", "caída". 
${hasRiskQualifications 
  ? 'Elige el valor más apropiado de la lista o infiere uno razonable si no hay coincidencia exacta.' 
  : 'INFERIR un valor apropiado basado en la severidad descrita. Ejemplos: "Alto", "Medio", "Bajo", "Grave", "Crítico", etc.'}
Si no puedes determinar incluso con inferencia profunda, usa "-".

"Sub tipo" hace referencia a la instalación que es causante o que está involucrada en el evento enunciado, también a tareas de las personas llevadas a cabo de forma riesgosa.
${hasSubTypes 
  ? `Valores posibles de referencia: ${subTypesList}. Si encuentras uno relacionado, úsalo. Si no coincide exactamente pero puedes inferir uno similar, úsalo.` 
  : 'NO hay lista de referencia. INFIERE el subtipo basándote en la instalación o tarea involucrada:'}
Identifica la INSTALACIÓN o TAREA involucrada en el evento analizando en profundidad:
- Si menciona "escaleras", "escalón", "escalera", "escalera mecánica", "bajó por escaleras", "subió escaleras" → ${hasSubTypes ? 'busca opciones relacionadas con escaleras, accesos, circulación, pasillos' : 'INFERIR: "Escaleras", "Accesos", "Circulación", "Pasillos", "Escaleras mecánicas", "Escaleras fijas" o similar'}
- Si menciona "máquina", "equipo", "herramienta", "maquinaria", "máquina de", "equipo de" → ${hasSubTypes ? 'busca opciones de maquinaria, equipos, herramientas' : 'INFERIR: "Maquinaria", "Equipos", "Herramientas", "Máquinas", "Equipos industriales" o similar'}
- Si menciona "carga", "levantar", "transportar", "manipulación", "cargó", "levantó" → ${hasSubTypes ? 'busca opciones de manipulación manual, carga, transporte' : 'INFERIR: "Manipulación manual", "Carga", "Transporte", "Levantamiento", "Manipulación de cargas" o similar'}
- Si menciona "altura", "caída", "caer", "andamio", "plataforma", "se cayó", "cayó" → ${hasSubTypes ? 'busca opciones de trabajo en altura, caídas, plataformas' : 'INFERIR: "Trabajo en altura", "Caídas", "Plataformas", "Andamios", "Caídas al mismo nivel", "Caídas a distinto nivel" o similar'}
- Si menciona "sustancia", "químico", "líquido", "material peligroso", "producto químico" → ${hasSubTypes ? 'busca opciones de sustancias químicas, materiales peligrosos' : 'INFERIR: "Sustancias químicas", "Materiales peligrosos", "Productos químicos", "Sustancias tóxicas" o similar'}
- Si menciona "eléctrico", "cable", "corriente", "instalación eléctrica", "electricidad" → ${hasSubTypes ? 'busca opciones de electricidad, instalaciones eléctricas' : 'INFERIR: "Electricidad", "Instalaciones eléctricas", "Cables", "Corriente eléctrica", "Riesgo eléctrico" o similar'}
- Si menciona "vehículo", "auto", "camión", "transporte", "montacargas", "grúa" → ${hasSubTypes ? 'busca opciones de vehículos, transporte' : 'INFERIR: "Vehículos", "Transporte", "Maquinaria móvil", "Vehículos industriales" o similar'}
- Si menciona "superficie", "piso", "suelo", "resbalón", "resbaló", "piso resbaloso" → ${hasSubTypes ? 'busca opciones relacionadas' : 'INFERIR: "Superficies", "Pisos", "Resbalones", "Superficies resbaladizas" o similar'}
${hasSubTypes 
  ? 'Busca el valor MÁS CERCANO o RELACIONADO en la lista, o infiere uno apropiado si no hay coincidencia.' 
  : 'INFERIR un valor apropiado basado en la instalación o tarea descrita. Ejemplos: "Escaleras", "Maquinaria", "Manipulación manual", "Trabajo en altura", etc.'}
Si no puedes determinar incluso con inferencia profunda, usa "-".

"Estado de solución" hace referencia al estado de la solución al problema que se indica en la descripción del evento.
${hasSolutionStates 
  ? `Valores posibles de referencia: ${solutionStatesList}. Si encuentras uno que coincida, úsalo. Si no coincide exactamente pero puedes inferir uno similar, úsalo.` 
  : 'NO hay lista de referencia. INFIERE el estado basándote en el contexto:'}
Analiza si el evento menciona el estado de la solución:
- Si dice "ya se arregló", "solucionado", "reparado", "corregido", "resuelto", "ya está bien" → ${hasSolutionStates ? 'busca estados relacionados con "Resuelto", "Completado", "Solucionado"' : 'INFERIR: "Resuelto", "Completado", "Solucionado", "Cerrado" o similar'}
- Si dice "pendiente", "hay que arreglar", "falta solucionar", "sin resolver", "aún no se ha solucionado" → ${hasSolutionStates ? 'busca estados relacionados con "Pendiente", "Por resolver"' : 'INFERIR: "Pendiente", "Por resolver", "Sin resolver", "Abierto" o similar'}
- Si dice "en proceso", "se está arreglando", "en curso", "en trámite" → ${hasSolutionStates ? 'busca estados relacionados con "En proceso", "En curso"' : 'INFERIR: "En proceso", "En curso", "En trámite" o similar'}
Si NO se menciona el estado en el evento, típicamente es "Pendiente" (asume que el evento acaba de ocurrir y aún no se ha resuelto). 
${hasSolutionStates 
  ? 'Si no puedes determinar, usa el primer valor de la lista que indique pendiente, o "-" si no hay.' 
  : 'Si no puedes determinar, INFERIR "Pendiente" como valor por defecto (es el más común para eventos recién reportados), o usa "-" si es absolutamente imposible.'}

"Clasificación de evento" hace referencia a un sistema de clasificación de los riesgos y puede estar relacionado tanto a cuestiones de actitud como de infraestructura.
${hasClassifications 
  ? `Valores posibles de referencia: ${classificationsList}. Si encuentras uno apropiado, úsalo. Si no coincide exactamente pero puedes inferir uno similar, úsalo.` 
  : 'NO hay lista de referencia. INFIERE la clasificación basándote en el TIPO y GRAVEDAD del evento:'}
Analiza el TIPO y GRAVEDAD del evento en profundidad:
- Lesión grave con riesgo físico extremo (muerte, lesión permanente, hospitalización prolongada, riesgo inminente, fractura grave) → ${hasClassifications ? 'busca "ARI - High Risk" o "PEI - IMMINENT DANGER" o "PEI - INMINENT RISK" o similar' : 'INFERIR: "ARI - High Risk", "PEI - IMMINENT DANGER", "Riesgo Crítico", "Alto Riesgo", "Riesgo Extremo" o similar'}
- Lesión moderada o accidente significativo (herida que requiere atención médica, incapacidad temporal, puntos de sutura) → ${hasClassifications ? 'busca clasificaciones de riesgo medio' : 'INFERIR: clasificaciones de "Riesgo Medio", "Moderado", "Intermedio", "Medio-Alto" o similar'}
- Lesión menor, incidente sin lesión, o condición de riesgo bajo (rasguño, golpe leve, condición sin lesión, moretón) → ${hasClassifications ? 'busca clasificaciones de riesgo bajo' : 'INFERIR: clasificaciones de "Riesgo Bajo", "Leve", "Mínimo", "Bajo-Medio" o similar'}
Busca palabras clave relacionadas con la gravedad y tipo de evento: "grave", "crítico", "inminente", "hospital", "fractura", "lesión", "accidente", "incidente", "condición", "riesgo", "peligro".
${hasClassifications 
  ? 'Elige el valor más apropiado de la lista, o infiere uno razonable si no hay coincidencia exacta.' 
  : 'INFERIR un valor apropiado basado en la gravedad y tipo descritos. Ejemplos: "ARI - High Risk", "Riesgo Medio", "Riesgo Bajo", etc.'}
Si no puedes determinar incluso con inferencia profunda, usa "-".

"Descripción del evento" será siempre en la lengua original en la que se realizó. Usa la descripción original tal como fue narrada, sin modificar.

"Clasificación de evento", tener en cuenta que las opciones "ARI - High Risk" o "PEI - INMINENT RISK" solamente deberán ser consideradas en casos extremos de gran riesgo fisico para las personas.

Para la "Fecha y hora del evento", cuando no son proporcionadas en la descripción del evento, asignar la fecha y hora local del dispositivo, al momento de recibir esta consulta.
Respecto de lo que se mencione en el evento, ten como referencia que hoy es ${new Date()}. Por ejemplo, cuando en el evento se dice "ayer" es un dia menos que la fecha que debes considerar como hoy.
Si se menciona "hace X días", "la semana pasada", etc., calcula la fecha correspondiente.

Considerar que toda la respuesta debe ser un objeto JSON válido como sigue (responde SOLO con el JSON, sin markdown, sin explicaciones):

{
  "type": "Action" o "Condition",
  "companySectorDescription": "valor exacto de la lista o \"-\"",
  "subType": "valor exacto de la lista o \"-\"",
  "dateTimeEvent": "fecha y hora",
  "ticketCustomDescription": "descripción del evento",
  "riskQualificationDescription": "valor exacto de la lista o \"-\"",
  "solutionStateDescription": "valor exacto de la lista o \"-\"",
  "eventClassification": "valor exacto de la lista o \"-\""
}
`
}

export default NewVoice
