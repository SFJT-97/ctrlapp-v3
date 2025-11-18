// Builtin modules
import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'

export const handleInternalMemory = async (setVideo) => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'video/*', // Muestra solo archivos de tipo imagen
    multiple: false,
    allowsEditing: true,
    quality: 0.8,
    size: 30000000 // Limitar a archivos de hasta 30 MB (en bytes)
  })
  console.log('result from internal memory\n', result.assets[0])
  try {
    setVideo(result.assets[0])
  } catch (error) {
    console.log(error)
  }
}

export const handleChangeVideoFromGallery = async (setVideo) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: true,
    quality: 0.8,
    videoMaxDuration: 60
  })
  try {
    if (!result.canceled && hasGalleryPermission) {
      delete result.cancelled
      console.log('result from Gallery\n', result.assets[0])
      setVideo(result?.assets[0])
    }
  } catch (error) {
    console.info(error)
  }
}

export const handleChangeVideoFromCamera = async (setVideo) => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: true,
    quality: 0.8,
    videoMaxDuration: 60
  })
  try {
    if (!result.canceled && hasCameraPermission) {
      delete result.cancelled
      console.log('result from Cammera\n', result.assets[0])
      setVideo(result?.assets[0])
    }
  } catch (error) {
    console.info(error)
  }
}

export async function showVideoOptions (setVideo, alTtle = 'Select video...', alMsg = 'from:') {
  Alert.alert(alTtle, alMsg, [
    // {
    //   text: 'Camera 📷',
    //   onPress: () => handleChangeVideoFromCamera(setVideo),
    //   style: 'default',
    //   isPreferred: true
    // },
    {
      text: '⛔ Cancel',
      style: 'cancel'
      // onPress: () => Alert.alert('canceled by user')
    },
    {
      text: '📂 Internal Memory',
      onPress: () => handleInternalMemory(setVideo)
    },
    {
      text: '🖼️ Gallery',
      onPress: () => handleChangeVideoFromGallery(setVideo)
    }
  ], 'cancelable')
}

const hasGalleryPermission = async () => {
  const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
  return (galleryStatus.status === 'granted')
}

const hasCameraPermission = async () => {
  const cameraStatus = await ImagePicker.requestCameraPermissionsAsync()
  return (cameraStatus.status === 'granted')
}