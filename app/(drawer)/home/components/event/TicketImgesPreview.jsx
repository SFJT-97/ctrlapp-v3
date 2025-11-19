/* eslint-disable import/named */
import { useState, useEffect, useRef } from 'react'
import { ImageBackground, View, Dimensions, TouchableOpacity } from 'react-native'
import { gql, useMutation } from '@apollo/client'
import { Video, ResizeMode } from 'expo-av'

// global variables
import { EMARAY_MOVILE_JPG, DEFAULT_IMAGE2 } from '../../../../../globals/variables/globalVariables'

const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
  getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
    signedUrl
  }
}
`
const WIDTH = Dimensions.get('screen').width

export const TicketImagesPreview = ({ item, setLoadingImages }) => {
  const [getURL] = useMutation(getSignedUrlFromCacheQ)
  const [loaded, setLoaded] = useState(false)
  const [keys, setKeys] = useState([EMARAY_MOVILE_JPG])
  const [videoKey, setVideoKey] = useState(null)
  const videoRef = useRef(null) // referencia para controlar el video
  const [isPLaying, setIsPlaying] = useState(true)
  const tempArray = []
  if (item?.result?.ticketImage1) tempArray.push(item?.result?.ticketImage1)
  if (item?.result?.ticketImage2) tempArray.push(item?.result?.ticketImage2)
  if (item?.result?.ticketImage3) tempArray.push(item?.result?.ticketImage3)
  if (item?.result?.ticketVideo) tempArray.push(item?.result?.ticketVideo)

  useEffect(() => {
    const fetchKey = async () => {
      const temp = []
      let result
      if (item?.result?.ticketImage1) {
        result = await getURL({ variables: { idSiMMediaURL: item?.result?.ticketImage1.split('/').pop() } })
        if (result && result !== 'Loading...' && result !== 'ApolloError') {
          result = result?.data?.getSignedUrlFromCache?.signedUrl
          temp.push(result)
        }
      }
      if (item?.result?.ticketImage2) {
        result = await getURL({ variables: { idSiMMediaURL: item?.result?.ticketImage2.split('/').pop() } })
        if (result && result !== 'Loading...' && result !== 'ApolloError') {
          result = result?.data?.getSignedUrlFromCache?.signedUrl
          temp.push(result)
        }
      }
      if (item?.result?.ticketImage3) {
        result = await getURL({ variables: { idSiMMediaURL: item?.result?.ticketImage3.split('/').pop() } })
        if (result && result !== 'Loading...' && result !== 'ApolloError') {
          result = result?.data?.getSignedUrlFromCache?.signedUrl
          temp.push(result)
        }
      }
      if (item?.result?.ticketVideo) {
        result = await getURL({ variables: { idSiMMediaURL: item?.result?.ticketVideo.split('/').pop() } })
        if (result && result !== 'Loading...' && result !== 'ApolloError') {
          result = result?.data?.getSignedUrlFromCache?.signedUrl
          setVideoKey(result)
          temp.push(result)
        }
      }
      if (temp.length === 0) temp.push(DEFAULT_IMAGE2)
      setKeys(temp)
      setLoaded(true)
      setLoadingImages(false)
    }
    fetchKey()
  }, [])
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {loaded
        ? (
            keys.map(el => {
              if (el !== videoKey) {
                return (
                  <ImageBackground
                    key={el}
                    style={{ width: WIDTH / 2, height: WIDTH / 2 }}
                    source={{ uri: el }}
                    fadeDuration={400}
                    resizeMode='contain' // contain
                    resizeMethod='scale'
                  />
                )
              } else {
                return (
                  <TouchableOpacity
                    key={videoKey}
                    onPress={() => {
                      setIsPlaying(prev => !prev)
                    }}
                  >
                    <Video
                      key={videoKey}
                      ref={videoRef}
                      style={{ width: WIDTH / 4, height: WIDTH / 4 }}
                      source={{ uri: videoKey }}
                      useNativeControls={false}
                      resizeMode={ResizeMode.STRETCH}
                      shouldPlay={isPLaying}
                      volume={0}
                      onReadyForDisplay={() => {
                        // Esperamos que el video esté listo y luego pausamos después de 5 segundos
                        setTimeout(() => {
                          if (videoRef.current) {
                            videoRef.current.pauseAsync()
                          }
                        }, 5000)
                      }}
                    />
                  </TouchableOpacity>
                )
              }
            })
          )
        : (
            tempArray.map(el => {
              // Carga al eMaray mientras se cargan las imagenes
              return (
                <ImageBackground
                  key={el}
                  style={{ width: 100, height: 50 }}
                  source={{ uri: EMARAY_MOVILE_JPG }}
                  fadeDuration={400}
                  resizeMode='contain' // contain
                  resizeMethod='resize'
                />
              )
            })

          )}
    </View>
  )
}
