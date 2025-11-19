import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  LightThemeColors,
  LightThemeNavColors,
  DarkThemeColors,
  DarkThemeNavColors
} from './theme'

export interface ThemeContextValue {
  themeColors: typeof LightThemeColors
  themeNavColors: typeof LightThemeNavColors
  toggleTheme: () => Promise<void>
  currentTheme: 'light' | 'dark'
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderCustomProps {
  children: ReactNode
}

export const ThemeProviderCustom: React.FC<ThemeProviderCustomProps> = ({ children }) => {
  // FIXED: Use explicit theme state instead of relying on themeColors.dark
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const [themeColors, setThemeColors] = useState(LightThemeColors)
  const [themeNavColors, setThemeNavColors] = useState(LightThemeNavColors)

  useEffect(() => {
    const loadTheme = async (): Promise<void> => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme')
        if (storedTheme === 'dark') {
          setCurrentTheme('dark')
          setThemeColors(DarkThemeColors)
          setThemeNavColors(DarkThemeNavColors)
        } else {
          setCurrentTheme('light')
          setThemeColors(LightThemeColors)
          setThemeNavColors(LightThemeNavColors)
        }
      } catch (error) {
        console.error('Error loading theme:', error)
      }
    }
    loadTheme()
  }, [])

  // FIXED: Typo fixed - toogleTheme -> toggleTheme
  const toggleTheme = async (): Promise<void> => {
    const newTheme: 'light' | 'dark' = currentTheme === 'light' ? 'dark' : 'light'
    
    try {
      if (newTheme === 'dark') {
        setThemeColors(DarkThemeColors)
        setThemeNavColors(DarkThemeNavColors)
      } else {
        setThemeColors(LightThemeColors)
        setThemeNavColors(LightThemeNavColors)
      }
      setCurrentTheme(newTheme)
      await AsyncStorage.setItem('theme', newTheme)
    } catch (error) {
      console.error('Error saving theme:', error)
    }
  }

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<ThemeContextValue>(
    () => ({
      themeColors,
      themeNavColors,
      toggleTheme,
      currentTheme
    }),
    [themeColors, themeNavColors, currentTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

