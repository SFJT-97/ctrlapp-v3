import { initializeApp, FirebaseApp } from 'firebase/app'
import messaging from '@react-native-firebase/messaging'
import { FirebaseConfig } from './types/firebase'

// Load configuration from environment variables
const getFirebaseConfig = (): FirebaseConfig => {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectNumber = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_NUMBER
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  const serverKey = process.env.EXPO_PUBLIC_FIREBASE_SERVER_KEY

  // Validate required environment variables
  if (!apiKey || !authDomain || !projectNumber || !projectId || !storageBucket || !appId || !messagingSenderId) {
    throw new Error(
      'Missing required Firebase environment variables. Please check your .env file.'
    )
  }

  if (!serverKey) {
    console.warn(
      'WARNING: EXPO_PUBLIC_FIREBASE_SERVER_KEY is not set. Push notifications may not work correctly.'
    )
  }

  return {
    apiKey,
    authDomain,
    projectNumber,
    projectId,
    storageBucket,
    appId,
    messagingSenderId,
    serverKey: serverKey || ''
  }
}

const firebaseConfig = getFirebaseConfig()

// Initialize Firebase app
const firebaseApp: FirebaseApp = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
})

export { messaging, firebaseConfig }
export default firebaseApp

