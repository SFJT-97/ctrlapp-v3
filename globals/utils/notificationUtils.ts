/**
 * Utility functions for sending local device notifications
 * Uses expo-notifications for local notifications
 */

import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
})

/**
 * Request notification permissions if not already granted
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()

    if (existingStatus === 'granted') {
      return true
    }

    // Request permission if not granted
    const { status } = await Notifications.requestPermissionsAsync()
    
    if (status === 'granted') {
      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: true,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C'
        })
      }
      return true
    }

    return false
  } catch (error) {
    console.error('Error requesting notification permissions:', error)
    return false
  }
}

/**
 * Send a local notification
 */
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string | null> => {
  try {
    // Request permissions first
    const hasPermission = await requestNotificationPermissions()
    if (!hasPermission) {
      console.warn('Notification permission not granted')
      return null
    }

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true
      },
      trigger: null // Send immediately
    })

    return notificationId
  } catch (error) {
    console.error('Error sending local notification:', error)
    return null
  }
}

/**
 * Send notification when offline report is successfully uploaded
 */
export const notifyReportUploaded = async (ticketId?: string, classification?: string): Promise<void> => {
  const title = 'Report Sent Successfully'
  const body = classification
    ? `Your offline ${classification} report has been successfully sent.`
    : 'Your offline report has been successfully sent.'
  
  await sendLocalNotification(title, body, {
    type: 'report_uploaded',
    ticketId: ticketId || null
  })
}

/**
 * Send notification when voice event is ready for AI processing
 */
export const notifyVoiceEventReady = async (): Promise<void> => {
  const title = 'AI Ready to Process'
  const body = 'AI is ready to process your voice event. Open the app and click Continue.'
  
  await sendLocalNotification(title, body, {
    type: 'voice_event_ready',
    deepLink: '/report/newvoice/upload/[upload]'
  })
}

