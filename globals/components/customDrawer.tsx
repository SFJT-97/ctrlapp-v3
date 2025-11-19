import React, { useState, useEffect, useContext, useCallback } from 'react'
import { View } from 'react-native'
import { Link } from 'expo-router'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import DrawerProfile from './drawerProfile'
import { Button, IconButton, useTheme } from 'react-native-paper'
import { useMyConfig } from '../../context/hooks/userConfiguration'
import { client } from '../../context/apolloClient'
import { gql, useMutation } from '@apollo/client'
import { ThemeContext } from '../styles/ThemeContext'
import { useTranslation } from 'react-i18next'
import { DataContext } from '../../context/DataContext'
import { getImageUrl } from '../functions/imageUtils'
import { useMe } from '../../context/hooks/userQH'
import { User } from '../../types'

// GraphQL mutation to update user configuration
const editUserConfigurationM = gql`
  mutation EditUserConfiguration($idUserConfiguration: ID!, $theme: String) {
    editUserConfiguration(idUserConfiguration: $idUserConfiguration, theme: $theme) {
      idUserConfiguration
      theme
    }
  }
`

const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
    getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
      signedUrl
    }
  }
`

interface CustomDrawerProps {
  [key: string]: unknown
}

const CustomDrawer: React.FC<CustomDrawerProps> = (props) => {
  const theme = useTheme()
  const { me, loading: meLoading } = useMe()
  const { config: myConfigData, loading: configLoading } = useMyConfig()
  const [load, setLoad] = useState<boolean>(false)
  const [updateUserConfig] = useMutation(editUserConfigurationM)
  const [getImageProfile] = useMutation<{
    getSignedUrlFromCache: { signedUrl: string }
  }>(getSignedUrlFromCacheQ)
  
  const themeContext = useContext(ThemeContext)
  if (!themeContext) {
    throw new Error('CustomDrawer must be used within ThemeProviderCustom')
  }
  
  const { toggleTheme } = themeContext // FIXED: Use toggleTheme instead of toogleTheme
  const { i18n } = useTranslation()
  
  const dataContext = useContext(DataContext)
  if (!dataContext) {
    throw new Error('CustomDrawer must be used within DataProvider')
  }
  
  const { data, setData } = dataContext
  const [meData, setMeData] = useState<User | null>(null)

  // Ensure user data is loaded before rendering profile
  useEffect(() => {
    if (!meLoading && me) {
      setLoad(true)
    }
  }, [me, meLoading])

  useEffect(() => {
    if (meLoading || !me) return

    const fetchImg = async (): Promise<void> => {
      let tempImg: string

      if (me?.userProfileImage?.toString().includes('amazonaws')) {
        const file = me.userProfileImage.split('/').pop()
        if (!file) {
          tempImg = getImageUrl(me.userProfileImage)
          setMeData({ ...me, userProfileImage: tempImg })
          return
        }

        try {
          const fetchedImgProf = await getImageProfile({
            variables: { idSiMMediaURL: file }
          })

          if (fetchedImgProf?.data?.getSignedUrlFromCache?.signedUrl) {
            tempImg = fetchedImgProf.data.getSignedUrlFromCache.signedUrl
          } else {
            tempImg = getImageUrl(me.userProfileImage)
          }
        } catch (error) {
          console.error('Error fetching image:', error)
          tempImg = getImageUrl(me.userProfileImage)
        }
      } else {
        tempImg = getImageUrl(me.userProfileImage)
      }

      setMeData({ ...me, userProfileImage: tempImg })
    }

    fetchImg()
  }, [me, meLoading, getImageProfile])

  // Handle theme toggle
  const handleThemeToggle = useCallback(async (): Promise<void> => {
    if (configLoading || !myConfigData?.idUserConfiguration) {
      console.error('User configuration not loaded')
      return
    }

    const newTheme = myConfigData.theme === 'light' ? 'dark' : 'light'
    try {
      await updateUserConfig({
        variables: {
          idUserConfiguration: myConfigData.idUserConfiguration,
          theme: newTheme
        }
      })
      await toggleTheme()
    } catch (error) {
      console.error('Failed to update theme:', error)
    }
  }, [myConfigData, configLoading, updateUserConfig, toggleTheme])

  const handleLogout = useCallback((): void => {
    // FIXED: Use functional update
    setData((prev) => ({
      ...prev,
      loged: false
    }))
    client.stop()
    client.resetStore()
  }, [setData])

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        {load && meData && <DrawerProfile userData={meData} />}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={{ paddingBottom: 20, alignItems: 'center' }}>
        {/* Language Switcher */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
          <Button
            mode={i18n.language === 'en' ? 'contained' : 'outlined'}
            onPress={() => i18n.changeLanguage('en')}
            style={{ marginRight: 10 }}
          >
            EN
          </Button>
          <Button
            mode={i18n.language === 'es' ? 'contained' : 'outlined'}
            onPress={() => i18n.changeLanguage('es')}
          >
            ES
          </Button>
        </View>
        {/* Theme Toggle and Logout */}
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 50 }}>
          <IconButton
            mode='outlined'
            icon='lightbulb-outline'
            size={28}
            onPress={handleThemeToggle}
            iconColor={theme.colors.primary}
          />
          <Link
            onPress={handleLogout}
            href='/(auth)/login'
          >
            <Button
              icon='hand-wave-outline'
              textColor={theme.colors.onError}
              buttonColor={theme.colors.error}
              mode='contained'
            >
              Log out
            </Button>
          </Link>
        </View>
      </View>
    </View>
  )
}

export default CustomDrawer

