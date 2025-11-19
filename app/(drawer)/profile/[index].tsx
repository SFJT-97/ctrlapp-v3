import React, { useEffect, useState, useCallback } from 'react'
import { ScrollView, View, TouchableOpacity, Alert, ImageBackground, RefreshControl } from 'react-native'
import { useTheme, TextInput, Icon, IconButton, Button } from 'react-native-paper'
import { useRouter, Stack } from 'expo-router'
import { gql, useLazyQuery, useMutation, useApolloClient } from '@apollo/client'

// Custom modules
import { useMe } from '../../../context/hooks/userQH'
import { useMyConfig } from '../../../context/hooks/userConfiguration'
import CustomActivityIndicator from '../../../globals/components/CustomActivityIndicator'
import CameraComponent from '../report/Components/newEvents/CameraComponent'
import { showImageOptions } from '../../../globals/handleImage.jsx'
import uploadFile from '../../../globals/uploadFile'
import { getImageUrl } from '../../../globals/functions/imageUtils'
import { API_URL, DEFAULT_IMAGE } from '../../../globals/variables/globalVariables'
import { User, UserConfiguration } from '../../../types'

// GraphQL Queries and Mutations
const getFileQ = gql`
  query GetFile($filename: String!) {
    getFile(filename: $filename) {
      url
    }
  }
`

const userConfigurationByIdEmployeeQ = gql`
  query userConfigurationByIdEmployee($idEmployee: String!) {
    userConfigurationByIdEmployee(idEmployee: $idEmployee) {
      idUserConfiguration
      showNotificationsToLevel
      optionConfiguration1
      optionConfiguration2
      optionConfiguration3
      personalPhone
      personalEmail
      personalAddress
      aboutMe
    }
  }
`

const addNewUserConfigurationM = gql`
  mutation AddNewUserConfiguration(
    $idUser: ID!
    $idEmployee: ID!
    $password: String!
    $firstName: String!
    $lastName: String!
    $nickName: String!
    $email: String!
    $idCompany: ID!
    $companyName: String!
    $idCompanyBusinessUnit: ID!
    $companyBusinessUnitDescription: String!
    $idCompanySector: ID!
    $companySectorDescription: String!
    $idStandardJobRole: ID!
    $standardJobRoleDescription: String!
    $idcompanyJobRole: ID!
    $companyJobRoleDescription: String!
    $userProfileImage: String!
    $theme: String!
    $showNotificationsToLevel: Int!
    $secondName: String
    $secondLastName: String
    $phone: String
    $optionConfiguration1: String
    $optionConfiguration2: String
    $optionConfiguration3: String
    $personalPhone: String
    $personalEmail: String
    $personalAddress: String
    $aboutMe: String
  ) {
    addNewUserConfiguration(
      idUser: $idUser
      idEmployee: $idEmployee
      password: $password
      firstName: $firstName
      lastName: $lastName
      nickName: $nickName
      email: $email
      idCompany: $idCompany
      companyName: $companyName
      idCompanyBusinessUnit: $idCompanyBusinessUnit
      companyBusinessUnitDescription: $companyBusinessUnitDescription
      idCompanySector: $idCompanySector
      companySectorDescription: $companySectorDescription
      idStandardJobRole: $idStandardJobRole
      standardJobRoleDescription: $standardJobRoleDescription
      idcompanyJobRole: $idcompanyJobRole
      companyJobRoleDescription: $companyJobRoleDescription
      userProfileImage: $userProfileImage
      theme: $theme
      showNotificationsToLevel: $showNotificationsToLevel
      secondName: $secondName
      secondLastName: $secondLastName
      phone: $phone
      optionConfiguration1: $optionConfiguration1
      optionConfiguration2: $optionConfiguration2
      optionConfiguration3: $optionConfiguration3
      personalPhone: $personalPhone
      personalEmail: $personalEmail
      personalAddress: $personalAddress
      aboutMe: $aboutMe
    ) {
      idUserConfiguration
      idUser
      idEmployee
      firstName
      secondName
      lastName
      secondLastName
      nickName
      email
      phone
      idCompany
      companyName
      idCompanyBusinessUnit
      companyBusinessUnitDescription
      idStandardJobRole
      standardJobRoleDescription
      idCompanySector
      companySectorDescription
      idcompanyJobRole
      companyJobRoleDescription
      userProfileImage
      theme
      showNotificationsToLevel
      optionConfiguration1
      optionConfiguration2
      optionConfiguration3
      personalPhone
      personalEmail
      personalAddress
      aboutMe
    }
  }
`

