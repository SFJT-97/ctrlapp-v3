import React, { useContext, useState, useEffect } from 'react'
import { Formik, useField } from 'formik'
import { View, StyleSheet, Platform, Alert, ImageBackground } from 'react-native'
import { Redirect, Stack } from 'expo-router'
import { gql, useMutation } from '@apollo/client'
import { DataContext } from '../../../context/DataContext.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Button, Text } from 'react-native-paper'
import * as LocalAuthentication from 'expo-local-authentication'
import { client } from '../../../context/apolloClient.js'
import StyledText from './styles/StyledText.jsx'
import StyledTextInput from './styles/StyledTextInput.jsx'
import { loginValidationSchema } from './LoginValidation.js'
import { GetToken } from '../../../context/GetToken.js'
import CustomActivityIndicator from '../../../globals/components/CustomActivityIndicator.js'
import LockOrientation from '../../../globals/LockOrientation.jsx'
import { REGISTERED_ICON } from '../../../globals/variables/globalVariables.js'

const gqlLoginM = gql`
  mutation Login($userName: String!, $password: String!, $userPlatform: String!, $tokenDevice: String) {
    login(userName: $userName, password: $password, userPlatform: $userPlatform, tokenDevice: $tokenDevice) {
      value
    }
  }
`

const notAllowedCharacters = ['*', '%', '(', ')', '>', '/', '<', '=', '"', '\\', '>', '`', '\'']

async function clearData () {
  try {
    await client.clearStore()
    await client.cache.reset()
    await AsyncStorage.clear()
  } catch (error) {
    console.error('Error clearing data:', error)
  }
}

const FormikInputValue = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name)
  const { data, setData } = useContext(DataContext)

  return (
    <>
      <StyledTextInput
        error={meta.error}
        value={field.value}
        onChangeText={(value) => {
          const lastChar = String(value).charAt(String(value).length - 1)
          if (notAllowedCharacters.includes(lastChar)) {
            Alert.alert('Warning!', `Character ${lastChar} is not allowed`)
            value = String(value).replace(lastChar, '')
          }
          helpers.setValue(value)
          setData({
            ...data,
            [name]: value
          })
        }}
        {...props}
      />
      {meta.error && <StyledText style={styles.error}>{meta.error}</StyledText>}
    </>
  )
}

