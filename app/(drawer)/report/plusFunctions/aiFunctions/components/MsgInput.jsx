// ==> 2024-10-02
// Builtin modules
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { TextInput, IconButton } from 'react-native-paper'
import { gql, useMutation } from '@apollo/client'

// Custom modules
import { msginput } from '../eMarayChat/styles'

// Modificar esta por la que corresponde a "chatIA"
const addNewChatM = gql`
mutation AddNewChat($idUser: ID!, $idEmployee: ID!, $firstName: String!, $secondName: String!, $lastName: String!, $secondLastName: String!, $nickName: String!, $email: String!, $phone: String!, $companyName: String!, $idCompanyBusinessUnit: ID!, $companyBusinessUnitDescription: String!, $idCompanySector: ID!, $companySectorDescription: String!, $idcompanyJobRole: ID!, $companyJobRoleDescription: String!, $idUserTo: ID!, $userProfileImage: String!, $chatText: String!, $chatDateTimePost: String!, $idConversation: ID!, $userProfileImageTo: String, $messageRead: Boolean!) {
  addNewChat(idUser: $idUser, idEmployee: $idEmployee, firstName: $firstName, secondName: $secondName, lastName: $lastName, secondLastName: $secondLastName, nickName: $nickName, email: $email, phone: $phone, companyName: $companyName, idCompanyBusinessUnit: $idCompanyBusinessUnit, companyBusinessUnitDescription: $companyBusinessUnitDescription, idCompanySector: $idCompanySector, companySectorDescription: $companySectorDescription, idcompanyJobRole: $idcompanyJobRole, companyJobRoleDescription: $companyJobRoleDescription, idUserTo: $idUserTo, userProfileImage: $userProfileImage, chatText: $chatText, chatDateTimePost: $chatDateTimePost, idConversation: $idConversation, userProfileImageTo: $userProfileImageTo, messageRead: $messageRead) {
    idChat
    idUser
    idEmployee
    firstName
    secondName
    lastName
    secondLastName
    nickName
    email
    phone
    companyName
    idCompanyBusinessUnit
    companyBusinessUnitDescription
    idCompanySector
    companySectorDescription
    idcompanyJobRole
    companyJobRoleDescription
    idUserTo
    userProfileImage
    userProfileImageTo
    chatText
    chatDateTimePost
    idConversation
    messageRead
  }
}

`

const MsgInput = (params) => {
  const {
    idUserTo,
    idConversation,
    me,
    styles
  } = params
  // La conversación será la que identifique a la charla, a la hora de cargar los mensajes se deberá usar un useChatByIdConversation
  const [addNewChat] = useMutation(addNewChatM)
  const [msg, setMsg] = useState('')
  const [values, setValues] = useState({})
  useEffect(() => {
    setMsg(msg)
  }, [msg])
  useEffect(() => {
    if (me !== undefined && me !== 'ApolloError' && me !== 'Loading...') {
      setValues({
        idUser: me.idUser,
        idEmployee: me.idEmployee,
        firstName: me.firstName,
        secondName: me.secondName,
        lastName: me.lastName,
        secondLastName: me.secondLastName,
        nickName: me.nickName,
        email: me.email,
        phone: me.phone,
        companyName: me.companyName,
        companyBusinessUnitDescription: me.companyBusinessUnitDescription,
        idCompanySector: me.idCompanySector,
        idCompanyBusinessUnit: me.idCompanyBusinessUnit,
        companySectorDescription: me.companySectorDescription,
        idcompanyJobRole: me.idcompanyJobRole,
        companyJobRoleDescription: me.companyJobRoleDescription,
        idUserTo,
        userProfileImage: me.userProfileImage,
        userProfileImageTo: '',
        chatText: msg,
        chatDateTimePost: new Date(),
        idConversation,
        messageRead: false
      })
    }
  }, [me])
  // console.log('msg=', msg)
  const handleSendMessage = async () => {
    try {
      await addNewChat(
        {
          variables: {
            ...values,
            chatText: msg,
            chatDateTimePost: new Date()
          }
        }
      )
      setMsg('')
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={msginput.input}
        value={msg}
        mode='outlined'
        placeholder='Type a message...'
        multiline
        maxLength={140}
        onChange={val => setMsg(val.nativeEvent.text)}
      />
      <IconButton
        icon='send-circle'
        size={50}
        animated
        onPress={() => handleSendMessage()}
      />
    </View>
  )
}

export default MsgInput
