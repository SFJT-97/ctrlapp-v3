# Optimization Recommendations & Implementation Guide

This document provides detailed code-level recommendations to fix the identified issues and optimize the app.

---

## 1. Chat Feature Fixes

### 1.1 Fix Chat List Data Fetching (CRITICAL)

**Current Problem**: Sequential API calls in a loop causing 10-30+ second load times.

**Solution**: Parallelize all API calls using `Promise.all()`.

**File**: `app/(drawer)/chat/index.jsx`

**Before**:
```javascript
for (const el of allUsersFromMyCompany) {
  imgProf = await getImageProfile({ variables: { idSiMMediaURL: name } })
  totUrMsgById = await getTotalUnreadMsgByIdUser({ variables: { idUserTo: el.idUser } })
  lastMsg = await getlastMsgBy2Users({ variables: { idUser: generalData?.me?.idUser, idUserTo: el.idUser } })
  // Process results...
}
```

**After**:
```javascript
useEffect(() => {
  if (!loading2 && generalData?.me && generalData?.allUsersFromMyCompany?.length > 0) {
    const fetchChatList = async () => {
      try {
        setLoaded(false)
        
        // Parallelize all user data fetching
        const chatListPromises = generalData.allUsersFromMyCompany
          .filter(el => el.idUser !== generalData.me.idUser)
          .map(async (el) => {
            try {
              const name = el.userProfileImage?.split('/').pop()
              
              // Parallel API calls for each user
              const [imgProfResult, totUrMsgResult, lastMsgResult] = await Promise.all([
                name ? getImageProfile({ variables: { idSiMMediaURL: name } }).catch(() => null) : Promise.resolve(null),
                getTotalUnreadMsgByIdUser({ variables: { idUserTo: el.idUser } }).catch(() => null),
                getlastMsgBy2Users({ 
                  variables: { 
                    idUser: generalData.me.idUser, 
                    idUserTo: el.idUser 
                  } 
                }).catch(() => null)
              ])

              // Extract data safely
              const imgProf = imgProfResult?.data?.getSignedUrlFromCache?.signedUrl || DEFAULT_IMAGE
              const totUrMsg = totUrMsgResult?.data?.totalUnReadChatsByIdUser || 0
              const lastMsg = lastMsgResult?.data?.lastMsgBy2Users

              return {
                idChat: lastMsg?.idChat || '',
                idUser: el.idUser,
                nickName: el.nickName,
                firstName: el.firstName,
                lastName: el.lastName,
                messageRead: lastMsg?.messageRead || false,
                userProfileImage: imgProf,
                lastMsgWithMe: lastMsg?.chatText || '',
                dateTimeLastMsgWithMe: lastMsg?.chatDateTimePost || '',
                totalUnReadChatsByIdUser: totUrMsg,
                idConversation: lastMsg?.idConversation || 'new_chat'
              }
            } catch (error) {
              console.error(`Error fetching chat data for user ${el.idUser}:`, error)
              return null
            }
          })

        const results = await Promise.all(chatListPromises)
        const validResults = results.filter(Boolean)

        // Sort and order chat list
        const userEMaray = `eMaray${generalData.me.companyName}`
        const eMarayChat = validResults.find(ev => ev.nickName === userEMaray)
        const otherChats = validResults
          .filter(ev => ev.nickName !== userEMaray)
          .sort((a, b) => new Date(b.dateTimeLastMsgWithMe) - new Date(a.dateTimeLastMsgWithMe))

        const orderedChatList = eMarayChat ? [eMarayChat, ...otherChats] : otherChats

        setChatList(orderedChatList)
        setLoaded(true)
      } catch (error) {
        console.error('Error fetching chat list:', error)
        Alert.alert('Error', 'Failed to load chat list. Please try again.')
        setLoaded(true) // Still show UI even on error
      }
    }

    fetchChatList()
  }
}, [loading2, generalData, getImageProfile, getTotalUnreadMsgByIdUser, getlastMsgBy2Users])
```

**Performance Improvement**: 10-30 seconds → 1-3 seconds

