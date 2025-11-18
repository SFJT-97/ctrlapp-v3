import { gql, useQuery } from '@apollo/client'

/*
  Query:notificationByIdUser(idUser:ID!):[notification]!
*/

// Query definition from BE. All constants definitions used for useQuery hooks, will have a Q letter at the end
const notificationByIdUserQ = gql`
query NotificationByIdUser($idUser: ID!) {
  notificationByIdUser(idUser: $idUser) {
    idNotification
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
    showNotificationsToLevel
    notificationLevel
    notificationTitle
    notificationDescription
    isActive
  }
}

`

export const useNotificationByIdUser = ({ idUser }) => {
  const { loading, error, data } = useQuery(notificationByIdUserQ, { variables: { idUser } }, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const notificationByIdUserData = data.notificationByIdUser.map(el => el)
  return { notificationByIdUserData }
}

/*
  Query:notificationsToLevel(idUser:ID!,showNotificationsToLevel:Int!):[notification]!
*/

// Query definition from BE. All constants definitions used for useQuery hooks, will have a Q letter at the end
const notificationsToLevelQ = gql`
query NotificationsToLevel($idUser: ID!, $showNotificationsToLevel: Int!) {
  notificationsToLevel(idUser: $idUser, showNotificationsToLevel: $showNotificationsToLevel) {
    idNotification
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
    showNotificationsToLevel
    notificationLevel
    notificationTitle
    notificationDescription
    isActive
  }
}

`

export const useNotificationsToLevel = ({ idUser, showNotificationsToLevel }) => {
  const { loading, error, data } = useQuery(notificationsToLevelQ, { variables: { idUser, showNotificationsToLevel } }, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const notificationsToLevelData = data.notificationsToLevel.map(el => el)
  return { notificationsToLevelData }
}

/*
  Query: notificationsCountFromUser(idUser: $idUser)
*/

/* const notificationsCountFromUserQ = gql`
query Query($idUser: ID!) {
  notificationsCountFromUser(idUser: $idUser)
}

`

// Query definition from BE. All constants definitions used for useQuery hooks, will have a Q letter at the end
export const useNotificationsCountFromUser = async ({ idUser }) => {
  const { loading, error, data } = useQuery(notificationsCountFromUserQ, { variables: { idUser } }, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const notificationsCountFU = await data.notificationsCountFromUser
  return { notificationsCountFU }
} */
