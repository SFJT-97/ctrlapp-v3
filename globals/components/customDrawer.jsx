import { useState, useEffect, useContext } from 'react'
import { useMe } from '../../context/hooks/userQH'
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
import { API_URL } from '../variables/globalVariables'

// GraphQL mutation to update user configuration
const editUserConfigurationM = gql`
  mutation EditUserConfiguration($idUserConfiguration: ID!, $theme: String) {
    editUserConfiguration(idUserConfiguration: $idUserConfiguration, theme: $theme) {
      idUserConfiguration
      theme
    }
  }
`
// La mutación que obtiene la key de AWS para la imágen indicada.
const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
  getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
    signedUrl
  }
}
`

const CustomDrawer = (props) => {
  const theme = useTheme()
  const { me } = useMe()
  const myConfigData = useMyConfig()
  const [load, setLoad] = useState(false)
  const [updateUserConfig] = useMutation(editUserConfigurationM)
  const [getImageProfile] = useMutation(getSignedUrlFromCacheQ)
  const { toogleTheme } = useContext(ThemeContext)
  const { i18n } = useTranslation()
  const { data, setData } = useContext(DataContext)
  const [meData, setMeData] = useState(null)

  delete data?.password

  // Ensure user data is loaded before rendering profile
  useEffect(() => {
    if (me && me !== 'ApolloError' && me !== 'Loading...') {
      setLoad(true)
    }
  }, [me])
  useEffect(() => {
    if (!me) return
    const fetchImg = async () => {
      let tempImg
      if (me?.userProfileImage?.toString().includes('amazonaws')) {
        const file = me?.userProfileImage.split('/').pop()
        const fetchedImgProf = await getImageProfile({ variables: { idSiMMediaURL: file } })
        if (fetchedImgProf && fetchedImgProf !== 'ApolloError' && fetchedImgProf !== 'Loading...') {
          tempImg = fetchedImgProf?.data?.getSignedUrlFromCache?.signedUrl
        }
      } else {
        tempImg = API_URL + me?.userProfileImage.toString().slice(me?.userProfileImage.indexOf('uploads'))
      }
      setMeData({
        ...me,
        userProfileImage: tempImg
      })
    }
    fetchImg()
  }, [me])

  // Handle theme toggle
  const handleThemeToggle = async () => {
    if (!myConfigData || !myConfigData?.idUserConfiguration) {
      console.error('User configuration not loaded')
      return
    }
    const newTheme = myConfigData?.theme === 'light' ? 'dark' : 'light'
    try {
      await updateUserConfig({
        variables: {
          idUserConfiguration: myConfigData?.idUserConfiguration,
          theme: newTheme
        }
      })
      toogleTheme()
    } catch (error) {
      console.error('Failed to update theme:', error)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        {load && <DrawerProfile userData={meData} />}
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
            onPress={() => {
              setData({ ...data, loged: false })
              client.stop()
              client.resetStore()
            }}
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
