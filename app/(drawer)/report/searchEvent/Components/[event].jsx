// ==> 2024-10-02
// Builtin modules
import { useState, useEffect } from 'react'
import { ScrollView, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import { useTranslation } from 'react-i18next'

// Custom modules
import EventCarousel from '../../../home/components/event/EventCarousel'
import Chips from '../../../home/components/event/chips'
import Content from '../../../home/components/event/content'
import Reaction from '../../../home/components/event/reactions'
import { Chip, useTheme } from 'react-native-paper'
import ShowComments from '../../../home/components/event/ShowComments'

const EventPage = () => {
  const { t } = useTranslation('report')
  const [loaded, setLoaded] = useState(false)
  const [closed, setClosed] = useState('Open')
  const [newState, setNewState] = useState(false)
  const theme = useTheme()
  let { param } = useLocalSearchParams()
  // console.log('param', param)
  try {
    if (typeof param === 'string') {
      param = JSON.parse(param)
    }
  } catch (error) {
    console.error('Error parsing param:', error)
    param = {}
  }

  const [orientation, setOrientation] = useState(null)
  // console.log('par param', param)

  useEffect(() => {
    if (param) {
      try {
        setLoaded(true)
        setNewState(newState)
        if (closed === 'Open') {
          setClosed('Open')
        } else {
          setClosed('Closed')
        }
      } catch (error) {
        console.log('error_________________', error)
      }
    }
    let subscription = 1

    const getCurrentOrientation = async () => {
      try {
        const currentOrientation = await ScreenOrientation.getOrientationAsync()
        // console.log('Obtenida orientación inicial:', currentOrientation)
        setOrientation(currentOrientation)
      } catch (error) {
        console.error('Error obteniendo la orientación:', error)
      }
    }
    const handleOrientationChange = (event) => {
      // console.log('Cambio de orientación detectado:', event.orientationInfo.orientation)
      setOrientation(event.orientationInfo.orientation)
    }
    // Obtener orientación inicial
    getCurrentOrientation()

    // Suscribir listener
    subscription = ScreenOrientation.addOrientationChangeListener(handleOrientationChange)

    return () => {
      // Limpiar el listener cuando el componente se desmonta
      ScreenOrientation.removeOrientationChangeListener(subscription)
    }
  }, [])
  if (orientation === 1) {
    return (
      <ScrollView>
        <Stack.Screen
          options={{
            title: t('sections.eventDetails'),
            headerShown: true
          }}
        />
        {
          loaded && (
            <View style={{ rowGap: 20, alignSelf: 'center', alignItems: 'center', marginBottom: 50 }}>
              <EventCarousel param={param} rotation={orientation} />
              <Chips param={param} />
              <Content param={param} />
              <View style={{ display: 'flex', justifyContent: 'space-around', rowGap: 5 }}>
                <Reaction param={param} />
                <Chip
                  textStyle={{ textAlign: 'center', fontWeight: 'bold' }}
                  style={{ backgroundColor: closed === 'Open' ? theme.colors.errorContainer : theme.colors.secondaryContainer }}
                >
                  Ticket: {closed}
                </Chip>
              </View>
              {/* En esta parte se deberá llamar a ShowComments, y habrá que pasarle el  */}
              <ShowComments idTicketNew={param?.idTicketNew} />
            </View>
          )
        }
      </ScrollView>
    )
  } else {
    return (
      <ScrollView>
        <Stack.Screen
          options={{
            title: t('sections.eventDetails'),
            headerShown: true,
            fullScreenGestureEnabled: true
          }}
        />
        {
          loaded && (
            <View style={{ rowGap: 20, alignSelf: 'center', alignItems: 'center', marginBottom: 50 }}>
              <EventCarousel param={param} rotation={orientation} />
            </View>
          )
        }
      </ScrollView>
    )
  }
}

export default EventPage
