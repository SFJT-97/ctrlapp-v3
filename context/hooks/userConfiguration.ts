import { gql, useQuery, QueryHookOptions } from '@apollo/client'
import { UserConfiguration } from '../../types'
import { UseMyConfigReturn } from './types'

const userConfigurationByIdEmployeeQ = gql`
  query UserConfigurationByIdEmployee($idEmployee: String!) {
    userConfigurationByIdEmployee(idEmployee: $idEmployee) {
      idUserConfiguration
    }
  }
`

const myConfigQ = gql`
  query MyConfig {
    myConfig {
      idUser
      idUserConfiguration
      idEmployee
      userProfileImage
      theme
      showNotificationsToLevel
      optionConfiguration1
      optionConfiguration2
      optionConfiguration3
      personalPhone
      personalEmail
      personalAddress
      aboutMe
    }
  }
`

export const useGetIdConfigByIdEmployee = (
  idEmployee: string
): string | 'ApolloError' | 'Loading...' | string => {
  const options: QueryHookOptions = {
    fetchPolicy: 'network-only',
    variables: { idEmployee }
  }

  const { loading, error, data } = useQuery<{
    userConfigurationByIdEmployee: { idUserConfiguration: string }
  }>(userConfigurationByIdEmployeeQ, options)

  if (data === undefined) return 'ApolloError'
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  return data?.userConfigurationByIdEmployee?.idUserConfiguration ?? ''
}

// CRITICAL FIX: useMyConfig now returns consistent structure
export const useMyConfig = (): UseMyConfigReturn => {
  const { loading, error, data } = useQuery<{ myConfig: UserConfiguration }>(
    myConfigQ,
    { fetchPolicy: 'network-only' }
  )

  if (loading) {
    return { loading: true, config: null, error: null }
  }

  if (error) {
    return { loading: false, config: null, error }
  }

  return {
    loading: false,
    config: data?.myConfig ?? null,
    error: null
  }
}

