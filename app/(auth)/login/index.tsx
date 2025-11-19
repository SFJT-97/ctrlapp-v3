import React, { useContext, useState, useEffect, useCallback } from 'react'
import { Formik, useField } from 'formik'
import { View, StyleSheet, Platform, Alert, ImageBackground, ScrollView, KeyboardAvoidingView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, Stack } from 'expo-router'
import { gql, useMutation } from '@apollo/client'
import { DataContext } from '../../../context/DataContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Button, Text } from 'react-native-paper'
import * as LocalAuthentication from 'expo-local-authentication'
import { client } from '../../../context/apolloClient'
import StyledText from './styles/StyledText'
import StyledTextInput from './styles/StyledTextInput'
import { loginValidationSchema } from './LoginValidation'
import { GetToken } from '../../../context/GetToken'
import CustomActivityIndicator from '../../../globals/components/CustomActivityIndicator'
import LockOrientation from '../../../globals/LockOrientation'
import { REGISTERED_ICON } from '../../../globals/variables/globalVariables'
import { DataContextType } from '../../../types'

const gqlLoginM = gql`
  mutation Login($userName: String!, $password: String!, $userPlatform: String!, $tokenDevice: String) {
    login(userName: $userName, password: $password, userPlatform: $userPlatform, tokenDevice: $tokenDevice) {
      value
    }
  }
`

import { NOT_ALLOWED_CHARACTERS } from '../../../globals/constants/appConstants'

interface LoginFormValues {
  nickName: string
  password: string
  tokenDevice: string
  idDevice: string
}

async function clearData(): Promise<void> {
  try {
    await client.clearStore()
    await client.cache.reset()
    await AsyncStorage.clear()
  } catch (error) {
    console.error('Error clearing data:', error)
  }
}

interface FormikInputValueProps {
  name: keyof LoginFormValues
  placeholder?: string
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  secureTextEntry?: boolean
}

const FormikInputValue: React.FC<FormikInputValueProps> = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name)
  const context = useContext(DataContext)

  if (!context) {
    throw new Error('FormikInputValue must be used within DataProvider')
  }

  const { data, setData } = context

  const handleChangeText = useCallback((value: string) => {
    const lastChar = String(value).charAt(String(value).length - 1)
    if (NOT_ALLOWED_CHARACTERS.includes(lastChar)) {
      // Filter silently without alert to improve UX
      value = String(value).replace(lastChar, '')
    }
    helpers.setValue(value)
    
    // Only update context for non-password fields
    // Password should not be stored in context
    if (name !== 'password') {
      setData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }, [name, helpers, setData])

  return (
    <>
      <StyledTextInput
        error={meta.error}
        value={field.value}
        onChangeText={handleChangeText}
        {...props}
      />
      {meta.error && <StyledText style={styles.error}>{meta.error}</StyledText>}
    </>
  )
}

export default function LoginScreen(): React.JSX.Element {
  // FIXED: Call all hooks first before any conditional returns
  const [waiting, setWaiting] = useState<boolean>(false)
  const [login, { error: loginError }] = useMutation(gqlLoginM, {
    fetchPolicy: 'network-only'
  })
  const [tokenDevice, setTokenDevice] = useState<string | null>(null)
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(false)
  const context = useContext(DataContext)

  // FIXED: Use context safely - don't throw before all hooks are called
  const data = context?.data
  const setData = context?.setData

  useEffect(() => {
    const fetchToken = async (): Promise<void> => {
      try {
        const fetchedToken = await GetToken()
        setTokenDevice(fetchedToken)
        if (setData) {
          setData((prev) => ({
            ...prev,
            tokenDevice: fetchedToken,
            idDevice: fetchedToken
          }))
        }
      } catch (error) {
        console.error('Error fetching token:', error)
      }
    }
    fetchToken()
  }, [setData])

  useEffect(() => {
    async function checkBiometricSupport(): Promise<void> {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      setIsBiometricSupported(compatible && enrolled)
    }
    checkBiometricSupport()
  }, [])

  // Move error handling to useEffect to prevent multiple alerts
  useEffect(() => {
    if (loginError) {
      console.error('Login mutation error:', loginError)
      Alert.alert('Error', loginError.message || 'Login failed')
    }
  }, [loginError])

  // FIXED: Now check context and early return AFTER all hooks
  if (!context || !setData) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <Text style={{ textAlign: 'center' }}>
            Error: LoginScreen must be used within DataProvider
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  // FIXED: Early return for logged-in state AFTER all hooks
  if (data?.loged) {
    return <Redirect href='/(drawer)/home' />
  }

  const handleBiometricAuth = async (): Promise<void> => {
    if (!setData) return
    
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Biometric Authentication',
        fallbackLabel: 'Use Password'
      })
      if (result.success) {
        const token = await AsyncStorage.getItem('token')
        if (token) {
          setData((prev) => ({
            ...prev,
            loged: true,
            tokenDevice: tokenDevice || '',
            idDevice: tokenDevice || ''
          }))
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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          <Formik
            validationSchema={loginValidationSchema}
            initialValues={{
              nickName: '',
              password: '',
              tokenDevice: tokenDevice || '',
              idDevice: tokenDevice || ''
            }}
            onSubmit={async (values) => {
              setWaiting(true)
              await clearData()
              const user = values.nickName.includes('@')
                ? values.nickName.split('@')[0]
                : values.nickName

              try {
                const response = await login({
                  variables: {
                    userName: user,
                    password: values.password,
                    userPlatform: Platform.OS,
                    tokenDevice
                  }
                })
                const token = response.data?.login?.value
                if (!token) {
                  throw new Error('No token received from server')
                }
                await AsyncStorage.setItem('token', token)
                
                // SECURITY FIX: Don't store password in context
                if (setData) {
                  setData((prev) => ({
                    ...prev,
                    nickName: values.nickName,
                    loged: true,
                    tokenDevice: tokenDevice || '',
                    idDevice: tokenDevice || '',
                    userToken: token
                    // Explicitly exclude password
                  }))
                }
                setWaiting(false)
              } catch (error) {
                console.error('Login error:', error)
                Alert.alert('Error', error instanceof Error ? error.message : 'Login failed')
                setWaiting(false)
              }
            }}
          >
            {({ handleSubmit }) => (
              <View style={styles.container}>
                <LockOrientation />
                <ImageBackground
                  source={{ uri: REGISTERED_ICON }}
                  style={styles.logo}
                />
                <Text style={styles.title}>
                  CONTROL ACCIóN
                </Text>
                <View style={styles.formContainer}>
                  <FormikInputValue name='nickName' placeholder='User / email' autoCapitalize='none' />
                  <FormikInputValue name='password' placeholder='Password' secureTextEntry autoCapitalize='none' />
                  <Button mode='contained' onPress={handleSubmit} style={styles.loginButton}>
                    Login
                  </Button>
                  {isBiometricSupported && (
                    <Button
                      mode='outlined'
                      onPress={handleBiometricAuth}
                      icon='fingerprint'
                      style={styles.biometricButton}
                    >
                      Use fingerprint
                    </Button>
                  )}
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomActivityIndicator visible={waiting} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
    paddingTop: 20,
    paddingBottom: 40
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20
  },
  title: {
    textAlign: 'center',
    fontWeight: '200',
    fontSize: 26,
    textTransform: 'uppercase',
    marginBottom: 40
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    rowGap: 25
  },
  loginButton: {
    paddingHorizontal: 50,
    marginTop: 10
  },
  biometricButton: {
    marginTop: 20
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 20,
    marginTop: -5
  }
})

