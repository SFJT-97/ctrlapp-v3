// VERSION 2
// // Builtin modules
// import { useState, memo, useCallback } from 'react'
// import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
// import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
// import { Text, TextInput } from 'react-native-paper'

// const searchEvent = () => {
//   const router = useRouter()
//   let { allTicketsOpen } = useLocalSearchParams()
//   allTicketsOpen = JSON.parse(allTicketsOpen)

//   // states
//   const [filterEvents, setFilterEvents] = useState(allTicketsOpen)

//   const handleFilter = (val) => {
//     const value = allTicketsOpen.filter(el => {
//       let result
//       if (
//         el.ticketCustomDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.classificationDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.companySectorDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.subType.toLowerCase().includes(val.toLowerCase()) ||
//         el.type.toLowerCase().includes(val.toLowerCase()) ||
//         el.solutionType.toLowerCase().includes(val.toLowerCase()) ||
//         el.riskQualification.toLowerCase().includes(val.toLowerCase())
//       ) {
//         result = el
//       }
//       return result
//     })
//     setFilterEvents({})
//     setFilterEvents(value)
//   }

//   const RenderItem = memo(({ item, onPress }) => {
//     return (
//       <TouchableOpacity style={styles.item}>
//         <Pressable onPress={onPress}>
//           <Text style={styles.itemText}>{item.type} - "{item.classification} - {item.classificationDescription}"</Text>
//           <Text style={styles.itemData}>➡️ {item.riskQualification}</Text>
//           <Text style={styles.itemData}>{item.ticketCustomDescription}</Text>
//         </Pressable>
//       </TouchableOpacity>
//     )
//   })

//   const handlePress = useCallback((item) => {
//     router.navigate({ pathname: '/report/searchEvent/Components/[event]', params: item })
//   }, [router])

//   return (
//     <ScrollView>

//       <View style={{ flex: 1 }}>
//         <Stack.Screen
//           options={{
//             title: 'Search Screen'
//           }}
//         />
//         <View>
//           <TextInput
//             style={{ margin: 30, width: 350, alignSelf: 'center' }}
//             mode='outlined'
//             left={<TextInput.Icon icon='magnify' />}
//             placeholder='Search...'
//             onChangeText={val => handleFilter(val)}
//           />
//         </View>
//         <Text style={{ padding: 10 }}>{filterEvents.length} open events found...</Text>
//         {
//           filterEvents.map(el => {
//             return (
//               <RenderItem key={el.idTicketNew} item={el} onPress={() => handlePress(el)} />
//             )
//           })
//         }
//       </View>
//     </ScrollView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop: 30
//   },
//   item: {
//     backgroundColor: 'lightgray',
//     flex: 1,
//     borderRadius: 7,
//     padding: 10,
//     marginRight: 10,
//     marginTop: 25,
//     paddingBottom: 20
//   },
//   itemText: {
//     color: 'black',
//     fontSize: 14,
//     fontWeight: 'bold'
//   },
//   itemData: {
//     color: 'darkgray',
//     fontSize: 14
//   }
// })

// export default searchEvent

// VERSION 3
// Builtin modules
// import { useState, useEffect, memo, useCallback } from 'react'
// import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
// import { Pressable, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
// import { Text, TextInput } from 'react-native-paper'

// const searchEvent = () => {
//   const router = useRouter()
//   let { allTicketsOpen } = useLocalSearchParams()
//   allTicketsOpen = JSON.parse(allTicketsOpen).sort((a, b) => new Date(Number(b.dateTimeEvent)) - new Date(Number(a.dateTimeEvent)))

//   // states
//   const [filterEvents, setFilterEvents] = useState(allTicketsOpen)
//   const [displayedEvents, setDisplayedEvents] = useState([]) // Para almacenar eventos paginados
//   const [page, setPage] = useState(1)
//   const itemsPerPage = 10

//   // Actualiza los elementos a mostrar cuando cambia el page o filterEvents
//   useEffect(() => {
//     const start = (page - 1) * itemsPerPage
//     const end = start + itemsPerPage
//     setDisplayedEvents(filterEvents.slice(0, end)) // Mostrar solo hasta el final de la página actual
//   }, [page, filterEvents])

//   const handleFilter = (val) => {
//     const value = allTicketsOpen.filter(el => {
//       return (
//         el.ticketCustomDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.classificationDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.companySectorDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.subType.toLowerCase().includes(val.toLowerCase()) ||
//         el.type.toLowerCase().includes(val.toLowerCase()) ||
//         el.solutionType.toLowerCase().includes(val.toLowerCase()) ||
//         el.riskQualification.toLowerCase().includes(val.toLowerCase())
//       )
//     })
//     // Ordenar por `dateTimeEvent` en orden decreciente
//     const sortedEvents = value.sort((a, b) => new Date(Number(b.dateTimeEvent)) - new Date(Number(a.dateTimeEvent)))

//     setFilterEvents(sortedEvents)
//     setDisplayedEvents(sortedEvents.slice(0, itemsPerPage)) // Reiniciar el paginado al aplicar filtro
//     setPage(1)
//   }

//   const RenderItem = memo(({ item, onPress }) => {
//     return (
//       <TouchableOpacity style={styles.item}>
//         <Pressable onPress={onPress}>
//           <Text style={styles.itemDate}>📅 {new Date(Number(item.dateTimeEvent)).toDateString()}</Text>
//           <Text style={styles.itemText}>{item.type} - "{item.classification} - {item.classificationDescription}"</Text>
//           <Text style={styles.itemData}>➡️ {item.riskQualification}</Text>
//           <Text style={styles.itemData}>{item.ticketCustomDescription}</Text>
//         </Pressable>
//       </TouchableOpacity>
//     )
//   })

