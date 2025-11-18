// Builtin modules
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import { Icon } from 'react-native-paper'
import { Link } from 'expo-router'

const CardSearch = () => {
  return (
    <View style={styles.buttonContainer}>
      <Link
        href={{
          pathname: '/report/searchEvent/[index]'
        }}
        asChild
      >
        <TouchableOpacity style={styles.button}>
          <View style={styles.button}>
            <Icon source='text-box-search' size={50} color='#FFFFFF' style={{ paddingBottom: 5 }} />
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 18, paddingTop: 5 }}>Search Event</Text>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  )
}

export default CardSearch

const styles = StyleSheet.create({
  buttonContainer: {
    width: 175,
    height: 175,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3
  },
  button: {
    borderRadius: 25,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: '#006A6A'
  }
})

// // Builtin modules
// import { useState, useEffect } from 'react'
// import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'
// import { Icon } from 'react-native-paper'
// import { gql, useQuery } from '@apollo/client'
// import { Link } from 'expo-router'

// // Custom modules

// const AllMyCompanyOpenTicketsNewQ = gql`
// query AllMyCompanyOpenTicketsNew {
//   allMyCompanyOpenTicketsNew {
//     classification
//     classificationDescription
//     companySectorDescription
//     costAsociated
//     dateTimeEvent
//     injuredPeople
//     lostProduction
//     lostProductionTotalTimeDuration
//     riskQualification
//     solutionType
//     subType
//     type
//     ticketCustomDescription
//     ticketImage1
//     ticketImage2
//     ticketImage3
//     ticketVideo
//     companyBusinessUnitDescription
//     companyName
//     dateTimeEventResolved
//     idChatIA
//     idTicketNew
//     idUser
//     ticketClosed
//     ticketExtraFile
//     ticketImage4
//     ticketLike
//     ticketSolved
//   }
// }

// `

// const CardSearch = ({ defaultValues }) => {
//   const allMyCompanyOpenTicketsNew = useQuery(AllMyCompanyOpenTicketsNewQ, { fetchPolicy: 'network-only', pollInterval: 5000 })
//   const [loaded, setLoaded] = useState(false)
//   const [allTicketsOpen, setAllTicketsOpen] = useState({})

//   useEffect(() => {
//     if (allMyCompanyOpenTicketsNew && allMyCompanyOpenTicketsNew?.data?.allMyCompanyOpenTicketsNew !== 'Loading...' && allMyCompanyOpenTicketsNew?.data?.allMyCompanyOpenTicketsNew !== 'ApolloError' && !allMyCompanyOpenTicketsNew.error && !allMyCompanyOpenTicketsNew.loading) {
//       setAllTicketsOpen(allMyCompanyOpenTicketsNew?.data?.allMyCompanyOpenTicketsNew)
//       setLoaded(true)
//     }
//   }, [allMyCompanyOpenTicketsNew, allMyCompanyOpenTicketsNew.loading, allMyCompanyOpenTicketsNew.error])

//   return (
//     <View>
//       {loaded && (
//         <View style={styles.buttonContainer}>
//           <Link
//             href={{
//               pathname: '/report/searchEvent/[index]',
//               params: { defaultValues: JSON.stringify(defaultValues), allTicketsOpen: JSON.stringify(allTicketsOpen) }
//             }}
//             asChild
//           >
//             <TouchableOpacity style={styles.button}>
//               <View style={styles.button}>
//                 <Icon source='text-box-search' size={50} color='#FFFFFF' style={{ paddingBottom: 5 }} />
//                 <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 18, paddingTop: 5 }}>Search Event</Text>
//               </View>
//             </TouchableOpacity>
//           </Link>
//         </View>
//       )}
//     </View>
//   )
// }

// export default CardSearch

// const styles = StyleSheet.create({
//   buttonContainer: {
//     width: 175,
//     height: 175,
//     marginHorizontal: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 3
//   },
//   button: {
//     borderRadius: 25,
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'column',
//     backgroundColor: '#006A6A'
//   }
// })
