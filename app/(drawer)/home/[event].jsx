// ==> 2024-10-02
// Builtin modules
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'

// Custom modules
import EventCarousel from './components/event/EventCarousel'
import Chips from './components/event/chips'
import Content from './components/event/content'
import Reaction from './components/event/reactions'
import { Chip, useTheme } from 'react-native-paper'
import ShowComments from './components/event/ShowComments'

import {
  configureReanimatedLogger,
  ReanimatedLogLevel
} from 'react-native-reanimated'

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false // Reanimated runs in strict mode by default, with this Im removing the false positive alert that appears in the console
})

const EventPage = () => {
  const [loaded, setLoaded] = useState(false)
  const [closed, setClosed] = useState('Open')
  const [newState, setNewState] = useState(false)
  const theme = useTheme()
  const param = useLocalSearchParams()

  useEffect(() => {
    if (param !== undefined) {
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
  }, [])
  return (
    <ScrollView>

      <Stack.Screen
        options={{
          title: ('Event Details...')
        }}
      />
      {
        loaded && (
          <View style={{ rowGap: 20, alignSelf: 'center', alignItems: 'center', marginBottom: 50 }}>
            <EventCarousel param={param} />
            <Chips param={param} />
            <Content param={param} />
            <View style={{ display: 'flex', justifyContent: 'space-around', rowGap: 4 }}>
              <Reaction param={param} />
              <Chip
                textStyle={{ textAlign: 'center', fontWeight: 'bold' }}
                style={{ backgroundColor: closed === 'Open' ? theme.colors.errorContainer : theme.colors.secondaryContainer }}
              >
                Ticket: {closed}
              </Chip>
            </View>
            <ShowComments idTicketNew={param.idTicketNew} />
          </View>
        )
      }
    </ScrollView>
  )
}

export default EventPage
