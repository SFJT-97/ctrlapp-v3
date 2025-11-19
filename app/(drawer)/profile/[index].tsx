import React, { useEffect, useState, useCallback, useContext } from 'react'
import { ScrollView, View, TouchableOpacity, Alert, ImageBackground, RefreshControl, StyleSheet } from 'react-native'
import { useTheme, TextInput, Icon, IconButton, Button, Card, Text, Divider, Surface } from 'react-native-paper'
import { useRouter, Stack } from 'expo-router'
import { gql, useLazyQuery, useMutation, useApolloClient } from '@apollo/client'
import { useTranslation } from 'react-i18next'

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
import { ThemeContext } from '../../../globals/styles/ThemeContext'

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
    <View style={styles.profileImageContainer}>
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
        style={styles.profileImageWrapper}
      >
        <ImageBackground
          source={{ uri: userProfileImage }}
          style={[
            styles.profileImage,
            { borderColor: theme.colors.primary }
          ]}
          imageStyle={styles.profileImageStyle}
        >
          <Surface style={styles.cameraButtonContainer}>
            <IconButton
              mode='contained'
              icon='camera-plus-outline'
              size={24}
              iconColor={theme.colors.onPrimary}
              style={styles.cameraButton}
              loading={!loaded}
            />
          </Surface>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  )
}

