// src/i18n/index.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { I18nManager } from 'react-native'

// Language resources
const resources = {
  en: {
    common: require('./translations/common/en.json'),
    auth: require('./translations/auth/en.json'),
    profile: require('./translations/profile/en.json'),
    donutCharts: require('./translations/home/en.json').donutChart,
    position: require('./translations/home/en.json').position,
    banner: require('./translations/home/en.json').banner,
    overview: require('./translations/home/en.json').overview,
    settings: require('./translations/settings/en.json'),
    chat: require('./translations/chat/en.json'),
    report: require('./translations/report/en.json'),
    voice: require('./translations/voice/en.json')
  },
  es: {
    common: require('./translations/common/es.json'),
    auth: require('./translations/auth/es.json'),
    profile: require('./translations/profile/es.json'),
    donutCharts: require('./translations/home/es.json').donutChart,
    position: require('./translations/home/es.json').position,
    banner: require('./translations/home/es.json').banner,
    overview: require('./translations/home/es.json').overview,
    settings: require('./translations/settings/es.json'),
    chat: require('./translations/chat/es.json'),
    report: require('./translations/report/es.json'),
    voice: require('./translations/voice/es.json')
  }
}

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // Default to English
    ns: ['common', 'auth', 'profile', 'donutCharts', 'position', 'banner', 'overview', 'settings', 'chat', 'report', 'voice'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    },
    compatibilityJSON: 'v3',
    react: {
      useSuspense: false
    }
  })

// Handle RTL
function handleRTL (lng) {
  const isRTL = ['ar', 'he'].includes(lng)
  try {
    I18nManager.allowRTL(isRTL)
    I18nManager.forceRTL(isRTL)
  } catch (error) {
    console.error('Failed to set RTL:', error)
  }
}

// Persist and load language
i18n.on('languageChanged', async (lng) => {
  try {
    await AsyncStorage.setItem('language', lng)
    handleRTL(lng)
  } catch (error) {
    console.error('Failed to save language:', error)
  }
})

async function initLanguage () {
  try {
    const savedLanguage = await AsyncStorage.getItem('language')
    if (savedLanguage && savedLanguage !== i18n.language) {
      await i18n.changeLanguage(savedLanguage)
      handleRTL(savedLanguage)
    }
  } catch (error) {
    console.error('Failed to load saved language:', error)
  }
}

initLanguage()

export default i18n
