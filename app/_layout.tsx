/* eslint-disable import/namespace */
// Contexts
import React, { useContext, useEffect } from 'react'
import { Slot } from 'expo-router'
import { ApolloProvider } from '@apollo/client'
import createApolloClient from '../context/apolloClient'
import { DataProvider } from '../context/DataContext'
import { GetToken } from '../context/GetToken'

import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { PaperProvider } from 'react-native-paper'
import { ThemeContext, ThemeProviderCustom } from '../globals/styles/ThemeContext'
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'

import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n/index.js'

import * as Notifications from 'expo-notifications'
import ErrorBoundary from '../globals/components/ErrorBoundary'
import { enableScreenshotPrevention } from '../globals/utils/securityUtils'

const apolloClient = createApolloClient()

Notifications.setNotificationHandler(null)

export default function RootLayout(): React.JSX.Element {
  useEffect(() => {
    GetToken()
      .then((token) => {
        if (token) {
          console.log('FCM Token fetched in RootLayout:', token)
        }
      })
      .catch((error) => {
        console.error('Error fetching FCM token:', error)
      })

    // SECURITY: Enable screenshot prevention app-wide
    enableScreenshotPrevention().catch((error) => {
      console.error('Error enabling screenshot prevention:', error)
    })
  }, [])

  return (
    <ThemeProviderCustom>
      <InnerApp />
    </ThemeProviderCustom>
  )
}

function InnerApp(): React.JSX.Element {
  const themeContext = useContext(ThemeContext)
  
  if (!themeContext) {
    throw new Error('InnerApp must be used within ThemeProviderCustom')
  }

  const { themeColors, themeNavColors } = themeContext

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

