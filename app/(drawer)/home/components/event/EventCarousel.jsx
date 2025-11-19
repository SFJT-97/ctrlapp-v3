/* eslint-disable import/named */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { gql, useMutation } from '@apollo/client'
import { Dimensions, View, StyleSheet, Modal, Pressable, ImageBackground, BackHandler, Platform } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import { useTheme, Text } from 'react-native-paper'
import { Video, ResizeMode } from 'expo-av'
import CustomActivityIndicator from '../../../../../globals/components/CustomActivityIndicator'
import ZoomableImage from './ZoomableImage'
import { DEFAULT_IMAGE2, SECURITY_PLACEHOLDER1, SECURITY_PLACEHOLDER2, SECURITY_PLACEHOLDER3, SECURITY_PLACEHOLDER4, SECURITY_PLACEHOLDER5 } from '../../../../../globals/variables/globalVariables'

const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
    getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
      signedUrl
    }
  }
`

const EventCarousel = ({ param, rotation }) => {
  const theme = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [status, setStatus] = useState({})
  const [countMMedia, setCountMMedia] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [gallery, setGallery] = useState([])
  const [isModalVisible, setModalVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const video = useRef(null)
  const carouselRef = useRef(null)
  const [getURL] = useMutation(getSignedUrlFromCacheQ)

  const placeholders = [
    SECURITY_PLACEHOLDER1,
    SECURITY_PLACEHOLDER2,
    SECURITY_PLACEHOLDER3,
    SECURITY_PLACEHOLDER4,
    SECURITY_PLACEHOLDER5
  ]

  const randomPlaceholder = useMemo(() => {
    return placeholders[Math.floor(Math.random() * placeholders.length)] || DEFAULT_IMAGE2
  }, [])

  const handleIndexChange = useCallback((index) => {
    let tempItem = index
    if (index >= gallery.length) {
      tempItem = 0
    } else if (index < 0) {
      tempItem = gallery.length - 1
    }
    setCurrentIndex(tempItem)
  }, [gallery.length])

  const renderPaginationDots = useCallback(() => {
    if (gallery.length <= 1) return null

    return (
      <View style={styles.paginationContainer}>
        {gallery.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === currentIndex
                  ? theme.colors.primary
                  : theme.colors.surfaceVariant
              }
            ]}
          />
        ))}
      </View>
    )
  }, [gallery, currentIndex, theme.colors.primary, theme.colors.surfaceVariant])

  useEffect(() => {
    const backAction = () => {
      if (isModalVisible) {
        setModalVisible(false)
        setSelectedImage(null)
        return true
      }
      return false
    }

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
      return () => backHandler.remove()
    }
  }, [isModalVisible])

  useEffect(() => {
    (async () => {
      const newGallery = []
      let count = 0

      if (param) {
        const imageUrls = []
        if (param.ticketImage1 && param.ticketImage1 !== '') imageUrls.push(param.ticketImage1.split('/').pop())
        if (param.ticketImage2 && param.ticketImage2 !== '') imageUrls.push(param.ticketImage2.split('/').pop())
        if (param.ticketImage3 && param.ticketImage3 !== '') imageUrls.push(param.ticketImage3.split('/').pop())

        for (let i = 0; i < imageUrls.length; i++) {
          const response = await getURL({ variables: { idSiMMediaURL: imageUrls[i] } })
          if (response?.data?.getSignedUrlFromCache?.signedUrl) {
            newGallery.push({ id: count++, source: response.data.getSignedUrlFromCache.signedUrl, type: 'image' })
          }
        }

        if (param.ticketVideo && param.ticketVideo !== '') {
          const videoUrl = param.ticketVideo.split('/').pop()
          const videoResponse = await getURL({ variables: { idSiMMediaURL: videoUrl } })
          console.log({ id: count++, source: videoResponse.data.getSignedUrlFromCache.signedUrl, type: 'video' })
          if (videoResponse?.data?.getSignedUrlFromCache?.signedUrl) {
            newGallery.push({ id: count++, source: videoResponse.data.getSignedUrlFromCache.signedUrl, type: 'video' }
            )
          }
        }

        if (newGallery.length === 0) {
          newGallery.push({ id: count++, source: randomPlaceholder, type: 'image' })
        }

        setGallery(newGallery)
        setCountMMedia(newGallery.length)
        setLoaded(true)
      }
    })()
  }, [param, randomPlaceholder, getURL])

  // console.log('video:', video)

  useEffect(() => {
    if (rotation === 2 || rotation === 4) {
      video.current?.presentFullscreenPlayer()
    } else if (rotation === 1 || rotation === 3) {
      video.current?.dismissFullscreenPlayer()
    }
  }, [rotation])

  const renderItem = useCallback(({ index }) => {
    setTimeout(() => {}, 1000)
    const item = gallery[index]
    if (!item) return null
    if (item.type === 'video') {
      return (
        <View style={{ flex: 1, left: 10 }}>
          <Video
            key={item.id}
            ref={video}
            style={styles.video}
            source={{ uri: item.source }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={rotation === 2 || rotation === 4}
            width={Dimensions.get('window').width}
            height={300}
            onPlaybackStatusUpdate={setStatus}
            onLoad={() => {
              video.current && console.log(status)
              if (rotation === 2 || rotation === 4) {
                video.current?.presentFullscreenPlayer()
              } else if (rotation === 1 || rotation === 3) {
                video.current?.dismissFullscreenPlayer()
              }
            }}
          />
        </View>
      )
    } else {
      return (
        <Pressable onPress={() => setModalVisible(true) || setSelectedImage(item.source)}>
          <ImageBackground
            key={item.id}
            style={{ width: Dimensions.get('window').width, height: (Dimensions.get('window').width / 1.5) }}
            source={{ uri: item.source }}
            fadeDuration={400}
            resizeMode='contain'
            resizeMethod='resize'
          />
        </Pressable>
      )
    }
  }, [gallery, rotation])

  const handleScrollEnd = useCallback((index) => {
    if (index >= gallery.length) {
      carouselRef.current?.scrollTo(gallery.length - 1)
    } else if (index < 0) {
      carouselRef.current?.scrollTo(0)
    }
  }, [gallery.length])

  const handleDefaultIndex = useCallback(() => {
    return gallery.findIndex(item => item && item.source !== '') || 0
  }, [gallery])

  const width = Dimensions.get('window').width

  return (
    loaded
      ? (
        <View style={{ flex: 1, position: 'relative' }}>
          <Carousel
            ref={carouselRef}
            defaultIndex={handleDefaultIndex()}
            loop={false}
            width={width}
            height={width / 1.5}
            data={gallery}
            scrollAnimationDuration={300}
            onSnapToItem={handleIndexChange}
            renderItem={renderItem}
            onScrollEnd={handleScrollEnd}
          />
          {renderPaginationDots()}
          <Modal visible={isModalVisible} transparent animationType='fade'>
            <View style={styles.modalContainer}>
              <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false) || setSelectedImage(null)}>
                {selectedImage && (
                  <ZoomableImage source={{ uri: selectedImage }} style={styles.fullscreenImage} />
                )}
              </Pressable>
              <Text
                style={{
                  color: 'yellow',
                  textAlign: 'center',
                  marginBottom: 5,
                  fontStyle: 'italic'
                }}
              >
                {param.ticketCustomDescription}
              </Text>
            </View>
          </Modal>
        </View>
        )
      : (
        <View style={{ height: width / 1.5, justifyContent: 'center', alignItems: 'center' }}>
          <CustomActivityIndicator />
        </View>
        )
  )
}

const styles = StyleSheet.create({
  video: {
    flex: 1
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch'
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.8
  }
})

export default EventCarousel
