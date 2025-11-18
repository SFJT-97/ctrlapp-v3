// ==> 2024-10-02
// Builtin modules
import { useEffect, useState } from 'react'
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

const SectorCanvas = () => {
  // states
  const [companySector, setCompanySector] = useState([])
  const [selectedSector, setSelectedSector] = useState([])
  const [selectedSectorAux, setSelectedSectorAux] = useState([])
  const [selectedSectorIdAux, setSelectedSectorIdAux] = useState([])
  const [companyName, setCompanyName] = useState('')
  const [selectedStandardSector, setSelectedStandardSector] = useState('')

  const [orientation, setOrientation] = useState(null)
  // hooks
  // const theme = useTheme()
  const { me } = useMe()
  const myCompanySectors = useMyCompanySectors()

  const screenWidth = Dimensions.get('screen').width
  const screenHeight = Dimensions.get('screen').height

  useEffect(() => {
    if (me && me !== 'Loading...' && me !== 'Apollo Error') {
      setCompanyName(me.companyName)
    }
  }, [me])

  useEffect(() => {
    if (myCompanySectors && myCompanySectors !== 'Loading...' && myCompanySectors !== 'ApolloError') {
      setCompanySector(myCompanySectors?.myCompanySectors)
    }
  }, [myCompanySectors])

  useEffect(() => {
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
  // console.log('orientation', orientation)
  if (orientation < 2) {
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
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{companyName} sectors</Text>
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
    return (
      <View style={{ paddingHorizontal: 2, height: screenHeight - 20, width: screenWidth }}>
        <MyReactMap selectedSector={selectedSector[0]} />
      </View>
    )
  }
}

export default SectorCanvas

/*
  Así funciona llamando a "MyReactMap.jsx" y utilizando google maps "react-native-maps", lo voy a dejar comentado pero funciona
  perfecto, simplemente cambiamos de idea ahora queremos mostrar un mapa de leaflet solo lectura que muestre los sectores de la empresa
*/
// // ==> 2024-10-02
// // Builtin modules
// import { useEffect, useRef, useState } from 'react'
// import { Alert, Dimensions, ScrollView, View } from 'react-native'
// import { useTheme, Text, Divider, Button, Switch, TextInput } from 'react-native-paper'
// import { Drawer } from 'expo-router/drawer'
// import { DrawerToggleButton } from '@react-navigation/drawer'
// import { gql, useLazyQuery, useMutation } from '@apollo/client'

// // Custom modules
// import MyReactMap from './components/MyReactMap'
// import CompanySectorDropdown from './components/CompanySectorDropdown'
// import StandardSectorDropdown from './components/StandardSectorDropdown'
// import CompanyBusinessUnitDropdown from './components/CompanyBusinessUnitDropdown'
// import { degreesToMeters } from '../../../globals/functions/functions'

// // Custom hooks
// import { useMe } from '../../../context/hooks/userQH'
// import { useAllStandardSectors } from '../../../context/hooks/standardSectorQH'
// import { useMyCompanySectors } from '../../../context/hooks/companySectorQ'
// import { useMyCompanyBussinesUnits } from '../../../context/hooks/companyBusinessUnitQH'

// const addNewCompanySectorM = gql`
// mutation AddNewCompanySector($idCompany: ID!, $companyName: String!, $idCompanyBusinessUnit: ID!, $companyBusinessUnitDescription: String!, $idStandardSector: ID!, $standardSectorDescription: String!, $companySectorDescription: String!, $companySectorPLineQuantity: Int!, $pLine1X: String, $pLine1Y: String, $pLine1Z: String, $pLine2X: String, $pLine2Y: String, $pLine2Z: String, $pLine3X: String, $pLine3Y: String, $pLine3Z: String, $pLine4X: String, $pLine4Y: String, $pLine4Z: String, $pLine5X: String, $pLine5Y: String, $pLine5Z: String, $pLine6X: String, $pLine6Y: String, $pLine6Z: String, $pLine7X: String, $pLine7Y: String, $pLine7Z: String, $pLine8X: String, $pLine8Y: String, $pLine8Z: String, $pLine9X: String, $pLine9Y: String, $pLine9Z: String, $pLine10X: String, $pLine10Y: String, $pLine10Z: String, $pLine11X: String, $pLine11Y: String, $pLine11Z: String, $pLine12X: String, $pLine12Y: String, $pLine12Z: String) {
//   addNewCompanySector(idCompany: $idCompany, companyName: $companyName, idCompanyBusinessUnit: $idCompanyBusinessUnit, companyBusinessUnitDescription: $companyBusinessUnitDescription, idStandardSector: $idStandardSector, standardSectorDescription: $standardSectorDescription, companySectorDescription: $companySectorDescription, companySectorPLineQuantity: $companySectorPLineQuantity, pLine1X: $pLine1X, pLine1Y: $pLine1Y, pLine1Z: $pLine1Z, pLine2X: $pLine2X, pLine2Y: $pLine2Y, pLine2Z: $pLine2Z, pLine3X: $pLine3X, pLine3Y: $pLine3Y, pLine3Z: $pLine3Z, pLine4X: $pLine4X, pLine4Y: $pLine4Y, pLine4Z: $pLine4Z, pLine5X: $pLine5X, pLine5Y: $pLine5Y, pLine5Z: $pLine5Z, pLine6X: $pLine6X, pLine6Y: $pLine6Y, pLine6Z: $pLine6Z, pLine7X: $pLine7X, pLine7Y: $pLine7Y, pLine7Z: $pLine7Z, pLine8X: $pLine8X, pLine8Y: $pLine8Y, pLine8Z: $pLine8Z, pLine9X: $pLine9X, pLine9Y: $pLine9Y, pLine9Z: $pLine9Z, pLine10X: $pLine10X, pLine10Y: $pLine10Y, pLine10Z: $pLine10Z, pLine11X: $pLine11X, pLine11Y: $pLine11Y, pLine11Z: $pLine11Z, pLine12X: $pLine12X, pLine12Y: $pLine12Y, pLine12Z: $pLine12Z) {
//     idCompanySector
//     idCompany
//     companyName
//     idCompanyBusinessUnit
//     companyBusinessUnitDescription
//     idStandardSector
//     standardSectorDescription
//     companySectorDescription
//     companySectorPLineQuantity
//     pLine1X
//     pLine1Y
//     pLine1Z
//     pLine2X
//     pLine2Y
//     pLine2Z
//     pLine3X
//     pLine3Y
//     pLine3Z
//     pLine4X
//     pLine4Y
//     pLine4Z
//     pLine5X
//     pLine5Y
//     pLine5Z
//     pLine6X
//     pLine6Y
//     pLine6Z
//     pLine7X
//     pLine7Y
//     pLine7Z
//     pLine8X
//     pLine8Y
//     pLine8Z
//     pLine9X
//     pLine9Y
//     pLine9Z
//     pLine10X
//     pLine10Y
//     pLine10Z
//     pLine11X
//     pLine11Y
//     pLine11Z
//     pLine12X
//     pLine12Y
//     pLine12Z
//   }
// }

// `

// const editCompanySectorM = gql`
// mutation EditCompanySector($idCompanySector: ID!, $companySectorDescription: String, $companySectorPLineQuantity: Int, $pLine1X: String, $pLine1Y: String, $pLine1Z: String, $pLine2X: String, $pLine2Y: String, $pLine2Z: String, $pLine3X: String, $pLine3Y: String, $pLine3Z: String, $pLine4X: String, $pLine4Y: String, $pLine4Z: String, $pLine5X: String, $pLine5Y: String, $pLine5Z: String, $pLine6X: String, $pLine6Y: String, $pLine6Z: String, $pLine7X: String, $pLine7Y: String, $pLine7Z: String, $pLine8X: String, $pLine8Y: String, $pLine8Z: String, $pLine9X: String, $pLine9Y: String, $pLine9Z: String, $pLine10X: String, $pLine10Y: String, $pLine10Z: String, $pLine11X: String, $pLine11Y: String, $pLine11Z: String, $pLine12X: String, $pLine12Y: String, $pLine12Z: String) {
//   editCompanySector(idCompanySector: $idCompanySector, companySectorDescription: $companySectorDescription, companySectorPLineQuantity: $companySectorPLineQuantity, pLine1X: $pLine1X, pLine1Y: $pLine1Y, pLine1Z: $pLine1Z, pLine2X: $pLine2X, pLine2Y: $pLine2Y, pLine2Z: $pLine2Z, pLine3X: $pLine3X, pLine3Y: $pLine3Y, pLine3Z: $pLine3Z, pLine4X: $pLine4X, pLine4Y: $pLine4Y, pLine4Z: $pLine4Z, pLine5X: $pLine5X, pLine5Y: $pLine5Y, pLine5Z: $pLine5Z, pLine6X: $pLine6X, pLine6Y: $pLine6Y, pLine6Z: $pLine6Z, pLine7X: $pLine7X, pLine7Y: $pLine7Y, pLine7Z: $pLine7Z, pLine8X: $pLine8X, pLine8Y: $pLine8Y, pLine8Z: $pLine8Z, pLine9X: $pLine9X, pLine9Y: $pLine9Y, pLine9Z: $pLine9Z, pLine10X: $pLine10X, pLine10Y: $pLine10Y, pLine10Z: $pLine10Z, pLine11X: $pLine11X, pLine11Y: $pLine11Y, pLine11Z: $pLine11Z, pLine12X: $pLine12X, pLine12Y: $pLine12Y, pLine12Z: $pLine12Z) {
//     idCompanySector
//     idCompany
//     companyName
//     idCompanyBusinessUnit
//     companyBusinessUnitDescription
//     idStandardSector
//     standardSectorDescription
//     companySectorDescription
//     companySectorPLineQuantity
//     pLine1X
//     pLine1Y
//     pLine1Z
//     pLine2X
//     pLine2Y
//     pLine2Z
//     pLine3X
//     pLine3Y
//     pLine3Z
//     pLine4X
//     pLine4Y
//     pLine4Z
//     pLine5X
//     pLine5Y
//     pLine5Z
//     pLine6X
//     pLine6Y
//     pLine6Z
//     pLine7X
//     pLine7Y
//     pLine7Z
//     pLine8X
//     pLine8Y
//     pLine8Z
//     pLine9X
//     pLine9Y
//     pLine9Z
//     pLine10X
//     pLine10Y
//     pLine10Z
//     pLine11X
//     pLine11Y
//     pLine11Z
//     pLine12X
//     pLine12Y
//     pLine12Z
//   }
// }
// `

// const findCompanySectorsQ = gql`
// query FindCompanySectors($companySectorDescription: String!) {
//   findCompanySectors(companySectorDescription: $companySectorDescription) {
//     idCompanySector
//     idCompany
//     companyName
//     idCompanyBusinessUnit
//     companyBusinessUnitDescription
//     idStandardSector
//     standardSectorDescription
//     companySectorDescription
//     companySectorPLineQuantity
//     pLine1X
//     pLine1Y
//     pLine1Z
//     pLine2X
//     pLine2Y
//     pLine2Z
//     pLine3X
//     pLine3Y
//     pLine3Z
//     pLine4X
//     pLine4Y
//     pLine4Z
//     pLine5X
//     pLine5Y
//     pLine5Z
//     pLine6X
//     pLine6Y
//     pLine6Z
//     pLine7X
//     pLine7Y
//     pLine7Z
//     pLine8X
//     pLine8Y
//     pLine8Z
//     pLine9X
//     pLine9Y
//     pLine9Z
//     pLine10X
//     pLine10Y
//     pLine10Z
//     pLine11X
//     pLine11Y
//     pLine11Z
//     pLine12X
//     pLine12Y
//     pLine12Z
//   }
// }
// `

// const SectorCanvas = () => {
//   // states
//   const [companySector, setCompanySector] = useState([])
//   const [companyBusinessUnit, setCompanyBusinessUnit] = useState([])
//   const [selectedSector, setSelectedSector] = useState([])
//   const [selectedSectorAux, setSelectedSectorAux] = useState([])
//   const [selectedSectorIdAux, setSelectedSectorIdAux] = useState([])
//   const [companyName, setCompanyName] = useState('')
//   const [standardSector, setStandardSector] = useState([])
//   const [clearPoints, setClearPoints] = useState(false)
//   const [selectedStandardSector, setSelectedStandardSector] = useState('')
//   const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('')
//   const [addNewCompanySector] = useMutation(addNewCompanySectorM)
//   const [editCompanySector] = useMutation(editCompanySectorM)
//   const [findCompanySectors] = useLazyQuery(findCompanySectorsQ, { fetchPolicy: 'network-only' })
//   const [isSwitchOn, setIsSwitchOn] = useState(false) // SwitchOn===true ==> "Add New Sector", SwitchOn===false ==> "Edit some"
//   const [saveEnabled, setSaveEnabled] = useState(false)
//   const [newSectorName, setNewSectorName] = useState('')
//   const [searchTerm, setSearchTerm] = useState('')
//   const [vertices, setVertices] = useState(0)

//   // hooks
//   const timerRef = useRef(null)
//   const polygonCoordinates = useRef(null) // This matrix is used to change the selected polygon as the user touches the map.
//   const theme = useTheme()
//   const { me } = useMe()
//   const allStandardSectors = useAllStandardSectors()
//   const myCompanySectors = useMyCompanySectors()
//   const myCompanyBusinessUnits = useMyCompanyBussinesUnits()

//   const screenWidth = Dimensions.get('screen').width

//   const handleChangeText = (text) => {
//     setSearchTerm(text)
//     if (timerRef.current) {
//       clearTimeout(timerRef.current)
//     }
//     timerRef.current = setTimeout(() => {
//       if (text.length === 0) {
//         setNewSectorName('')
//       } else {
//         performSearch(text)
//       }
//     }, 500)
//   }

//   const performSearch = async (term) => {
//     // en esta parte se debe ejecutar la useLazyQuery para encontrar los sectores de la empresa con el criterio de búsqueda del filtro
//     const matchedSectors = await findCompanySectors({ variables: { companySectorDescription: term } }, { fetchPolicy: 'network-only' })
//     if (matchedSectors && matchedSectors !== 'Loading...' && matchedSectors !== 'ApolloError') {
//       if (matchedSectors?.data?.findCompanySectors?.length === 0 && term.length > 4) {
//         setNewSectorName(term)
//       } else {
//         setNewSectorName('')
//       }
//     }
//   }

//   const handleSaveEnabled = () => {
//     if (isSwitchOn) {
//       // Add new Sector condition, must have a valid name + one Type of Sector (standardSector) + one Unit Business + 3 points of sector already chosen
//       setSaveEnabled((vertices > 2 && selectedBusinessUnit !== '' && selectedStandardSector !== '' && newSectorName !== ''))
//     } else {
//       // Edit existing Sector condition
//       setSaveEnabled(selectedSector?.length > 0 && vertices > 2)
//     }
//   }

//   const handleSaveChanges = async () => {
//     // Primero, se deben cargar los datos necesarios

//     const idCompanyBusinessUnit = isSwitchOn ? companyBusinessUnit.myBusinessUnitsCompany.filter(v => v.companyBusinessUnitDescription === selectedBusinessUnit)[0].idCompanyBusinessUnit : me.idCompanyBusinessUnit
//     const idStandardSector = standardSector.filter(v => v.standardSectorDescription === selectedStandardSector)[0].idStandardSector
//     let values = {
//       idCompany: me.idCompany,
//       companyName,
//       idCompanyBusinessUnit,
//       companyBusinessUnitDescription: isSwitchOn ? selectedBusinessUnit : me.companyBusinessUnitDescription,
//       idStandardSector,
//       standardSectorDescription: selectedStandardSector,
//       companySectorDescription: newSectorName,
//       companySectorPLineQuantity: polygonCoordinates?.current?.length
//     }
//     values = addCoordinatesMeters(values)
//     // values ==> Contiene ahora todos los valores para la mutation de agregado o de edición
//     const message = `You are about to ${isSwitchOn ? `"add one new Sector " ${newSectorName}` : '"edit the selected sector"'}.\nAre you shure?`
//     // console.log('message', message)
//     Alert.alert(
//       'Please confirm',
//       message,
//       [
//         {
//           text: 'Ok ✅',
//           style: 'destructive',
//           onPress: async () => {
//             if (isSwitchOn) {
//               // Add new companySector
//               console.log('values for addNewSector Mutation\n', values)
//               try {
//                 const result = await addNewCompanySector(
//                   {
//                     variables: {
//                       ...values
//                     }
//                   }
//                 )
//                 console.log('result.data\n', result?.data)
//                 // Alert.alert(`${companyName} has one new sector!`, `${result.data}`)
//               } catch (error) {
//                 console.log('error adding new Company Sector!\n', error)
//               }
//             } else {
//               // Edit companySector
//               // En este caso, voy a tener que obtener cual fue el sector seleccionado por el usuario (modificar companySectorDropDown)
//               if (polygonCoordinates?.current?.length > 2) {
//                 // Si seleccionó nuevos puntos para editar el sector y se los agrega a "values"
//                 values = {
//                   ...values,
//                   idCompanySector: selectedSectorIdAux,
//                   companySectorDescription: selectedSectorAux
//                 }
//                 console.log('values for editSector Mutation\n', values)
//                 /*
//                   idCompanySector: $idCompanySector ==>  (tengo que averiguarlo... pasarle un set al companySectorDropDown)
//                   companySectorDescription: $companySectorDescription ==> (tengo que averiguarlo... pasarle un set al companySectorDropDown)
//                 */
//                 try {
//                   const result = await editCompanySector(
//                     {
//                       variables: {
//                         ...values
//                       }
//                     }
//                   )
//                   console.log('result.data\n', result?.data)
//                   Alert.alert('Success editing', 'You succesfully edited the selected sector')
//                 } catch (error) {
//                   console.log('error editing the selected Company Sector!\n', error)
//                 }
//               } else {
//               // En esta parte no va a entrar nunca, porque no se habilitará el botón "SAVE"
//               }
//             }
//           }
//         },
//         { text: 'Cancel ⛔', style: 'default', isPreferred: true, onPress: () => Alert.alert('canceled by user') }
//       ], 'cancelable'
//     )
//   }

//   function addCoordinatesMeters (target) {
//     let temp = { ...target }

//     for (let i = 0; i < polygonCoordinates?.current?.length; i++) {
//       temp =
//         {
//           ...temp,
//           [`pLine${i + 1}X`]: String(degreesToMeters(polygonCoordinates?.current[i]?.longitude, polygonCoordinates?.current[i]?.latitude).X),
//           [`pLine${i + 1}Y`]: String(degreesToMeters(polygonCoordinates?.current[i]?.longitude, polygonCoordinates?.current[i]?.latitude).Y),
//           [`pLine${i + 1}Z`]: '0.00'
//         }
//     }
//     return temp
//   }

//   useEffect(() => {
//     if (me && me !== 'Loading...' && me !== 'Apollo Error') {
//       setCompanyName(me.companyName)
//     }
//   }, [me])

//   useEffect(() => {
//     if (allStandardSectors && allStandardSectors !== 'Loading...' && allStandardSectors !== 'ApolloError') {
//       setStandardSector(allStandardSectors)
//     }
//   }, [allStandardSectors])

//   useEffect(() => {
//     if (myCompanySectors && myCompanySectors !== 'Loading...' && myCompanySectors !== 'ApolloError') {
//       setCompanySector(myCompanySectors?.myCompanySectors)
//     }
//   }, [myCompanySectors])

//   useEffect(() => {
//     if (myCompanyBusinessUnits && myCompanyBusinessUnits !== 'Loading...' && myCompanyBusinessUnits !== 'ApolloError') {
//       setCompanyBusinessUnit(myCompanyBusinessUnits)
//     }
//   }, [myCompanyBusinessUnits])

//   useEffect(() => handleSaveEnabled(), [selectedStandardSector || selectedBusinessUnit || vertices])
//   useEffect(() => handleSaveEnabled(), [newSectorName])
//   useEffect(() => handleSaveEnabled(), [vertices])
//   useEffect(() => handleSaveEnabled(), [isSwitchOn])
//   return (
//     <ScrollView>
//       <Drawer.Screen
//         options={{
//           title: 'Sectors',
//           headerShown: true,
//           headerLeft: () => <DrawerToggleButton />
//         }}
//       />

//       <View style={{ marginVertical: 20, rowGap: 10 }}>
//         <View>
//           <Text style={{ color: isSwitchOn ? theme.colors.error : theme.colors.primary, paddingLeft: 10, fontSize: 16 }}>{isSwitchOn ? 'Add new sector' : 'Edit sector'}</Text>
//           <View style={{ alignItems: 'flex-start', paddingHorizontal: 10 }}>
//             <Switch
//               value={isSwitchOn}
//               onValueChange={() => {
//                 // if (polygonCoordinates?.current?.length > 0) {
//                 //   polygonCoordinates.current = null
//                 // }
//                 handleClearSector(polygonCoordinates, setClearPoints, clearPoints, setSaveEnabled, setVertices)
//                 setIsSwitchOn(!isSwitchOn)
//               }}
//               color={isSwitchOn ? theme.colors.error : undefined}
//             />
//           </View>
//           {
//             isSwitchOn && (
//               <View style={{ paddingHorizontal: 10, width: 200, fontSize: 18 }}>
//                 <TextInput
//                   label='Sector name:'
//                   placeholder='type here...'
//                   right={<TextInput.Icon icon='magnify' />}
//                   style={{
//                     fontSize: 16,
//                     paddingHorizontal: 10,
//                     width: Math.floor(screenWidth / 2.5)
//                   }}
//                   value={searchTerm}
//                   onChangeText={handleChangeText}
//                 />
//               </View>
//             )
//           }
//           {
//             !isSwitchOn && (
//               <View style={{ paddingHorizontal: 10 }}>
//                 <Text style={{ fontSize: 16 }}>{companyName} sectors</Text>
//                 <CompanySectorDropdown
//                   myCompanySectors={companySector}
//                   setCompanySector={setSelectedSector}
//                   setSelectedStandardSector={setSelectedStandardSector}
//                   setSelectedSectorAux={setSelectedSectorAux}
//                   setSelectedSectorIdAux={setSelectedSectorIdAux}
//                 />
//               </View>
//             )
//           }
//           <View style={{ padding: 10 }}>
//             <Text style={{ fontSize: 16 }}>Type of sector</Text>
//             <StandardSectorDropdown
//               myCompanySectors={standardSector}
//               selectedStandardSector={selectedStandardSector}
//               setSelectedStandardSector={setSelectedStandardSector}
//             />
//           </View>
//           {
//             isSwitchOn && (
//               <View style={{ paddingHorizontal: 10 }}>
//                 <Text style={{ fontSize: 16 }}>Company Business Unit</Text>
//                 <CompanyBusinessUnitDropdown
//                   myCompanySectors={companyBusinessUnit}
//                   selectedStandardSector={selectedBusinessUnit}
//                   setSelectedStandardSector={setSelectedBusinessUnit}
//                 />
//               </View>
//             )
//           }
//         </View>

//         <Divider bold />
//         <View style={{ paddingHorizontal: 10 }}>
//           <MyReactMap companySector={selectedSector[0]} polygonCoordinates={polygonCoordinates} setVertices={setVertices} />
//         </View>
//         <Divider bold />
//         <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', columnGap: 20, flexWrap: 'wrap' }}>
//           <Button
//             style={{ width: 120 }}
//             buttonColor='red'
//             mode='contained'
//             disabled={polygonCoordinates?.current?.length <= 1}
//             onPress={() => handleClearSector(polygonCoordinates, setClearPoints, clearPoints, setSaveEnabled, setVertices)}
//           >
//             Clear
//           </Button>
//           <Button
//             style={{ width: 120 }}
//             buttonColor={theme.colors.primary}
//             mode='contained'
//             disabled={!saveEnabled}
//             onPress={handleSaveChanges}
//           >
//             Save
//           </Button>
//         </View>
//       </View>
//     </ScrollView>
//   )
// }

// function handleClearSector (polygonCoordinates, setClearPoints, clearPoints, setSaveEnabled, setVertices) {
//   if (polygonCoordinates.current !== null) polygonCoordinates.current = []
//   setClearPoints(!clearPoints)
//   setSaveEnabled(false)
//   setVertices(0)
// }

// export default SectorCanvas
