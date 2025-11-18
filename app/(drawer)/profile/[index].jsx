// builtin modules
import { useEffect, useState, useCallback } from 'react'
import { ScrollView, View, TouchableOpacity, Alert, ImageBackground } from 'react-native'
import { useTheme, TextInput, Icon, IconButton, Button } from 'react-native-paper'
import { useRouter, Stack } from 'expo-router'
import { gql, useLazyQuery, useMutation } from '@apollo/client'

// custom modules
import { useMe } from '../../../context/hooks/userQH'
import { useMyConfig } from '../../../context/hooks/userConfiguration'
import CustomActivityIndicator from '../../../globals/components/CustomActivityIndicator'
import CameraComponent from '../report/Components/newEvents/CameraComponent'
import { showImageOptions } from '../../../globals/handleImage.jsx'
import uploadFile from '../../../globals/uploadFile'

// global variables
import { API_URL } from '../../../globals/variables/globalVariables'

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
mutation AddNewUserConfiguration($idUser: ID!, $idEmployee: ID!, $password: String!, $firstName: String!, $lastName: String!, $nickName: String!, $email: String!, $idCompany: ID!, $companyName: String!, $idCompanyBusinessUnit: ID!, $companyBusinessUnitDescription: String!, $idCompanySector: ID!, $companySectorDescription: String!, $idStandardJobRole: ID!, $standardJobRoleDescription: String!, $idcompanyJobRole: ID!, $companyJobRoleDescription: String!, $userProfileImage: String!, $theme: String!, $showNotificationsToLevel: Int!, $secondName: String, $secondLastName: String, $phone: String, $optionConfiguration1: String, $optionConfiguration2: String, $optionConfiguration3: String, $personalPhone: String, $personalEmail: String, $personalAddress: String, $aboutMe: String) {
  addNewUserConfiguration(idUser: $idUser, idEmployee: $idEmployee, password: $password, firstName: $firstName, lastName: $lastName, nickName: $nickName, email: $email, idCompany: $idCompany, companyName: $companyName, idCompanyBusinessUnit: $idCompanyBusinessUnit, companyBusinessUnitDescription: $companyBusinessUnitDescription, idCompanySector: $idCompanySector, companySectorDescription: $companySectorDescription, idStandardJobRole: $idStandardJobRole, standardJobRoleDescription: $standardJobRoleDescription, idcompanyJobRole: $idcompanyJobRole, companyJobRoleDescription: $companyJobRoleDescription, userProfileImage: $userProfileImage, theme: $theme, showNotificationsToLevel: $showNotificationsToLevel, secondName: $secondName, secondLastName: $secondLastName, phone: $phone, optionConfiguration1: $optionConfiguration1, optionConfiguration2: $optionConfiguration2, optionConfiguration3: $optionConfiguration3, personalPhone: $personalPhone, personalEmail: $personalEmail, personalAddress: $personalAddress, aboutMe: $aboutMe) {
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

// Profile Image Component using ImageBackground
const ProfileImage = ({
  userProfileImage,
  loaded,
  isTakingPhoto,
  setIsTakingPhoto,
  setUserProfileImage,
  setNewPhoto,
  newPhoto,
  handleTakePicture // Add handleTakePicture as a prop
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
export default function ProfileScreen () {
  const theme = useTheme()
  const router = useRouter()
  const { me } = useMe()
  const myConfig = useMyConfig()

  // Form states
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [userProfileImage, setUserProfileImage] = useState(
    `${API_URL}uploads/211b1ffa-1c51-4e5c-84e3-070179d5e6dc.webp`
  )
  const [isTakingPhoto, setIsTakingPhoto] = useState(false)
  const [newPhoto, setNewPhoto] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newUserConfig, setNewUserConfig] = useState(false)

  // GraphQL hooks
  const [getURL] = useLazyQuery(getFileQ, { fetchPolicy: 'cache-and-network' })
  const [getUsrConfigData] = useLazyQuery(userConfigurationByIdEmployeeQ, {
    fetchPolicy: 'network-only'
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
    (setIsTakingPhoto, isTakingPhoto, setNewPhoto) => {
      setIsTakingPhoto(!isTakingPhoto)
      setNewPhoto(true)
    },
    []
  )

  // Validate input fields
  const checkData = useCallback(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phonePattern = /^[0-9]{10,12}$/
    const addressPattern = /^[A-Za-z0-9áéíóúÁÉÍÓÚüÜñÑ,. ]{5,}$/

    return (
      emailPattern.test(email) &&
      phonePattern.test(phone) &&
      addressPattern.test(address)
    )
  }, [email, phone, address])

  // Fetch user data and configuration
  useEffect(() => {
    if (me && me !== 'Loading...' && me !== 'ApolloError') {
      setName(me.fullName)
      setCompany(me.companyName)

      const fetchUserData = async () => {
        try {
          let imgData
          console.log(API_URL)
          if (me?.userProfileImage?.toString().includes('amazonaws')) {
            imgData = await getURL({
              variables: { filename: me?.userProfileImage?.toString().split('/').pop() }
            })
            if (imgData?.data?.getFile?.url) {
              setUserProfileImage(imgData?.data?.getFile?.url)
              setLoaded(true)
            }
          } else {
            imgData = API_URL + me?.userProfileImage.slice(me?.userProfileImage.indexOf('uploads'))
            console.log(imgData)
            setUserProfileImage(imgData)
            setLoaded(true)
          }

          const configData = await getUsrConfigData({
            variables: { idEmployee: me.idEmployee }
          })
          setNewUserConfig(!configData?.data?.userConfigurationByIdEmployee)
        } catch (error) {
          console.error('Error fetching user data:', error)
          Alert.alert('Error', 'Failed to load user data. Please try again.')
        }
      }

      fetchUserData()
    }

    if (myConfig && myConfig !== 'ApolloError' && myConfig !== 'Loading...') {
      setAddress(myConfig.personalAddress || '')
      setEmail(myConfig.personalEmail || '')
      setPhone(myConfig.personalPhone || '')
    }
  }, [me, myConfig, getURL, getUsrConfigData])

  // Handle saving user configuration
  const handleSaveUserConfig = useCallback(
    async () => {
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

          if (result?.data?.singleUploadS3?.location) {
            location = result.data.singleUploadS3.location

            await editUser({
              variables: {
                idUser: me.idUser,
                userProfileImage: location
              }
            })
          }
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
              ...me,
              ...variables
            }
          })
        } else {
          await editUserConfiguration({
            variables: {
              idUserConfiguration: myConfig.idUserConfiguration,
              ...variables
            }
          })
        }

        Alert.alert('Success', 'Profile updated successfully.')
      } catch (error) {
        console.error('Error saving user config:', error)
        Alert.alert('Error', 'Failed to save profile. Please try again.')
      } finally {
        setSaving(false)
      }
    },
    [
      checkData,
      newPhoto,
      userProfileImage,
      me,
      myConfig,
      phone,
      email,
      address,
      newUserConfig,
      singleUploadS3,
      editUser,
      addNewUserConfiguration,
      editUserConfiguration
    ]
  )

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
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
          handleTakePicture={handleTakePicture} // Pass handleTakePicture as a prop
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
