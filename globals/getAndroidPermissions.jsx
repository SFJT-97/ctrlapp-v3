import { PermissionsAndroid } from 'react-native'

export const requestAudioPermission = async () => {
  const prevAccess = await checkAudioPermission()
  if (prevAccess) return true
  let result = false
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Access to microphone',
        message: 'The app needs access to the microphone to make voice recordings for AI Reports.',
        buttonPositive: 'Accept',
        buttonNegative: 'Cancel'
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Microphone permission granted')
      // Ahora puedes iniciar el reconocimiento de voz u otras acciones relacionadas con el micrófono
      result = true
    } else {
      console.log('Microphone permission denied')
      // Manejar la denegación de permisos, por ejemplo, mostrar un mensaje al usuario
    }
  } catch (error) {
    console.error('Error requesting microphone permission...:', error)
  }
  return result
}

// Para saber si ya estaban otorgados de antes los permisos
const checkAudioPermission = async () => {
  const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
  console.log('hasPermission ==> ', hasPermission)
  if (hasPermission) {
    return true
  } else {
    return false
  }
}
// Falta una función similar para el caso de IOS
