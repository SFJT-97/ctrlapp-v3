import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import Svg, { Circle } from 'react-native-svg'

const TimerCircle = ({ duration, handleRecordAudio, stopListening = undefined }) => {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const [timeLeft, setTimeLeft] = useState(duration)

  const theme = useTheme()

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1
        } else {
          clearInterval(interval)
          return 0
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [duration])

  // Calcula el progreso del círculo con base en el tiempo restante
  const progress = timeLeft / duration
  const strokeDashoffset = circumference * (1 - progress)

  useEffect(() => {
    if (timeLeft === 0) {
      if (handleRecordAudio) {
        handleRecordAudio()
      } else {
        stopListening()
        // setTimeLeft(duration)
      }
    }
  }, [timeLeft])

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    timerText: {
      position: 'absolute',
      fontSize: 24,
      color: theme.colors.primary,
      fontWeight: 'bold'
    }
  })

  return (
    <View style={styles.container}>
      <Svg height='120' width='120'>
        <Circle
          stroke='#d3d3d3'
          fill='none'
          cx='60'
          cy='60'
          r={radius}
          strokeWidth='10'
        />
        <Circle
          stroke={theme.colors.tertiaryContainer}
          fill='none'
          cx='60'
          cy='60'
          r={radius}
          strokeWidth='10'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          rotation='-90'
          origin='60, 60'
        />
      </Svg>
      <Text style={styles.timerText}>{timeLeft} s</Text>
    </View>
  )
}

export default TimerCircle
