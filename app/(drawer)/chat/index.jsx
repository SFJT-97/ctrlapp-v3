// ==> 2024-10-02
/*
  Esta pantalla debe mostrar la lista de chats del usuario logueado (chatList) y cada elemento de dicho chat debe llevarnos a la
  chatScreen en la cual se puede ver lo que los usuarios hablan
*/
// Builtin modules
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Avatar, Text, Divider, Badge } from 'react-native-paper'
import { Link } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from '@react-navigation/drawer'
import { gql, useLazyQuery, useQuery, useMutation } from '@apollo/client'

// Custom modules
// import { useMe, useAllUsersFromMyCompany } from '../../../context/hooks/userQH'
import { chatlist } from '../../../globals/styles/styles'
import { showedName, getFormatedTime } from '../../../globals/functions/functions'
import CustomActivityIndicator from '../../../globals/components/CustomActivityIndicator'
import LockOrientation from '../../../globals/LockOrientation'
import { useAsyncStorage } from '../../../context/hooks/ticketNewQH'

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

export default function ChatPage () {
  // hookes calls
  const [loaded, setLoaded] = useState(false)
  const [propCount, setPropCount] = useState(0)
  // const [userProfileImage, setUserProfileImage] = useState('') // this is the users logged profile image
  const [chatList, setChatList] = useState([])
  const { value: generalData, loading2 } = useAsyncStorage('CTRLA_GENERAL_DATA')
  // const { me } = useMe()
  // const { allUsersFromMyCompany } = useAllUsersFromMyCompany()
  const [allUsersFromMyCompany, setAllUsersFromMyCompany] = useState([])
  const [getlastMsgBy2Users] = useLazyQuery(lastMsgBy2UsersQ, { fetchPolicy: 'network-only' })
  const getOnLineLastMsgBy2Users = useQuery(lastMsgWithMeQ, { fetchPolicy: 'network-only', pollInterval: 5000 })
  const [getImageProfile] = useMutation(getSignedUrlFromCacheQ)
  const [getTotalUnreadMsgByIdUser] = useLazyQuery(totalUnreadMsgByIdUserQ, { fetchPolicy: 'network-only' })
  const [unreadedMessages, setUnreadedMessages] = useState(false)
  const [userEMaray, setUserEMaray] = useState('')

  let idUser
  let idUserTo
  // useEffect(() => {
  //   if (me !== undefined && me !== 'ApolloError' && me !== 'Loading...') {
  //     idUser = me.idUser
  //     setUserEMaray('eMaray' + me.companyName)
  //     setPropCount(propCount + 1)
  //   }
  // }, [me])
  // useEffect(() => {
  //   if (allUsersFromMyCompany !== undefined && allUsersFromMyCompany !== 'ApolloError' && allUsersFromMyCompany !== 'Loading...') {
  //     setPropCount(propCount + 1)
  //   }
  // }, [allUsersFromMyCompany])
  useEffect(() => {
    if (!loading2) {
      idUser = generalData?.me?.idUser
      setUserEMaray('eMaray' + generalData?.me?.companyName)
      setPropCount(propCount + 2)
      setAllUsersFromMyCompany(generalData?.allUsersFromMyCompany)
    }
  }, [generalData, loading2])
  useEffect(() => {
    // console.log('getOnLineLastMsgBy2Users', getOnLineLastMsgBy2Users?.data)
    if (getOnLineLastMsgBy2Users && getOnLineLastMsgBy2Users !== 'ApolloError' && getOnLineLastMsgBy2Users !== 'Loading...' && getOnLineLastMsgBy2Users?.data?.lastMsgBy2Users) {
      setPropCount(propCount + 1)
    }
  }, [getOnLineLastMsgBy2Users?.data?.lastMsgBy2Users, getOnLineLastMsgBy2Users.loading, getOnLineLastMsgBy2Users.error])
  useEffect(() => {
    if (propCount > 2) {
      const fetchChatList = async () => {
        const tempChatList = []
        // En este punto hay que llamar al eMaray como el primer "tempChatList.push"
        for (const el of allUsersFromMyCompany) {
          let lastMsg
          let imgProf
          let totUrMsgById
          if (el.idUser !== generalData?.me?.idUser) {
            const name = el.userProfileImage.split('/').pop()
            imgProf = await getImageProfile({ variables: { idSiMMediaURL: name } })
            if (imgProf && imgProf !== 'Loading...' && imgProf !== 'ApolloError') {
              imgProf = imgProf.data.getSignedUrlFromCache.signedUrl
            }
            totUrMsgById = await getTotalUnreadMsgByIdUser({ variables: { idUserTo: el.idUser } })
            if (totUrMsgById && totUrMsgById !== 'ApolloError' && totUrMsgById !== 'Loading...') {
              totUrMsgById = totUrMsgById.data.totalUnReadChatsByIdUser
              // console.log('totUrMsgById\n', totUrMsgById)
            }
            lastMsg = await getlastMsgBy2Users({ variables: { idUser: generalData?.me?.idUser, idUserTo: el.idUser } })
            if (lastMsg && lastMsg !== 'ApolloError' && lastMsg !== 'Loading...') {
              lastMsg = lastMsg.data.lastMsgBy2Users

              let userToProfileImage
              let lastMsgWithMe
              let dateTimeLastMsgWithMe
              let idChat
              let messageRead
              let idConversation

              if (lastMsg === null) {
                userToProfileImage = imgProf
                lastMsgWithMe = ''
                dateTimeLastMsgWithMe = ''
                idChat = ''
                messageRead = false
                idConversation = 'new_chat'
              } else {
                userToProfileImage = imgProf
                lastMsgWithMe = await lastMsg.chatText
                dateTimeLastMsgWithMe = await lastMsg.chatDateTimePost
                idChat = await lastMsg.idChat
                messageRead = await lastMsg.messageRead
                idConversation = await lastMsg.idConversation
              }
              /*
                totalUnreadChatsByIdUser hay que revisarlo desde el BE, se arma quilombo con los idUser y los idUserTo
              */
              setUnreadedMessages(!messageRead)
              const totalUnReadChatsByIdUser = await totUrMsgById
              const temp = {
                idChat,
                idUser: el.idUser,
                nickName: el.nickName,
                firstName: el.firstName,
                lastName: el.lastName,
                messageRead,
                userProfileImage: userToProfileImage,
                lastMsgWithMe,
                dateTimeLastMsgWithMe,
                totalUnReadChatsByIdUser,
                idConversation
              }
              tempChatList.push(temp)
            }
          }
        }
        // En esta parte se verifica si existe el usuario eMaray en la compañía del usuario
        const tempEMaray = tempChatList.find(ev => ev.nickName === userEMaray)
        const orderedChatList = []
        if (tempEMaray) { // Verifica si encontró un objeto
          orderedChatList.push(tempEMaray) // Añade el objeto encontrado al inicio
        }

        // Filtra el resto y ordena por la propiedad dateTimeLastMsgWithMe
        const filteredAndSorted = tempChatList
          .filter(ev => ev.nickName !== userEMaray)
          .sort((a, b) => b.dateTimeLastMsgWithMe - a.dateTimeLastMsgWithMe)

        // Añade los elementos filtrados y ordenados al arreglo final
        orderedChatList.push(...filteredAndSorted)

        setChatList(orderedChatList)
        // setChatList(tempChatList)
        setLoaded(true)
      }
      fetchChatList()
    }
  }, [propCount, getOnLineLastMsgBy2Users, getOnLineLastMsgBy2Users.loading, getOnLineLastMsgBy2Users.error])

  return (
    <View>
      <Drawer.Screen
        options={{
          title: 'Chat',
          headerShown: true,
          headerLeft: () => <DrawerToggleButton />
        }}
      />
      <LockOrientation />
      {!loaded && (
        <View>
          <Text>Loading...</Text><CustomActivityIndicator />
        </View>
      )}
      {loaded && (
        // En esta parte hay que buscar dentro de chatList al usuario eMaray para cargarlo primero
        chatList.map(el => {
          // console.log('el', el)
          if (el.nickName !== generalData?.me?.nickName /* && el.nickName !== eMaray */) {
            idUserTo = el.idUser
            idUser = generalData?.me?.idUser
            return (
              <View key={el.idChat}>
                <Link
                  href={{
                    pathname: '/chat/[chatScreen]',
                    params:
                      {
                        idUser,
                        idUserTo,
                        userProfileImage: generalData?.me?.userProfileImage, // sin link temporario
                        userToProfileImage: el.userProfileImage, // con link temporario
                        idChat: el.idChat,
                        idConversation: el.idConversation,
                        me: JSON.stringify(generalData?.me),
                        name: showedName(el.firstName, el.lastName)
                      }
                  }}
                >
                  <Divider style={{ borderWidth: 0.5 }} />
                  <View style={chatlist.chatListRow}>
                    <View>
                      <Avatar.Image size={56} source={{ uri: el.userProfileImage }} style={{ margin: 2 }} />
                    </View>
                    <View style={chatlist.chatListContent}>
                      <View>
                        <Text style={{ fontSize: 11 }}>{getFormatedTime(el.dateTimeLastMsgWithMe)}</Text>
                        <Text variant='titleMedium'> {showedName(el.firstName, el.lastName)} </Text>
                        <Text>{el.lastMsgWithMe?.slice(0, 17)}...</Text>
                      </View>
                      <View style={{ marginLeft: 2, justifyContent: 'center' }}>
                        {unreadedMessages || (
                          <Badge
                            size={20}
                            style={{ alignSelf: 'flex-end', marginTop: 5 }}
                          >
                            {el.totalUnReadChatsByIdUser}
                          </Badge>
                        )}
                      </View>
                    </View>
                  </View>
                </Link>
                <Divider style={{ borderWidth: 0.2 }} />
              </View>
            )
          } else {
            return (
              <View key={el.idUser}>
                <Divider />
              </View>
            )
          }
        }
        )

      )}
    </View>
  )
}
