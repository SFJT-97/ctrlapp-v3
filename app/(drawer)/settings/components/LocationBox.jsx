// ==> 2024-10-02
// Builtin modules
import { useState, useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Surface, Text, useTheme } from 'react-native-paper'

// Custom modules
import { GetOnlineLocation } from '../../../../globals/components/getLocation'
import { convertDegreesToDMS, roundToDecimals } from '../../../../globals/functions/functions'

const LocationBox = () => {
  const theme = useTheme()
  const [xPosition, setXPosition] = useState(null)
  const [yPosition, setYPosition] = useState(null)

  const screenWidth = Dimensions.get('screen').width
  const actualPosition = GetOnlineLocation()

  useEffect(() => {
    if (actualPosition) {
      // console.log(actualPosition)
      setXPosition(roundToDecimals(actualPosition.longitude, 7))
      setYPosition(roundToDecimals(actualPosition.latitude, 7))
    }
  }, [actualPosition])

  const styles = StyleSheet.create({
    surface: {
      height: 150,
      width: screenWidth * 0.5,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      rowGap: 10,
      backgroundColor: theme.colors.surface,
      borderRadius: 10
    },
    items: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      rowGap: 4,
      marginHorizontal: 10
    }
  })

  return (
    <View style={{ display: 'flex', alignSelf: 'center' }}>
      <Surface style={styles.surface} elevation={2}>
        <View style={styles.items}>
          <Text variant='labelLarge' style={{ fontWeight: 'bold' }}>
            Current longitude:
          </Text>
          <Text style={{ fontStyle: 'italic', color: theme.colors.primary, fontSize: 18 }}>
            {xPosition !== null ? `${convertDegreesToDMS(xPosition).degrees}º ${convertDegreesToDMS(xPosition).minutes}' ${convertDegreesToDMS(xPosition).seconds}" ` : '...getting location'}
          </Text>
          <Text variant='labelLarge' style={{ fontWeight: 'bold', marginTop: 5 }}>
            Current latitude:
          </Text>
          <Text style={{ fontStyle: 'italic', color: theme.colors.primary, fontSize: 18 }}>
            {yPosition !== null ? `${convertDegreesToDMS(yPosition).degrees}º ${convertDegreesToDMS(yPosition).minutes}' ${convertDegreesToDMS(yPosition).seconds}" ` : '...getting location'}
          </Text>
        </View>
      </Surface>
    </View>
  )
}

export const MyPosition = () => {
  const [xPosition, setXPosition] = useState(null)
  const [yPosition, setYPosition] = useState(null)
  const actualPosition = GetOnlineLocation()

  useEffect(() => {
    if (actualPosition) {
      setXPosition(roundToDecimals(actualPosition.X, 7))
      setYPosition(roundToDecimals(actualPosition.Y, 7))
    }
  }, [actualPosition])

  return ({
    x: xPosition,
    y: yPosition
  })
}

export default LocationBox