//   const handlePress = useCallback((item) => {
//     router.navigate({ pathname: '/report/searchEvent/Components/[event]', params: item })
//   }, [router])

//   const loadMoreItems = () => {
//     if (displayedEvents.length < filterEvents.length) {
//       setPage(prevPage => prevPage + 1)
//     }
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <Stack.Screen
//         options={{
//           title: 'Search Screen'
//         }}
//       />
//       <TextInput
//         style={{ margin: 30, width: 350, alignSelf: 'center' }}
//         mode='outlined'
//         left={<TextInput.Icon icon='magnify' />}
//         placeholder='Search...'
//         onChangeText={val => handleFilter(val)}
//       />
//       <Text style={{ padding: 10 }}>{filterEvents.length} open events found...</Text>

//       <FlatList
//         data={displayedEvents}
//         renderItem={({ item }) => (
//           <RenderItem item={item} onPress={() => handlePress(item)} />
//         )}
//         keyExtractor={(item) => item.idTicketNew.toString()} // Utilizar solo keyExtractor
//         onEndReached={loadMoreItems}
//         onEndReachedThreshold={0.2} // Cargar más elementos cuando el usuario esté cerca del final
//       />
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop: 30,
//     marginLeft: 5
//   },
//   item: {
//     backgroundColor: 'lightgray',
//     flex: 1,
//     borderRadius: 7,
//     padding: 10,
//     marginRight: 10,
//     marginTop: 25,
//     paddingBottom: 20
//   },
//   itemDate: {
//     color: 'black',
//     fontSize: 15,
//     fontWeight: 'bold',
//     paddingBottom: 30,
//     paddingLeft: 120
//   },
//   itemText: {
//     color: 'black',
//     fontSize: 14,
//     fontWeight: 'bold'
//   },
//   itemData: {
//     color: 'darkgray',
//     fontSize: 14
//   }
// })

// export default searchEvent

// // VERSION 4
// import { useState, useEffect, memo, useCallback } from 'react'
// import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
// // import { Pressable, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
// import { FlatList, View } from 'react-native'
// import { Text, TextInput } from 'react-native-paper'
// import CardComponent from './Components/CardComponent'

// const searchEvent = () => {
//   const router = useRouter()
//   let { allTicketsOpen } = useLocalSearchParams()
//   allTicketsOpen = JSON.parse(allTicketsOpen).sort((a, b) => new Date(Number(b.dateTimeEvent)) - new Date(Number(a.dateTimeEvent)))

//   // states
//   const [filterEvents, setFilterEvents] = useState(allTicketsOpen)
//   const [displayedEvents, setDisplayedEvents] = useState([]) // Para almacenar eventos paginados
//   const [page, setPage] = useState(1)
//   const itemsPerPage = 5

//   // Actualiza los elementos a mostrar cuando cambia el page o filterEvents
//   useEffect(() => {
//     const start = (page - 1) * itemsPerPage
//     const end = start + itemsPerPage
//     setDisplayedEvents(filterEvents.slice(0, end)) // Mostrar solo hasta el final de la página actual
//   }, [page, filterEvents])

//   const handleFilter = (val) => {
//     const value = allTicketsOpen.filter(el => {
//       return (
//         el.ticketCustomDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.classificationDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.companySectorDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.subType.toLowerCase().includes(val.toLowerCase()) ||
//         el.type.toLowerCase().includes(val.toLowerCase()) ||
//         el.solutionType.toLowerCase().includes(val.toLowerCase()) ||
//         el.riskQualification.toLowerCase().includes(val.toLowerCase())
//       )
//     })
//     // Ordenar por `dateTimeEvent` en orden decreciente
//     const sortedEvents = value.sort((a, b) => new Date(Number(b.dateTimeEvent)) - new Date(Number(a.dateTimeEvent)))

//     setFilterEvents(sortedEvents)
//     setDisplayedEvents(sortedEvents.slice(0, itemsPerPage)) // Reiniciar el paginado al aplicar filtro
//     setPage(1)
//   }

//   const RenderItem = memo(({ item, onPress }) => {
//     return (
//       <CardComponent item={item} onPress={onPress} />
//     )
//   })

//   const handlePress = useCallback((item) => {
//     router.navigate({ pathname: '/report/searchEvent/Components/[event]', params: item })
//   }, [router])

//   const loadMoreItems = () => {
//     if (displayedEvents.length < filterEvents.length) {
//       setPage(prevPage => prevPage + 1)
//     }
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <Stack.Screen
//         options={{
//           title: 'Search Screen'
//         }}
//       />
//       <TextInput
//         style={{ margin: 30, width: 350, alignSelf: 'center' }}
//         mode='outlined'
//         left={<TextInput.Icon icon='magnify' />}
//         placeholder='Search...'
//         onChangeText={val => handleFilter(val)}
//       />
//       <Text style={{ padding: 10 }}>{filterEvents.length} open events found...</Text>

