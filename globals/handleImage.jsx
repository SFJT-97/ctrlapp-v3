// ==> 2024-10-02
// Builtin modules
import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'

// Custom modules
import imagesToWEBP from './functions/imagesToWEBP' // activar si quiero modificar el tamaño

const IMAGE_QUALITY = 0.8
const IMAGE_ASPECT = [3, 4]
const IMAGE_SIZE = 10485760

export const handleInternalMemory = async (setImage, isProfileImg = false, returnOnlyUri = false) => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'image/*', // Muestra solo archivos de tipo imagen
    multiple: false,
    quality: isProfileImg ? 0.7 : IMAGE_QUALITY,
    allowsEditing: false,
    // aspect: IMAGE_ASPECT,
    size: IMAGE_SIZE // Limitar a archivos de hasta 10 MB (en bytes)
  })
  // console.log('result from internal memory\n', result.assets[0])
  try {
    /*
      // INICIO, si quiero modificar el tamaño
      // console.log('antes', result.assets[0])
      // const tempImage = await imagesToWEBP(result.assets[0])
      // // console.log('despues', tempImage)
      // if (tempImage !== null) {
      //   // si la conversión a webp es exitosa, entonces la utiliza.
      //   setImage(tempImage)
      // } else {
      //   // si la conversión a webp no fue exitosa, entonces utiliza el archivo original.
      //   setImage(result.assets[0])
      // }
      // FIN, si quiero modificar el tamaño
    */
    if (isProfileImg) {
      console.log('internal memory:\n', result.assets[0])
      returnOnlyUri ? setImage(imagesToWEBP(result.assets[0]).uri) : setImage(imagesToWEBP(result.assets[0]))
    } else {
      console.log('internal memory:\n', result.assets[0])
      returnOnlyUri ? setImage(result.assets[0].uri) : setImage(result.assets[0])
    }
  } catch (error) {
    console.log(error)
  }
}

export const handleChangeImageFromGallery = async (setImage, isProfileImg = false, returnOnlyUri = false) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: isProfileImg ? 0.7 : IMAGE_QUALITY,
    aspect: IMAGE_ASPECT,
    allowsEditing: true,
    size: IMAGE_SIZE
  })
  try {
    if (!result.canceled && hasGalleryPermission) {
      delete result.cancelled
      /*
        // INICIO, si quiero modificar el tamaño
        // // console.log('antes ==> result from Gallery\n', result.assets[0])
        // const tempImage = await imagesToWEBP(result?.assets[0])
        // // console.log('despues ==> tempImage\n', tempImage)

        // if (tempImage !== null) {
        //   // si la conversión a webp es exitosa, entonces la utiliza.
        //   setImage(tempImage)
        // } else {
        //   // si la conversión a webp no fue exitosa, entonces utiliza el archivo original.
        //   setImage(result?.assets[0])
        // }
        // FIN, si quiero modificar el tamaño
      */
      if (isProfileImg) {
        console.log('gallery\n', result?.assets[0])
        returnOnlyUri ? setImage(imagesToWEBP(result?.assets[0]).uri) : setImage(imagesToWEBP(result?.assets[0]))
      } else {
        console.log('gallery\n', result?.assets[0])
        returnOnlyUri ? setImage(result?.assets[0].uri) : setImage(result?.assets[0])
      }
    }
  } catch (error) {
    console.info(error)
  }
}

export const handleChangeImageFromCamera = async (setImage, isProfileImg = false, cameraRef, system = 1) => {
  // system === 1 indica el modo de las ultimas versiones de Android y "probablemente" de IOS, para versiones anteriores de Android, convendría usar system !== 1
  if (system === 1) {
    if (await hasCameraPermission()) {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: isProfileImg ? 0.7 : IMAGE_QUALITY,
          skipProcessing: true
        })
        console.log('photo\n', photo)
        if (isProfileImg) {
          setImage(imagesToWEBP(photo))
        } else {
          setImage(photo)
        }
      }
    }
  } else {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: isProfileImg ? 0.7 : IMAGE_QUALITY,
        aspect: IMAGE_ASPECT,
        allowsEditing: false
        // size: IMAGE_SIZE
      })
      console.log('lo que devuelve', result?.assets[0])
      if (!result.canceled && hasCameraPermission) {
        delete result.cancelled
        if (isProfileImg) {
          setImage(imagesToWEBP(result?.assets[0]))
        } else {
          setImage(result?.assets[0])
        }
      }
    } catch (error) {
      console.info(error)
    }
  }
}

export async function showImageOptions (setImage, alTtle = 'Select image...', alMsg = 'from:', isProfileImg = false, returnOnlyUri = false) {
  Alert.alert(alTtle, alMsg, [
    {
      text: '⛔ Cancel',
      style: 'cancel'
      // onPress: () => Alert.alert('canceled by user')
    },
    {
      text: '📂 Internal Memory',
      onPress: () => handleInternalMemory(setImage, isProfileImg, returnOnlyUri)
    },
    {
      text: '🖼️ Gallery',
      onPress: () => handleChangeImageFromGallery(setImage, isProfileImg, returnOnlyUri)
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
