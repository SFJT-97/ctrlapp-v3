import React, { useEffect, useRef } from 'react'
import { View, Animated, Image, ImageBackground, StyleSheet } from 'react-native'

const SmartImage = ({ loading, image, defaultImage, style }) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 700,
            useNativeDriver: true
          })
        ])
      ).start()
    }
  }, [loading])

  if (loading) {
    return (
      <Animated.View style={[style, { opacity: fadeAnim }]}>
        <ImageBackground
          source={{ uri: defaultImage }}
          style={styles.image}
          imageStyle={{ borderRadius: 10 }}
        />
      </Animated.View>
    )
  }

  return (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: image }}
        style={styles.image}
        resizeMode='cover'
      />
    </View>
  )
}

const styles = StyleSheet.create({
  // imageContainer: {
  //   width: 200,
  //   height: 305,
  //   borderRadius: 10,
  //   overflow: 'hidden'
  // },
  image: {
    width: '100%',
    height: '100%'
  }
})

export default SmartImage
