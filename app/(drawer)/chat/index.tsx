import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { View, FlatList, Alert, AppState, AppStateStatus, TouchableOpacity, RefreshControl } from 'react-native'
import { Avatar, Text, useTheme, Searchbar } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from '@react-navigation/drawer'
import { useIsFocused } from '@react-navigation/native'
import { gql, useLazyQuery, useQuery, useMutation } from '@apollo/client'
import * as ScreenOrientation from 'expo-screen-orientation'

// Custom modules
import { showedName, getFormatedTime } from '../../../globals/functions/functions'
import CustomActivityIndicator from '../../../globals/components/CustomActivityIndicator'
import LockOrientation from '../../../globals/LockOrientation'
import { useAsyncStorage } from '../../../context/hooks/ticketNewQH'
import { ChatListItem, User } from '../../../types'
import { DEFAULT_IMAGE } from '../../../globals/variables/globalVariables'
import { createChatStyles } from './styles'

const lastMsgBy2UsersQ = gql`
  query LastMsgBy2Users($idUser: ID!, $idUserTo: ID!) {
    lastMsgBy2Users(idUser: $idUser, idUserTo: $idUserTo) {
      idChat
      chatDateTimePost
      chatText
      messageRead
      idConversation
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

const totalUnreadMsgByIdUserQ = gql`
  query Query($idUserTo: ID!) {
    totalUnReadChatsByIdUser(idUser: $idUserTo)
  }
`

const lastMsgWithMeQ = gql`
  query LastMsgWithMe {
    lastMsgWithMe {
      idChat
      chatDateTimePost
      chatText
      messageRead
      idConversation
    }
  }
