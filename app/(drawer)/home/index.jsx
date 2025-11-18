// ==> 2024-10-02
// Bultin modules
import { useEffect, useState, useContext, useCallback } from 'react'
import { gql, useMutation } from '@apollo/client'
import { SafeAreaView, ScrollView, View, Platform } from 'react-native'
import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from '@react-navigation/drawer'
import { useTheme, IconButton } from 'react-native-paper'
import * as Notifications from 'expo-notifications'

// Custom modules
import HomeBottomSheetModal from './components/banner'
import BottomSheetBU from './components/BottomSheetBU'
import Position from './components/position'
import DonutCharts from './components/charts/donutCharts'

// Custom hooks
import { DataContext } from '../../../context/DataContext.js'
import { useMe } from '../../../context/hooks/userQH.js'
import { useMyCompanySectors } from '../../../context/hooks/companySectorQ'
import { WatchNewTickets } from '../../../globals/watchNewTickets'
import { WatchNewValues } from '../../../globals/WatchNewValues'

// import ACPieChart from './components/charts/piechart' // pensado para web

// Custom functions
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

export default function HomePage () {
  const theme = useTheme()
  const { me } = useMe()
  const { myCompanySectors } = useMyCompanySectors()
  const { data } = useContext(DataContext)
  const [addNewDeviceToUser] = useMutation(gqlAddNewDeviceToUserM)

  // useStates
  const [visible, setVisible] = useState(false)
  const [positionValues, setPositionValues] = useState({})
  const [sectorEvent, setSectorEvent] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [count, setCount] = useState(0)

  // estado para los datos de los graficos
  const toggleBannerVisibility = () => {
    setVisible(!visible)
  }

  const [businessUnitVisible, setBusinessUnitVisible] = useState(false)

  const toggleBussinessUnitVisibility = useCallback(() => {
    setBusinessUnitVisible((prev) => !prev)
  }, [])

  const closeBusinessUnitSheet = useCallback(() => {
    setBusinessUnitVisible(false)
  }, [])

  useEffect(() => {
    if (myCompanySectors && myCompanySectors !== 'Loading...' && myCompanySectors !== 'ApolloError') {
      setPositionValues({ ...positionValues, myCompanySectors })
      setCount(prevCount => prevCount + 1)
    }
  }, [myCompanySectors])

  useEffect(() => {
    if (me && me !== 'Loading...' && me !== 'ApolloError') {
      setPositionValues({ ...positionValues, me })
      setCount(prevCount => prevCount + 1)
    }
  }, [me])

  useEffect(() => {
    if (count > 1) setLoaded(true)
  }, [count])

  useEffect(() => {
    if (!data) return
    async function addNewDevice (tokenDevice) {
      // console.log('platform', platform)
      try {
        await addNewDeviceToUser({
          variables: {
            tokenDevice,
            platform
          }
        })
      } catch (error) {
        console.error('error adding new device', error)
      }
    }
    try {
      addNewDevice(data.idDevice)
    } catch (error) {
      console.log(error)
    }
  }, [data])

  useEffect(() => {
    const checkNotificationsPermissions = async () => {
      await checkAndRequestNotificationPermission()
    }
    checkNotificationsPermissions()
  }, [])

  const checkAndRequestNotificationPermission = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()

    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus === 'granted') {
      console.log('✅ Permiso de notificaciones concedido')

      // Podés registrar el token acá si querés
      // const tokenData = await Notifications.getExpoPushTokenAsync()
      // console.log('Expo Push Token:', tokenData.data)
    } else {
      console.log('🚫 Permiso de notificaciones denegado')
    }

    // (opcional) configurar el comportamiento de la notificación
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT
      })
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <Drawer.Screen
          options={{
            title: 'Home',
            headerShown: true,
            headerLeft: () => <DrawerToggleButton tintColor={theme.colors.primary} />,
            headerRight: () => {
              return (
                <View style={{ display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
                  <IconButton
                    icon='billboard'
                    iconColor={theme.colors.primary}
                    size={20}
                    onPress={toggleBussinessUnitVisibility}
                  />
                  <IconButton
                    icon='alarm-light-outline'
                    iconColor={theme.colors.error}
                    size={20}
                    onPress={toggleBannerVisibility}
                  />
                </View>
              )
            }
          }}
        />

        <View style={{ marginTop: 20, alignSelf: 'center', alignItems: 'center' }}>
          {/* {
            platform === 'web'
              ? <ACPieChart />
              : <DonutCharts />
          } */}
          <DonutCharts />
        </View>

        {/* Esto está comentado para que no jodan las notificaciones, después hay que agregar algo que le indique al algoritmo que el usuario ya recibió la notificación. */}
        <View style={{ bottom: 30, alignItems: 'center', marginTop: 80 }}>
          {loaded && <Position positionValues={positionValues} setSectorEvent={setSectorEvent} />}
        </View>

        <WatchNewTickets />
        <WatchNewValues />
        {/* <VoiceToText /> */}
      </ScrollView>
      <HomeBottomSheetModal visible={visible} setVisible={setVisible} sectorEvent={sectorEvent} />
      <BottomSheetBU visible={businessUnitVisible} onClose={closeBusinessUnitSheet} />
    </SafeAreaView>
  )
}