export default function LoginScreen () {
  const [waiting, setWaiting] = useState(false)
  const [login, { data: dataLogedUser, error: loginError }] = useMutation(gqlLoginM, {
    fetchPolicy: 'network-only'
  })
  const [tokenDevice, setTokenDevice] = useState(null)
  const { data, setData } = useContext(DataContext)

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const fetchedToken = await GetToken()
        setTokenDevice(fetchedToken)
        setData({ ...data, tokenDevice: fetchedToken, idDevice: fetchedToken })
      } catch (error) {
        console.error('Error fetching token:', error)
        console.log('dataLogedUser\n', dataLogedUser)
      }
    }
    fetchToken()
  }, [])

  const [isBiometricSupported, setIsBiometricSupported] = useState(false)

  useEffect(() => {
    async function checkBiometricSupport () {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      setIsBiometricSupported(compatible && enrolled)
    }
    checkBiometricSupport()
  }, [])

  useEffect(() => {
    if (isBiometricSupported) handleBiometricAuth()
  }, [isBiometricSupported])

  if (data?.loged) {
    return <Redirect href='/(drawer)/home' />
  }

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Biometric Authentication',
        fallbackLabel: 'Use Password'
      })
      if (result.success) {
        const token = await AsyncStorage.getItem('token')
        if (token) {
          setData({ ...data, loged: true, tokenDevice, idDevice: tokenDevice })
        } else {
          Alert.alert('Error', 'Please log in with username and password first')
        }
      } else {
        Alert.alert('Error', 'Biometric authentication failed')
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed')
      console.error('Biometric error:', error)
    }
  }

  if (loginError) {
    console.error('Login mutation error:', loginError)
    Alert.alert('Error', loginError.message || 'Login failed')
  }

  return (
    <View>
      <Stack.Screen
        options={{
          title: 'Login'
        }}
      />
      <Formik
        validationSchema={loginValidationSchema}
        initialValues={{ nickName: '', password: '', tokenDevice: tokenDevice || '', idDevice: tokenDevice || '' }}
        onSubmit={async (values) => {
          setWaiting(true)
          await clearData()
          const user = values.nickName.includes('@') ? values.nickName.split('@')[0] : values.nickName

          try {
            const response = await login({
              variables: {
                userName: user,
                password: values.password,
                userPlatform: Platform.OS,
                tokenDevice
              }
            })
            const token = response.data.login.value
            await AsyncStorage.setItem('token', token)
            setData({
              ...values,
              loged: true,
              tokenDevice,
              idDevice: tokenDevice
            })
            setWaiting(false)
          } catch (error) {
            console.error('Login error:', error)
            Alert.alert('Error', error.message || 'Login failed')
            setWaiting(false)
          }
        }}
      >
        {({ handleSubmit }) => (
          <View style={{ marginVertical: 50, marginHorizontal: 15, rowGap: 30 }}>
            <LockOrientation />
            <ImageBackground
              source={{ uri: REGISTERED_ICON }}
              style={{ width: 150, height: 150, alignSelf: 'center' }}
            />
            <Text style={{ textAlign: 'center', fontWeight: '200', fontSize: 26, textTransform: 'uppercase' }}>
              CONTROL ACCIóN
            </Text>
            <View style={{ rowGap: 25 }}>
              <FormikInputValue name='nickName' placeholder='User / email' autoCapitalize='none' />
              <FormikInputValue name='password' placeholder='Password' secureTextEntry autoCapitalize='none' />
              <Button mode='contained' onPress={handleSubmit} style={{ paddingHorizontal: 50 }}>
                Login
              </Button>
              {isBiometricSupported && (
                <Button
                  mode='outlined'
                  onPress={handleBiometricAuth}
                  icon='fingerprint'
                  style={{ marginTop: 20 }}
                >
                  Use fingerprint
                </Button>
              )}
            </View>
          </View>
        )}
      </Formik>
      <CustomActivityIndicator visible={waiting} />
    </View>
  )
}

const styles = StyleSheet.create({
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 20,
    marginTop: -5
  }
})

/*
  Codigo viejo, confiable
*/
// Builtin modules
// import React, { useContext, useState, useEffect } from 'react'
// import { Formik, useField } from 'formik'
// import {
//   View,
//   StyleSheet,
//   Platform,
//   Alert
// } from 'react-native'
// import { Stack, Redirect } from 'expo-router'
// import { gql, useMutation, ApolloConsumer } from '@apollo/client'
// import { DataContext } from '../../../context/DataContext.js'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { Button, Text /* TextInput, useTheme */ } from 'react-native-paper'
// import { MaterialCommunityIcons as MaterialIcon } from '@expo/vector-icons'

// // Custom modules
// import { client } from '../../../context/apolloClient.js'
// import StyledText from './styles/StyledText.jsx'
// import StyledTextInput from './styles/StyledTextInput.jsx'
// import { loginValidationSchema } from './LoginValidation.js'
// import { GetToken } from '../../../context/GetToken.js'
// import CustomActivityIndicator from '../../../globals/components/CustomActivityIndicator.js'

// const gqlLoginM = gql`
// mutation Login($userName: String!, $password: String!, $userPlatform: String!, $tokenDevice: String) {
//   login(userName: $userName, password: $password, userPlatform: $userPlatform, tokenDevice: $tokenDevice) {
//     value
//   }
// }

// `

// let newData
// let tokenUserDevice
// let userToken
// const notAllowedCharacters = ['*', '%', '(', ')', '>', '/', '<', '=', '"', '\\', '>', '`', '\'']

// const FormikInputValue = ({ name, ...props }) => {
//   const [field, meta, helpers] = useField(name)
//   const { data, setData } = useContext(DataContext)
//   newData = data
//   return (
//     <>
//       <StyledTextInput
//         error={meta.error}
//         value={field.value}
//         onChangeText={value => {
//           const lastChar = String(value).charAt(String(value).length - 1)
//           if (notAllowedCharacters.includes(lastChar)) {
//             Alert.alert('Warning!', `character ${lastChar} is not allowed`)
//             value = String(value).replace(lastChar, '')
//           }
//           helpers.setValue(value)
//           field.name === 'nickName' ? newData.nickName = value : newData.password = value
//           newData.tokenDevice = tokenUserDevice
//           newData.idDevice = tokenUserDevice
//           setData(newData)
//         }}
//         {...props}
//       />
//       {meta.error && <StyledText style={styles.error}>{meta.error}</StyledText>}
//     </>
//   )
// }

