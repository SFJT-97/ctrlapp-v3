// ==> 2024-10-02
// Builtin modules
/* eslint-disable import/named */
import { useState, useEffect } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text, useTheme, Icon } from 'react-native-paper'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

// Custom modules
import CustomActivityIndicator from './CustomActivityIndicator'

// Custom functions
import { showedName } from '../functions/functions'

const DrawerProfile = ({ userData }) => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [idEmployee, setIdEmployee] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userData && !userData.loading && !userData.error) {
      setCompanyName(userData.companyName)
      setIdEmployee(userData.idEmployee)
      setEmail(userData.email)
    }
  }, [userData])

  const theme = useTheme()
  return (
    <View style={{ marginHorizontal: 10, marginBottom: 10, rowGap: 15 }}>
      {loading && <CustomActivityIndicator />}
      <View style={{ marginHorizontal: 10 }}>
        <Text variant='headlineSmall'>Welcome!</Text>
      </View>
      <View style={{ alignItems: 'center', rowGap: 10 }}>
        <View>
          <Image
            style={{ width: 120, height: 120, borderRadius: 60 }}
            source={{
              uri: userData?.userProfileImage?.uri ? userData?.userProfileImage?.uri : userData?.userProfileImage
            }}
            onLoadEnd={() => {
              setLoading(false)
            }}
          />
        </View>

        <View style={{ alignItems: 'start' }}>
          <Text variant='bodyMedium'>ID:{idEmployee}</Text>
          <Text variant='bodyMedium'>Name:{userData && showedName(userData.firstName, userData.lastName)}</Text>
          <Text variant='bodyMedium'>Company: {companyName}</Text>
          <Text variant='bodyMedium'>Email: {email?.slice(0, 18)}...</Text>
        </View>
        <View style={{ marginVertical: 15 }}>
          <TouchableOpacity
            onPress={() => { router.navigate({ pathname: '/profile/' }) }}
          >
            <Icon
              source='account-edit-outline'
              style={{ alignItems: 'center' }}
              size={32}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  )
}

export default DrawerProfile
