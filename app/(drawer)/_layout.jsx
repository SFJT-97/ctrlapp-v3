// 2024-10-02
// Builtin modules
// import { useEffect, useState } from 'react'
import { Drawer } from 'expo-router/drawer'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import CustomDrawer from '../../globals/components/customDrawer'

// Custom modules
// import { useMe } from '../../context/hooks/userQH'

if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn
  console.warn = (...args) => {
    console.log(' ==>', args[0])
    const message = args[0]
    if (
      message.includes('new NativeEventEmitter()')
    ) {
      return // Ignorar
    }
    originalWarn(...args)
  }
}

export default function DrawerLayout () {
  // const theme = useTheme()
  // const [access, setAccess] = useState(false)
  // const { me } = useMe()

  // useEffect(() => {
  //   if (me && me !== 'Loading' && me !== 'ApolloError') {
  //     if (me.isCompanyAppAdmin || me.isSuperUser) {
  //       setAccess(true)
  //     } else {
  //       setAccess(false)
  //     }
  //   }
  // }, [me])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false
          /* swipeEdgeWidth: 0, => Elimina la posibilidad de abrir el menu desplazando desde el borde de la pantalla */
        }}
        drawerContent={(props) => <CustomDrawer {...props} />}
      >

        <Drawer.Screen
          name='home'
          options={{
            drawerLabel: 'Home',
            drawerIcon: ({ size, color }) => <MaterialCommunityIcons name='home' size={size} color={color} />
          }}
        />

        <Drawer.Screen
          name='report'
          options={{
            drawerLabel: 'Event',
            drawerIcon: ({ size, color }) => <MaterialCommunityIcons name='alarm-light' size={size} color={color} />
          }}
        />

        <Drawer.Screen
          name='chat'
          options={{
            drawerLabel: 'Chat',
            drawerIcon: ({ size, color }) => <MaterialCommunityIcons name='chat' size={size} color={color} />
          }}
        />

        <Drawer.Screen
          name='settings'
          options={{
            // drawerItemStyle: { display: access ? 'flex' : 'none' },  // Si se desea que solamente se pueda visualizar este item si el usuario es companyAppAdmin o SuperUser
            drawerItemStyle: { display: 'flex' },
            drawerLabel: 'Sectors',
            drawerIcon: ({ size, color }) => <MaterialCommunityIcons name='hexagon-multiple' size={size} color={color} />
          }}
        />
        <Drawer.Screen
          name='profile'
          options={{
            drawerItemStyle: { display: 'none' }
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}
