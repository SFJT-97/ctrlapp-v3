// ==> 2024-10-02
// Builtin modules
import { useEffect, useState, useCallback } from 'react'
import { ScrollView, View, RefreshControl } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useTheme, Text, Divider } from 'react-native-paper'
import { useApolloClient } from '@apollo/client'
import * as ScreenOrientation from 'expo-screen-orientation'
import { useTranslation } from 'react-i18next'

// Custom modules
import EventCarousel from '../../../home/components/event/EventCarousel'
import Chips from '../../../home/components/event/chips'
import Content from '../../../home/components/event/content'
import Reaction from '../../../home/components/event/reactions'
import ShowComments from '../../../home/components/event/ShowComments'

import {
  configureReanimatedLogger,
  ReanimatedLogLevel
} from 'react-native-reanimated'

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false // Reanimated runs in strict mode by default, with this Im removing the false positive alert that appears in the console
})

const EventPage = () => {
  const { t } = useTranslation('report')
  const [loaded, setLoaded] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const theme = useTheme()
  const client = useApolloClient()
  let { param } = useLocalSearchParams()
  
  try {
    if (typeof param === 'string') {
      param = JSON.parse(param)
    }
  } catch (error) {
    console.error('Error parsing param:', error)
    param = {}
  }

  const [orientation, setOrientation] = useState(null)

  useEffect(() => {
    if (param !== undefined) {
      try {
        setLoaded(true)
      } catch (error) {
        console.log('error_________________', error)
      }
    }

    let subscription = 1

    const getCurrentOrientation = async () => {
      try {
        const currentOrientation = await ScreenOrientation.getOrientationAsync()
        setOrientation(currentOrientation)
      } catch (error) {
        console.error('Error obteniendo la orientación:', error)
      }
    }
    const handleOrientationChange = (event) => {
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
            title: t('sections.eventDetails')
          }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading event...</Text>
        </View>
      </>
    )
  }

  // Portrait orientation (orientation === 1)
  if (orientation === 1) {
    return (
      <>
        <Stack.Screen
          options={{
            title: param?.classificationDescription || t('sections.eventDetails')
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
              <EventCarousel param={param} rotation={orientation} />
            </View>

            {/* Classification Chips */}
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
                marginBottom: 16,
                alignItems: 'center'
              }}
            >
              <Reaction param={param} />
            </View>

            <Divider style={{ marginVertical: 8 }} />

            {/* Comments Section */}
            <ShowComments idTicketNew={param?.idTicketNew} />
          </View>
        </ScrollView>
      </>
    )
  } else {
    // Landscape orientation
    return (
      <>
        <Stack.Screen
          options={{
            title: param?.classificationDescription || t('sections.eventDetails'),
            fullScreenGestureEnabled: true
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
              <EventCarousel param={param} rotation={orientation} />
            </View>

            {/* Classification Chips */}
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
                marginBottom: 16,
                alignItems: 'center'
              }}
            >
              <Reaction param={param} />
            </View>

            <Divider style={{ marginVertical: 8 }} />

            {/* Comments Section */}
            <ShowComments idTicketNew={param?.idTicketNew} />
          </View>
        </ScrollView>
      </>
    )
  }
}

export default EventPage
