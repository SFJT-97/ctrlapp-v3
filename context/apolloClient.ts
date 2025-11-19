import { setContext } from '@apollo/client/link/context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  ApolloClient,
  InMemoryCache,
  ApolloClientOptions,
  NormalizedCacheObject,
  from
} from '@apollo/client'
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev'
import { createUploadLink } from 'apollo-upload-client'
// Note: apollo-cache-persist is incompatible with Apollo Client 3.x
// Using manual cache persistence instead
import { API_URL_GQL } from '../globals/variables/globalVariables'

// FIXED: Load Apollo Client error messages in development
// Apollo Client 3.8+ omits error messages from bundle to reduce size
// This loads them back for better debugging experience
if (__DEV__ || process.env.NODE_ENV !== 'production') {
  loadDevMessages()
  loadErrorMessages()
}

const httpLink = createUploadLink({
  uri: API_URL_GQL
})

let client: ApolloClient<NormalizedCacheObject> | null = null

const getValue = async (): Promise<string> => {
  try {
    const value = await AsyncStorage.getItem('token')
    if (value !== null) {
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
    credentials: 'include' as const,
    headers: {
      ...headers,
      Authorization: token
    }
  }
})

// FIXED: Improved cache configuration with type policies
// FIXED: Array fields need explicit merge functions, not just merge: true
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Object fields can use merge: true
        me: {
          merge: true
        },
        myConfig: {
          merge: true
        },
        // FIXED: Array fields need explicit merge functions
        // Replace arrays instead of trying to merge them
        myCompanySectors: {
          merge(existing, incoming) {
            return incoming // Replace with new data
          }
        },
        allUsersFromMyCompany: {
          merge(existing, incoming) {
            return incoming // Replace with new data
          }
        },
        allcompanySectors: {
          merge(existing, incoming) {
            return incoming // Replace with new data
          }
        },
        chatBy2Users: {
          merge(existing, incoming) {
            return incoming // Replace with new data
          }
        },
        chatByConversation: {
          merge(existing, incoming) {
            return incoming // Replace with new data
          }
        },
        notificationByIdUser: {
          merge(existing, incoming) {
            return incoming // Replace with new data
          }
        },
        notificationsToLevel: {
          merge(existing, incoming) {
            return incoming // Replace with new data
          }
        },
        lastMsgWithMe: {
          merge(existing, incoming) {
            return incoming // Replace with new data
          }
        }
      }
    },
    User: {
      keyFields: ['idUser']
    },
    Chat: {
      keyFields: ['idChat']
    },
    UserConfiguration: {
      keyFields: ['idUserConfiguration']
    },
    CompanySector: {
      keyFields: ['idCompanySector']
    },
    Notification: {
      keyFields: ['idNotification']
    }
  }
})

// Create client synchronously for immediate use
client = new ApolloClient<NormalizedCacheObject>({
  link: from([authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    }
  }
})

// FIXED: Manual cache persistence for Apollo Client 3.x compatibility
// apollo-cache-persist is incompatible with Apollo Client 3.x
const CACHE_KEY = 'apollo-cache'
const MAX_CACHE_SIZE = 1048576 // 1MB

const initializeCachePersistence = async (): Promise<void> => {
  try {
    // Restore cache from AsyncStorage
    const cachedData = await AsyncStorage.getItem(CACHE_KEY)
    if (cachedData) {
      try {
        const parsedCache = JSON.parse(cachedData)
        cache.restore(parsedCache)
        console.log('Apollo cache restored from storage')
      } catch (parseError) {
        console.warn('Failed to parse cached data, starting fresh:', parseError)
        await AsyncStorage.removeItem(CACHE_KEY)
      }
    }

    // Set up cache write listener
    const writeCacheToStorage = async (): Promise<void> => {
      try {
        const cacheData = cache.extract()
        const cacheString = JSON.stringify(cacheData)
        
        // Check size before storing
        if (cacheString.length > MAX_CACHE_SIZE) {
          console.warn('Cache size exceeds limit, not persisting')
          return
        }
        
        await AsyncStorage.setItem(CACHE_KEY, cacheString)
      } catch (error) {
        console.error('Error writing cache to storage:', error)
      }
    }

    // Write cache periodically (every 30 seconds) and on app background
    const cacheWriteInterval = setInterval(writeCacheToStorage, 30000)
    
    // Also write on app state change to background
    if (typeof global !== 'undefined' && global.addEventListener) {
      // This will be handled by AppState in components if needed
    }

    // Store interval reference for cleanup if needed
    if (typeof global !== 'undefined') {
      (global as { apolloCacheInterval?: NodeJS.Timeout }).apolloCacheInterval = cacheWriteInterval
    }
  } catch (error) {
    console.error('Error initializing cache persistence:', error)
  }
}

// Start cache persistence in background
initializeCachePersistence()

const createApolloClient = (): ApolloClient<NormalizedCacheObject> => {
  // Return existing client or create new one
  if (!client) {
    client = new ApolloClient<NormalizedCacheObject>({
      link: from([authLink, httpLink]),
      cache,
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
          errorPolicy: 'all'
        },
        query: {
          fetchPolicy: 'cache-first',
          errorPolicy: 'all'
        }
      }
    })
  }
  return client
}

export { client }
export default createApolloClient