//       <FlatList
//         data={displayedEvents}
//         renderItem={({ item }) => (
//           <RenderItem item={item} onPress={() => handlePress(item)} />
//         )}
//         keyExtractor={(item) => item.idTicketNew.toString()} // Utilizar solo keyExtractor
//         onEndReached={loadMoreItems}
//         onEndReachedThreshold={0.2} // Cargar más elementos cuando el usuario esté cerca del final
//       />
//     </View>
//   )
// }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     marginTop: 30,
// //     marginLeft: 5
// //   },
// //   item: {
// //     backgroundColor: 'lightgray',
// //     flex: 1,
// //     borderRadius: 7,
// //     padding: 10,
// //     marginRight: 10,
// //     marginTop: 25,
// //     paddingBottom: 20
// //   },
// //   itemDate: {
// //     color: 'black',
// //     fontSize: 15,
// //     fontWeight: 'bold',
// //     paddingBottom: 30,
// //     paddingLeft: 120
// //   },
// //   itemText: {
// //     color: 'black',
// //     fontSize: 14,
// //     fontWeight: 'bold'
// //   },
// //   itemData: {
// //     color: 'darkgray',
// //     fontSize: 14
// //   }
// // })

// export default searchEvent

// // VERSION 5
// import { useState, useEffect, memo, useCallback } from 'react'
// import { Stack, useRouter } from 'expo-router'
// import { FlatList, View, Dimensions } from 'react-native'
// import { Text, TextInput } from 'react-native-paper'

// // Custom modules
// import CardComponent from './Components/CardComponent'
// import { useAsyncStorage } from '../../../../context/hooks/ticketNewQH'
// import CustomActivityIndicator from '../../../../globals/components/CustomActivityIndicator'

// const WIDTH = Dimensions.get('window').width

// const SearchEvent = () => {
//   const router = useRouter()
//   let { value: allTicketsOpen, loading } = useAsyncStorage('CTRLA_TICKETS_DATA')
//   const { value: generalData, loading2 } = useAsyncStorage('CTRLA_GENERAL_DATA')
//   // const allUsersFromMyCompany = useAllUsersFromMyCompany()

//   // states
//   const [filterEvents, setFilterEvents] = useState([])
//   const [displayedEvents, setDisplayedEvents] = useState([]) // Para almacenar eventos paginados
//   const [page, setPage] = useState(1)
//   const itemsPerPage = 5
//   const [allUsers, setAllUsers] = useState(null)

//   // Actualiza los elementos a mostrar cuando cambia el page o filterEvents
//   useEffect(() => {
//     if (filterEvents) {
//       const start = (page - 1) * itemsPerPage
//       const end = start + itemsPerPage
//       setDisplayedEvents(filterEvents.slice(0, end)) // Mostrar solo hasta el final de la página actual
//     }
//   }, [page, filterEvents])

//   useEffect(() => {
//     if (!loading) {
//       allTicketsOpen = allTicketsOpen?.sort((a, b) => new Date(Number(b.dateTimeEvent)) - new Date(Number(a.dateTimeEvent)))
//       setFilterEvents(allTicketsOpen)
//     }
//   }, [allTicketsOpen, loading])

//   useEffect(() => {
//     if (!loading2) {
//       setAllUsers(generalData?.allUsersFromMyCompany)
//     }
//   }, [generalData, loading2])
//   // console.log('allUsers', allUsers)
//   const handleFilter = (val) => {
//     const value = allTicketsOpen.filter(el => {
//       return (
//         el.ticketCustomDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.classificationDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.companySectorDescription.toLowerCase().includes(val.toLowerCase()) ||
//         el.subType.toLowerCase().includes(val.toLowerCase()) ||
//         el.type.toLowerCase().includes(val.toLowerCase()) ||
//         el.solutionType.toLowerCase().includes(val.toLowerCase()) ||
//         el.riskQualification.toLowerCase().includes(val.toLowerCase()) ||
//         el.idUser === allUsers.filter(eln => {
//           return (
//             eln.fullName.toLowerCase().includes(val.toLowerCase())
//           )
//         })[0]?.idUser
//       )
//     })
//     // Ordenar por `dateTimeEvent` en orden decreciente
//     const sortedEvents = value.sort((a, b) => new Date(Number(b.dateTimeEvent)) - new Date(Number(a.dateTimeEvent)))
//     setFilterEvents(sortedEvents)
//     setDisplayedEvents(sortedEvents.slice(0, itemsPerPage)) // Reiniciar el paginado al aplicar filtro
//     setPage(1)
//   }

//   const RenderItem = memo(({ item, onPress }) => {
//     return (
//       <CardComponent item={item} onPress={onPress} />
//     )
//   })
//   RenderItem.displayName = 'RenderItem'

//   const handlePress = useCallback((item) => {
//     router.navigate({ pathname: '/report/searchEvent/Components/[event]', params: item })
//   }, [router])

//   const loadMoreItems = () => {
//     if (displayedEvents.length < filterEvents.length) {
//       setPage(prevPage => prevPage + 1)
//     }
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <Stack.Screen
//         options={{
//           title: 'Search Screen'
//         }}
//       />
//       <TextInput
//         style={{ margin: 10, width: WIDTH - 50, alignSelf: 'center' }}
//         mode='outlined'
//         left={<TextInput.Icon icon='magnify' />}
//         placeholder='Search...'
//         onChangeText={val => {
//           const timmerSearch = setTimeout(() => {
//             handleFilter(val)
//           }, 200)
//           return () => clearTimeout(timmerSearch)
//         }}
//       />
//       {loading
//         ? (
//           <CustomActivityIndicator />
//           )
//         : (
//           <>
//             <Text style={{ padding: 5 }}>{filterEvents.length} open tickets found...</Text>
//             <FlatList
//               data={displayedEvents}
//               renderItem={({ item }) => (
//                 <RenderItem item={item} onPress={() => handlePress(item)} />
//               )}
//               keyExtractor={(item) => item.idTicketNew.toString()} // Utilizar solo keyExtractor
//               onEndReached={loadMoreItems}
//               onEndReachedThreshold={0.2}
//             />
//           </>
//           )}
//     </View>
//   )
// }

