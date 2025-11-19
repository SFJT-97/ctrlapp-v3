// Environment variable type definitions

declare namespace NodeJS {
  interface ProcessEnv {
    // Firebase
    EXPO_PUBLIC_FIREBASE_API_KEY?: string
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string
    EXPO_PUBLIC_FIREBASE_PROJECT_NUMBER?: string
    EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string
    EXPO_PUBLIC_FIREBASE_APP_ID?: string
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string
    EXPO_PUBLIC_FIREBASE_SERVER_KEY?: string

    // API
    EXPO_PUBLIC_API_URL?: string
  }
}

