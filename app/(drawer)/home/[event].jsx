// ==> 2024-10-02
// Builtin modules
import { useEffect, useState, useCallback } from 'react'
import { ScrollView, View, RefreshControl } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Chip, useTheme, Text, Divider } from 'react-native-paper'
import { useApolloClient } from '@apollo/client'

// Custom modules
import EventCarousel from './components/event/EventCarousel'
import Chips from './components/event/chips'
import Content from './components/event/content'
import Reaction from './components/event/reactions'
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
  const [refreshing, setRefreshing] = useState(false)
  const theme = useTheme()
  const client = useApolloClient()
  const param = useLocalSearchParams()

  useEffect(() => {
    if (param !== undefined) {
      try {
        setLoaded(true)
        // Determine ticket status from param if available
        if (param.status) {
          setClosed(param.status)
        }
      } catch (error) {
        console.log('error_________________', error)
      }
    }
  }, [param])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      // Refetch all active queries to refresh event data, comments, and reactions
      await client.refetchQueries({
        include: 'active'
      })
    } catch (error) {
      console.error('Error refreshing event data:', error)
    } finally {
      setRefreshing(false)
    }
  }, [client])

  if (!loaded) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Event Details'
          }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading event...</Text>
        </View>
      </>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: param.classificationDescription || 'Event Details'
        }}
      />
      <ScrollView
        nestedScrollEnabled
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={{ backgroundColor: theme.colors.surface }}>
          {/* Image Carousel */}
          <View style={{ marginBottom: 16 }}>
            <EventCarousel param={param} />
          </View>

          {/* Classification and Status Chips */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingHorizontal: 16,
              marginBottom: 16,
              gap: 8
            }}
          >
            <Chips param={param} />
            <Chip
              textStyle={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12 }}
              style={{
                backgroundColor:
                  closed === 'Open'
                    ? theme.colors.errorContainer
                    : theme.colors.secondaryContainer,
                height: 32
              }}
            >
              Status: {closed}
            </Chip>
          </View>

          <Divider style={{ marginVertical: 8 }} />

          {/* Event Content */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Content param={param} />
          </View>

          <Divider style={{ marginVertical: 8 }} />

          {/* Reactions Section */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 16
            }}
          >
            <Reaction param={param} />
          </View>

          <Divider style={{ marginVertical: 8 }} />

          {/* Comments Section */}
          <ShowComments idTicketNew={param.idTicketNew} />
        </View>
      </ScrollView>
    </>
  )
}

export default EventPage
