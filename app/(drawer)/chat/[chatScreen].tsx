import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react'
import { View, KeyboardAvoidingView, FlatList, Keyboard, Platform, AppState, AppStateStatus, SafeAreaView, RefreshControl } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useIsFocused } from '@react-navigation/native'
import { gql, useLazyQuery, useMutation, useApolloClient } from '@apollo/client'
import { useTheme, Text } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

// Custom modules
import { getFormatedTime } from '../../../globals/functions/functions'
import MsgBubble from './components/MsgBubble'
import MsgInput from './components/MsgInput'
import ChatHeader from './components/ChatHeader'
import DateSeparator from './components/DateSeparator'
import { DataContext } from '../../../context/DataContext'
import { DEFAULT_IMAGE } from '../../../globals/variables/globalVariables'
import { getImageUrl } from '../../../globals/functions/imageUtils'
import { ChatMessage } from '../../../types'
import { createChatStyles } from './styles'

// GraphQL queries and mutations
const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
    getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
      signedUrl
    }
  }
`

const chatByConversationQH = gql`
  query ChatByConversation($idConversation: ID!) {
    chatByConversation(idConversation: $idConversation) {
      chatText
      chatDateTimePost
      firstName
      lastName
      messageRead
      idConversation
      idChat
      idUser
      idUserTo
      userProfileImage
      userProfileImageTo
    }
  }
