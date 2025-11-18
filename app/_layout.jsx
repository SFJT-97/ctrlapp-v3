/* eslint-disable import/namespace */
// Contexts
import { useContext, useEffect } from 'react'
import { Slot } from 'expo-router'
import { ApolloProvider } from '@apollo/client'
import createApolloClient from '../context/apolloClient.js'
import { DataProvider } from '../context/DataContext.js'
import { GetToken } from '../context/GetToken'

import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { PaperProvider } from 'react-native-paper'
import { ThemeContext, ThemeProviderCustom } from '../globals/styles/ThemeContext.js'
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'

import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n/index.js'

import * as Notifications from 'expo-notifications'

const apolloClient = createApolloClient()

/* Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

Notifications.setNotificationChannelAsync('default', {
  name: 'default',
  importance: Notifications.AndroidImportance.HIGH,
  enableLights: true
}) */

Notifications.setNotificationHandler(null)

export default function RootLayout () {
  useEffect(() => {
    GetToken().then((token) => {
      if (token) {
        console.log('FCM Token fetched in RootLayout:', token)
      }
    })
  }, [])

  return (
    <ThemeProviderCustom>
      <InnerApp />
    </ThemeProviderCustom>
  )
}

function InnerApp () {
  const { themeColors, themeNavColors } = useContext(ThemeContext)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <DataProvider>
          <ApolloProvider client={apolloClient}>
            <PaperProvider theme={themeColors}>
              <NavigationThemeProvider value={themeNavColors}>
                <Slot />
              </NavigationThemeProvider>
            </PaperProvider>
          </ApolloProvider>
        </DataProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  )
}

/* import { useContext } from 'react'
import { ApolloProvider } from '@apollo/client'
import createApolloClient from '../context/apolloClient.js'
import { DataProvider } from '../context/DataContext.js'
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'
import { PaperProvider } from 'react-native-paper'
import { Slot } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n/index.js' // Path to your i18n config

import { ThemeContext, ThemeProviderCustom } from '../globals/styles/ThemeContext.js'

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

Notifications.setNotificationChannelAsync('default', {
  name: 'default',
  importance: Notifications.AndroidImportance.HIGH,
  enableLights: true
})

export default function RootLayout () {
  return (
    <ThemeProviderCustom>
      <InnerApp />
    </ThemeProviderCustom>
  )
}

function InnerApp () {
  const { themeColors, themeNavColors } = useContext(ThemeContext)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <DataProvider>
          <ApolloProvider client={apolloClient}>
            <PaperProvider theme={themeColors}>
              <NavigationThemeProvider value={themeNavColors}>
                <Slot />
              </NavigationThemeProvider>
            </PaperProvider>
          </ApolloProvider>
        </DataProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  )
} */

// Funcional hasta el 10/5/2025
// // ==> 2024-10-02
// import { useState, useEffect } from 'react'
// import { ApolloProvider } from '@apollo/client'
// import createApolloClient from '../context/apolloClient.js'
// import { DataProvider } from '../context/DataContext.js'
// import { LightThemeColors, LightThemeNavColors, DarkThemeColors, DarkThemeNavColors } from '../globals/styles/theme.js'
// import AsyncStorage from '@react-native-async-storage/async-storage'

// import * as Notifications from 'expo-notifications'
// import { PaperProvider } from 'react-native-paper'
// import { ThemeProvider } from '@react-navigation/native'
// import { Slot } from 'expo-router'

// const apolloClient = createApolloClient()

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false
//   })
// })

// Notifications.setNotificationChannelAsync('default', {
//   name: 'default',
//   importance: Notifications.AndroidImportance.HIGH,
//   enableLights: true
// })

// export default function RootLayout () {
//   const [themeColors, setThemeColors] = useState(LightThemeColors) // Light Theme Default
//   const [themeNavColors, setThemeNavColors] = useState(LightThemeColors) // Light Theme Default

//   useEffect(() => {
//     const fetchStorage = async () => {
//       try {
//         const theme = await AsyncStorage.getItem('theme')
//         if (theme === 'dark') {
//           setThemeColors(DarkThemeColors)
//           setThemeNavColors(DarkThemeNavColors)
//         } else {
//           setThemeColors(LightThemeColors)
//           setThemeNavColors(LightThemeNavColors)
//         }
//       } catch (error) {
//         setThemeColors(LightThemeColors)
//         setThemeNavColors(LightThemeNavColors)
//         console.error('Error al cargar el tema:', error)
//       }
//     }
//     fetchStorage()
//   }, [])
//   return (
//     <DataProvider>
//       <ApolloProvider client={apolloClient}>
//         <PaperProvider theme={themeColors}>
//           <ThemeProvider value={themeNavColors}>
//             <Slot />
//           </ThemeProvider>
//         </PaperProvider>
//       </ApolloProvider>
//     </DataProvider>
//   )
// }
