// ==> 2025-06-20
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { FlatList, View, Pressable, Modal, TouchableOpacity, ImageBackground, StyleSheet, Text, RefreshControl } from 'react-native'
import { useTheme, Icon, Button, Card, Chip, Divider, IconButton } from 'react-native-paper'
import { Drawer } from 'expo-router/drawer'
import { useLazyQuery, useQuery, gql, useMutation, useApolloClient } from '@apollo/client'
import { useRouter } from 'expo-router'
import { getFormatedTime } from '../../../../../globals/functions/functions'
import { SECURITY_PLACEHOLDER1, SECURITY_PLACEHOLDER2, SECURITY_PLACEHOLDER3, SECURITY_PLACEHOLDER4, SECURITY_PLACEHOLDER5 } from '../../../../../globals/variables/globalVariables'
import EventCard from '../EventCard'

const colors = {
  risk: ['#FF0000', '#FF6600', '#FFCC00', '#FFFF00'], // Gradient from red to yellow
  solution: ['#0F67B1', '#33FF66', '#3FA2F6', '#99FFCC'] // Gradient from green to light green
}

const Dot = ({ color }) => (
  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 5 }} />
)

function switchRisk (risk, solution) {
  let resultRisk
  switch (risk) {
    case 'Catstrophic':
    case 'Extremely Dangerous':
    case 'Very Dangerous':
      resultRisk = 0
      break
    case 'Dangerous':
    case 'Very Serious':
      resultRisk = 1
      break
    case 'Serious':
    case 'Warning':
      resultRisk = 2
      break
    case 'Low warning':
    case 'Inconsequential':
    case 'Secure Event':
      resultRisk = 3
      break
    default:
      resultRisk = null
      break
  }
  let resultSolution
  switch (solution) {
    case 'Inmediate action':
      resultSolution = 3
      break
    case 'Partial action':
      resultSolution = 2
      break
    case 'Pending action':
      resultSolution = 1
      break
    case 'Resolved':
      resultSolution = 0
      break
    default:
      resultSolution = null
      break
  }
  return {
    RiskDot: resultRisk,
    SolutionDot: resultSolution
  }
}

const myLastQueryQ = gql`
  query MyLastQuery {
    myLastQuery {
      idTempValue
      idUser
      args
    }
  }
`

const myCompanyTicketsNewQ = gql`
  query MyCompanyTicketsNew($args: TicketNewInput) {
    myCompanyTicketsNew(args: $args) {
      idTicketNew
      idUser
      type
      companyName
      companyBusinessUnitDescription
      companySectorDescription
      dateTimeEvent
      classification
      classificationDescription
      subType
      riskQualification
      ticketCustomDescription
      ticketImage1
      ticketImage2
      ticketImage3
      ticketImage4
      ticketVideo
      ticketSolved
      ticketLike
      injuredPeople
      lostProduction
      lostProductionTotalTimeDuration
      dateTimeEventResolved
      ticketClosed
      solutionType
      costAsociated
      ticketExtraFile
      idChatIA
    }
  }
`

const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
    getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
      signedUrl
    }
  }