---

### 1.2 Replace propCount Pattern

**Current Problem**: Unpredictable state management using magic numbers.

**Solution**: Use `useMemo` to compute readiness state.

**File**: `app/(drawer)/chat/index.jsx`

**Before**:
```javascript
const [propCount, setPropCount] = useState(0)

useEffect(() => {
  if (!loading2) {
    setPropCount(propCount + 2)
  }
}, [generalData, loading2])

useEffect(() => {
  if (propCount > 2) {
    // Fetch data
  }
}, [propCount])
```

**After**:
```javascript
// Remove propCount state entirely

const isDataReady = useMemo(() => {
  return (
    !loading2 &&
    generalData?.me?.idUser &&
    generalData?.allUsersFromMyCompany?.length > 0
  )
}, [loading2, generalData])

useEffect(() => {
  if (isDataReady) {
    // Fetch data
  }
}, [isDataReady])
```

---

### 1.3 Implement Smart Polling

**Current Problem**: Polling every 5 seconds even when screen is not active.

**Solution**: Only poll when screen is focused and app is in foreground.

**File**: `app/(drawer)/chat/index.jsx`

**Install dependency**:
```bash
npm install @react-navigation/native
```

**After**:
```javascript
import { useIsFocused } from '@react-navigation/native'
import { AppState } from 'react-native'

export default function ChatPage () {
  const isFocused = useIsFocused()
  const [appState, setAppState] = useState(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState)
    })
    return () => subscription?.remove()
  }, [])

  const shouldPoll = isFocused && appState === 'active'

  const getOnLineLastMsgBy2Users = useQuery(lastMsgWithMeQ, { 
    fetchPolicy: 'network-only', 
    pollInterval: shouldPoll ? 5000 : 0,
    skip: !isDataReady
  })
  
  // ... rest of component
}
```

**File**: `app/(drawer)/chat/[chatScreen].jsx`

**After**:
```javascript
import { useIsFocused } from '@react-navigation/native'
import { AppState } from 'react-native'

const ChatScreen = () => {
  const isFocused = useIsFocused()
  const [appState, setAppState] = useState(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState)
    })
    return () => subscription?.remove()
  }, [])

  const shouldPoll = isFocused && appState === 'active'

  const [getChatByIdConv] = useLazyQuery(chatByConversationQH, { 
    fetchPolicy: 'network-only', 
    pollInterval: shouldPoll ? 5000 : 0
  })
  
  // ... rest of component
}
```

---

### 1.4 Fix Chat Screen Data Refresh

**Current Problem**: Complex useEffect dependencies and setTimeout hacks.

**Solution**: Simplify data fetching logic.

**File**: `app/(drawer)/chat/[chatScreen].jsx`

**Before**:
```javascript
const [newQuery, setNewQuery] = useState(true)

useEffect(() => {
  const fetchData = async () => {
    // ... fetch logic
  }
  newQuery && fetchData()
}, [imageProfile, chat, data, newQuery])

useEffect(() => {
  setNewQuery(true)
  setTimeout(() => {
    setNewQuery(false)
  }, 1000 * 2)
}, [])
```

**After**:
```javascript
// Remove newQuery state

useEffect(() => {
  const fetchData = async () => {
    if (!idConversation) {
      setChat([])
      setLoaded(true)
      return
    }

    try {
      const fetchedChat = await getChatByIdConv({ 
        variables: { idConversation } 
      })
      
      if (fetchedChat?.data?.chatByConversation) {
        setChat(fetchedChat.data.chatByConversation)
        setLoaded(true)
      }
    } catch (error) {
      console.error('Error fetching chat:', error)
      setLoaded(true)
    }
  }

  fetchData()
}, [idConversation, getChatByIdConv])

// Separate effect for image profile
useEffect(() => {
  if (imageProfile || !userProfileImage) return

  const fetchImage = async () => {
    if (userProfileImage.includes('amazonaws')) {
      const file = userProfileImage.split('/').pop()
      try {
        const fetchedImgProf = await getImageProfile({ 
          variables: { idSiMMediaURL: file } 
        })
        if (fetchedImgProf?.data?.getSignedUrlFromCache?.signedUrl) {
          setImageProfile(fetchedImgProf.data.getSignedUrlFromCache.signedUrl)
        }
      } catch (error) {
        console.error('Error fetching image:', error)
        setImageProfile(DEFAULT_IMAGE)
      }
    } else {
      setImageProfile(userProfileImage)
    }
  }

  fetchImage()
}, [userProfileImage, imageProfile, getImageProfile])
```

