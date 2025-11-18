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
import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, FlatList, Dimensions } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Text, TextInput } from 'react-native-paper'
import { useDebounce } from 'use-debounce'

import CardComponent from './Components/CardComponent.jsx'
import { useAsyncStorage } from '../../../../context/hooks/ticketNewQH.js'
import CustomActivityIndicator from '../../../../globals/components/CustomActivityIndicator.js'
// import CardXComponent from './Components/CardXComponent.jsx'
// import { EMARAY_MOVILE_GIF, EMARAY_CAMERA_JPG } from '../../../../globals/variables/globalVariables.js'

const WIDTH = Dimensions.get('window').width
const ITEMS_PER_PAGE = 5

const SearchEvent = () => {
  const router = useRouter()

  // Acceso seguro a async storage para tickets
  const { value: ticketsRaw = [], loading: loadingTickets, error: ticketsError } = useAsyncStorage('CTRLA_TICKETS_DATA')
  // Acceso seguro a async storage para datos generales
  const { value: generalDataRaw = { allUsersFromMyCompany: [] }, loading: loadingGeneralData, error: generalError } = useAsyncStorage('CTRLA_GENERAL_DATA')

  const [filterEvents, setFilterEvents] = useState([])
  const [displayedEvents, setDisplayedEvents] = useState([])
  const [page, setPage] = useState(1)
  const [allUsers, setAllUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 200)

  const allTicketsOpen = useMemo(() => {
    if (!Array.isArray(ticketsRaw)) return []
    try {
      return [...ticketsRaw].sort((a, b) => new Date(Number(b?.dateTimeEvent)) - new Date(Number(a?.dateTimeEvent)))
    } catch (error) {
      return []
    }
  }, [ticketsRaw])

  useEffect(() => {
    if (!loadingTickets && Array.isArray(allTicketsOpen)) {
      setFilterEvents(allTicketsOpen)
    } else {
      setFilterEvents([])
    }
  }, [allTicketsOpen, loadingTickets])

  useEffect(() => {
    if (!loadingGeneralData && Array.isArray(generalDataRaw?.allUsersFromMyCompany)) {
      setAllUsers(generalDataRaw?.allUsersFromMyCompany)
    } else {
      setAllUsers([])
    }
  }, [generalDataRaw, loadingGeneralData])

  useEffect(() => {
    const end = page * ITEMS_PER_PAGE
    setDisplayedEvents(filterEvents?.slice(0, end))
  }, [page, filterEvents])

  const handleFilter = useCallback(
    (term) => {
      if (!term || !Array.isArray(allTicketsOpen)) {
        setFilterEvents(allTicketsOpen)
        setPage(1)
        return
      }

      const lowerTerm = term?.toLowerCase()
      const result = allTicketsOpen?.filter((el) => {
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

      const sorted = result
        .sort((a, b) => new Date(Number(b?.dateTimeEvent)) - new Date(Number(a?.dateTimeEvent)))
      setFilterEvents(sorted)
      setPage(1)
    }, [allTicketsOpen, allUsers]
  )

  useEffect(() => {
    handleFilter(debouncedSearchTerm)
  }, [debouncedSearchTerm, handleFilter])

  const handlePress = useCallback(
    (item) => {
      // console.log('item', item)
      if (item?.idTicketNew) {
        router.navigate({
          pathname: '/report/searchEvent/Components/[event]',
          params: { param: JSON.stringify(item) }
        })
      }
    },
    [router]
  )

  const loadMoreItems = () => {
    if (displayedEvents?.length < filterEvents?.length) {
      setPage((prev) => prev + 1)
    }
  }

  const showError = ticketsError || generalError || (!Array.isArray(ticketsRaw) && !loadingTickets)

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Search Screen' }} />

      <TextInput
        style={{ margin: 10, width: WIDTH - 50, alignSelf: 'center' }}
        mode='outlined'
        placeholder='Search...'
        left={<TextInput.Icon icon='magnify' />}
        onChangeText={setSearchTerm}
        value={searchTerm}
      />

      {loadingTickets || loadingGeneralData
        ? (
          <CustomActivityIndicator />
          )
        : showError
          ? (
            <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>
              Ocurrió un error al cargar los datos...
            </Text>
            )
          : (
            <>
              <Text style={{ padding: 5 }}>{filterEvents?.length} open tickets found...</Text>
              <FlatList
                data={displayedEvents}
                keyExtractor={(item, index) => item?.idTicketNew?.toString() || `fallback-${index}`}
                renderItem={({ item }) => (
                  <>
                    <CardComponent item={item} onPress={() => handlePress(item)} />
                    {/* <CardXComponent
                      media={[
                        { type: 'image', uri: EMARAY_MOVILE_GIF },
                        { type: 'image', uri: EMARAY_MOVILE_GIF },
                        { type: 'image', uri: EMARAY_CAMERA_JPG },
                        { type: 'video', uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }
                      ]}
                    /> */}
                  </>
                )}
                onEndReached={loadMoreItems}
                onEndReachedThreshold={0.2}
              />
            </>
            )}
    </View>
  )
}

export default SearchEvent
