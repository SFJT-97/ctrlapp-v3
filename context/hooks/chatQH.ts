import { gql, useQuery, QueryHookOptions } from '@apollo/client'
import { ChatMessage } from '../../types'

const chatBy2UsersQ = gql`
  query ChatBy2Users($idUser: ID!, $idUserTo: ID!) {
    chatBy2Users(idUser: $idUser, idUserTo: $idUserTo) {
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

const TotalUnReadChatsByIdUserQ = gql`
  query Query($idUser: ID!) {
    totalUnReadChatsByIdUser(idUser: $idUser)
  }
`

const lastMsgBy2UsersQH = gql`
  query LastMsgBy2Users($idUser: ID!, $idUserTo: ID!) {
    lastMsgBy2Users(idUser: $idUser, idUserTo: $idUserTo) {
      idChat
      chatText
      chatDateTimePost
      messageRead
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

// FIXED: Correct useQuery syntax - all options in second argument
export const useChatBy2Users = (
  idUser: string,
  idUserTo: string
): ChatMessage[] | 'Loading...' | string => {
  const { loading, error, data } = useQuery<{ chatBy2Users: ChatMessage[] }>(
    chatBy2UsersQ,
    {
      variables: { idUser, idUserTo },
      fetchPolicy: 'network-only'
    }
  )

  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  return data?.chatBy2Users ?? []
}

export const useTotalUnReadChatsByIdUser = (
  idUser: string
): number | 'Loading...' | string => {
  const { loading, error, data } = useQuery<{
    totalUnReadChatsByIdUser: number
  }>(TotalUnReadChatsByIdUserQ, {
    variables: { idUser },
    fetchPolicy: 'network-only'
  })

  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  return data?.totalUnReadChatsByIdUser ?? 0
}

export const useLastMsgBy2Users = (
  idUser: string,
  idUserTo: string
): ChatMessage | 'Loading...' | string | null => {
  const { loading, error, data } = useQuery<{
    lastMsgBy2Users: ChatMessage | null
  }>(lastMsgBy2UsersQH, {
    variables: { idUser, idUserTo },
    fetchPolicy: 'network-only'
  })

  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  return data?.lastMsgBy2Users ?? null
}

export const useChatByIdConversation = (
  idConversation: string
): ChatMessage[] | 'Loading...' | string => {
  const { loading, error, data } = useQuery<{
    chatByConversation: ChatMessage[]
  }>(chatByConversationQH, {
    variables: { idConversation },
    fetchPolicy: 'network-only'
  })

  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  return data?.chatByConversation ?? []
}

