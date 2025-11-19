import React, { useEffect, useState, useContext, useCallback } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { TextInput, IconButton, useTheme, Text } from 'react-native-paper'
import { gql, useMutation } from '@apollo/client'

// Custom modules
import { useMe } from '../../../../context/hooks/userQH'
import { DataContext } from '../../../../context/DataContext'
import { User } from '../../../../types'
import { createChatStyles } from '../styles'

const addNewChatM = gql`
  mutation AddNewChat(
    $idUser: ID!
    $idEmployee: ID!
    $firstName: String!
    $secondName: String
    $lastName: String!
    $secondLastName: String
    $nickName: String!
    $email: String!
    $phone: String
    $companyName: String!
    $idCompanyBusinessUnit: ID!
    $companyBusinessUnitDescription: String!
    $idCompanySector: ID!
    $companySectorDescription: String!
    $idcompanyJobRole: ID!
    $companyJobRoleDescription: String!
    $idUserTo: ID!
    $userProfileImage: String!
    $chatText: String!
    $chatDateTimePost: String!
    $idConversation: ID!
    $userProfileImageTo: String
    $messageRead: Boolean!
  ) {
    addNewChat(
      idUser: $idUser
      idEmployee: $idEmployee
      firstName: $firstName
      secondName: $secondName
      lastName: $lastName
      secondLastName: $secondLastName
      nickName: $nickName
      email: $email
      phone: $phone
      companyName: $companyName
      idCompanyBusinessUnit: $idCompanyBusinessUnit
      companyBusinessUnitDescription: $companyBusinessUnitDescription
      idCompanySector: $idCompanySector
      companySectorDescription: $companySectorDescription
      idcompanyJobRole: $idcompanyJobRole
      companyJobRoleDescription: $companyJobRoleDescription
      idUserTo: $idUserTo
      userProfileImage: $userProfileImage
      chatText: $chatText
      chatDateTimePost: $chatDateTimePost
      idConversation: $idConversation
      userProfileImageTo: $userProfileImageTo
      messageRead: $messageRead
    ) {
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

interface MsgInputProps {
  idUserTo: string
  idConversation: string
  userProfileImageTo?: string
}

interface ChatValues {
  idUser: string
  idEmployee: string
  firstName: string
  secondName?: string
  lastName: string
  secondLastName?: string
  nickName: string
  email: string
  phone?: string
  companyName: string
  companyBusinessUnitDescription?: string
  idCompanySector?: string
  idCompanyBusinessUnit?: string
  companySectorDescription?: string
  idcompanyJobRole?: string
  companyJobRoleDescription?: string
  idUserTo: string
  userProfileImage: string
  userProfileImageTo: string
  chatText: string
  chatDateTimePost: Date
  idConversation: string
  messageRead: boolean
}

const MsgInput: React.FC<MsgInputProps> = ({ idUserTo, idConversation, userProfileImageTo }) => {
  const theme = useTheme()
  const styles = createChatStyles(theme)
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('MsgInput must be used within DataProvider')
  }

  const { data, setData } = context
  const { me, loading: meLoading } = useMe()
  const [addNewChat] = useMutation(addNewChatM)
  const [msg, setMsg] = useState<string>('')
  const [values, setValues] = useState<Partial<ChatValues>>({})
  const MAX_LENGTH = 500

  // FIXED: Use functional update for setData
  useEffect(() => {
    if (data?.newMsg !== 'new_chat' && data?.newMsg !== '') {
      setData((prev) => ({
        ...prev,
        newMsg: new Date().toLocaleTimeString()
      }))
    }
  }, [msg, data?.newMsg, setData])

  useEffect(() => {
    if (meLoading || !me) return

    setValues({
      idUser: me.idUser,
      idEmployee: me.idEmployee,
      firstName: me.firstName,
      secondName: me.secondName || '',
      lastName: me.lastName,
      secondLastName: me.secondLastName || '',
      nickName: me.nickName,
      email: me.email,
      phone: me.phone || '',
      companyName: me.companyName,
      companyBusinessUnitDescription: me.companyBusinessUnitDescription || '',
      idCompanySector: me.idCompanySector || '',
      idCompanyBusinessUnit: me.idCompanyBusinessUnit || '',
      companySectorDescription: me.companySectorDescription || '',
      idcompanyJobRole: me.idcompanyJobRole || '',
      companyJobRoleDescription: me.companyJobRoleDescription || '',
      idUserTo,
      userProfileImage: me.userProfileImage || '',
      userProfileImageTo: userProfileImageTo || '',
      chatText: msg,
      chatDateTimePost: new Date(),
      idConversation,
      messageRead: false
    })
  }, [me, meLoading, idUserTo, idConversation, msg, userProfileImageTo])

  const handleSendMessage = useCallback(async (): Promise<void> => {
    if (!msg.trim() || !me || !values.idUser) return

    try {
      // Match old implementation: spread values directly and override chatText and chatDateTimePost
      // Send Date object directly (Apollo will serialize it) to match old implementation
      const mutationVariables = {
        ...values,
        chatText: msg.trim(),
        chatDateTimePost: new Date() // Send Date object instead of ISO string to match old implementation
      }

      console.log('Sending message with variables:', {
        ...mutationVariables,
        chatText: mutationVariables.chatText.substring(0, 50) + '...'
      })

      await addNewChat({
        variables: mutationVariables
      })

      // FIXED: Use functional update
      setData((prev) => ({
        ...prev,
        newMsg: new Date().toLocaleTimeString()
      }))
      setMsg('')
    } catch (error: any) {
      console.error('Error sending message:', error)
      console.error('Error details:', {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
        variables: error.variables
      })
      // You might want to show an alert to the user here
    }
  }, [msg, me, values, addNewChat, setData])

  const canSend = msg.trim().length > 0 && !meLoading && me
  const showCounter = msg.length > MAX_LENGTH * 0.8

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          value={msg}
          mode='flat'
          placeholder='Type a message...'
          placeholderTextColor={theme.colors.onSurfaceVariant}
          multiline
          maxLength={MAX_LENGTH}
          onChangeText={setMsg}
          underlineColorAndroid='transparent'
          activeUnderlineColor='transparent'
          underlineColor='transparent'
          contentStyle={{ color: theme.colors.onSurface }}
        />
        <View style={styles.sendButtonContainer}>
          <TouchableOpacity
            style={[styles.inputButton, !canSend && styles.inputButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!canSend}
          >
            <IconButton
              icon='send'
              size={20}
              iconColor={canSend ? theme.colors.onPrimary : theme.colors.onSurfaceDisabled}
              disabled={!canSend}
            />
          </TouchableOpacity>
        </View>
      </View>
      {showCounter && (
        <Text style={styles.characterCounter}>
          {msg.length}/{MAX_LENGTH}
        </Text>
      )}
    </View>
  )
}

export default MsgInput

