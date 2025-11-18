import { gql, useQuery } from '@apollo/client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState, useEffect } from 'react'

const allMyCompanyTicketsNewQ = gql`
query Query {
  allMyCompanyTicketsNew
}

`

export const useAllMyCommpanyTicketsNewCount = () => {
  const { loading, error, data } = useQuery(allMyCompanyTicketsNewQ, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const allMyCompanyTicketsNew = data
  if (allMyCompanyTicketsNew) {
    return allMyCompanyTicketsNew
  } else {
    return {}
  }
}

// export function useAsyncStorage (key, defaultValue = null) {
//   const [value, setValue] = useState(defaultValue)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const loadValue = async () => {
//       try {
//         const storedValue = await AsyncStorage.getItem(key)
//         if (storedValue !== null) {
//           setValue(JSON.parse(storedValue))
//         } else {
//           setValue(defaultValue)
//         }
//       } catch (error) {
//         console.error(`Error loading key "${key}" from AsyncStorage`, error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     loadValue()
//   }, [key])

//   return { value, loading }
// }

export function useAsyncStorage (key, defaultValue = {}) {
  const [value, setValue] = useState(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadValue = async () => {
      setLoading(true)
      setError(null)

      try {
        const storedValue = await AsyncStorage.getItem(key)

        if (storedValue !== null) {
          try {
            const parsed = JSON.parse(storedValue)

            // Validación adicional opcional (por ejemplo, que sea un objeto o array, según esperes)
            if (typeof parsed === 'object' && parsed !== null) {
              if (isMounted) setValue(parsed)
            } else {
              console.warn(`Invalid type for key "${key}", using default.`)
              if (isMounted) setValue(defaultValue)
            }
          } catch (parseError) {
            console.error(`Error parsing stored value for key "${key}"`, parseError)
            if (isMounted) {
              setError(`Parse error for key "${key}"`)
              setValue(defaultValue)
            }
          }
        } else {
          if (isMounted) setValue(defaultValue)
        }
      } catch (storageError) {
        console.error(`Error loading key "${key}" from AsyncStorage`, storageError)
        if (isMounted) {
          setError(`Storage error for key "${key}"`)
          setValue(defaultValue)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadValue()

    return () => {
      isMounted = false
    }
  }, [key])

  return { value, loading, error }
}
