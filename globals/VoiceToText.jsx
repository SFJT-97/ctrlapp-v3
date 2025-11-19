/* eslint-disable import/namespace */
import React, { useEffect, useState, useRef } from 'react'
import { Alert, View, ScrollView } from 'react-native'
import Voice from '@react-native-voice/voice'
import { IconButton, TextInput, useTheme, Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import TimerCircle from '../app/(drawer)/report/Components/newEvents/TimerCircle'
import ImageVideo from '../app/(drawer)/report/Components/newEvents/ImageVideo'
import CameraComponent from '../app/(drawer)/report/Components/newEvents/CameraComponent'
import { useRouter } from 'expo-router'

// Imports for save locally files and mutations when there are no connection available
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CustomActivityIndicator from './components/CustomActivityIndicator'

const PENDING_UPLOADS_KEY = 'PendingTickets-' + Date.now().toString()

const LANG_CODE = 'es-US'

export default function VoiceToText () {
  const { t } = useTranslation('voice')
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const isActiveRef = useRef(false) // usamos una referencia para tener acceso en cualquier callback
  const listeningRef = useRef(false)
  const theme = useTheme()
  const router = useRouter()

  // Agregado para la carga
  const [image1, setImage1] = useState(undefined)
  const [image2, setImage2] = useState(undefined)
  const [image3, setImage3] = useState(undefined)
  const [video, SetVideo] = useState(undefined)

  // Estado para saber si se activó la camara o no
  const [isCameraActive, setIsCameraActive] = useState(false)

  // Estado para saber desde la cámara nueva, cual SetImage usar
  const [cameraSelected, setCameraSelected] = useState(1)

  // Armo un estado load para saber cuando se está subiendo información
  const [load, setLoad] = useState(false)

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      const result = e.value[0]
      setText(prev => prev + ' ' + result)
    }

    Voice.onSpeechEnd = () => {
      console.log('Reconocimiento terminó.')
      listeningRef.current = false
      if (isActiveRef.current) {
        console.log('Reiniciando...')
        setTimeout(() => {
          Voice.start(LANG_CODE)
        }, 5000)
      }
    }

    Voice.onSpeechError = (e) => {
      const code = e.error?.code
      const message = e.error?.message || 'Error desconocido'

      console.log(`Error de voz [${code}]: ${message}`)

      if (code === '12') {
        // No entendió nada, pero no es grave
        Alert.alert(t('errors.notUnderstood'))
      } else if (code === '5') {
        // Error cliente: reiniciamos la escucha
        Alert.alert(t('errors.recognitionError'))
        Voice.destroy().then(() => {
          setTimeout(() => {
            Voice.start(LANG_CODE)
          }, 500) // Pausa breve antes de reiniciar
        })
      } else {
        Alert.alert(t('errors.title'), `${code}: ${message}`)
      }
    }

    return () => {
      Voice.destroy().then(Voice.removeAllListeners)
    }
  }, [])

  const startListening = async () => {
    if (listeningRef.current) return
    try {
      setText('')
      isActiveRef.current = true
      setIsListening(true)
      listeningRef.current = true
      await Voice.start(LANG_CODE)
    } catch (e) {
      console.error(e)
      Alert.alert(t('errors.startError'), e.message || t('errors.unknown'))
    }
  }

  const stopListening = async () => {
    try {
      isActiveRef.current = false
      setIsListening(false)
      listeningRef.current = false
      await Voice.stop()
    } catch (e) {
      console.error(e)
    }
  }

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

  const savePendingTicket = async (ticketData) => {
    try {
      const pendingTickets = JSON.parse(await AsyncStorage.getItem(PENDING_UPLOADS_KEY)) || []
      pendingTickets.push(ticketData)
      await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pendingTickets))
    } catch (error) {
      console.log('Error saving pending ticket:', error)
    }
  }

  const handleSubmit = async () => {
    setLoad(true)

    const mediaPaths = []
    if (image1) mediaPaths.push(await saveFileLocally(image1))
    if (image2) mediaPaths.push(await saveFileLocally(image2))
    if (image3) mediaPaths.push(await saveFileLocally(image3))
    if (video) mediaPaths.push(await saveFileLocally(video))
    const ticketData = {
      ticketCustomDescription: text,
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
      costAsociated: 0
    }
    // Acá vamos a agregar {fromVoiceOffLine: true}, después en el "watchNewTickets" servirá para saber como subirlo
    await savePendingTicket({ data: ticketData, files: mediaPaths, fromVoiceOffLine: true })
    Alert.alert(t('errors.title'), t('messages.savedOffline'))
    router.navigate({ pathname: 'report' })
    setLoad(false)
  }

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
    <View style={{ padding: 20 }}>
      <IconButton
        icon={isListening ? 'microphone' : 'microphone-outline'}
        mode='contained-tonal'
        size={65}
        iconColor={theme.colors.primary}
        containerColor={isListening ? theme.colors.tertiaryContainer : theme.colors.secondaryContainer}
        animated
        onPress={isListening ? stopListening : startListening}
      />
      {isListening && <TimerCircle duration={60} stopListening={stopListening} />}
      {text && (
        <ScrollView>
          <TextInput
            multiline
            style={{ flex: 1, marginTop: 10 }}
            value={text}
            onChangeText={setText}
          />
          {isCameraActive
            ? (
              <CameraComponent
                mode={modeSelected}
                setImageVideo={seterSelected}
                setIsCameraActive={setIsCameraActive}
                isCameraActive={isCameraActive}
              />
              )
            : (
              <ImageVideo
                setImage1={setImage1}
                setImage2={setImage2}
                setImage3={setImage3}
                setVideo={SetVideo}
                image1={image1}
                image2={image2}
                image3={image3}
                video={video}
                setIsCameraActive={setIsCameraActive}
                isCameraActive={isCameraActive}
                setCameraSelected={setCameraSelected}
              />
              )}
          <Button compact style={{ padding: 5, marginTop: 30, backgroundColor: theme.colors.primary }} mode='contained' onPress={handleSubmit}>
            {t('buttons.registerEvent')}
          </Button>
        </ScrollView>
      )}
      {load && <CustomActivityIndicator />}
    </View>
  )
}
