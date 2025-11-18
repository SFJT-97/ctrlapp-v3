import { gql, useMutation } from '@apollo/client'
import { Platform } from 'react-native'

const gqlLoginM = gql`
  mutation Login($userName: String!, $password: String!, $userPlatform: String!) {
    login(userName: $userName, password: $password, userPlatform: $userPlatform) {
      value
    }
  }
`

export const useLogin = () => {
  const [login, { data, loading, error }] = useMutation(gqlLoginM)

  const loginUser = async (userData) => {
    try {
      const result = await login({
        variables: {
          userName: userData.userName,
          password: userData.password,
          userPlatform: Platform.OS // e.g., 'ios' or 'android'
        }
      })
      // Extract the login value from the mutation result
      const loginValue = result?.data?.login?.value
      return { result: loginValue, error: null }
    } catch (err) {
      console.error('Login error:', err.message)
      return { result: null, error: err.message }
    }
  }

  return { loginUser, loading, error, data }
}
