import { gql, useQuery } from '@apollo/client'

interface Notification {
  idNotification: string
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
  idCompanyBusinessUnit?: string
  companyBusinessUnitDescription?: string
  idCompanySector?: string
  companySectorDescription?: string
  idcompanyJobRole?: string
  companyJobRoleDescription?: string
  showNotificationsToLevel?: number
  notificationLevel?: number
  notificationTitle?: string
  notificationDescription?: string
  isActive?: boolean
}

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

// FIXED: Correct useQuery syntax
export const useNotificationByIdUser = ({
  idUser
}: {
  idUser: string
}): { notificationByIdUserData: Notification[] } | 'Loading...' | string => {
  const { loading, error, data } = useQuery<{
    notificationByIdUser: Notification[]
  }>(notificationByIdUserQ, {
    variables: { idUser },
    fetchPolicy: 'network-only'
  })

  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  // FIXED: Remove unnecessary map
  return {
    notificationByIdUserData: data?.notificationByIdUser ?? []
  }
}

export const useNotificationsToLevel = ({
  idUser,
  showNotificationsToLevel
}: {
  idUser: string
  showNotificationsToLevel: number
}): { notificationsToLevelData: Notification[] } | 'Loading...' | string => {
  const { loading, error, data } = useQuery<{
    notificationsToLevel: Notification[]
  }>(notificationsToLevelQ, {
    variables: { idUser, showNotificationsToLevel },
    fetchPolicy: 'network-only'
  })

  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  // FIXED: Remove unnecessary map
  return {
    notificationsToLevelData: data?.notificationsToLevel ?? []
  }
}