const editUserConfigurationM = gql`
  mutation editUserConfiguration(
    $idUserConfiguration: ID!
    $userProfileImage: String
    $theme: String
    $showNotificationsToLevel: Int
    $optionConfiguration1: String
    $optionConfiguration2: String
    $optionConfiguration3: String
    $personalPhone: String
    $personalEmail: String
    $personalAddress: String
    $aboutMe: String
  ) {
    editUserConfiguration(
      idUserConfiguration: $idUserConfiguration
      userProfileImage: $userProfileImage
      theme: $theme
      showNotificationsToLevel: $showNotificationsToLevel
      optionConfiguration1: $optionConfiguration1
      optionConfiguration2: $optionConfiguration2
      optionConfiguration3: $optionConfiguration3
      personalPhone: $personalPhone
      personalEmail: $personalEmail
      personalAddress: $personalAddress
      aboutMe: $aboutMe
    ) {
      idUserConfiguration
      idUser
      idEmployee
      nickName
      userProfileImage
      theme
      showNotificationsToLevel
      optionConfiguration1
      optionConfiguration2
      optionConfiguration3
      personalPhone
      personalEmail
      personalAddress
      aboutMe
    }
  }
`

const singleUploadS3M = gql`
  mutation SingleUploadS3($file: Upload) {
    singleUploadS3(file: $file) {
      filename
      mimetype
      encoding
      success
      message
      location
      url
    }
  }
`

const editUserM = gql`
  mutation editUser($idUser: ID!, $userProfileImage: String) {
    editUser(idUser: $idUser, userProfileImage: $userProfileImage) {
      idUser
    }
  }
`

interface ProfileImageProps {
  userProfileImage: string
  loaded: boolean
  isTakingPhoto: boolean
  setIsTakingPhoto: (value: boolean) => void
  setUserProfileImage: (value: string) => void
  setNewPhoto: (value: boolean) => void
  newPhoto: boolean
  handleTakePicture: (
    setIsTakingPhoto: (value: boolean) => void,
    isTakingPhoto: boolean,
    setNewPhoto: (value: boolean) => void
  ) => void
}

// Profile Image Component using ImageBackground
const ProfileImage: React.FC<ProfileImageProps> = ({
  userProfileImage,
  loaded,
  isTakingPhoto,
  setIsTakingPhoto,
  setUserProfileImage,
  setNewPhoto,
  newPhoto,
  handleTakePicture
}) => {
  const theme = useTheme()

  if (!userProfileImage) return null

  if (isTakingPhoto) {
    return (
      <CameraComponent
        isCameraActive={isTakingPhoto}
        setIsCameraActive={setIsTakingPhoto}
        mode='picture'
        setImageVideo={setUserProfileImage}
        wichCamera='front'
        optionOnlyShot
      />
    )
  }

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <TouchableOpacity
        onPress={() => handleTakePicture(setIsTakingPhoto, isTakingPhoto, setNewPhoto)}
        onLongPress={() => {
          showImageOptions(
            setUserProfileImage,
            'Select your profile image',
            'from:',
            false,
            true
          )
          setNewPhoto(true)
        }}
        style={{ position: 'relative' }}
      >
        <ImageBackground
          source={{ uri: userProfileImage }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: theme.colors.primary
          }}
          imageStyle={{ borderRadius: 60 }}
        >
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: theme.colors.background,
              borderRadius: 20
            }}
          >
            <IconButton
              mode='contained'
              icon='camera-plus-outline'
              size={26}
              iconColor={theme.colors.onBackground}
              loading={!loaded}
            />
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  )
}

