// Firebase configuration types

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectNumber: string
  projectId: string
  storageBucket: string
  appId: string
  messagingSenderId: string
  serverKey: string
}

export interface FirebaseEnv {
  EXPO_PUBLIC_FIREBASE_API_KEY: string
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: string
  EXPO_PUBLIC_FIREBASE_PROJECT_NUMBER: string
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: string
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: string
  EXPO_PUBLIC_FIREBASE_APP_ID: string
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
  EXPO_PUBLIC_FIREBASE_SERVER_KEY: string
}

