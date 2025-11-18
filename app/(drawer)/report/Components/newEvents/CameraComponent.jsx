/* eslint-disable import/named */
import { CameraView, Camera } from 'expo-camera'
import { useState, useRef, useEffect } from 'react'
import { StyleSheet, View, Dimensions, BackHandler } from 'react-native'
import { Button, IconButton, Surface, useTheme } from 'react-native-paper'
import Slider from '@react-native-community/slider'

const WINDOW_HEIGHT = Dimensions.get('window').height
const WINDOW_WIDTH = Dimensions.get('window').width

const CameraComponent = ({ setImageVideo, mode, setIsCameraActive, isCameraActive, wichCamera = 'back', optionOnlyShot = false }) => {
  const [facing, setFacing] = useState(wichCamera)
  const [isRecording, setIsRecording] = useState(false)
  const [flash, setFlash] = useState('off')
  const [zoom, setZoom] = useState(0)
  const cameraRef = useRef(null)
  const theme = useTheme()
  const handleCapture = async () => {
    if (!(await hasCameraPermission())) return

    if (cameraRef.current) {
      if (mode === 'picture') {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true })
        optionOnlyShot ? setImageVideo(photo.uri) : setImageVideo(photo)
        setIsCameraActive(prev => !prev)
      } else if (mode === 'video') {
        if (isRecording) {
          cameraRef.current.stopRecording()
          setIsRecording(false)
        } else {
          setIsRecording(true)
          const video = await cameraRef.current.recordAsync({ quality: '720p' })
          setImageVideo(video)
          setIsRecording(false)
          setIsCameraActive(prev => !prev)
        }
      }
    }
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'))
  }

  const hasCameraPermission = async () => {
    const cameraStatus = await (Camera.requestCameraPermissionsAsync() && Camera.requestMicrophonePermissionsAsync())
    return cameraStatus.status === 'granted'
  }

  useEffect(() => {
    const onBackPress = () => {
      if (isRecording) {
        // Si está grabando, detenemos la grabación
        cameraRef.current?.stopRecording()
        setIsRecording(false)
      }

      // Cerramos la cámara
      // setIsCameraActive(false)

      // Evitamos que el sistema maneje el botón "volver"
      return true
    }
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress)

    return () => backHandler.remove()
  }, [isRecording])

  useEffect(() => {
    hasCameraPermission()
  }, [])

  if (optionOnlyShot) {
    return (
      <View style={styles.roundContainer}>
        <CameraView style={styles.cameraRound} facing={facing} ref={cameraRef} mode={mode} flash={flash} zoom={zoom} />
        <Button mode='contained' onPress={handleCapture} style={{ marginTop: 12 }}>
          Tomar foto
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} mode={mode} flash={flash} zoom={zoom} />

      <Surface style={styles.controls}>
        {!isRecording && (
          <IconButton
            icon='camera-switch'
            size={28}
            onPress={toggleCameraFacing}
            accessibilityLabel='Cambiar cámara'
            iconColor={theme.colors.primary}
          />
        )}
        {facing === 'back' && mode === 'picture' && !isRecording && (
          <IconButton
            icon={flash === 'on' ? 'flash' : 'flash-off'}
            size={28}
            onPress={toggleFlash}
            iconColor={flash === 'on' ? theme.colors.warning : theme.colors.primary}
          />
        )}
        <IconButton
          iconColor={mode === 'video' ? (isRecording ? theme.colors.error : theme.colors.primary) : theme.colors.primary}
          onPress={handleCapture}
          size={28}
          icon={mode === 'video' ? (isRecording ? 'stop' : 'video') : 'camera'}
        />
        <IconButton
          iconColor={theme.colors.error}
          onPress={() => setIsCameraActive(prev => !prev)}
          size={28}
          icon='cancel'
        />
      </Surface>
      <View style={styles.zoomContainer}>
        <Slider
          value={zoom}
          onValueChange={value => setZoom(value)}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          style={{ width: '80%', height: 40 }}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor='#ccc'
          thumbTintColor={theme.colors.primary}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: 'black',
    height: WINDOW_HEIGHT * 0.8,
    width: WINDOW_WIDTH * 0.85
  },
  camera: {
    flex: 1
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: 'white',
    elevation: 4
  },
  roundContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: 'black'
  },
  cameraRound: {
    width: '100%',
    height: '100%'
  },
  zoomContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white'
  }
})

export default CameraComponent
