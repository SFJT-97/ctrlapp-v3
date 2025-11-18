import { gql, useQuery } from '@apollo/client'

/*
  Query: userConfigurations, from company or from idEmployee
*/

// Query definition from BE. All constants definitions used for useQuery hooks, will have a Q letter at the end

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

export const useGetIdConfigByIdEmployee = (idEmployee) => {
  const param = { variables: { idEmployee } }
  const { loading, error, data } = useQuery(userConfigurationByIdEmployeeQ, param, { fetchPolicy: 'network-only' })
  // console.log('data\n', data)
  if (data === undefined) return 'ApolloError'
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  return data.idUserConfiguration
}

export const useMyConfig = () => {
  const { loading, error, data } = useQuery(myConfigQ, { fetchPolicy: 'network-only' })
  // console.log('data', data)
  if (data === undefined) return 'ApolloError'
  if (loading) return 'Loading...'
  if (error) return `Error! ${error}`
  // console.log(data)
  const myConfigData = data.myConfig
  return myConfigData
}
