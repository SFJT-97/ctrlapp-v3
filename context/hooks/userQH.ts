import { gql, useQuery, QueryHookOptions } from '@apollo/client'
import { User } from '../../types'
import { UseMeReturn, UseAllUsersFromMyCompanyReturn } from './types'

// Query definitions
const allUsersQ = gql`
  query Query {
    allUsers
  }
`

const totalUsersFromCompanyQ = gql`
  query Query($companyName: String!, $isCompanyAppAdmin: Boolean) {
    totalUsersFromCompany(companyName: $companyName, isCompanyAppAdmin: $isCompanyAppAdmin)
  }
`

const allUsersFromCompanyQ = gql`
  query AllUsersFromCompany($companyName: String!, $isCompanyAppAdmin: Boolean) {
    allUsersFromCompany(companyName: $companyName, isCompanyAppAdmin: $isCompanyAppAdmin) {
      idUser
      idEmployee
      password
      firstName
      secondName
      lastName
      secondLastName
      nickName
      email
      phone
      idCompany
      fullName
      companyName
      idCompanyBusinessUnit
      companyBusinessUnitDescription
      idCompanySector
      companySectorDescription
      idStandardJobRole
      standardJobRoleDescription
      idcompanyJobRole
      companyJobRoleDescription
      userProfileImage
      isCompanyAppAdmin
      hiredDate
      active
      isSuperUser
    }
  }
`

const meQ = gql`
  query Me {
    me {
      idUser
      idEmployee
      password
      firstName
      secondName
      lastName
      secondLastName
      nickName
      email
      phone
      idCompany
      fullName
      companyName
      idCompanyBusinessUnit
      companyBusinessUnitDescription
      idCompanySector
      companySectorDescription
      idStandardJobRole
      standardJobRoleDescription
      idcompanyJobRole
      companyJobRoleDescription
      userProfileImage
      isCompanyAppAdmin
      hiredDate
      active
      isSuperUser
      gender
      birthday
      age
    }
  }
`

const allUserFromMyCompanyQH = gql`
  query AllUsersFromMyCompany {
    allUsersFromMyCompany {
      idUser
      idEmployee
      firstName
      lastName
      nickName
      email
      phone
      idCompany
      fullName
      companyName
      companyBusinessUnitDescription
      companySectorDescription
      companyJobRoleDescription
      userProfileImage
      active
      age
      gender
    }
  }
`

// Hook implementations
export const useAllUsers = (): number | 'loading...' | string => {
  const { loading, error, data } = useQuery<{ allUsers: number }>(allUsersQ, {
    fetchPolicy: 'network-only'
  })
  if (loading) {
    return 'loading...'
  }
  if (error) {
    return `Error... ${error}`
  }
  return data?.allUsers ?? 0
}

export const useTotalUsersFromCompany = (
  companyName: string,
  isCompanyAppAdmin?: boolean
): number | 'loading...' | string => {
  const options: QueryHookOptions = {
    fetchPolicy: 'network-only',
    variables: { companyName }
  }

  if (isCompanyAppAdmin !== undefined) {
    options.variables = { ...options.variables, isCompanyAppAdmin }
  }

  const { loading, error, data } = useQuery<{ totalUsersFromCompany: number }>(
    totalUsersFromCompanyQ,
    options
  )

  if (loading) {
    return 'loading...'
  }
  if (error) {
    return `Error... ${error}`
  }
  return data?.totalUsersFromCompany ?? 0
}

export const useAllUsersFromCompany = (
  companyName: string,
  isCompanyAppAdmin: boolean | null = null
): User[] | 'loading...' | string | Record<string, never> => {
  const options: QueryHookOptions = {
    fetchPolicy: 'network-only',
    variables: { companyName }
  }

  if (isCompanyAppAdmin !== null) {
    options.variables = { ...options.variables, isCompanyAppAdmin }
  }

  const { loading, error, data } = useQuery<{ allUsersFromCompany: User[] }>(
    allUsersFromCompanyQ,
    options
  )

  if (loading) {
    return 'loading...'
  }
  if (error) {
    console.error(error.message)
    return `Error... ${error}`
  }

  return data?.allUsersFromCompany ?? {}
}

// CRITICAL FIX: useMe now returns proper structure
export const useMe = (): UseMeReturn => {
  const { loading, error, data } = useQuery<{ me: User }>(meQ, {
    fetchPolicy: 'cache-and-network'
  })

  if (loading) {
    return { loading: true, me: null, error: null }
  }

  if (error) {
    return { loading: false, me: null, error }
  }

  return {
    loading: false,
    me: data?.me ?? null,
    error: null
  }
}

// CRITICAL FIX: useAllUsersFromMyCompany now returns proper structure
export const useAllUsersFromMyCompany = (): UseAllUsersFromMyCompanyReturn => {
  const { loading, error, data } = useQuery<{ allUsersFromMyCompany: User[] }>(
    allUserFromMyCompanyQH,
    { fetchPolicy: 'network-only' }
  )

  if (loading) {
    return { loading: true, users: null, error: null }
  }

  if (error) {
    return { loading: false, users: null, error }
  }

  return {
    loading: false,
    users: data?.allUsersFromMyCompany ?? null,
    error: null
  }
}

