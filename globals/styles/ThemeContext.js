import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  LightThemeColors,
  LightThemeNavColors,
  DarkThemeColors,
  DarkThemeNavColors
} from './theme'

export const ThemeContext = createContext()

export const ThemeProviderCustom = ({ children }) => {
  const [themeColors, setThemeColors] = useState(LightThemeColors)
  const [themeNavColors, setThemeNavColors] = useState(LightThemeNavColors)

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('theme')
      if (storedTheme === 'dark') {
        setThemeColors(DarkThemeColors)
        setThemeNavColors(DarkThemeNavColors)
      }
    }
    loadTheme()
  }, [])

  const toogleTheme = async () => {
    const newTheme = themeColors.dark ? 'light' : 'dark'
    if (newTheme === 'dark') {
      setThemeColors(DarkThemeColors)
      setThemeNavColors(DarkThemeNavColors)
    } else {
      setThemeColors(LightThemeColors)
      setThemeNavColors(LightThemeNavColors)
    }
    await AsyncStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ themeColors, themeNavColors, toogleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