---

## 2. Profile Page Fixes

### 2.1 Fix useMe Hook Return Value

**Current Problem**: Hook returns `{ me: {...} }` but code expects `me` directly.

**File**: `context/hooks/userQH.js`

**Before**:
```javascript
export const useMe = () => {
  const { loading, error, data } = useQuery(meQ, { fetchPolicy: 'cache-and-network' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const meData = data
  if (meData) {
    return meData  // Returns { me: {...} }
  } else {
    return {}
  }
}
```

**After**:
```javascript
export const useMe = () => {
  const { loading, error, data } = useQuery(meQ, { fetchPolicy: 'cache-and-network' })
  
  if (loading) {
    return { loading: true, me: null, error: null }
  }
  
  if (error) {
    return { loading: false, me: null, error }
  }
  
  return { 
    loading: false, 
    me: data?.me || null,  // Return me directly, not data
    error: null 
  }
}
```

**Update all usages**:

**File**: `app/(drawer)/profile/[index].jsx`

**Before**:
```javascript
const { me } = useMe()
```

**After**:
```javascript
const { me, loading: meLoading, error: meError } = useMe()

// Add loading/error handling
if (meLoading) {
  return <CustomActivityIndicator />
}

if (meError || !me) {
  return (
    <View>
      <Text>Error loading profile. Please try again.</Text>
      <Button onPress={() => router.refresh()}>Retry</Button>
    </View>
  )
}
```

**File**: `app/(drawer)/chat/components/MsgInput.jsx`

**Before**:
```javascript
const { me } = useMe()
```

**After**:
```javascript
const { me } = useMe()

// Add safety check
if (!me || me.loading) {
  return null // Or loading indicator
}
```

---

### 2.2 Fix useMyConfig Hook

**File**: `context/hooks/userConfiguration.js`

**Before**:
```javascript
export const useMyConfig = () => {
  const { loading, error, data } = useQuery(myConfigQ, { fetchPolicy: 'network-only' })
  if (data === undefined) return 'ApolloError'
  if (loading) return 'Loading...'
  if (error) return `Error! ${error}`
  const myConfigData = data.myConfig
  return myConfigData
}
```

**After**:
```javascript
export const useMyConfig = () => {
  const { loading, error, data } = useQuery(myConfigQ, { fetchPolicy: 'network-only' })
  
  if (loading) {
    return { loading: true, config: null, error: null }
  }
  
  if (error) {
    return { loading: false, config: null, error }
  }
  
  return { 
    loading: false, 
    config: data?.myConfig || null, 
    error: null 
  }
}
```

**Update usage in profile page**:

**File**: `app/(drawer)/profile/[index].jsx`

**Before**:
```javascript
const myConfig = useMyConfig()

if (myConfig && myConfig !== 'ApolloError' && myConfig !== 'Loading...') {
  setAddress(myConfig.personalAddress || '')
}
```

**After**:
```javascript
const { config: myConfig, loading: configLoading } = useMyConfig()

useEffect(() => {
  if (myConfig && !configLoading) {
    setAddress(myConfig.personalAddress || '')
    setEmail(myConfig.personalEmail || '')
    setPhone(myConfig.personalPhone || '')
  }
}, [myConfig, configLoading])
```

---

### 2.3 Fix Image URL Construction

**File**: `app/(drawer)/profile/[index].jsx`

**Before**:
```javascript
imgData = API_URL + me?.userProfileImage.slice(me?.userProfileImage.indexOf('uploads'))
```