// export default SearchEvent

// VERSION 6
// import { useState, useEffect, memo, useCallback, useMemo } from 'react'
// import { View, FlatList, Dimensions } from 'react-native'
// import { Stack, useRouter } from 'expo-router'
// import { Text, TextInput } from 'react-native-paper'

// import CardComponent from './Components/CardComponent'
// import { useAsyncStorage } from '../../../../context/hooks/ticketNewQH'
// import CustomActivityIndicator from '../../../../globals/components/CustomActivityIndicator'

// const WIDTH = Dimensions.get('window').width
// const ITEMS_PER_PAGE = 5

// const SearchEvent = () => {
//   const router = useRouter()

//   // const { value: ticketsRaw, loading, error: ticketsError } = useAsyncStorage('CTRLA_TICKETS_DATA') || [{}]
//   // const { value: generalDataRaw, loading: loadingGeneralData, error: generalError } = useAsyncStorage('CTRLA_GENERAL_DATA') || [{}]
//   const { value: ticketsRaw, loading, error: ticketsError } = useAsyncStorage('CTRLA_TICKETS_DATA') || { value: [], loading: false, error: null }
//   const { value: generalDataRaw, loading: loadingGeneralData, error: generalError } = useAsyncStorage('CTRLA_GENERAL_DATA') || { value: { allUsersFromMyCompany: [] }, loading: false, error: null }

//   const [filterEvents, setFilterEvents] = useState([])
//   const [displayedEvents, setDisplayedEvents] = useState([])
//   const [page, setPage] = useState(1)
//   const [allUsers, setAllUsers] = useState([])

//   const allTicketsOpen = useMemo(() => {
//     if (!ticketsRaw || !Array.isArray(ticketsRaw)) return []
//     return [...ticketsRaw].sort((a, b) => new Date(b.dateTimeEvent) - new Date(a.dateTimeEvent))
//   }, [ticketsRaw])

//   useEffect(() => {
//     if (!loading && Array.isArray(allTicketsOpen) && allTicketsOpen.length > 0) {
//       setFilterEvents(allTicketsOpen)
//     } else {
//       setFilterEvents([])
//     }
//   }, [allTicketsOpen, loading])

//   useEffect(() => {
//     if (!loadingGeneralData && generalDataRaw?.allUsersFromMyCompany) {
//       setAllUsers(generalDataRaw?.allUsersFromMyCompany)
//     }
//   }, [generalDataRaw, loadingGeneralData])

//   useEffect(() => {
//     // const start = 0
//     const end = page * ITEMS_PER_PAGE
//     setDisplayedEvents(filterEvents?.slice(0, end))
//   }, [page, filterEvents])

//   const handleFilter = useCallback((val) => {
//     const term = val.toLowerCase()
//     if (!Array.isArray(allTicketsOpen)) return

//     const result = allTicketsOpen?.filter(el => {
//       const user = allUsers?.find(u => u?.idUser === el?.idUser)
//       const userName = user?.fullName?.toLowerCase() || ''

//       return (
//         el?.ticketCustomDescription?.toLowerCase()?.includes(term) ||
//         el?.classificationDescription?.toLowerCase()?.includes(term) ||
//         el?.companySectorDescription?.toLowerCase()?.includes(term) ||
//         el?.subType?.toLowerCase()?.includes(term) ||
//         el?.type?.toLowerCase()?.includes(term) ||
//         el?.solutionType?.toLowerCase()?.includes(term) ||
//         el?.riskQualification?.toLowerCase()?.includes(term) ||
//         userName?.includes(term)
//       )
//     })

//     const sorted = result.sort((a, b) => new Date(b.dateTimeEvent) - new Date(a.dateTimeEvent))
//     setFilterEvents(sorted)
//     setPage(1)
//   }, [allTicketsOpen, allUsers])

//   const handlePress = useCallback((item) => {
//     router.navigate({ pathname: '/report/searchEvent/Components/[event]', params: item })
//   }, [router])

//   const loadMoreItems = () => {
//     if (displayedEvents?.length < filterEvents?.length) {
//       setPage(prev => prev + 1)
//     }
//   }

//   const RenderItem = memo(({ item, onPress }) => (
//     <CardComponent item={item} onPress={onPress} />
//   ))
//   RenderItem.displayName = 'RenderItem'

//   const showError = ticketsError || generalError || (!Array.isArray(ticketsRaw) && !loading)

//   return (
//     <View style={{ flex: 1 }}>
//       <Stack.Screen options={{ title: 'Search Screen' }} />

//       <TextInput
//         style={{ margin: 10, width: WIDTH - 50, alignSelf: 'center' }}
//         mode='outlined'
//         placeholder='Search...'
//         left={<TextInput.Icon icon='magnify' />}
//         onChangeText={(val) => {
//           const timer = setTimeout(() => handleFilter(val), 200)
//           return () => clearTimeout(timer)
//         }}
//       />