`

const SkeletonCard = () => {
  return (
    <Card style={{ borderRadius: 10, margin: 5, opacity: 0.7 }}>
      <Card.Title
        title={<View style={styles.skeletonTextLong} />}
        subtitle={<View style={styles.skeletonTextMedium} />}
        right={() => <View style={[styles.skeletonTextShort, { marginRight: 10 }]} />}
      />
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <View style={[styles.skeletonImage, { width: 200, height: 305, borderRadius: 10 }]} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginVertical: 10, columnGap: 5 }}>
          <View style={[styles.skeletonChip, { width: 100 }]} />
          <View style={[styles.skeletonChip, { width: 40 }]} />
        </View>
        <Divider bold style={{ marginVertical: 8 }} />
        <View style={styles.skeletonTextLong} />
      </Card.Content>
    </Card>
  )
}

// TicketCard replaced with EventCard - keeping for reference but not used

const CustomOverviewTable = ({ params, items }) => {
  const theme = useTheme()
  const router = useRouter()
  const flatListRef = useRef(null)
  const [sortedItems, setSortedItems] = useState([])
  const client = useApolloClient()
  const [refreshing, setRefreshing] = useState(false)

  // Sort items by dateTimeEvent
  useEffect(() => {
    const sorted = [...items].sort((a, b) => {
      const dateA = new Date(a.result.dateTimeEvent)
      const dateB = new Date(b.result.dateTimeEvent)
      // Handle invalid dates by placing them at the end
      if (isNaN(dateA.getTime())) return 1
      if (isNaN(dateB.getTime())) return -1
      return dateB - dateA // Descending order (most recent first)
    })
    setSortedItems(sorted)
  }, [items])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await client.refetchQueries({ include: 'active' })
    } catch (error) {
      console.error('Error refreshing overview:', error)
    } finally {
      setRefreshing(false)
    }
  }, [client])

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={sortedItems}
        renderItem={({ item }) => (
          <EventCard
            item={item}
            onPress={async () => {
              const nParams = await item.result
              if (nParams) {
                router.navigate({ pathname: '../../[event]', params: nParams })
              }
            }}
          />
        )}
        keyExtractor={(item) => item.key.toString()}
        contentContainerStyle={styles.cardContainer}
        ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 20, color: theme.colors.onBackground }}>No items available</Text>}
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
      />
    </View>
  )
}

const Overview = () => {
  const theme = useTheme()
  const [modalVisible, setModalVisible] = useState(false)
  const [tempArgs, setTempArgs] = useState({})
  const myLastQuery = useQuery(myLastQueryQ, { fetchPolicy: 'network-only' })
  const [myCompanyTicketsNew] = useLazyQuery(myCompanyTicketsNewQ, { fetchPolicy: 'cache-and-network' })
  const [items, setItems] = useState([
    {
      key: 1,
      dateTime: 'no data...',
      risk: { RiskDot: 0, SolutionDot: null },
      type: 'no data...',
      subtype: 'no data...'
    }
  ])

  // Mapping for groupedBy to show value
  const groupedByMapping = {
    subType: 'Subtype',
    classificationDescription: 'Classification',
    riskQualification: 'Risk',
    solutionType: 'Solution'
  }

  useEffect(() => {
    if (myLastQuery && myLastQuery !== 'Loading...' && myLastQuery !== 'ApolloError') {
      try {
        const temp = JSON.parse(myLastQuery?.data?.myLastQuery?.args)
        setTempArgs(temp)
      } catch (error) {
        // console.log('error\n', error);
      }
    }
  }, [myLastQuery])

  useEffect(() => {
    const fetchTicketsNew = async () => {
      let args = {
        ticketClosed: false,
        type: tempArgs.ac,
        [tempArgs.groupedBy]: tempArgs.fullLabel
      }
      if (tempArgs?.sector !== '') {
        args = {
          ...args,
          companySectorDescription: tempArgs.sector
        }
      }
      try {
        const result = await myCompanyTicketsNew({
          variables: {
            args
          }
        })
        const temp = result?.data?.myCompanyTicketsNew.map((val) => {
          return {
            key: val.idTicketNew,
            dateTime: getFormatedTime(val.dateTimeEvent, false, true, false),
            risk: switchRisk(val.riskQualification, val.solutionType),
            type: val.subType,
            [tempArgs.groupedBy]: tempArgs.fullLabel,
            result: result?.data?.myCompanyTicketsNew?.filter((el) => el.idTicketNew === val.idTicketNew)[0]
          }
        })
        setItems(temp)
      } catch (error) {
        console.log('something happened querying Mongo...', error)
      }
    }
    if (Object.keys(tempArgs).length > 0) fetchTicketsNew()
  }, [tempArgs])

  return (
    <View style={{ flex: 1 }}>
      <Drawer.Screen
        options={{
          title: 'Overview',
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={() => setModalVisible(true)}>
              <Icon source='information-outline' size={24} color={theme.colors.primary} />
            </Pressable>
          )
        }}
      />
      <View style={{ rowGap: 15, marginTop: 5, flex: 1 }}>
        {/* <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: theme.colors.onBackground }}>
          {tempArgs?.groupedBy
            ? `${groupedByMapping[tempArgs.groupedBy] || tempArgs.groupedBy} events,\n${tempArgs.fullLabel}`
            : 'Loading...'}
        </Text> */}
        <CustomOverviewTable params={tempArgs} items={items} />
      </View>
      <Modal
        visible={modalVisible}
        animationType='slide'
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: 300 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Risk & Solution Color Categorization</Text>
            <Text style={{ marginTop: 10 }}>Risk Colors:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Dot color={colors.risk[0]} />
              <Text>High Risk</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Dot color={colors.risk[1]} />
              <Text>Medium-High Risk</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Dot color={colors.risk[2]} />
              <Text>Medium-Low Risk</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Dot color={colors.risk[3]} />
              <Text>Low Risk</Text>
            </View>
            <Text style={{ marginTop: 10 }}>Solution Colors:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Dot color={colors.solution[0]} />
              <Text>Implemented Solution</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Dot color={colors.solution[2]} />
              <Text>In Progress</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Dot color={colors.solution[1]} />
              <Text>Pending Solution</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Dot color={colors.solution[3]} />
              <Text>Not Started</Text>
            </View>
            <Button mode='contained' onPress={() => setModalVisible(false)} style={{ marginTop: 20 }}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  cardContainer: {
    padding: 10,
    rowGap: 10
  },
  paginationContainer: {
    padding: 5,
    alignItems: 'center'
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10
  },
  paginationButton: {
    minWidth: 40
  },
  paginationText: {
    fontSize: 14
  },
  itemsPerPageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  itemsPerPageButton: {
    padding: 8,
    borderRadius: 5
  },
  itemsPerPageText: {
    fontSize: 14
  },
  skeletonTextLong: {
    backgroundColor: '#E0E0E0',
    height: 20,
    width: '80%',
    borderRadius: 4
  },
  skeletonTextMedium: {
    backgroundColor: '#E0E0E0',
    height: 16,
    width: '60%',
    borderRadius: 4
  },
  skeletonTextShort: {
    backgroundColor: '#E0E0E0',
    height: 14,
    width: 60,
    borderRadius: 4
  },
  skeletonImage: {
    backgroundColor: '#E0E0E0'
  },
  skeletonChip: {
    backgroundColor: '#E0E0E0',
    height: 32,
    borderRadius: 16
  }
})

export default Overview