**After**:
```javascript
// Create a utility function
const getImageUrl = (userProfileImage) => {
  if (!userProfileImage) {
    return `${API_URL}uploads/211b1ffa-1c51-4e5c-84e3-070179d5e6dc.webp`
  }
  
  // If it's already a full URL (AWS or other), return as-is
  if (userProfileImage.startsWith('http://') || userProfileImage.startsWith('https://')) {
    return userProfileImage
  }
  
  // If it contains 'uploads', construct relative URL
  const uploadsIndex = userProfileImage.indexOf('uploads')
  if (uploadsIndex !== -1) {
    return API_URL + userProfileImage.slice(uploadsIndex)
  }
  
  // Fallback to default
  return `${API_URL}uploads/211b1ffa-1c51-4e5c-84e3-070179d5e6dc.webp`
}

// Usage
if (me?.userProfileImage?.toString().includes('amazonaws')) {
  imgData = await getURL({
    variables: { filename: me.userProfileImage.toString().split('/').pop() }
  })
  if (imgData?.data?.getFile?.url) {
    setUserProfileImage(imgData.data.getFile.url)
    setLoaded(true)
  }
} else {
  setUserProfileImage(getImageUrl(me.userProfileImage))
  setLoaded(true)
}
```

---

### 2.4 Fix useEffect Dependencies

**File**: `app/(drawer)/profile/[index].jsx`

**Before**:
```javascript
}, [me, myConfig, getURL, getUsrConfigData])
```

**After**:
```javascript
// Split into separate effects with proper dependencies

// Effect for user data
useEffect(() => {
  if (!me || me.loading) return

  const fetchUserData = async () => {
    try {
      // ... fetch logic
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  fetchUserData()
}, [me?.idUser, me?.userProfileImage]) // Only depend on data, not functions

// Effect for config data
useEffect(() => {
  if (!myConfig || configLoading) return
  
  setAddress(myConfig.personalAddress || '')
  setEmail(myConfig.personalEmail || '')
  setPhone(myConfig.personalPhone || '')
}, [myConfig, configLoading])
```

---

### 2.5 Add Validation to Save Function

**File**: `app/(drawer)/profile/[index].jsx`

**Before**:
```javascript
const handleSaveUserConfig = useCallback(async () => {
  if (!checkData()) {
    Alert.alert('Validation Error', 'Please check the provided information.')
    return
  }
  // ... save logic
}, [/* deps */])
```

**After**:
```javascript
const handleSaveUserConfig = useCallback(async () => {
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

  try {
    let location = userProfileImage

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
          idCompanyBusinessUnit: me.idCompanyBusinessUnit,
          companyBusinessUnitDescription: me.companyBusinessUnitDescription,
          idCompanySector: me.idCompanySector,
          companySectorDescription: me.companySectorDescription,
          idStandardJobRole: me.idStandardJobRole,
          standardJobRoleDescription: me.standardJobRoleDescription,
          idcompanyJobRole: me.idcompanyJobRole,
          companyJobRoleDescription: me.companyJobRoleDescription,
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
    Alert.alert('Error', error.message || 'Failed to save profile. Please try again.')
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
```

---

## 3. General Optimizations

### 3.1 Create Constants File

**File**: `globals/constants/appConstants.js` (NEW)

```javascript
// Loading states
export const LOADING_STATE = 'Loading...'
export const ERROR_STATE = 'ApolloError'

// Polling intervals
export const CHAT_POLL_INTERVAL = 5000 // 5 seconds
export const CHAT_POLL_INTERVAL_BACKGROUND = 0 // Disabled

// Chat limits
export const MAX_CHAT_MESSAGE_LENGTH = 140
export const MAX_CHAT_LIST_ITEMS = 50

// Profile validation
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_PATTERN = /^[0-9]{10,12}$/
export const ADDRESS_PATTERN = /^[A-Za-z0-9áéíóúÁÉÍÓÚüÜñÑ,. ]{5,}$/
```

---

### 3.2 Add Error Boundary Component

**File**: `globals/components/ErrorBoundary.jsx` (NEW)