//       {loading || loadingGeneralData
//         ? (
//           <CustomActivityIndicator />
//           )
//         : showError
//           ? (
//             <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>
//               Ocurrió un error al cargar los datos...
//             </Text>
//             )
//           : (
//             <>
//               <Text style={{ padding: 5 }}>{filterEvents?.length} open tickets found...</Text>
//               <FlatList
//                 data={displayedEvents}
//                 keyExtractor={item => item?.idTicketNew?.toString() || Math.random().toString()}
//                 renderItem={({ item }) => (
//                   <RenderItem item={item} onPress={() => handlePress(item)} />
//                 )}
//                 onEndReached={loadMoreItems}
//                 onEndReachedThreshold={0.2}
//               />
//             </>
//             )}
//     </View>
//   )
// }

// export default SearchEvent

// // version 7
// import { useState, useEffect, memo, useCallback, useMemo } from 'react'
// import { View, FlatList, Dimensions } from 'react-native'
// import { Stack, useRouter } from 'expo-router'
// import { Text, TextInput } from 'react-native-paper'
// import { useDebounce } from 'use-debounce'

// import CardComponent from './Components/CardComponent'
// import { useAsyncStorage } from '../../../../context/hooks/ticketNewQH'
// import CustomActivityIndicator from '../../../../globals/components/CustomActivityIndicator'

// const WIDTH = Dimensions.get('window').width
// const ITEMS_PER_PAGE = 5

// const SearchEvent = () => {
//   const router = useRouter()
//   const { value: ticketsRaw = [], loading, error: ticketsError } = useAsyncStorage('CTRLA_TICKETS_DATA') || {}
//   const { value: generalDataRaw = { allUsersFromMyCompany: [] }, loading: loadingGeneralData, error: generalError } = useAsyncStorage('CTRLA_GENERAL_DATA') || {}

//   const [filterEvents, setFilterEvents] = useState([])
//   const [displayedEvents, setDisplayedEvents] = useState([])
//   const [page, setPage] = useState(1)
//   const [allUsers, setAllUsers] = useState([])
//   const [searchTerm, setSearchTerm] = useState('')
//   const [debouncedSearchTerm] = useDebounce(searchTerm, 200)

//   const allTicketsOpen = useMemo(() => {
//     if (!Array.isArray(ticketsRaw)) return []
//     return [...ticketsRaw].sort((a, b) => new Date(b.dateTimeEvent) - new Date(a.dateTimeEvent))
//   }, [ticketsRaw])

//   useEffect(() => {
//     if (!loading && Array.isArray(allTicketsOpen)) {
//       setFilterEvents(allTicketsOpen)
//     } else {
//       setFilterEvents([])
//     }
//   }, [allTicketsOpen, loading])

//   useEffect(() => {
//     if (!loadingGeneralData && Array.isArray(generalDataRaw?.allUsersFromMyCompany)) {
//       setAllUsers(generalDataRaw?.allUsersFromMyCompany)
//     } else {
//       setAllUsers([])
//     }
//   }, [generalDataRaw, loadingGeneralData])

//   useEffect(() => {
//     const end = page * ITEMS_PER_PAGE
//     setDisplayedEvents(filterEvents?.slice(0, end))
//   }, [page, filterEvents])

//   const handleFilter = useCallback(
//     (term) => {
//       if (!term || !Array.isArray(allTicketsOpen)) {
//         setFilterEvents(allTicketsOpen)
//         setPage(1)
//         return
//       }

//       const lowerTerm = term?.toLowerCase()
//       const result = allTicketsOpen?.filter((el) => {
//         const user = allUsers?.find((u) => u?.idUser === el?.idUser)
//         const userName = user?.fullName?.toLowerCase() || ''

//         return (
//           el?.ticketCustomDescription?.toLowerCase()?.includes(lowerTerm) ||
//           el?.classificationDescription?.toLowerCase()?.includes(lowerTerm) ||
//           el?.companySectorDescription?.toLowerCase()?.includes(lowerTerm) ||
//           el?.subType?.toLowerCase()?.includes(lowerTerm) ||
//           el?.type?.toLowerCase()?.includes(lowerTerm) ||
//           el?.solutionType?.toLowerCase()?.includes(lowerTerm) ||
//           el?.riskQualification?.toLowerCase()?.includes(lowerTerm) ||
//           userName?.includes(lowerTerm)
//         )
//       })

//       const sorted = result.sort((a, b) => new Date(b.dateTimeEvent) - new Date(a.dateTimeEvent))
//       setFilterEvents(sorted)
//       setPage(1)
//     },
//     [allTicketsOpen, allUsers]
//   )

//   useEffect(() => {
//     handleFilter(debouncedSearchTerm)
//   }, [debouncedSearchTerm, handleFilter])

//   const handlePress = useCallback(
//     (item) => {
//       if (item?.idTicketNew) {
//         router.navigate({
//           pathname: '/report/searchEvent/Components/[event]',
//           params: { idTicketNew: item?.idTicketNew, ...item }
//         })
//       }
//     },
//     [router]
//   )

//   const loadMoreItems = () => {
//     if (displayedEvents?.length < filterEvents?.length) {
//       setPage((prev) => prev + 1)
//     }
//   }

//   const RenderItem = memo(({ item, onPress }) => <CardComponent item={item} onPress={onPress} />)
//   RenderItem.displayName = 'RenderItem'

//   const showError = ticketsError || generalError || (!Array.isArray(ticketsRaw) && !loading)

//   return (
//     <View style={{ flex: 1 }}>
//       <Stack.Screen options={{ title: 'Search Screen' }} />

//       <TextInput
//         style={{ margin: 10, width: WIDTH - 50, alignSelf: 'center' }}
//         mode='outlined'
//         placeholder='Search...'
//         left={<TextInput.Icon icon='magnify' />}
//         onChangeText={setSearchTerm}
//         value={searchTerm}
//       />

