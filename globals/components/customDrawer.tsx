import React, { useState, useEffect, useCallback, useContext } from 'react'
import { View } from 'react-native'
import { Link } from 'expo-router'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import DrawerProfile from './drawerProfile'
import { Button, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { client } from '../../context/apolloClient'
import { gql, useMutation } from '@apollo/client'
import { DataContext } from '../../context/DataContext'
import { getImageUrl } from '../functions/imageUtils'
import { useMe } from '../../context/hooks/userQH'
import { User } from '../../types'

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
  const { t } = useTranslation()
  const theme = useTheme()
  const { me, loading: meLoading } = useMe()
  const [load, setLoad] = useState<boolean>(false)
  const [getImageProfile] = useMutation<{
    getSignedUrlFromCache: { signedUrl: string }
  }>(getSignedUrlFromCacheQ)
  
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
      <View style={{ paddingBottom: 20, paddingHorizontal: 16, alignItems: 'center' }}>
        {/* Logout Button */}
        <Link
          onPress={handleLogout}
          href='/(auth)/login'
          style={{ width: '100%' }}
        >
          <Button
            icon='hand-wave-outline'
            textColor={theme.colors.onError}
            buttonColor={theme.colors.error}
            mode='contained'
            style={{ width: '100%' }}
            contentStyle={{ paddingVertical: 8 }}
          >
            {t('buttons.logout')}
          </Button>
        </Link>
      </View>
    </View>
  )
}

export default CustomDrawer

