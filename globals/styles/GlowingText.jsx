// import React from 'react'
// import { Text, StyleSheet } from 'react-native'
// import { useAnimatedStyle, withTiming, Easing, Animated } from 'react-native-reanimated'

// const GlowingText = ({ text }) => {
//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       textShadowColor: 'rgba(255, 255, 255, 0.8)',
//       textShadowOffset: {
//         width: withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
//         height: withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
//       },
//       textShadowRadius: withTiming(20, { duration: 1000, easing: Easing.inOut(Easing.ease) })
//     }
//   })
//   console.log('Animated\n', Animated)
//   return (
//     <Text style={[styles.text, animatedStyle]}>
//       {text}
//     </Text>
//     // <Animated.Text style={[styles.text, animatedStyle]}>
//     //   {text}
//     // </Animated.Text>
//   )
// }

// const styles = StyleSheet.create({
//   text: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white'
//   }
// })

// export default GlowingText
