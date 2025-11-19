import React, { useEffect, useState } from 'react'
import { Dimensions, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from '@react-navigation/drawer'
import * as ScreenOrientation from 'expo-screen-orientation'
import { useTranslation } from 'react-i18next'

// Custom modules
import MyReactMap from './components/MyReactMap'
import CompanySectorDropdown from './components/CompanySectorDropdown'

// Custom hooks
import { useMe } from '../../../context/hooks/userQH'
import { useMyCompanySectors } from '../../../context/hooks/companySectorQ'
import { ORIENTATION_PORTRAIT, ORIENTATION_LANDSCAPE } from '../../../globals/constants/appConstants'
import { CompanySector } from '../../../types'

const SectorCanvas: React.FC = () => {
  const { t } = useTranslation('settings')
  const theme = useTheme()
  // states
  const [companySector, setCompanySector] = useState<CompanySector[]>([])
  const [selectedSector, setSelectedSector] = useState<CompanySector[]>([])
  const [selectedSectorAux, setSelectedSectorAux] = useState<CompanySector[]>([])
  const [selectedSectorIdAux, setSelectedSectorIdAux] = useState<string[]>([])
  const [companyName, setCompanyName] = useState<string>('')
  const [selectedStandardSector, setSelectedStandardSector] = useState<string>('')

  const [orientation, setOrientation] = useState<number | null>(null)
  
  const { me } = useMe()
  const myCompanySectors = useMyCompanySectors()

  const screenWidth = Dimensions.get('screen').width
  const screenHeight = Dimensions.get('screen').height

  useEffect(() => {
    if (me && me !== 'Loading...' && me !== 'Apollo Error') {
      setCompanyName(me.companyName || '')
    }
  }, [me])

  useEffect(() => {
    // Adapt to current hook structure which returns { loading, sectors, error }
    if (myCompanySectors && !myCompanySectors.loading && myCompanySectors.sectors) {
      setCompanySector(myCompanySectors.sectors)
    }
  }, [myCompanySectors])

  useEffect(() => {
    let subscription: ScreenOrientation.OrientationChangeListener | null = null

    const getCurrentOrientation = async () => {
      try {
        const currentOrientation = await ScreenOrientation.getOrientationAsync()
        setOrientation(currentOrientation)
      } catch (error) {
        console.error('Error obteniendo la orientación:', error)
      }
    }

    const handleOrientationChange = (event: ScreenOrientation.OrientationChangeEvent) => {
      setOrientation(event.orientationInfo.orientation)
    }

    // Get initial orientation
    getCurrentOrientation()

    // Subscribe listener
    subscription = ScreenOrientation.addOrientationChangeListener(handleOrientationChange)

    return () => {
      // Cleanup listener
      if (subscription) {
        ScreenOrientation.removeOrientationChangeListener(subscription)
      }
    }
  }, [])

  // Original orientation check: orientation < 2 for portrait
  if (orientation !== null && orientation < 2) {
    return (
      <View>
        <Drawer.Screen
          options={{
            title: t('title'),
            headerShown: true,
            headerLeft: () => <DrawerToggleButton tintColor={theme.colors.primary} />
          }}
        />

        <View style={{ marginVertical: 10, rowGap: 10 }}>
          <View style={{ paddingHorizontal: 5 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              {companyName} sectors
            </Text>
            <CompanySectorDropdown
              myCompanySectors={companySector}
              setCompanySector={setSelectedSector}
              setSelectedStandardSector={setSelectedStandardSector}
              setSelectedSectorAux={setSelectedSectorAux}
              setSelectedSectorIdAux={setSelectedSectorIdAux}
              selectedSectorAux={selectedSectorAux}
              selectedSectorIdAux={selectedSectorIdAux}
              selectedStandardSector={selectedStandardSector}
            />
          </View>
          <View style={{ paddingHorizontal: 5, height: screenHeight - 220, width: screenWidth }}>
            <MyReactMap selectedSector={selectedSector[0]} />
          </View>
        </View>
      </View>
    )
  } else {
    // Landscape view - map only
    return (
      <View style={{ paddingHorizontal: 2, height: screenHeight - 20, width: screenWidth }}>
        <MyReactMap selectedSector={selectedSector[0]} />
      </View>
    )
  }
}

export default SectorCanvas