// Main Profile Screen Component
export default function ProfileScreen(): React.JSX.Element {
  const theme = useTheme()
  const router = useRouter()
  
  // FIXED: Use proper hook return structure
  const { me, loading: meLoading, error: meError } = useMe()
  const { config: myConfig, loading: configLoading, error: configError } = useMyConfig()

  // Form states
  const [name, setName] = useState<string>('')
  const [company, setCompany] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [userProfileImage, setUserProfileImage] = useState<string>(DEFAULT_IMAGE)
  const [isTakingPhoto, setIsTakingPhoto] = useState<boolean>(false)
  const [newPhoto, setNewPhoto] = useState<boolean>(false)
  const [loaded, setLoaded] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [newUserConfig, setNewUserConfig] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const client = useApolloClient()

  // GraphQL hooks
  const [getURL] = useLazyQuery<{ getFile: { url: string } }>(getFileQ, {
    fetchPolicy: 'cache-and-network'
  })
  const [getUsrConfigData] = useLazyQuery<{
    userConfigurationByIdEmployee: UserConfiguration
  }>(userConfigurationByIdEmployeeQ, {
    fetchPolicy: 'cache-and-network' // Profile data updates occasionally, use cache-and-network
  })
  const [addNewUserConfiguration] = useMutation(addNewUserConfigurationM, {
    fetchPolicy: 'network-only'
  })
  const [editUserConfiguration] = useMutation(editUserConfigurationM, {
    fetchPolicy: 'network-only'
  })
  const [singleUploadS3] = useMutation(singleUploadS3M, {
    fetchPolicy: 'network-only'
  })
  const [editUser] = useMutation(editUserM, { fetchPolicy: 'network-only' })

  // Utility function to handle taking a picture
  const handleTakePicture = useCallback(
    (
      setIsTakingPhoto: (value: boolean) => void,
      isTakingPhoto: boolean,
      setNewPhoto: (value: boolean) => void
    ) => {
      setIsTakingPhoto(!isTakingPhoto)
      setNewPhoto(true)
    },
    []
  )

  // Validate input fields
  const checkData = useCallback((): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phonePattern = /^[0-9]{10,12}$/
    const addressPattern = /^[A-Za-z0-9áéíóúÁÉÍÓÚüÜñÑ,. ]{5,}$/

    return (
      emailPattern.test(email) &&
      phonePattern.test(phone) &&
      addressPattern.test(address)
    )
  }, [email, phone, address])

  // FIXED: Effect for user data - only depends on data, not functions
  useEffect(() => {
    if (meLoading || !me || meError) {
      if (meError) {
        Alert.alert('Error', 'Failed to load user data. Please try again.')
      }
      return
    }

    setName(me.fullName || '')
    setCompany(me.companyName || '')

    const fetchUserData = async (): Promise<void> => {
      try {
        let imgData: string

        if (me?.userProfileImage?.toString().includes('amazonaws')) {
          const result = await getURL({
            variables: { filename: me.userProfileImage.toString().split('/').pop() || '' }
          })
          if (result?.data?.getFile?.url) {
            setUserProfileImage(result.data.getFile.url)
            setLoaded(true)
            return
          }
        }

        // FIXED: Use utility function for image URL construction
        imgData = getImageUrl(me.userProfileImage)
        setUserProfileImage(imgData)
        setLoaded(true)

        const configData = await getUsrConfigData({
          variables: { idEmployee: me.idEmployee }
        })
        setNewUserConfig(!configData?.data?.userConfigurationByIdEmployee)
      } catch (error) {
        console.error('Error fetching user data:', error)
        Alert.alert('Error', 'Failed to load user data. Please try again.')
        setLoaded(true) // Still show UI even on error
      }
    }

    fetchUserData()
  }, [me?.idUser, me?.userProfileImage, meLoading, meError, getURL, getUsrConfigData])

  // FIXED: Separate effect for config data
  useEffect(() => {
    if (configLoading || !myConfig || configError) {
      return
    }

    setAddress(myConfig.personalAddress || '')
    setEmail(myConfig.personalEmail || '')
    setPhone(myConfig.personalPhone || '')
  }, [myConfig, configLoading, configError])

  // FIXED: Handle saving user configuration with proper validation
  const handleSaveUserConfig = useCallback(async (): Promise<void> => {
    // Validate me exists
    if (!me || !me.idUser) {
      Alert.alert('Error', 'User data not loaded. Please refresh the page.')
      return
    }

    // Validate form data
    if (!checkData()) {
      Alert.alert('Validation Error', 'Please check the provided information.')
      return
    }

    setSaving(true)
    let location = userProfileImage

    try {
      if (newPhoto) {
        const result = await singleUploadS3({
          variables: { file: uploadFile({ uri: userProfileImage }) }
        })

        if (!result?.data?.singleUploadS3?.location) {
          throw new Error('Failed to upload image')
        }

        location = result.data.singleUploadS3.location

        await editUser({
          variables: {
            idUser: me.idUser,
            userProfileImage: location
          }
        })
      }

      const variables = {
        userProfileImage: location,
        theme: myConfig?.theme || 'light',
        showNotificationsToLevel: 1,
        personalPhone: phone,
        personalEmail: email,
        personalAddress: address,
        aboutMe: ''
      }

      if (newUserConfig) {
        await addNewUserConfiguration({
          variables: {
            idUser: me.idUser,
            idEmployee: me.idEmployee,
            password: me.password || '',
            firstName: me.firstName,
            lastName: me.lastName,
            nickName: me.nickName,
            email: me.email,
            phone: me.phone || '',
            idCompany: me.idCompany,
            companyName: me.companyName,
            idCompanyBusinessUnit: me.idCompanyBusinessUnit || '',
            companyBusinessUnitDescription: me.companyBusinessUnitDescription || '',
            idCompanySector: me.idCompanySector || '',
            companySectorDescription: me.companySectorDescription || '',
            idStandardJobRole: me.idStandardJobRole || '',
            standardJobRoleDescription: me.standardJobRoleDescription || '',
            idcompanyJobRole: me.idcompanyJobRole || '',
            companyJobRoleDescription: me.companyJobRoleDescription || '',
            ...variables
          }
        })
      } else {
        if (!myConfig?.idUserConfiguration) {
          throw new Error('User configuration ID not found')
        }

        await editUserConfiguration({
          variables: {
            idUserConfiguration: myConfig.idUserConfiguration,
            ...variables
          }
        })
      }

      Alert.alert('Success', 'Profile updated successfully.')
      setNewPhoto(false)
    } catch (error) {
      console.error('Error saving user config:', error)
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save profile. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }, [
    me,
    myConfig,
    checkData,
    newPhoto,
    userProfileImage,
    phone,
    email,
    address,
    newUserConfig,
    singleUploadS3,
    editUser,
    addNewUserConfiguration,
    editUserConfiguration
  ])

  // Show loading state
  if (meLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CustomActivityIndicator />
      </View>
    )
  }

  // Show error state
  if (meError || !me) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <TextInput.Icon icon='alert-circle-outline' />
        <Button onPress={() => router.refresh()}>Retry</Button>
      </View>
    )
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      // Refetch user profile and configuration data
      await client.refetchQueries({
        include: 'active'
      })
      // Also reload the profile data
      if (me?.idEmployee) {
        await getUsrConfigData({ variables: { idEmployee: me.idEmployee } })
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    } finally {
      setRefreshing(false)
    }
  }, [client, me?.idEmployee, getUsrConfigData])

  return (
    <ScrollView 
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.navigate('/home/')}>
              <Icon source='chevron-left' color={theme.colors.primary} size={30} />
            </TouchableOpacity>
          )
        }}
      />

      <View style={{ marginVertical: 20, alignItems: 'center' }}>
        <ProfileImage
          userProfileImage={userProfileImage}
          isTakingPhoto={isTakingPhoto}
          setIsTakingPhoto={setIsTakingPhoto}
          setUserProfileImage={setUserProfileImage}
          loaded={loaded}
          setNewPhoto={setNewPhoto}
          newPhoto={newPhoto}
          handleTakePicture={handleTakePicture}
        />

        <View style={{ alignItems: 'center', rowGap: 15, width: '80%' }}>
          <TextInput
            style={{ height: 56, width: '100%' }}
            mode='flat'
            label='Name'
            value={name}
            onChangeText={setName}
            disabled
            left={<TextInput.Icon icon='account-outline' />}
          />
          <TextInput
            style={{ height: 56, width: '100%' }}
            mode='flat'
            label='Company'
            value={company}
            onChangeText={setCompany}
            disabled
            left={<TextInput.Icon icon='office-building-outline' />}
          />
          <TextInput
            style={{ height: 56, width: '100%' }}
            mode='outlined'
            label='Email'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            left={<TextInput.Icon icon='email-outline' />}
          />
          <TextInput
            style={{ height: 56, width: '100%' }}
            mode='outlined'
            label='Phone'
            value={phone}
            onChangeText={setPhone}
            keyboardType='phone-pad'
            left={<TextInput.Icon icon='phone-outline' />}
          />
          <TextInput
            style={{ height: 56, width: '100%' }}
            mode='outlined'
            label='Address'
            value={address}
            onChangeText={setAddress}
            left={<TextInput.Icon icon='home-outline' />}
          />
        </View>

        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Button
            mode='contained'
            buttonColor='green'
            style={{ width: 175 }}
            onPress={handleSaveUserConfig}
            disabled={saving}
            loading={saving}
          >
            Save
          </Button>
          {saving && <CustomActivityIndicator />}
        </View>
      </View>
    </ScrollView>
  )
}