`

interface ChatScreenParams {
  idUser?: string
  idUserTo?: string
  userToProfileImage?: string
  idChat?: string
  idConversation?: string
  userProfileImage?: string
  companyJobRoleDescription?: string
}

interface MessageGroup {
  type: 'date' | 'message'
  date?: string
  message?: ChatMessage
}

const groupMessagesByDate = (messages: ChatMessage[]): MessageGroup[] => {
  if (!messages || messages.length === 0) return []

  const groups: MessageGroup[] = []
  let currentDate = ''

  messages.forEach((message) => {
    const messageDate = new Date(message.chatDateTimePost).toDateString()
    
    if (messageDate !== currentDate) {
      groups.push({ type: 'date', date: message.chatDateTimePost })
      currentDate = messageDate
    }
    
    groups.push({ type: 'message', message })
  })

  return groups
}

const ChatScreen: React.FC = () => {
  const { t } = useTranslation('chat')
  const theme = useTheme()
  const styles = createChatStyles(theme)
  const client = useApolloClient()
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('ChatScreen must be used within DataProvider')
  }

  const { data } = context
  const [loaded, setLoaded] = useState<boolean>(false)
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [imageProfile, setImageProfile] = useState<string>('')
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const flatListRef = useRef<FlatList>(null)
  const [getImageProfile] = useMutation<{
    getSignedUrlFromCache: { signedUrl: string }
  }>(getSignedUrlFromCacheQ)

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

  const [getChatByIdConv] = useLazyQuery<{
    chatByConversation: ChatMessage[]
  }>(chatByConversationQH, {
    fetchPolicy: 'cache-and-network',
    pollInterval: shouldPoll ? 5000 : 0
  })

  const params = useLocalSearchParams<ChatScreenParams>()
  const idUser = params?.idUser
  const idUserTo = params?.idUserTo
  const userToProfileImage = params?.userToProfileImage
  const idChat = params?.idChat
  const idConversation = params?.idConversation || ''
  const userProfileImage = params?.userProfileImage || ''
  const name = params?.name || 'User'
  const companyJobRoleDescription = params?.companyJobRoleDescription || ''

  // Group messages by date
  const messageGroups = useMemo(() => groupMessagesByDate(chat), [chat])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      // Refetch chat messages for current conversation
      if (idConversation && idConversation !== 'new_chat' && idConversation.trim() !== '') {
        const result = await getChatByIdConv({
          variables: { idConversation }
        })
        if (result?.data?.chatByConversation) {
          setChat(result.data.chatByConversation)
        }
      }
      // Also refetch all active queries
      await client.refetchQueries({
        include: 'active'
      })
    } catch (error) {
      console.error('Error refreshing chat:', error)
    } finally {
      setRefreshing(false)
    }
  }, [idConversation, getChatByIdConv, client])

  // Scroll to end when chat updates
  useEffect(() => {
    if (loaded && messageGroups.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [chat, loaded, messageGroups.length])

  // Scroll to end on initial load
  useEffect(() => {
    if (loaded && messageGroups.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false })
      }, 100)
    }
  }, [loaded, messageGroups.length])

  // FIXED: Simplified data fetching - removed setTimeout hack and newQuery state
  useEffect(() => {
    // Reset loading state when conversation changes
    setLoaded(false)
    setChat([])

    if (!idConversation || idConversation === 'new_chat' || idConversation.trim() === '') {
      setChat([])
      setLoaded(true)
      return
    }

    let isMounted = true
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Chat fetch timeout, setting loaded to true')
        setChat([])
        setLoaded(true)
      }
    }, 10000) // 10 second timeout

    const fetchData = async (): Promise<void> => {
      try {
        if (!isMounted) return
        
        const fetchedChat = await getChatByIdConv({
          variables: { idConversation }
        })

        if (!isMounted) return

        clearTimeout(timeoutId)

        if (fetchedChat?.data?.chatByConversation) {
          setChat(fetchedChat.data.chatByConversation)
        } else {
          setChat([])
        }
        setLoaded(true)
      } catch (error) {
        console.error('Error fetching chat:', error)
        if (isMounted) {
          clearTimeout(timeoutId)
          setChat([])
          setLoaded(true)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [idConversation, getChatByIdConv])

  // FIXED: Separate effect for image profile
  useEffect(() => {
    if (imageProfile || !userProfileImage) return

    const fetchImage = async (): Promise<void> => {
      if (userProfileImage.includes('amazonaws')) {
        const file = userProfileImage.split('/').pop()
        if (!file) {
          setImageProfile(DEFAULT_IMAGE)
          return
        }

        try {
          const fetchedImgProf = await getImageProfile({
            variables: { idSiMMediaURL: file }
          })

          if (fetchedImgProf?.data?.getSignedUrlFromCache?.signedUrl) {
            setImageProfile(fetchedImgProf.data.getSignedUrlFromCache.signedUrl)
          } else {
            setImageProfile(DEFAULT_IMAGE)
          }
        } catch (error) {
          console.error('Error fetching image:', error)
          setImageProfile(DEFAULT_IMAGE)
        }
      } else {
        setImageProfile(getImageUrl(userProfileImage))
      }
    }

    fetchImage()
  }, [userProfileImage, imageProfile, getImageProfile])

  // Keyboard listener
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    })

    return () => {
      keyboardDidShowListener.remove()
    }
  }, [])

  const renderMessageItem = useCallback(({ item }: { item: MessageGroup }) => {
    if (item.type === 'date' && item.date) {
      return <DateSeparator date={item.date} />
    }

    if (item.type === 'message' && item.message) {
      const message = item.message
      const isSender = message.idUser === idUser
      
      // Determine if we should show avatar (show for first message in a group)
      const messageIndex = chat.findIndex((m) => m.idChat === message.idChat)
      const prevMessage = messageIndex > 0 ? chat[messageIndex - 1] : null
      const showAvatar = !prevMessage || 
        prevMessage.idUser !== message.idUser ||
        new Date(message.chatDateTimePost).getTime() - new Date(prevMessage.chatDateTimePost).getTime() > 300000 // 5 minutes

      return (
        <MsgBubble
          message={message.chatText}
          messageTime={getFormatedTime(message.chatDateTimePost)}
          isSender={isSender}
          userToProfileImage={userToProfileImage}
          imageProfile={imageProfile}
          showAvatar={showAvatar}
        />
      )
    }

    return null
  }, [chat, idUser, userToProfileImage, imageProfile])

  return (
    <SafeAreaView style={styles.chatScreenContainer} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Stack.Screen
          options={{
            headerShown: false
          }}
        />
        <ChatHeader
          name={name}
          userProfileImage={userToProfileImage}
          idUserTo={idUserTo}
          companyJobRoleDescription={companyJobRoleDescription}
        />
        {!loaded ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading messages...</Text>
          </View>
        ) : messageGroups.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={messageGroups}
            keyExtractor={(item, index) => 
              item.type === 'date' 
                ? `date-${item.date}-${index}`
                : `message-${item.message?.idChat}-${index}`
            }
            renderItem={renderMessageItem}
            style={styles.chatMessagesContainer}
            contentContainerStyle={{ paddingVertical: 12, paddingBottom: 16 }}
            inverted={false}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            onContentSizeChange={() => {
              if (messageGroups.length > 0) {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: false })
                }, 100)
              }
            }}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        )}
        <MsgInput 
          idUserTo={idUserTo || ''} 
          idConversation={idConversation}
          userProfileImageTo={userToProfileImage}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default ChatScreen

