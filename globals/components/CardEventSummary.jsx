import { useEffect, useState } from 'react'
import { View, ImageBackground } from 'react-native'
import { gql, useMutation } from '@apollo/client'
// import CustomActivityIndicator from './CustomActivityIndicator'

// global variables
import { EMARAY_MOVILE_GIF, DEFAULT_IMAGE2 } from '../variables/globalVariables'

const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
  getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
    signedUrl
  }
}
`

const CardEventSummary = ({ item, setLoadingImages }) => {
  const [getURL] = useMutation(getSignedUrlFromCacheQ)
  const [loaded, setLoaded] = useState(false)
  const [keys, setKeys] = useState([EMARAY_MOVILE_GIF])
  useEffect(() => {
    const fetchKey = async () => {
      const temp = []
      let result
      if (item?.ticketImage1) {
        result = await getURL({ variables: { idSiMMediaURL: item?.ticketImage1.split('/').pop() } })
        if (result && result !== 'Loading...' && result !== 'ApolloError') {
          result = result?.data?.getSignedUrlFromCache?.signedUrl
          temp.push(result)
        }
      }
      if (item?.ticketImage2) {
        result = await getURL({ variables: { idSiMMediaURL: item?.ticketImage2.split('/').pop() } })
        if (result && result !== 'Loading...' && result !== 'ApolloError') {
          result = result?.data?.getSignedUrlFromCache?.signedUrl
          temp.push(result)
        }
      }
      if (item?.ticketImage3) {
        result = await getURL({ variables: { idSiMMediaURL: item?.ticketImage3.split('/').pop() } })
        if (result && result !== 'Loading...' && result !== 'ApolloError') {
          result = result?.data?.getSignedUrlFromCache?.signedUrl
          temp.push(result)
        }
      }
      setKeys(temp)
      setLoaded(true)
      setLoadingImages && setLoadingImages(false)
    }
    fetchKey()
  }, [])

  return (
    <View>
      {
        keys.length === 0
          ? (
            <View className='IMAGENES-0' style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <View>
                <ImageBackground imageStyle={{ borderRadius: 10 }} style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', width: 200, height: 305, borderRadius: 10 }} source={{ uri: DEFAULT_IMAGE2 }} />
              </View>
            </View>
            )
          : keys.length === 1
            ? (
              <View className='IMAGENES-1' style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <View>
                  <ImageBackground imageStyle={{ borderRadius: 10 }} style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', width: 200, height: 305 }} source={{ uri: loaded ? keys[0] : EMARAY_MOVILE_GIF }} />
                </View>
              </View>
              )
            : keys.length === 2
              ? (
                <View className='IMAGENES-2' style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, margin: 5 }}>
                  <View>
                    <ImageBackground imageStyle={{ borderRadius: 10 }} style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', width: 150, height: 305, borderRadius: 10 }} source={{ uri: loaded ? keys[0] : EMARAY_MOVILE_GIF }} />
                  </View>
                  <View>
                    <ImageBackground imageStyle={{ borderRadius: 10 }} style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', width: 150, height: 305, borderRadius: 10 }} source={{ uri: loaded ? keys[1] : EMARAY_MOVILE_GIF }} />
                  </View>
                </View>
                )
              : (
                <View className='IMAGENES-3' style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <View>
                    <ImageBackground imageStyle={{ borderRadius: 10 }} style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', width: 200, height: 305, borderRadius: 10 }} source={{ uri: loaded ? keys[0] : EMARAY_MOVILE_GIF }} />
                  </View>
                  <View style={{ flexDirection: 'col', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <ImageBackground imageStyle={{ borderRadius: 10 }} style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', width: 100, height: 150, borderRadius: 10 }} source={{ uri: loaded ? keys[1] : EMARAY_MOVILE_GIF }} />
                    <ImageBackground imageStyle={{ borderRadius: 10 }} style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', width: 100, height: 150, borderRadius: 10 }} source={{ uri: loaded ? keys[2] : EMARAY_MOVILE_GIF }} />
                  </View>
                </View>
                )
      }
    </View>
  )
}

export default CardEventSummary
