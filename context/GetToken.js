// GetToken.js
import { getApp } from '@react-native-firebase/app'
import { getMessaging, requestPermission, getToken } from '@react-native-firebase/messaging'

async function requestFCMPermission () {
  let result = false
  try {
    const messaging = getMessaging(getApp())
    const authStatus = await requestPermission(messaging)
    const enabled =
      authStatus === 1 || // AUTHORIZED
      authStatus === 2 // PROVISIONAL

    if (enabled) {
      result = true
      console.log('Permiso para notificaciones concedido.')
    }
  } catch (error) {
    console.error('Error requesting FCM permission:', error)
  }
  return result
}

export const GetToken = async () => {
  if (!(await requestFCMPermission())) return null
  try {
    const messaging = getMessaging(getApp())
    // Register for remote messages (iOS-specific)
    const token = await getToken(messaging)
    console.log('FCM Token:', token)
    return token
  } catch (error) {
    console.error('Error obteniendo el token FCM:', error)
    return null
  }
}

/*
  // import * as Notifications from 'expo-notifications'

  // export const GetToken = async () => {
  //   const { status } = await Notifications.getPermissionsAsync()
  //   if (status !== 'granted' && status !== 'undetermined') {
  //     console.log('Permission to notifications was denied')
  //     return
  //   }
  //   const token = (await (Notifications.getExpoPushTokenAsync())).data
  //   console.log('token ID DEVICE= ', token)

  //   return token
  // }
*/

/*
  Funcional 100% para expo-notifications. Sirve para la etapa de desarrollo, pero al pasar a producción deja de tener sentido...
*/

/*
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

export const GetToken = async () => {
  const { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted' && status !== 'undetermined') {
    console.log('Permission to notifications was denied')
    return
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.manifest?.extra?.eas?.projectId

  if (!projectId) {
    console.error("No 'projectId' found. Make sure it's set in app.json or app.config.js")
    return
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
  console.log('token ID DEVICE= ', token)

  return token
}

*/
