// Builtin modules
import { useState, useEffect, useContext, useRef } from 'react'
import { View, KeyboardAvoidingView, ScrollView, Keyboard, Platform } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { gql, useLazyQuery, useMutation } from '@apollo/client'

// Custom modules
import { getFormatedTime } from '../../../globals/functions/functions'
import MsgBubble from './components/MsgBubble'
import MsgInput from './components/MsgInput'
import { DataContext } from '../../../context/DataContext'

// global variables
import { DEFAULT_IMAGE } from '../../../globals/variables/globalVariables'

// La mutación que obtiene la key de AWS para la imágen indicada.
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

const ChatScreen = () => {
  const { data } = useContext(DataContext)
  const [loaded, setLoaded] = useState(false)
  const [chat, setChat] = useState([])
  const [newQuery, setNewQuery] = useState(true)
  const [imageProfile, setImageProfile] = useState('')
  const [getImageProfile] = useMutation(getSignedUrlFromCacheQ)
  const [getChatByIdConv] = useLazyQuery(chatByConversationQH, { fetchPolicy: 'network-only', pollInterval: 5000 })
  const [idConv, setIdConv] = useState('')
  const params = useLocalSearchParams()
  const idUser = params?.idUser
  const idUserTo = params?.idUserTo
  const userToProfileImage = params?.userToProfileImage
  const idChat = params?.idChat
  const idConversation = params?.idConversation
  const userProfileImage = params?.userProfileImage

  const scrollViewRef = useRef()

  // Scroll al final cada vez que cambia el chat
  useEffect(() => {
    if (loaded) {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }
  }, [chat])

  // Scroll al final cuando se abre la ventana por primera vez
  useEffect(() => {
    if (loaded) {
      scrollViewRef.current?.scrollToEnd({ animated: false })
    }
  }, [loaded])

  useEffect(() => {
    const fetchData = async () => {
      const params = idConversation ? { variables: { idConversation } } : { variables: { idConversation: '' } }
      const fetchedChat = await getChatByIdConv(params)
      if (fetchedChat && fetchedChat !== 'ApolloError' && fetchedChat !== 'Loading...') {
        setChat(fetchedChat.data.chatByConversation)
        setLoaded(true)
      }
      if (imageProfile === '') {
        setImageProfile(DEFAULT_IMAGE)
        if (userProfileImage.includes('amazonaws')) {
          const file = userProfileImage.split('/').pop()
          const fetchedImgProf = await getImageProfile({ variables: { idSiMMediaURL: file } })
          if (fetchedImgProf && fetchedImgProf !== 'ApolloError' && fetchedImgProf !== 'Loading...') {
            const imgProfUrl = fetchedImgProf.data.getSignedUrlFromCache.signedUrl
            setImageProfile(imgProfUrl)
          }
        } else {
          setImageProfile(userProfileImage)
        }
      }
    }
    newQuery && fetchData()

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    })

    return () => {
      keyboardDidShowListener.remove()
    }
  }, [imageProfile, chat, data, newQuery])

  useEffect(() => {
    let param = ''
    if (idConversation) param = idConversation
    setIdConv(param)
    setNewQuery(true)
  }, [data])

  useEffect(() => {
    setNewQuery(true)
    setTimeout(() => {
      setNewQuery(false)
    }, 1000 * 2) // Timer de 2 segundos
  }, [])

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <Stack.Screen
        options={{
          title: (`idChat #${idChat?.slice(0, 7)}...`)
        }}
      />
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
        keyboardShouldPersistTaps='handled'
      >
        {loaded && (
          <ShowConversation chat={chat} idUser={idUser} userToProfileImage={userToProfileImage} imageProfile={imageProfile} />
        )}
      </ScrollView>
      <View style={{ position: 'relative', paddingTop: 150 }}>
        <MsgInput idUserTo={idUserTo} idConversation={idConv} />
      </View>
    </KeyboardAvoidingView>
  )
}

// Función para mostrar la conversación
const ShowConversation = (params) => {
  const {
    chat,
    idUser,
    userToProfileImage,
    imageProfile
  } = params

  if (!chat || chat.length === 0 || chat === undefined || chat === 'Loading...' || chat === 'Loading...Loading...') return <></>

  try {
    return (
      // chat.slice(chat.length - 20, chat.length).map(el => {
      chat.map(el => {
        // en esta parte habría que limitar la cantidad de conversaciones que se muestran
        return (
          <View key={el.idChat}>
            <MsgBubble
              message={el.chatText}
              messageTime={getFormatedTime(el.chatDateTimePost)}
              isSender={el.idUser === idUser}
              userToProfileImage={userToProfileImage}
              imageProfile={imageProfile}
            />
          </View>
        )
      })
    )
  } catch (error) {
    console.error('Error al renderizar los mensajes:', error)
    return <></>
  }
}

export default ChatScreen
