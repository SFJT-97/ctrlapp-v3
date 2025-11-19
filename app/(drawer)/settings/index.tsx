import React, { useEffect, useState } from 'react'
import { Dimensions, View } from 'react-native'
import { Text } from 'react-native-paper'
import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from '@react-navigation/drawer'
import * as ScreenOrientation from 'expo-screen-orientation'

// Custom modules
import MyReactMap from './components/MyReactMap'
import CompanySectorDropdown from './components/CompanySectorDropdown'

// Custom hooks
import { useMe } from '../../../context/hooks/userQH'
import { useMyCompanySectors } from '../../../context/hooks/companySectorQ'
import { ORIENTATION_PORTRAIT, ORIENTATION_LANDSCAPE } from '../../../globals/constants/appConstants'
import { CompanySector } from '../../../types'

const SectorCanvas: React.FC = () => {
  // states
  const [companySector, setCompanySector] = useState<CompanySector[]>([])
  const [selectedSector, setSelectedSector] = useState<CompanySector[]>([])
  const [selectedSectorAux, setSelectedSectorAux] = useState<CompanySector[]>([])
  const [selectedSectorIdAux, setSelectedSectorIdAux] = useState<string[]>([])
  const [companyName, setCompanyName] = useState<string>('')
  const [selectedStandardSector, setSelectedStandardSector] = useState<string>('')

  const [orientation, setOrientation] = useState<number | null>(null)
  
  // FIXED: Use proper hook return structure
  const { me, loading: meLoading } = useMe()
  const { sectors: myCompanySectors, loading: sectorsLoading } = useMyCompanySectors()

  const screenWidth = Dimensions.get('screen').width
  const screenHeight = Dimensions.get('screen').height

  useEffect(() => {
    if (!meLoading && me) {
      setCompanyName(me.companyName || '')
    }
  }, [me, meLoading])

  useEffect(() => {
    if (!sectorsLoading && myCompanySectors) {
      setCompanySector(myCompanySectors)
    }
  }, [myCompanySectors, sectorsLoading])

  // FIXED: Proper subscription initialization
  useEffect(() => {
    let subscription: ScreenOrientation.OrientationChangeListener | null = null

    const getCurrentOrientation = async (): Promise<void> => {
      try {
        const currentOrientation = await ScreenOrientation.getOrientationAsync()
        setOrientation(currentOrientation)
      } catch (error) {
        console.error('Error obteniendo la orientación:', error)
      }
    }

    const handleOrientationChange = (
      event: ScreenOrientation.OrientationChangeEvent
    ): void => {
      setOrientation(event.orientationInfo.orientation)
    }

    // Get initial orientation
    getCurrentOrientation()

    // Subscribe listener
    subscription = ScreenOrientation.addOrientationChangeListener(handleOrientationChange)

    return () => {
      // FIXED: Proper cleanup
      if (subscription) {
        ScreenOrientation.removeOrientationChangeListener(subscription)
      }
    }
  }, [])

  // FIXED: Use named constants instead of magic numbers
  const isPortrait = orientation !== null && orientation < ORIENTATION_LANDSCAPE

  if (isPortrait) {
    return (
      <View>
        <Drawer.Screen
          options={{
            title: 'Sectors',
            headerShown: true,
            headerLeft: () => <DrawerToggleButton />
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
        </View>
      </View>
    )
  }

  // Landscape view
  return (
    <View>
      <Drawer.Screen
        options={{
          title: 'Sectors',
          headerShown: true,
          headerLeft: () => <DrawerToggleButton />
        }}
      />
      <View style={{ flexDirection: 'row', height: screenHeight }}>
        <View style={{ width: screenWidth * 0.3, marginVertical: 10, rowGap: 10 }}>
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
        </View>
        <View style={{ width: screenWidth * 0.7 }}>
          <MyReactMap
            selectedSector={selectedSector}
            selectedSectorAux={selectedSectorAux}
            selectedSectorIdAux={selectedSectorIdAux}
            setSelectedSector={setSelectedSector}
            setSelectedSectorAux={setSelectedSectorAux}
            setSelectedSectorIdAux={setSelectedSectorIdAux}
            companySector={companySector}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
          />
        </View>
      </View>
    </View>
  )
}

export default SectorCanvas