```javascript
import React from 'react'
import { View, Text, Button } from 'react-native'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ marginBottom: 20, textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button
            title="Try Again"
            onPress={() => {
              this.setState({ hasError: false, error: null })
              this.props.onRetry?.()
            }}
          />
        </View>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

**Usage in app/_layout.jsx**:
```javascript
import ErrorBoundary from '../globals/components/ErrorBoundary'

function InnerApp () {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* ... rest of app */}
      </GestureHandlerRootView>
    </ErrorBoundary>
  )
}
```

---

### 3.3 Optimize Chat List with FlatList

**File**: `app/(drawer)/chat/index.jsx`

**Before**:
```javascript
{loaded && (
  chatList.map(el => {
    // Render item
  })
)}
```

**After**:
```javascript
import { FlatList } from 'react-native'

// Create memoized chat item component
const ChatListItem = React.memo(({ item, generalData, onPress }) => {
  const idUser = generalData?.me?.idUser
  const idUserTo = item.idUser
  
  if (item.nickName === generalData?.me?.nickName) {
    return <Divider />
  }

  return (
    <Link
      href={{
        pathname: '/chat/[chatScreen]',
        params: {
          idUser,
          idUserTo,
          userProfileImage: generalData?.me?.userProfileImage,
          userToProfileImage: item.userProfileImage,
          idChat: item.idChat,
          idConversation: item.idConversation,
          me: JSON.stringify(generalData?.me),
          name: showedName(item.firstName, item.lastName)
        }
      }}
    >
      <Divider style={{ borderWidth: 0.5 }} />
      <View style={chatlist.chatListRow}>
        {/* ... chat item UI */}
      </View>
      <Divider style={{ borderWidth: 0.2 }} />
    </Link>
  )
})

// In component
{loaded ? (
  <FlatList
    data={chatList}
    keyExtractor={(item) => item.idChat || item.idUser}
    renderItem={({ item }) => (
      <ChatListItem 
        item={item} 
        generalData={generalData}
      />
    )}
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    windowSize={10}
  />
) : (
  <CustomActivityIndicator />
)}
```

---

## 4. Implementation Priority

### Phase 1: Critical Fixes (Week 1)
1. ✅ Fix `useMe` hook return value
2. ✅ Fix `useMyConfig` hook return value
3. ✅ Fix profile page image URL construction
4. ✅ Fix chat list parallel fetching
5. ✅ Fix profile page useEffect dependencies

### Phase 2: Performance (Week 2)
1. ✅ Implement smart polling
2. ✅ Replace propCount pattern
3. ✅ Optimize chat screen data refresh
4. ✅ Add FlatList to chat list

### Phase 3: Code Quality (Week 3)
1. ✅ Create constants file
2. ✅ Add error boundaries
3. ✅ Standardize error handling
4. ✅ Remove dead code

### Phase 4: Advanced Optimizations (Week 4)
1. ⏳ Implement query batching
2. ⏳ Add React.memo to expensive components
3. ⏳ Implement proper cache strategies
4. ⏳ Add performance monitoring

---

## 5. Testing Checklist

After implementing fixes, test:

- [ ] Chat list loads in < 3 seconds with 10+ users
- [ ] Profile page displays user data correctly
- [ ] Profile save functionality works
- [ ] Chat messages send and receive correctly
- [ ] Polling stops when app is in background
- [ ] No infinite re-renders in profile page
- [ ] Error messages display correctly
- [ ] Images load correctly in chat and profile

---

## 6. Performance Benchmarks

**Before Optimizations**:
- Chat list load: 10-30 seconds
- Profile page load: 2-5 seconds
- API calls per chat list: 30+ (for 10 users)
- Re-renders per interaction: 5-10

**After Optimizations** (Target):
- Chat list load: 1-3 seconds
- Profile page load: < 1 second
- API calls per chat list: 1-3 (batched)
- Re-renders per interaction: 1-2

---

This document should be used as a step-by-step guide for implementing the fixes. Each section can be implemented independently, allowing for incremental improvements.