`

interface GeneralData {
  me?: User
  allUsersFromMyCompany?: User[]
}

export default function ChatPage(): React.JSX.Element {
  const theme = useTheme()
  const styles = createChatStyles(theme)
  const router = useRouter()
  const [loaded, setLoaded] = useState<boolean>(false)
  const [chatList, setChatList] = useState<ChatListItem[]>([])
  const [filteredChatList, setFilteredChatList] = useState<ChatListItem[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { value: generalData, loading: loading2 } = useAsyncStorage(
    'CTRLA_GENERAL_DATA',
    {} as GeneralData
  )
  
  // FIXED: Use refs to prevent race conditions
  const fetchInProgressRef = useRef<boolean>(false)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef<boolean>(true)

  const [getlastMsgBy2Users] = useLazyQuery<{
    lastMsgBy2Users: {
      idChat: string
      chatDateTimePost: string
      chatText: string
      messageRead: boolean
      idConversation: string
    } | null
  }>(lastMsgBy2UsersQ, { fetchPolicy: 'cache-and-network' })

  // FIXED: Use useMemo to compute readiness instead of propCount
  const isDataReady = useMemo<boolean>(() => {
    const data = generalData as GeneralData | undefined
    const ready = (
      !loading2 &&
      !!data?.me?.idUser &&
      !!data?.allUsersFromMyCompany &&
      data.allUsersFromMyCompany.length > 0
    )
    
    // Debug logging
    if (!ready && !loading2) {
      console.log('Chat list data not ready:', {
        loading2,
        hasMe: !!data?.me,
        hasIdUser: !!data?.me?.idUser,
        hasUsers: !!data?.allUsersFromMyCompany,
        usersLength: data?.allUsersFromMyCompany?.length || 0
      })
    }
    
    return ready
  }, [loading2, generalData])

  // FIXED: Smart polling - only poll when screen is focused and app is active
  const isFocused = useIsFocused()
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
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

  const [getImageProfile] = useMutation<{
    getSignedUrlFromCache: { signedUrl: string }
  }>(getSignedUrlFromCacheQ)

  const [getTotalUnreadMsgByIdUser] = useLazyQuery<{
    totalUnReadChatsByIdUser: number
  }>(totalUnreadMsgByIdUserQ, { fetchPolicy: 'cache-and-network' })

  const userEMaray = useMemo<string>(() => {
    const data = generalData as GeneralData | undefined
    return data?.me?.companyName ? `eMaray${data.me.companyName}` : ''
  }, [generalData])

  // FIXED: Parallelize all API calls - CRITICAL PERFORMANCE FIX
  // FIXED: Prevent race conditions with refs and fetch tracking
  useEffect(() => {
    mountedRef.current = true
    
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
      fetchTimeoutRef.current = null
    }

    const fetchChatList = async (): Promise<void> => {
      // FIXED: Prevent multiple simultaneous fetches
      if (fetchInProgressRef.current || !mountedRef.current) {
        return
      }

      fetchInProgressRef.current = true

      try {
        if (!mountedRef.current) {
          fetchInProgressRef.current = false
          return
        }
        
        setLoaded(false)

        const data = generalData as GeneralData | undefined
        const allUsersFromMyCompany = data?.allUsersFromMyCompany || []
        const currentUserId = data?.me?.idUser

        // If still loading, wait a bit more
        if (loading2) {
          fetchInProgressRef.current = false
          fetchTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              fetchChatList()
            }
          }, 500)
          return
        }

        // If no currentUserId, show empty state
        if (!currentUserId) {
          if (mountedRef.current) {
            setChatList([])
            setFilteredChatList([])
            setLoaded(true)
          }
          fetchInProgressRef.current = false
          return
        }

        // Filter out current user
        const otherUsers = allUsersFromMyCompany.filter((el: User) => el.idUser !== currentUserId)

        // If no other users, show empty state
        if (otherUsers.length === 0) {
          if (mountedRef.current) {
            setChatList([])
            setFilteredChatList([])
            setLoaded(true)
          }
          fetchInProgressRef.current = false
          return
        }

        // CRITICAL FIX: Parallelize all API calls for all users
        const chatListPromises = otherUsers.map(async (el: User): Promise<ChatListItem | null> => {
          try {
            const name = el.userProfileImage?.split('/').pop()

            // Parallel API calls for each user
            const [imgProfResult, totUrMsgResult, lastMsgResult] = await Promise.all([
              name
                ? getImageProfile({
                    variables: { idSiMMediaURL: name }
                  }).catch(() => null)
                : Promise.resolve(null),
              getTotalUnreadMsgByIdUser({
                variables: { idUserTo: el.idUser }
              }).catch(() => null),
              currentUserId
                ? getlastMsgBy2Users({
                    variables: {
                      idUser: currentUserId,
                      idUserTo: el.idUser
                    }
                  }).catch(() => null)
                : Promise.resolve(null) // Skip if no currentUserId
            ])

            // Extract data safely
            const imgProf =
              imgProfResult?.data?.getSignedUrlFromCache?.signedUrl || DEFAULT_IMAGE
            const totUrMsg = totUrMsgResult?.data?.totalUnReadChatsByIdUser || 0
            const lastMsg = lastMsgResult?.data?.lastMsgBy2Users

            if (!lastMsg) {
              return {
                idChat: '',
                idUser: el.idUser,
                nickName: el.nickName,
                firstName: el.firstName || '',
                lastName: el.lastName || '',
                messageRead: false,
                userProfileImage: imgProf,
                lastMsgWithMe: '',
                dateTimeLastMsgWithMe: '',
                totalUnReadChatsByIdUser: totUrMsg,
                idConversation: 'new_chat'
              }
            }

            return {
              idChat: lastMsg.idChat || '',
              idUser: el.idUser,
              nickName: el.nickName,
              firstName: el.firstName || '',
              lastName: el.lastName || '',
              messageRead: lastMsg.messageRead || false,
              userProfileImage: imgProf,
              lastMsgWithMe: lastMsg.chatText || '',
              dateTimeLastMsgWithMe: lastMsg.chatDateTimePost || '',
              totalUnReadChatsByIdUser: totUrMsg,
              idConversation: lastMsg.idConversation || 'new_chat'
            }
          } catch (error) {
            console.error(`Error fetching chat data for user ${el.idUser}:`, error)
            return null
          }
        })

        const results = await Promise.all(chatListPromises)
        
        if (!mountedRef.current) {
          fetchInProgressRef.current = false
          return
        }

        // Clear timeout if it exists
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current)
          fetchTimeoutRef.current = null
        }

        const validResults = results.filter(
          (item: ChatListItem | null): item is ChatListItem => item !== null
        )

        // Sort and order chat list
        // Chats with messages first (sorted by date), then empty chats
        const chatsWithMessages = validResults.filter(
          (item: ChatListItem) => item.dateTimeLastMsgWithMe && item.dateTimeLastMsgWithMe !== ''
        )
        const emptyChats = validResults.filter(
          (item: ChatListItem) => !item.dateTimeLastMsgWithMe || item.dateTimeLastMsgWithMe === ''
        )

        // Sort chats with messages by date (most recent first)
        const sortedChatsWithMessages = chatsWithMessages.sort(
          (a: ChatListItem, b: ChatListItem) =>
            new Date(b.dateTimeLastMsgWithMe || 0).getTime() -
            new Date(a.dateTimeLastMsgWithMe || 0).getTime()
        )

        // Sort empty chats alphabetically by nickName
        const sortedEmptyChats = emptyChats.sort(
          (a: ChatListItem, b: ChatListItem) =>
            (a.nickName || '').localeCompare(b.nickName || '')
        )

        // Combine: eMaray chat first (if exists), then chats with messages, then empty chats
        const eMarayChat = validResults.find((ev: ChatListItem) => ev.nickName === userEMaray)
        const otherChatsWithMessages = sortedChatsWithMessages.filter(
          (ev: ChatListItem) => ev.nickName !== userEMaray
        )
        const otherEmptyChats = sortedEmptyChats.filter(
          (ev: ChatListItem) => ev.nickName !== userEMaray
        )

        const orderedChatList = [
          ...(eMarayChat ? [eMarayChat] : []),
          ...otherChatsWithMessages,
          ...otherEmptyChats
        ]

        if (mountedRef.current) {
          // Clear timeout if it exists
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current)
            fetchTimeoutRef.current = null
          }
          setChatList(orderedChatList)
          setFilteredChatList(orderedChatList)
          setLoaded(true)
        }
        fetchInProgressRef.current = false
      } catch (error) {
        console.error('Error fetching chat list:', error)
        if (mountedRef.current) {
          // Clear timeout if it exists
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current)
            fetchTimeoutRef.current = null
          }
          setChatList([])
          setFilteredChatList([])
          setLoaded(true) // Still show UI even on error
        }
        fetchInProgressRef.current = false
      }
    }

    // FIXED: Always try to fetch when data changes
    // If data is ready, fetch immediately
    // If still loading, wait a bit and try again
    // Clear any existing timeout first
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
      fetchTimeoutRef.current = null
    }

    if (isDataReady && !fetchInProgressRef.current) {
      fetchChatList()
    } else if (!loading2 && !fetchInProgressRef.current) {
      // Data finished loading but might not be ready yet - wait a bit and try
      fetchTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && !fetchInProgressRef.current) {
          fetchChatList()
        }
      }, 1000)
    } else if (!fetchInProgressRef.current) {
      // Still loading - wait and retry
      fetchTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && !fetchInProgressRef.current) {
          fetchChatList()
        }
      }, 500)
    }

    return () => {
      mountedRef.current = false
      fetchInProgressRef.current = false
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
        fetchTimeoutRef.current = null
      }
    }
  }, [
    isDataReady,
    generalData,
    loading2,
    getImageProfile,
    getTotalUnreadMsgByIdUser,
    getlastMsgBy2Users,
    userEMaray
  ])

  // Filter chat list based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChatList(chatList)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = chatList.filter((item) => {
      const fullName = showedName(item.firstName, item.lastName).toLowerCase()
      const lastMessage = item.lastMsgWithMe?.toLowerCase() || ''
      return fullName.includes(query) || lastMessage.includes(query)
    })
    setFilteredChatList(filtered)
  }, [searchQuery, chatList])

  // Pull to refresh handler
  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true)
    try {
      // FIXED: Actually trigger a refetch by calling fetchChatList directly
      // Reset the fetch flag to allow a new fetch
      fetchInProgressRef.current = false
      
      // Clear any pending timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
        fetchTimeoutRef.current = null
      }
      
      // Force a refetch by temporarily clearing the data
      const data = generalData as GeneralData | undefined
      if (data?.me?.idUser && data?.allUsersFromMyCompany) {
        // Re-fetch the chat list
        const allUsersFromMyCompany = data.allUsersFromMyCompany || []
        const currentUserId = data.me.idUser
        const otherUsers = allUsersFromMyCompany.filter((el: User) => el.idUser !== currentUserId)
        
        if (otherUsers.length > 0) {
          const chatListPromises = otherUsers.map(async (el: User): Promise<ChatListItem | null> => {
            try {
              const name = el.userProfileImage?.split('/').pop()
              const [imgProfResult, totUrMsgResult, lastMsgResult] = await Promise.all([
                name
                  ? getImageProfile({
                      variables: { idSiMMediaURL: name }
                    }).catch(() => null)
                  : Promise.resolve(null),
                getTotalUnreadMsgByIdUser({
                  variables: { idUserTo: el.idUser }
                }).catch(() => null),
                getlastMsgBy2Users({
                  variables: {
                    idUser: currentUserId,
                    idUserTo: el.idUser
                  }
                }).catch(() => null)
              ])

              const imgProf =
                imgProfResult?.data?.getSignedUrlFromCache?.signedUrl || DEFAULT_IMAGE
              const totUrMsg = totUrMsgResult?.data?.totalUnReadChatsByIdUser || 0
              const lastMsg = lastMsgResult?.data?.lastMsgBy2Users

              if (!lastMsg) {
                return {
                  idChat: '',
                  idUser: el.idUser,
                  nickName: el.nickName,
                  firstName: el.firstName || '',
                  lastName: el.lastName || '',
                  messageRead: false,
                  userProfileImage: imgProf,
                  lastMsgWithMe: '',
                  dateTimeLastMsgWithMe: '',
                  totalUnReadChatsByIdUser: totUrMsg,
                  idConversation: 'new_chat'
                }
              }

              return {
                idChat: lastMsg.idChat || '',
                idUser: el.idUser,
                nickName: el.nickName,
                firstName: el.firstName || '',
                lastName: el.lastName || '',
                messageRead: lastMsg.messageRead || false,
                userProfileImage: imgProf,
                lastMsgWithMe: lastMsg.chatText || '',
                dateTimeLastMsgWithMe: lastMsg.chatDateTimePost || '',
                totalUnReadChatsByIdUser: totUrMsg,
                idConversation: lastMsg.idConversation || 'new_chat'
              }
            } catch (error) {
              console.error(`Error fetching chat data for user ${el.idUser}:`, error)
              return null
            }
          })

          const results = await Promise.all(chatListPromises)
          const validResults = results.filter(
            (item: ChatListItem | null): item is ChatListItem => item !== null
          )

          const chatsWithMessages = validResults.filter(
            (item: ChatListItem) => item.dateTimeLastMsgWithMe && item.dateTimeLastMsgWithMe !== ''
          )
          const emptyChats = validResults.filter(
            (item: ChatListItem) => !item.dateTimeLastMsgWithMe || item.dateTimeLastMsgWithMe === ''
          )

          const sortedChatsWithMessages = chatsWithMessages.sort(
            (a: ChatListItem, b: ChatListItem) =>
              new Date(b.dateTimeLastMsgWithMe || 0).getTime() -
              new Date(a.dateTimeLastMsgWithMe || 0).getTime()
          )

          const sortedEmptyChats = emptyChats.sort(
            (a: ChatListItem, b: ChatListItem) =>
              (a.nickName || '').localeCompare(b.nickName || '')
          )

          const eMarayChat = validResults.find((ev: ChatListItem) => ev.nickName === userEMaray)
          const otherChatsWithMessages = sortedChatsWithMessages.filter(
            (ev: ChatListItem) => ev.nickName !== userEMaray
          )
          const otherEmptyChats = sortedEmptyChats.filter(
            (ev: ChatListItem) => ev.nickName !== userEMaray
          )

          const orderedChatList = [
            ...(eMarayChat ? [eMarayChat] : []),
            ...otherChatsWithMessages,
            ...otherEmptyChats
          ]

          setChatList(orderedChatList)
          setFilteredChatList(orderedChatList)
        }
      }
    } catch (error) {
      console.error('Error refreshing chat list:', error)
    } finally {
      setRefreshing(false)
    }
  }, [generalData, getImageProfile, getTotalUnreadMsgByIdUser, getlastMsgBy2Users, userEMaray])

  const handleChatPress = useCallback((item: ChatListItem): void => {
    const data = generalData as GeneralData | undefined
    const idUser = data?.me?.idUser || ''
    const idUserTo = item.idUser
    
    // Get company role from the user in allUsersFromMyCompany
    const user = data?.allUsersFromMyCompany?.find((u: User) => u.idUser === item.idUser)
    const companyJobRoleDescription = user?.companyJobRoleDescription || ''

    router.push({
      pathname: '/chat/[chatScreen]',
      params: {
        idUser,
        idUserTo,
        userProfileImage: data?.me?.userProfileImage || '',
        userToProfileImage: item.userProfileImage,
        idChat: item.idChat,
        idConversation: item.idConversation,
        me: JSON.stringify(data?.me || {}),
        name: showedName(item.firstName, item.lastName),
        companyJobRoleDescription
      }
    })
  }, [generalData, router])

  const renderChatItem = ({ item }: { item: ChatListItem }): React.JSX.Element | null => {
    const data = generalData as GeneralData | undefined
    if (item.nickName === data?.me?.nickName) {
      return null
    }

    const displayName = showedName(item.firstName, item.lastName)
    const lastMessage = item.lastMsgWithMe || 'No messages yet'
    const truncatedMessage = lastMessage.length > 50 ? `${lastMessage.slice(0, 50)}...` : lastMessage
    const hasUnread = item.totalUnReadChatsByIdUser > 0

    return (
      <TouchableOpacity
        key={item.idChat || item.idUser}
        style={styles.chatListItem}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={56}
            source={{ uri: item.userProfileImage }}
            style={{ backgroundColor: theme.colors.surfaceVariant }}
          />
          {/* Online indicator - placeholder for future implementation */}
          {/* <View style={styles.onlineIndicator} /> */}
        </View>
        <View style={styles.chatListItemContent}>
          <View style={styles.chatListItemHeader}>
            <Text style={[styles.chatListItemName, hasUnread && { fontWeight: '700' }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.chatListItemTime}>
              {item.dateTimeLastMsgWithMe ? getFormatedTime(item.dateTimeLastMsgWithMe) : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={[
                styles.chatListItemMessage,
                hasUnread && { color: theme.colors.onSurface, fontWeight: '500' }
              ]}
              numberOfLines={1}
            >
              {truncatedMessage}
            </Text>
            {hasUnread && (
              <View style={styles.chatListItemUnread}>
                <Text style={styles.chatListItemUnreadText}>
                  {item.totalUnReadChatsByIdUser > 99 ? '99+' : item.totalUnReadChatsByIdUser}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyState = (): React.JSX.Element => {
    if (!loaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <CustomActivityIndicator />
          <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>Loading chats...</Text>
        </View>
      )
    }

    if (searchQuery && filteredChatList.length === 0) {
      return (
        <View style={styles.chatListEmpty}>
          <Text style={styles.chatListEmptyText}>No chats found matching "{searchQuery}"</Text>
        </View>
      )
    }

    if (filteredChatList.length === 0) {
      return (
        <View style={styles.chatListEmpty}>
          <Text style={styles.chatListEmptyText}>No chats yet. Start a conversation!</Text>
        </View>
      )
    }

    return <></>
  }

  return (
    <View style={styles.chatListContainer}>
      <Drawer.Screen
        options={{
          title: 'Chat',
          headerShown: true,
          headerLeft: () => <DrawerToggleButton tintColor={theme.colors.primary} />
        }}
      />
      <LockOrientation orientation={ScreenOrientation.OrientationLock.PORTRAIT_UP} />
      <Searchbar
        placeholder='Search chats...'
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ margin: 8, elevation: 2 }}
        inputStyle={{ fontSize: 14 }}
      />
      <FlatList
        data={filteredChatList}
        keyExtractor={(item) => item.idChat || item.idUser}
        renderItem={renderChatItem}
        ListEmptyComponent={renderEmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={
          filteredChatList.length === 0 ? { flex: 1 } : undefined
        }
      />
    </View>
  )
}

