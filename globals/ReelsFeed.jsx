/* eslint-disable import/named */
import { useRef, useState, useEffect } from 'react'
import { FlatList, Dimensions, StyleSheet, Image } from 'react-native'
import { Video } from 'expo-av'

// global variables
import { DEFAULT_IMAGE } from './variables/globalVariables'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const ReelItem = ({ uri, type, isActive }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      if (isActive) {
        videoRef.current.playAsync()
      } else {
        videoRef.current.pauseAsync()
      }
    }
  }, [isActive])

  if (type === 'image') {
    return (
      <Image
        source={{ uri }}
        style={styles.video}
        resizeMode='cover'
      />
    )
  }

  return (
    <Video
      ref={videoRef}
      source={{ uri }}
      style={styles.video}
      resizeMode='cover'
      // isLooping
      isMuted={false}
      shouldPlay={false} // importante: desactivamos reproducción automática aquí
    />
  )
}

export default function ReelsFeed ({ items }) {
  const [activeIndex, setActiveIndex] = useState(0)
  // console.log('items\n', items)
  // const tempData = useGetSignedUrlFromCache(items)
  const reelsData = [
    {
      key: 1,
      type: 'image',
      id: 1,
      uri: DEFAULT_IMAGE
    }
  ]
  // const [loaded, setLoaded] = useState(false)
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index)
    }
  }).current

  // useEffect(() => {
  //   if (tempData && tempData !== 'ApolloError' && tempData !== 'Loading...') {
  //     setReelsData(tempData)
  //     setLoaded(true)
  //   }
  // }, [tempData])

  return (
    <>
      <FlatList
        data={reelsData}
        renderItem={({ item, index }) => (
          <ReelItem
            uri={item.uri}
            type={item.type}
            isActive={index === activeIndex}
          />
        )}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        snapToAlignment='start'
        decelerationRate='fast'
      />
    </>
  )
}

const styles = StyleSheet.create({
  video: {
    height: SCREEN_HEIGHT,
    width: '100%'
  }
})
