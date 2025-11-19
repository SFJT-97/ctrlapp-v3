// intento 3
import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from '@react-navigation/drawer'
import HelpButton from './Components/ReportScreen/HelpButton'
import Card from './Components/ReportScreen/Card'
import CardAI from './Components/ReportScreen/CardAI'
import CardSearch from './Components/ReportScreen/CardSearch'
import AIFunctions from './Components/ReportScreen/AIFunctions'
import CustomActivityIndicator from '../../../globals/components/CustomActivityIndicator'
import { useAsyncStorage } from '../../../context/hooks/ticketNewQH'

export default function ReportScreen () {
  const theme = useTheme()
  // Estados
  const [dataLoaded, setDataLoaded] = useState(false)
  const [defaultValues, setDefaultValues] = useState({})
  const [errorMessage, setErrorMessage] = useState(null)
  const { value: generalData = undefined, loading, error } = useAsyncStorage('CTRLA_GENERAL_DATA')

  useEffect(() => {
    if (loading) {
      setDataLoaded(false)
      setErrorMessage(null)
      return
    }

    if (error) {
      setErrorMessage('Error al cargar los datos. Por favor, intenta de nuevo.')
      setDataLoaded(false)
      return
    }

    if (generalData && typeof generalData === 'object') {
      setDefaultValues({ ...generalData })
      setDataLoaded(true)
      setErrorMessage(null)
    } else {
      setErrorMessage('Datos inválidos recibidos.')
      setDataLoaded(false)
    }
  }, [generalData, loading, error])

  return (
    <View style={styles.container}>
      <Drawer.Screen
        options={{
          title: 'Event Page',
          headerShown: true,
          headerLeft: () => <DrawerToggleButton tintColor={theme.colors.primary} />,
          headerRight: () => <HelpButton />
        }}
      />
      {
        loading
          ? (
            <CustomActivityIndicator />
            )
          : errorMessage
            ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
              )
            : dataLoaded
              ? (
                <View style={styles.content}>
                  <View style={styles.row}>
                    <Card defaultValues={defaultValues} />
                    <CardAI defaultValues={defaultValues} />
                  </View>
                  <View style={styles.row}>
                    <CardSearch />
                    {/* AIFunctions se debe negar si el contrato no es plus */}
                    <View style={{ display: 'none' }}>
                      <AIFunctions />
                    </View>
                  </View>
                </View>
                )
              : (
                <Text style={styles.errorText}>No se pudieron cargar los datos.</Text>
                )
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 40 // Espacio entre las filas
  },
  button: {
    // backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 10, // Espacio entre los botones
    borderRadius: 10
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold'
  }
})
