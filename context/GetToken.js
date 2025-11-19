// GetToken.js
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
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
    // FIXED: On iOS, register for remote notifications using Expo first to get APNS token
    // This must be done before getting the FCM token from Firebase
    if (Platform.OS === 'ios') {
      try {
        // Use Expo's notification system to register for remote notifications
        // This ensures APNS token is available before requesting FCM token
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        if (existingStatus !== 'granted') {
          await Notifications.requestPermissionsAsync()
        }
        
        // Register device for remote notifications (this gets the APNS token)
        await Notifications.getDevicePushTokenAsync()
        
        // Give a small delay to ensure APNS token is registered with Firebase
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (registerError) {
        // If registration fails, log but continue - might still work
        console.warn('Warning: Could not register for remote notifications:', registerError)
      }
    }
    
    const messaging = getMessaging(getApp())
    const token = await getToken(messaging)
    if (token) {
      console.log('FCM Token:', token)
      return token
    } else {
      console.warn('FCM Token is null or undefined')
      return null
    }
  } catch (error) {
    // FIXED: Handle APNS token error gracefully
    if (error?.message?.includes('APNS token') || error?.code === 'messaging/unknown') {
      console.warn('APNS token not available yet. This is normal on first launch or if notification permissions are not granted. Token will be available after user grants notification permission.')
      return null
    }
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