//       {loading || loadingGeneralData
//         ? (
//           <CustomActivityIndicator />
//           )
//         : showError
//           ? (
//             <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>
//               Ocurrió un error al cargar los datos...
//             </Text>
//             )
//           : (
//             <>
//               <Text style={{ padding: 5 }}>{filterEvents?.length} open tickets found...</Text>
//               <FlatList
//                 data={displayedEvents}
//                 keyExtractor={(item, index) => item?.idTicketNew?.toString() || `fallback-${index}`}
//                 renderItem={({ item }) => <RenderItem item={item} onPress={() => handlePress(item)} />}
//                 onEndReached={loadMoreItems}
//                 onEndReachedThreshold={0.2}
//               />
//             </>
//             )}
//     </View>
//   )
// }

// export default SearchEvent

// version 8
import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react'
import { View, FlatList, Dimensions, RefreshControl, TouchableOpacity } from 'react-native'
import { Stack, useRouter, useLocalSearchParams } from 'expo-router'
import { Text, Searchbar, useTheme, IconButton, Badge } from 'react-native-paper'
import { useDebounce } from 'use-debounce'
import { useApolloClient } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import BottomSheet from '@gorhom/bottom-sheet'

import EventCard from '../../home/components/EventCard'
import { useAsyncStorage } from '../../../../context/hooks/ticketNewQH'
import CustomActivityIndicator from '../../../../globals/components/CustomActivityIndicator'
import FilterDrawer from './Components/FilterDrawer'
// import CardXComponent from './Components/CardXComponent.jsx'
// import { EMARAY_MOVILE_GIF, EMARAY_CAMERA_JPG } from '../../../../globals/variables/globalVariables.js'

const WIDTH = Dimensions.get('window').width
const ITEMS_PER_PAGE = 5

// Red scale colors for risk qualification
const riskColors = {
  0: '#8B0000', // Dark red - Catastrophic/Extremely Dangerous/Very Dangerous
  1: '#DC143C', // Crimson - Dangerous/Very Serious
  2: '#FF6347', // Tomato - Serious/Warning
  3: '#FFA07A', // Light salmon - Low warning/Inconsequential/Secure Event
  null: '#FFE4E1' // Misty rose - default/unknown
}

// Yellow scale colors for solution type
const solutionColors = {
  0: '#FFFF99', // Light yellow - Resolved
  1: '#FFD700', // Gold - Pending action
  2: '#FFA500', // Orange - Partial action
  3: '#FF8C00', // Dark orange - Immediate action
  null: '#FFE4B5' // Moccasin - default/unknown
}

// Convert risk qualification to color index
function switchRisk (risk) {
  const mapping = {
    Catastrophic: 0,
    'Extremely Dangerous': 0,
    'Very Dangerous': 0,
    Dangerous: 1,
    'Very Serious': 1,
    Serious: 2,
    Warning: 2,
    'Low warning': 3,
    Inconsequential: 3,
    'Secure Event': 3
  }
  return mapping[risk] ?? null
}

// Convert solution type to color index
function switchSolution (solution) {
  const mapping = {
    Resolved: 0,
    'Pending action': 1,
    'Partial action': 2,
    'Immediate action': 3
  }
  return mapping[solution] ?? null
}

// Get risk color from risk qualification string
function getRiskColor (riskQualification) {
  const index = switchRisk(riskQualification)
  return riskColors[index] || riskColors.null
}

// Get solution color from solution type string
function getSolutionColor (solutionType) {
  const index = switchSolution(solutionType)
  return solutionColors[index] || solutionColors.null
}