// async function clearData () {
//   ApolloConsumer(client => {
//     client.resetStore()
//     client.cache.reset()
//   })
//   await AsyncStorage.setItem('token', '')
//   await AsyncStorage.multiRemove(['token'])
//   await AsyncStorage.clear()
//   if (client) {
//     client.stop()
//     client.resetStore()
//   }
// }

// export default function LoginScreen () {
//   // const theme = useTheme()

//   const [waiting, setWaiting] = useState(false)
//   const [login, dataLogedUser] = useMutation(gqlLoginM, {
//     fetchPolicy: 'network-only'
//   })
//   const [tokenDevice, setTokenDevice] = useState(null)
//   const { data, setData } = useContext(DataContext)
//   try {
//     useEffect(() => {
//       setData(data)
//       GetToken().then(setTokenDevice)
//       tokenUserDevice = tokenDevice
//     }, [])
//   } catch (error) {
//     console.log('error getToken')
//   }

//   return (
//     <View>
//       <Formik
//         validationSchema={loginValidationSchema}
//         initialValues={data}
//         onSubmit={
//             async (values) => {
//               setWaiting(true)
//               // await AsyncStorage.clear()
//               await clearData()
//               let user
//               const occurence = values.nickName.indexOf('@')
//               occurence !== -1 ? user = values.nickName.slice(0, occurence) : user = values.nickName
//               try {
//                 await login({
//                   variables:
//                   {
//                     userName: user,
//                     password: values.password,
//                     userPlatform: Platform.OS,
//                     idDevice: values.idDevice,
//                     tokenDevice: values.idDevice,
//                     loged: true,
//                     idCompany: '',
//                     companyName: '',
//                     userToChat: ''
//                   }
//                 })
//                 values.idDevice = tokenDevice
//                 values.loged = true
//                 newData.loged = true
//                 setData({ ...values, loged: true, userToken, userToChat: '', newMsg: '' })
//                 await AsyncStorage.setItem('token', userToken)
//                 setWaiting(false)
//               } catch (error) {
//                 console.error(error)
//                 setWaiting(false)
//                 return false
//               }
//             }
//           }
//       >
//         {({ handleSubmit }) => {
//           if (dataLogedUser.data) {
//             userToken = dataLogedUser.data.login.value
//             if (userToken !== null && data.loged) {
//               return <Redirect href='/(drawer)/home' />
//             }
//           }
//           return (
//             <View style={{ marginVertical: 50, marginHorizontal: 15, rowGap: 30 }}>
//               <Stack.Screen
//                 options={{
//                   title: 'Login'
//                 }}
//               />

//               <MaterialIcon name='chart-bar' size={56} color='black' style={{ alignSelf: 'center' }} />
//               <Text style={{ textAlign: 'center', fontWeight: '200', fontSize: 26 }}>
//                 CONTROL ACCION
//               </Text>
//               <View style={{ rowGap: 25 }}>
//                 <View>
//                   <Text>User / email</Text>
//                   <FormikInputValue
//                     name='nickName'
//                     placeholder='User / email'
//                     autoCapitalize='none'
//                   />
//                   <FormikInputValue
//                     name='password'
//                     placeholder='Password'
//                     secureTextEntry
//                     autoCapitalize='none'
//                   />
//                 </View>
//                 <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
//                   <Button mode='contained' onPress={handleSubmit} title='Log In' style={{ paddingHorizontal: 50 }}>
//                     Login
//                   </Button>

//                 </View>
//               </View>
//             </View>
//           )
//         }}
//       </Formik>
//       <CustomActivityIndicator visible={waiting} />
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   error: {
//     color: 'red',
//     fontSize: 12,
//     marginBottom: 20,
//     marginTop: -5
//   },
//   form: {
//     margin: 12,
//     backgroundColor: 'lightyellow'
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'black'
//   }

// })