// Main Profile Screen Component
export default function ProfileScreen(): React.JSX.Element {
  const theme = useTheme()
  const router = useRouter()
  const { t: tCommon } = useTranslation()
  const { t, i18n } = useTranslation('profile')
  
  // Theme context
  const themeContext = useContext(ThemeContext)
  if (!themeContext) {
    throw new Error('ProfileScreen must be used within ThemeProviderCustom')
  }
  const { toggleTheme, currentTheme } = themeContext
  
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
  const [updateUserConfig] = useMutation(editUserConfigurationM, {
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
        Alert.alert(t('alerts.error'), t('alerts.loadError'))
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
        Alert.alert(t('alerts.error'), t('alerts.loadError'))
        setLoaded(true) // Still show UI even on error
      }
    }

    fetchUserData()
  }, [me?.idUser, me?.userProfileImage, meLoading, meError, getURL, getUsrConfigData, t])

  // FIXED: Separate effect for config data
  useEffect(() => {
    if (configLoading || !myConfig || configError) {
      return
    }

    setAddress(myConfig.personalAddress || '')
    setEmail(myConfig.personalEmail || '')
    setPhone(myConfig.personalPhone || '')
  }, [myConfig, configLoading, configError])

  // Handle language change
  const handleLanguageChange = useCallback((lang: 'en' | 'es') => {
    i18n.changeLanguage(lang)
  }, [i18n])

  // Handle theme change
  const handleThemeChange = useCallback(async (newTheme: 'light' | 'dark') => {
    if (newTheme === currentTheme) return
    
    if (configLoading || !myConfig?.idUserConfiguration) {
      console.error('User configuration not loaded')
      return
    }

    try {
      await updateUserConfig({
        variables: {
          idUserConfiguration: myConfig.idUserConfiguration,
          theme: newTheme
        }
      })
      await toggleTheme()
    } catch (error) {
      console.error('Failed to update theme:', error)
      Alert.alert(t('alerts.error'), t('alerts.themeUpdateError'))
    }
  }, [currentTheme, myConfig, configLoading, toggleTheme, updateUserConfig])

  // FIXED: Handle saving user configuration with proper validation
  const handleSaveUserConfig = useCallback(async (): Promise<void> => {
    // Validate me exists
    if (!me || !me.idUser) {
      Alert.alert(t('alerts.error'), t('alerts.userDataNotLoaded'))
      return
    }

    // Validate form data
    if (!checkData()) {
      Alert.alert(t('alerts.validationError'), t('alerts.validationMessage'))
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
          throw new Error(t('errors.imageUploadFailed'))
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
        theme: currentTheme,
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
          throw new Error(t('errors.configNotFound'))
        }

        await editUserConfiguration({
          variables: {
            idUserConfiguration: myConfig.idUserConfiguration,
            ...variables
          }
        })
      }

      Alert.alert(t('alerts.success'), t('alerts.updateSuccess'))
      setNewPhoto(false)
    } catch (error) {
      console.error('Error saving user config:', error)
      Alert.alert(
        t('alerts.error'),
        error instanceof Error ? error.message : t('alerts.saveError')
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
    currentTheme,
    singleUploadS3,
    editUser,
    addNewUserConfiguration,
    editUserConfiguration,
    t
  ])

  // FIXED: Move onRefresh hook before early returns to maintain hook order
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
        <Icon source='alert-circle-outline' size={48} color={theme.colors.error} />
        <Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 8 }}>
          {t('errors.loadFailed')}
        </Text>
        <Button mode="contained" onPress={() => router.refresh()} style={{ marginTop: 8 }}>
          {tCommon('buttons.retry')}
        </Button>
      </View>
    )
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
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
          title: t('title'),
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.navigate('/home/')}>
              <Icon source='chevron-left' color={theme.colors.primary} size={30} />
            </TouchableOpacity>
          )
        }}
      />

      <View style={styles.container}>
        {/* Profile Image Section */}
        <Card style={[styles.card, styles.profileCard]} mode="elevated">
          <Card.Content style={styles.profileCardContent}>
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
            {name && (
              <Text variant="headlineSmall" style={styles.profileName}>
                {name}
              </Text>
            )}
            {company && (
              <Text variant="bodyMedium" style={[styles.profileCompany, { color: theme.colors.onSurfaceVariant }]}>
                {company}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Personal Information Section */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('sections.personalInfo')}
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                mode='outlined'
                label={t('labels.name')}
                value={name}
                onChangeText={setName}
                disabled
                left={<TextInput.Icon icon='account-outline' />}
              />
              <TextInput
                style={styles.input}
                mode='outlined'
                label={t('labels.company')}
                value={company}
                onChangeText={setCompany}
                disabled
                left={<TextInput.Icon icon='office-building-outline' />}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Contact Information Section */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('sections.contactInfo')}
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                mode='outlined'
                label={t('labels.email')}
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                left={<TextInput.Icon icon='email-outline' />}
              />
              <TextInput
                style={styles.input}
                mode='outlined'
                label={t('labels.phone')}
                value={phone}
                onChangeText={setPhone}
                keyboardType='phone-pad'
                left={<TextInput.Icon icon='phone-outline' />}
              />
              <TextInput
                style={styles.input}
                mode='outlined'
                label={t('labels.address')}
                value={address}
                onChangeText={setAddress}
                left={<TextInput.Icon icon='home-outline' />}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Preferences Section */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('sections.preferences')}
            </Text>
            <Divider style={styles.divider} />
            
            {/* Language Selector */}
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceLabel}>
                <Icon source="translate" size={24} color={theme.colors.primary} />
                <Text variant="bodyLarge" style={styles.preferenceText}>
                  {t('preferences.language')}
                </Text>
              </View>
              <View style={styles.buttonGroup}>
                <Button
                  mode={i18n.language === 'en' ? 'contained' : 'outlined'}
                  onPress={() => handleLanguageChange('en')}
                  style={styles.languageButton}
                  compact
                >
                  EN
                </Button>
                <Button
                  mode={i18n.language === 'es' ? 'contained' : 'outlined'}
                  onPress={() => handleLanguageChange('es')}
                  style={styles.languageButton}
                  compact
                >
                  ES
                </Button>
              </View>
            </View>

            <Divider style={styles.preferenceDivider} />

            {/* Theme Selector */}
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceLabel}>
                <Icon 
                  source={currentTheme === 'dark' ? 'weather-night' : 'weather-sunny'} 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text variant="bodyLarge" style={styles.preferenceText}>
                  {t('preferences.theme')}
                </Text>
              </View>
              <View style={styles.buttonGroup}>
                <Button
                  mode={currentTheme === 'light' ? 'contained' : 'outlined'}
                  onPress={() => handleThemeChange('light')}
                  style={styles.themeButton}
                  icon="weather-sunny"
                  compact
                >
                  {t('preferences.themeOptions.light')}
                </Button>
                <Button
                  mode={currentTheme === 'dark' ? 'contained' : 'outlined'}
                  onPress={() => handleThemeChange('dark')}
                  style={styles.themeButton}
                  icon="weather-night"
                  compact
                >
                  {t('preferences.themeOptions.dark')}
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button
            mode='contained'
            onPress={handleSaveUserConfig}
            disabled={saving}
            loading={saving}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            icon="content-save"
          >
            {t('buttons.save')}
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

// Styles
const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 16
  },
  container: {
    paddingVertical: 16
  },
  card: {
    marginBottom: 16,
    borderRadius: 12
  },
  profileCard: {
    marginBottom: 24
  },
  profileCardContent: {
    alignItems: 'center',
    paddingVertical: 24
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16
  },
  profileImageWrapper: {
    position: 'relative'
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    borderWidth: 3
  },
  profileImageStyle: {
    borderRadius: 70
  },
  cameraButtonContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
    elevation: 4
  },
  cameraButton: {
    margin: 0
  },
  profileName: {
    marginTop: 16,
    fontWeight: '600'
  },
  profileCompany: {
    marginTop: 4
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600'
  },
  divider: {
    marginVertical: 12
  },
  inputContainer: {
    gap: 16
  },
  input: {
    height: 56
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  preferenceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  preferenceText: {
    fontWeight: '500'
  },
  preferenceDivider: {
    marginVertical: 8
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8
  },
  languageButton: {
    minWidth: 60
  },
  themeButton: {
    minWidth: 80
  },
  saveButtonContainer: {
    marginTop: 8,
    marginBottom: 24
  },
  saveButton: {
    borderRadius: 8
  },
  saveButtonContent: {
    paddingVertical: 6
  }
})