const SearchEvent = () => {
  const { t } = useTranslation('report')
  const router = useRouter()
  const theme = useTheme()
  const client = useApolloClient()
  const params = useLocalSearchParams()
  // Check for filter params immediately to prevent modal from opening
  const hasFilterParamsOnMount = useMemo(() => {
    const filterParamKeys = [
      'filterType',
      'filterRiskQualification',
      'filterSolutionType',
      'filterClassificationDescription',
      'filterCompanySectorDescription',
      'filterSubType'
    ]
    return params && filterParamKeys.some(key => params[key])
  }, [params])

  const [refreshing, setRefreshing] = useState(false)
  const isNavigatingFromChip = useRef(false)
  const bottomSheetRef = useRef(null)
  const processedParamsRef = useRef('')

  // Acceso seguro a async storage para tickets
  const { value: ticketsRaw = [], loading: loadingTickets, error: ticketsError } = useAsyncStorage('CTRLA_TICKETS_DATA')
  // Acceso seguro a async storage para datos generales
  const { value: generalDataRaw = { allUsersFromMyCompany: [] }, loading: loadingGeneralData, error: generalError } = useAsyncStorage('CTRLA_GENERAL_DATA')

  const [filterEvents, setFilterEvents] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 200)
  const [activeFilters, setActiveFilters] = useState({})

  const allTicketsOpen = useMemo(() => {
    if (!Array.isArray(ticketsRaw)) return []
    try {
      return [...ticketsRaw].sort((a, b) => new Date(Number(b?.dateTimeEvent)) - new Date(Number(a?.dateTimeEvent)))
    } catch (error) {
      return []
    }
  }, [ticketsRaw])

  useEffect(() => {
    // Initialize filterEvents when data is available
    if (!loadingTickets) {
      if (Array.isArray(allTicketsOpen) && allTicketsOpen.length > 0) {
        setFilterEvents(allTicketsOpen)
      } else if (Array.isArray(allTicketsOpen) && allTicketsOpen.length === 0) {
        // Explicitly set empty array if data is loaded but empty
        setFilterEvents([])
      }
    }
  }, [allTicketsOpen, loadingTickets])

  useEffect(() => {
    if (!loadingGeneralData && Array.isArray(generalDataRaw?.allUsersFromMyCompany)) {
      setAllUsers(generalDataRaw?.allUsersFromMyCompany)
    } else {
      setAllUsers([])
    }
  }, [generalDataRaw, loadingGeneralData])

  // Ensure bottom sheet stays closed when navigating from chips (before first render)
  useLayoutEffect(() => {
    if (hasFilterParamsOnMount) {
      isNavigatingFromChip.current = true
      // Close bottom sheet if it's open
      bottomSheetRef.current?.close()
    } else {
      isNavigatingFromChip.current = false
    }
  }, [hasFilterParamsOnMount])

  // Handle initial filters from route params (when navigating from chips)
  // Process params only once to prevent infinite loops
  useEffect(() => {
    // Check if we have filter params (indicating navigation from chip click)
    const filterParamKeys = [
      'filterType',
      'filterRiskQualification',
      'filterSolutionType',
      'filterClassificationDescription',
      'filterCompanySectorDescription',
      'filterSubType'
    ]

    const hasFilterParams = params && filterParamKeys.some(key => params[key])
    
    // Create a unique key from current params to track if we've processed them
    const paramsKey = filterParamKeys
      .map(key => `${key}:${params[key] || ''}`)
      .join('|')

    // Only process if we have params and haven't processed this exact set before
    if (hasFilterParams && processedParamsRef.current !== paramsKey) {
      // Mark these params as processed immediately
      processedParamsRef.current = paramsKey
      
      // Mark that we're navigating from a chip
      isNavigatingFromChip.current = true
      // Explicitly close bottom sheet when navigating from chips
      bottomSheetRef.current?.close()
      
      const initialFilters = {}
      
      if (params.filterType) {
        initialFilters.type = [String(params.filterType).toLowerCase()]
      }
      if (params.filterRiskQualification) {
        initialFilters.riskQualification = [String(params.filterRiskQualification)]
      }
      if (params.filterSolutionType) {
        initialFilters.solutionType = [String(params.filterSolutionType)]
      }
      if (params.filterClassificationDescription) {
        initialFilters.classificationDescription = [String(params.filterClassificationDescription)]
      }
      if (params.filterCompanySectorDescription) {
        initialFilters.companySectorDescription = [String(params.filterCompanySectorDescription)]
      }
      if (params.filterSubType) {
        initialFilters.subType = [String(params.filterSubType)]
      }

      if (Object.keys(initialFilters).length > 0) {
        // Reset flag to allow filter application useEffect to run
        isNavigatingFromChip.current = false
        // Apply filters - this will trigger the filter useEffect below
        setActiveFilters(initialFilters)
      }

      // Clear filter params from route immediately to prevent re-processing
      setTimeout(() => {
        try {
          const clearedParams = {}
          filterParamKeys.forEach(key => {
            if (params[key]) {
              clearedParams[key] = ''
            }
          })
          if (Object.keys(clearedParams).length > 0) {
            router.setParams(clearedParams)
          }
          // Reset the flag after clearing params
          isNavigatingFromChip.current = false
        } catch (error) {
          console.debug('Could not clear filter params:', error)
          isNavigatingFromChip.current = false
        }
      }, 100)
    }
  }, [params, router])

  const handleFilter = useCallback(
    (term, filters) => {
      if (!Array.isArray(allTicketsOpen)) {
        setFilterEvents([])
        return
      }

      // Mobile app always shows only open tickets - filter out closed ones
      let result = allTicketsOpen.filter((el) => !el?.ticketClosed)

      // Apply text search filter
      if (term && term.trim()) {
        const lowerTerm = term.toLowerCase()
        result = result.filter((el) => {
          const user = allUsers?.find((u) => u?.idUser === el?.idUser)
          const userName = user?.fullName?.toLowerCase() || ''

          return (
            el?.ticketCustomDescription?.toLowerCase()?.includes(lowerTerm) ||
            el?.classificationDescription?.toLowerCase()?.includes(lowerTerm) ||
            el?.companySectorDescription?.toLowerCase()?.includes(lowerTerm) ||
            el?.subType?.toLowerCase()?.includes(lowerTerm) ||
            el?.type?.toLowerCase()?.includes(lowerTerm) ||
            el?.solutionType?.toLowerCase()?.includes(lowerTerm) ||
            el?.riskQualification?.toLowerCase()?.includes(lowerTerm) ||
            userName?.includes(lowerTerm)
          )
        })
      }

      // Apply active filters (AND logic across categories, OR logic within category)
      if (filters && Object.keys(filters).length > 0) {
        result = result.filter((el) => {
          // Type filter - case insensitive matching
          if (filters.type && filters.type.length > 0) {
            const elType = String(el?.type || '').toLowerCase()
            const filterTypes = filters.type.map(t => String(t).toLowerCase())
            if (!filterTypes.includes(elType)) return false
          }

          // Risk Qualification filter - exact match
          if (filters.riskQualification && filters.riskQualification.length > 0) {
            const elRisk = String(el?.riskQualification || '')
            if (!filters.riskQualification.includes(elRisk)) return false
          }

          // Solution Type filter - exact match
          if (filters.solutionType && filters.solutionType.length > 0) {
            const elSolution = String(el?.solutionType || '')
            if (!filters.solutionType.includes(elSolution)) return false
          }

          // Classification Description filter - exact match
          if (filters.classificationDescription && filters.classificationDescription.length > 0) {
            const elClassification = String(el?.classificationDescription || '')
            if (!filters.classificationDescription.includes(elClassification)) return false
          }

          // Company Sector Description filter - exact match
          if (filters.companySectorDescription && filters.companySectorDescription.length > 0) {
            const elSector = String(el?.companySectorDescription || '')
            if (!filters.companySectorDescription.includes(elSector)) return false
          }

          // Sub Type filter - exact match
          if (filters.subType && filters.subType.length > 0) {
            const elSubType = String(el?.subType || '')
            if (!filters.subType.includes(elSubType)) return false
          }

          // Note: Status filter removed - mobile app always shows only open tickets
          // Closed tickets are already filtered out at the start of handleFilter

          return true
        })
      }

      const sorted = result
        .sort((a, b) => new Date(Number(b?.dateTimeEvent)) - new Date(Number(a?.dateTimeEvent)))
      setFilterEvents(sorted)
    }, [allTicketsOpen, allUsers]
  )

  // Apply filters when search term or active filters change
  // Only apply filters after data is fully loaded
  useEffect(() => {
    // Only apply filters if data is loaded and we have tickets data
    // Skip if we're still processing params to prevent loops
    if (!loadingTickets && !loadingGeneralData && Array.isArray(allTicketsOpen) && !isNavigatingFromChip.current) {
      handleFilter(debouncedSearchTerm || '', activeFilters || {})
    }
  }, [debouncedSearchTerm, activeFilters, handleFilter, loadingTickets, loadingGeneralData, allTicketsOpen])

  const handleFiltersChange = useCallback((filters) => {
    setActiveFilters(filters)
    // Filter will be applied in useEffect above
  }, [])

  const openFilterSheet = useCallback(() => {
    // Don't open bottom sheet if we're navigating from a chip
    if (isNavigatingFromChip.current) {
      isNavigatingFromChip.current = false
      return
    }
    bottomSheetRef.current?.expand()
  }, [])

  const closeFilterSheet = useCallback(() => {
    bottomSheetRef.current?.close()
  }, [])

  const getActiveFilterCount = useCallback(() => {
    return Object.values(activeFilters).reduce((count, arr) => count + (arr?.length || 0), 0)
  }, [activeFilters])

  const handlePress = useCallback(
    (item) => {
      // console.log('item', item)
      if (item?.idTicketNew) {
        router.push({
          pathname: '/report/searchEvent/Components/[event]',
          params: { param: JSON.stringify(item) }
        })
      }
    },
    [router]
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await client.refetchQueries({ include: 'active' })
    } catch (error) {
      console.error('Error refreshing search:', error)
    } finally {
      setRefreshing(false)
    }
  }, [client])

  // Transform item to EventCard format
  const transformItemForEventCard = useCallback((item) => {
    return {
      result: item,
      risk: {
        RiskDot: switchRisk(item?.riskQualification),
        SolutionDot: switchSolution(item?.solutionType),
        riskColor: getRiskColor(item?.riskQualification),
        solutionColor: getSolutionColor(item?.solutionType)
      }
    }
  }, [])

  // Only show error if there's an actual error AND loading is complete
  const showError = (ticketsError || generalError) && !loadingTickets && !loadingGeneralData

  const activeFilterCount = getActiveFilterCount()

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: t('search.title') }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 8 }}>
        <Searchbar
          placeholder={t('search.placeholder')}
          onChangeText={setSearchTerm}
          value={searchTerm}
          style={{ flex: 1, marginRight: 8, elevation: 2 }}
          inputStyle={{ fontSize: 14 }}
        />
        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={openFilterSheet} activeOpacity={0.7}>
            <IconButton
              icon='filter-variant'
              size={24}
              iconColor={theme.colors.onSurface}
              style={{ margin: 0 }}
            />
          </TouchableOpacity>
          {activeFilterCount > 0 && (
            <Badge
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: theme.colors.error,
                minWidth: 20,
                height: 20,
                pointerEvents: 'none'
              }}
            >
              {activeFilterCount}
            </Badge>
          )}
        </View>
      </View>

      {loadingTickets || loadingGeneralData
        ? (
          <CustomActivityIndicator />
          )
        : showError
          ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ color: theme.colors.error, textAlign: 'center' }}>
                Ocurrió un error al cargar los datos...
              </Text>
            </View>
            )
          : (
            <>
              <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}>
                  {filterEvents?.length || 0} {filterEvents?.length === 1 ? 'event' : 'events'} found
                </Text>
              </View>
              <FlatList
                data={filterEvents}
                keyExtractor={(item, index) => item?.idTicketNew?.toString() || `fallback-${index}`}
                renderItem={({ item }) => (
                  <EventCard
                    item={transformItemForEventCard(item)}
                    onPress={() => handlePress(item)}
                  />
                )}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]}
                    tintColor={theme.colors.primary}
                  />
                }
                contentContainerStyle={{ paddingBottom: 16 }}
                ListEmptyComponent={
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                    <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', fontSize: 16 }}>
                      {searchTerm ? 'No events found matching your search' : 'No events available'}
                    </Text>
                  </View>
                }
              />
            </>
            )}
      <FilterDrawer
        bottomSheetRef={bottomSheetRef}
        activeFilters={activeFilters}
        onFiltersChange={handleFiltersChange}
        allEvents={allTicketsOpen}
        allUsers={allUsers}
      />
    </View>
  )
}

export default SearchEvent
