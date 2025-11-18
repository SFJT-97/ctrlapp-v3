import React from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const ZoomableImage = ({ source }) => {
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(0)

  const clamp = (value, min, max) => {
    'worklet'
    return Math.min(Math.max(value, min), max)
  }

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const scaledWidth = SCREEN_WIDTH * scale.value
      const scaledHeight = SCREEN_HEIGHT * scale.value
      const maxX = (scaledWidth - SCREEN_WIDTH) / 2
      const maxY = (scaledHeight - SCREEN_HEIGHT) / 2
      translateX.value = clamp(savedTranslateX.value + e.translationX, -maxX, maxX)
      translateY.value = clamp(savedTranslateY.value + e.translationY, -maxY, maxY)
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, 1, 4)
    })
    .onEnd(() => {
      savedScale.value = scale.value
      const scaledWidth = SCREEN_WIDTH * scale.value
      const scaledHeight = SCREEN_HEIGHT * scale.value
      const maxX = (scaledWidth - SCREEN_WIDTH) / 2
      const maxY = (scaledHeight - SCREEN_HEIGHT) / 2
      translateX.value = clamp(translateX.value, -maxX, maxX)
      translateY.value = clamp(translateY.value, -maxY, maxY)
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ]
  }))

  // Ensure source is valid to prevent rendering issues
  if (!source?.uri) {
    return null
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={styles.container}>
          <Animated.Image
            source={source}
            style={[styles.image, animatedStyle]}
            resizeMode='contain'
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  container: {
    flex: 1
  },
  image: {
    width: '100%',
    height: '100%'
  }
})

export default ZoomableImage

/*

  // // version 2
  // import React from 'react'
  // import { StyleSheet } from 'react-native'
  // import Animated, {
  //   useSharedValue,
  //   useAnimatedStyle,
  //   withDecay,
  //   withTiming
  // } from 'react-native-reanimated'
  // import {
  //   Gesture,
  //   GestureDetector,
  //   GestureHandlerRootView
  // } from 'react-native-gesture-handler'

  // const ZoomableImage = ({ source }) => {
  //   const scale = useSharedValue(1)
  //   const savedScale = useSharedValue(1)

  //   const translateX = useSharedValue(0)
  //   const translateY = useSharedValue(0)
  //   const savedTranslateX = useSharedValue(0)
  //   const savedTranslateY = useSharedValue(0)

  //   const pinchGesture = Gesture.Pinch()
  //     .onUpdate((e) => {
  //       scale.value = savedScale.value * e.scale
  //     })
  //     .onEnd(() => {
  //       savedScale.value = scale.value
  //     })

  //   const panGesture = Gesture.Pan()
  //     .onUpdate((e) => {
  //       translateX.value = savedTranslateX.value + e.translationX
  //       translateY.value = savedTranslateY.value + e.translationY
  //     })
  //     .onEnd((e) => {
  //       translateX.value = withDecay({ velocity: e.velocityX })
  //       translateY.value = withDecay({ velocity: e.velocityY })
  //       savedTranslateX.value = translateX.value
  //       savedTranslateY.value = translateY.value
  //     })

  //   const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture)

  //   const animatedStyle = useAnimatedStyle(() => ({
  //     transform: [
  //       { translateX: translateX.value },
  //       { translateY: translateY.value },
  //       { scale: scale.value }
  //     ]
  //   }))

  //   return (
  //     <GestureHandlerRootView style={styles.root}>
  //       <GestureDetector gesture={composedGesture}>
  //         <Animated.View style={styles.container}>
  //           <Animated.Image
  //             source={source}
  //             style={[styles.image, animatedStyle]}
  //             resizeMode='contain'
  //           />
  //         </Animated.View>
  //       </GestureDetector>
  //     </GestureHandlerRootView>
  //   )
  // }

  // const styles = StyleSheet.create({
  //   root: {
  //     flex: 1
  //   },
  //   container: {
  //     flex: 1
  //   },
  //   image: {
  //     width: '100%',
  //     height: '100%'
  //   }
  // })

  // export default ZoomableImage

  // // version 1
  // import React from 'react'
  // import { StyleSheet } from 'react-native'
  // import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler'
  // import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

  // const ZoomableImage = ({ source }) => {
  //   const scale = useSharedValue(1)

  //   // Estilo animado que aplica la escala a la imagen
  //   const animatedStyle = useAnimatedStyle(() => ({
  //     transform: [{ scale: scale.value }]
  //   }))

  //   // Función de manejo de gestos para el "pinch"
  //   const handlePinchGesture = (event) => {
  //     scale.value = event.nativeEvent.scale
  //   }

  //   const handlePinchEnd = () => {
  //     // Restablece el zoom al soltar los dedos
  //     scale.value = withTiming(1, { duration: 300 })
  //   }

  //   return (
  //     <>
  //       <GestureHandlerRootView style={styles.container}>
  //         <PinchGestureHandler
  //           onGestureEvent={handlePinchGesture}
  //           onEnded={handlePinchEnd}
  //         >
  //           <Animated.View style={styles.imageContainer}>
  //             <Animated.Image source={source} style={[styles.image, animatedStyle]} resizeMode='contain' />
  //           </Animated.View>
  //         </PinchGestureHandler>
  //       </GestureHandlerRootView>
  //     </>
  //   )
  // }

  // const styles = StyleSheet.create({
  //   container: {
  //     flex: 1,
  //     justifyContent: 'center',
  //     alignItems: 'center'
  //   },
  //   imageContainer: {
  //     width: '100%',
  //     height: '100%'
  //   },
  //   image: {
  //     width: '100%',
  //     height: '100%'
  //   }
  // })

  // export default ZoomableImage
*/
