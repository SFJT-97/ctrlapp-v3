// ==> 2024-10-02
//
/*
  import { NetworkInfo } from 'react-native-network-info'
  import { setContext } from '@apollo/client/link/context'
  import AsyncStorage from '@react-native-community/async-storage'
  import { ApolloClient, InMemoryCache } from '@apollo/client'
  import { createUploadLink } from 'apollo-upload-client'

  const httpLink = createUploadLink({
    uri: 'http://192.168.1.37:4000/graphql'
    // uri: 'http://127.0.0.1:4000/graphql'
  })

  let tokenValue
  const getValue = async () => {
    await AsyncStorage.getItem('token').then(async value => {
      await AsyncStorage.flushGetRequests(tokenValue = `BEARER ${value}`)
      // console.log('tokenValue on ApolloClient side (then)= \n', tokenValue)
    }
    ).catch(
      value => {
        tokenValue = `BEARER ${value}`
        // console.log('tokenValue on ApolloClient side (catch)= \n', tokenValue)
      }
    )
    if (tokenValue === 'BEARER ' + null) {
      AsyncStorage.flushGetRequests(tokenValue = await AsyncStorage.getItem('token'))
      // console.log('tokenValue on ApolloClient side (tokenValue===null)= \n', tokenValue)
    }
    await AsyncStorage.flushGetRequests(tokenValue)
    return await tokenValue
  }

  const authLink = setContext(async (_, { headers }) => {
    return {
      credentials: 'include',
      headers: {
        ...headers,
        Authorization: await getValue()
      }
    }
  })

  let client
  const createApolloClient = () => {
    if (client) client.stop()
    client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache()
    })
    return client
  }
  export { client }
  export default createApolloClient
*/

import { setContext } from '@apollo/client/link/context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'
import { API_URL_GQL } from '../globals/variables/globalVariables'

// const API_URL_GQL = 'http://192.168.0.176:4000/graphql' // si hay que cambiar este valor => cambiar en "globalVariables"

const httpLink = createUploadLink({
  uri: API_URL_GQL
})

let client

const getValue = async () => {
  try {
    const value = await AsyncStorage.getItem('token')
    if (value !== null) {
      // console.log(value)
      return `BEARER ${value}`
    }
  } catch (error) {
    console.error('Error al obtener el token:', error)
  }
  return ''
}

const authLink = setContext(async (_, { headers }) => {
  const token = await getValue()
  return {
    credentials: 'include',
    headers: {
      ...headers,
      Authorization: token
    }
  }
})

const createApolloClient = () => {
  // Limpiar el cliente Apollo existente si existe
  if (client) {
    client.stop()
  }

  client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  })

  return client
}

export { client }
export default createApolloClient
