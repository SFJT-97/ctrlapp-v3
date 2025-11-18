// ==> 2024-10-02
import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Line } from 'react-native-svg'
import { useTheme } from 'react-native-paper'

/*
  Esta función asume que ya las coordenadas se están pasando de forma apropiada de acuerdo al contenedor...
  Ojo que si las coordenadas se pasan tal como se leen, acá habrá que hacer las conversiones...
*/
export default function LineSVG ({ point1, point2, screenDimensions, lineWidth = 2 }) {
  const theme = useTheme()

  const { x1, y1 } = point1
  const { x2, y2 } = point2
  const { height, width } = screenDimensions
  const colorLine = theme.colors.tertiary

  return (
    <View style={styles.container}>
      <Svg height={height} width={width}>
        <Line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={colorLine}
          strokeWidth={lineWidth}
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
