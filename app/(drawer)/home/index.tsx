import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react'
import { gql, useMutation, useApolloClient } from '@apollo/client'
import { SafeAreaView, ScrollView, View, Platform, AppState, AppStateStatus, StyleSheet, RefreshControl } from 'react-native'
import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from '@react-navigation/drawer'
import { useTheme, IconButton, ActivityIndicator, Text } from 'react-native-paper'
import * as Notifications from 'expo-notifications'

// Custom modules
import HomeBottomSheetModal from './components/banner'
import BottomSheetBU from './components/BottomSheetBU'
import Position from './components/position'
import DonutCharts from './components/charts/donutCharts'

// Custom hooks
import { DataContext } from '../../../context/DataContext'
import { useMe } from '../../../context/hooks/userQH'
import { useMyCompanySectors } from '../../../context/hooks/companySectorQ'
import { WatchNewTickets } from '../../../globals/watchNewTickets'
import { WatchNewValues } from '../../../globals/WatchNewValues'

const gqlAddNewDeviceToUserM = gql`
  mutation AddNewDeviceToUser($tokenDevice: String!, $platform: String) {
    addNewDeviceToUser(tokenDevice: $tokenDevice, platform: $platform) {
      idUserDevice
      idUser
      tokenDevice
    }
  }
`

const platform = Platform.OS

export default function HomePage(): React.JSX.Element {
  const theme = useTheme()
  const client = useApolloClient()
  const { me, loading: meLoading, error: meError } = useMe()
  const { sectors: myCompanySectors, loading: sectorsLoading, error: sectorsError } = useMyCompanySectors()
  
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('HomePage must be used within DataProvider')
  }
  
  const { data } = context
  const [addNewDeviceToUser] = useMutation(gqlAddNewDeviceToUserM)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // useStates
  const [visible, setVisible] = useState<boolean>(false)
  const [sectorEvent, setSectorEvent] = useState<Record<string, unknown>>({})
  const [deviceRegistered, setDeviceRegistered] = useState<boolean>(false)

  // FIXED: Use useMemo to compute readiness instead of count pattern
  const isDataReady = useMemo<boolean>(() => {
    return (
      !meLoading &&
      !sectorsLoading &&
      !!me &&
      !!myCompanySectors &&
      myCompanySectors.length > 0
    )
  }, [meLoading, sectorsLoading, me, myCompanySectors])

  // FIXED: Memoize positionValues to prevent unnecessary re-renders
  const positionValues = useMemo(() => ({
    me,
    myCompanySectors
  }), [me?.idUser, myCompanySectors?.length])

  // FIXED: Stable callback for sector event updates
  const handleSectorEventChange = useCallback((event: Record<string, unknown>) => {
    setSectorEvent(prev => {
      // Only update if data actually changed
      const prevStr = JSON.stringify(prev)
      const eventStr = JSON.stringify(event)
      if (prevStr === eventStr) return prev
      return event
    })
  }, [])

  // FIXED: Only register device once on mount
  useEffect(() => {
    if (deviceRegistered || !data?.idDevice) return

    const registerDevice = async (): Promise<void> => {
      try {
        await addNewDeviceToUser({
          variables: {
            tokenDevice: data.idDevice,
            platform
          }
        })
        setDeviceRegistered(true)
      } catch (error) {
        console.error('Error adding new device:', error)
      }
    }

    registerDevice()
  }, [data?.idDevice, deviceRegistered, addNewDeviceToUser])

  // FIXED: Check permission status first, only request if needed
  useEffect(() => {
    const checkNotificationsPermissions = async (): Promise<void> => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync()

        if (existingStatus === 'granted') {
          console.log('✅ Notification permission already granted')
          return
        }

        // Request permission if not granted
        const { status } = await Notifications.requestPermissionsAsync()
        if (status === 'granted') {
          console.log('✅ Notification permission granted')
        } else {
          console.log('🚫 Notification permission denied')
        }

        // Configure notification channel for Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.DEFAULT
          })
        }
      } catch (error) {
        console.error('Error checking notification permissions:', error)
      }
    }

    checkNotificationsPermissions()
  }, [])

  const toggleBannerVisibility = useCallback(() => {
    setVisible((prev) => !prev)
  }, [])

  const [businessUnitVisible, setBusinessUnitVisible] = useState<boolean>(false)

  const toggleBussinessUnitVisibility = useCallback(() => {
    setBusinessUnitVisible((prev) => !prev)
  }, [])

  const closeBusinessUnitSheet = useCallback(() => {
    setBusinessUnitVisible(false)
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      // Refetch all active queries to refresh data
      await client.refetchQueries({
        include: 'active'
      })
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }, [client])

  // Show loading state with proper UI
  if (!isDataReady) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Drawer.Screen
          options={{
            title: 'Home',
            headerShown: true,
            headerLeft: () => <DrawerToggleButton tintColor={theme.colors.primary} />
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  // Show error state with proper UI
  if (meError || sectorsError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Drawer.Screen
          options={{
            title: 'Home',
            headerShown: true,
            headerLeft: () => <DrawerToggleButton tintColor={theme.colors.primary} />
          }}
        />
        <View style={styles.errorContainer}>
          <IconButton icon='alert-circle-outline' size={48} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Failed to load data. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Drawer.Screen
        options={{
          title: 'Home',
          headerShown: true,
          headerLeft: () => <DrawerToggleButton tintColor={theme.colors.primary} />,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <IconButton
                icon='billboard'
                iconColor={theme.colors.primary}
                size={24}
                onPress={toggleBussinessUnitVisibility}
              />
              <IconButton
                icon='alarm-light-outline'
                iconColor={theme.colors.error}
                size={24}
                onPress={toggleBannerVisibility}
              />
            </View>
          )
        }}
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.contentContainer}>
          <View style={styles.chartsContainer}>
            <DonutCharts />
          </View>
          <Position
            positionValues={positionValues}
            setSectorEvent={handleSectorEventChange}
            toggleBussinessUnitVisibility={toggleBussinessUnitVisibility}
          />
        </View>
        <WatchNewTickets />
        <WatchNewValues />
      </ScrollView>
      {/* Move BottomSheets outside ScrollView to avoid VirtualizedList nesting warning */}
      <HomeBottomSheetModal visible={visible} setVisible={setVisible} sectorEvent={sectorEvent} />
      <BottomSheetBU
        visible={businessUnitVisible}
        onClose={closeBusinessUnitSheet}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center'
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  contentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    marginVertical: 20,
    width: '100%'
  },
  chartsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8
  }
})

