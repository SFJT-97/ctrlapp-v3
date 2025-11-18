// ==> 2025-06-20
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { FlatList, View, Pressable, Modal, TouchableOpacity, ImageBackground, StyleSheet, Text } from 'react-native'
import { useTheme, Icon, Button, Card, Chip, Divider, IconButton } from 'react-native-paper'
import { Drawer } from 'expo-router/drawer'
import { useLazyQuery, useQuery, gql, useMutation } from '@apollo/client'
import { useRouter } from 'expo-router'
import { getFormatedTime } from '../../../../../globals/functions/functions'
import { SECURITY_PLACEHOLDER1, SECURITY_PLACEHOLDER2, SECURITY_PLACEHOLDER3, SECURITY_PLACEHOLDER4, SECURITY_PLACEHOLDER5 } from '../../../../../globals/variables/globalVariables'

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

const TicketCard = ({ item }) => {
  const theme = useTheme()
  const router = useRouter()
  const [getURL] = useMutation(getSignedUrlFromCacheQ)
  const [loaded, setLoaded] = useState(false)
  const [imageKeys, setImageKeys] = useState([])

  // Array of placeholder images
  const placeholders = [
    SECURITY_PLACEHOLDER1,
    SECURITY_PLACEHOLDER2,
    SECURITY_PLACEHOLDER3,
    SECURITY_PLACEHOLDER4,
    SECURITY_PLACEHOLDER5
  ]

  // Memoized random placeholder to avoid changing on re-renders
  const randomPlaceholder = useMemo(() => {
    return placeholders[Math.floor(Math.random() * placeholders.length)]
  }, [])

  // Custom date formatting function for dd/mm/yyyy hh:mm
  const formatDateTime = useCallback((timestamp) => {
    if (!timestamp && timestamp !== 0) return 'N/A'
    const date = new Date(Number(timestamp))
    if (isNaN(date.getTime())) return 'Invalid Date'
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }, [])

  useEffect(() => {
    const fetchImages = async () => {
      const temp = []
      let result
      if (item.result?.ticketImage1) {
        result = await getURL({ variables: { idSiMMediaURL: item.result.ticketImage1.split('/').pop() } })
        if (result?.data?.getSignedUrlFromCache?.signedUrl) {
          temp.push(result.data.getSignedUrlFromCache.signedUrl)
        }
      }
      if (item.result?.ticketImage2) {
        result = await getURL({ variables: { idSiMMediaURL: item.result.ticketImage2.split('/').pop() } })
        if (result?.data?.getSignedUrlFromCache?.signedUrl) {
          temp.push(result.data.getSignedUrlFromCache.signedUrl)
        }
      }
      if (item.result?.ticketImage3) {
        result = await getURL({ variables: { idSiMMediaURL: item.result.ticketImage3.split('/').pop() } })
        if (result?.data?.getSignedUrlFromCache?.signedUrl) {
          temp.push(result.data.getSignedUrlFromCache.signedUrl)
        }
      }
      setImageKeys(temp.length > 0 ? temp : [randomPlaceholder])
      setLoaded(true)
    }
    fetchImages()
  }, [item.result?.ticketImage1, item.result?.ticketImage2, item.result?.ticketImage3, getURL, randomPlaceholder])

  const renderImages = useCallback(() => {
    const imageStyle = {
      elevation: 2
    }

    if (imageKeys.length === 0) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <ImageBackground
            imageStyle={{ borderRadius: 10 }}
            style={{ ...imageStyle, width: 200, height: 305, borderRadius: 10 }}
            source={{ uri: randomPlaceholder }}
          />
        </View>
      )
    } else if (imageKeys.length === 1) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <ImageBackground
            imageStyle={{ borderRadius: 10 }}
            style={{ ...imageStyle, width: 200, height: 305, borderRadius: 10 }}
            source={{ uri: loaded ? imageKeys[0] : randomPlaceholder }}
          />
        </View>
      )
    } else if (imageKeys.length === 2) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, margin: 5 }}>
          <ImageBackground
            imageStyle={{ borderRadius: 10 }}
            style={{ ...imageStyle, width: 150, height: 305, borderRadius: 10 }}
            source={{ uri: loaded ? imageKeys[0] : randomPlaceholder }}
          />
          <ImageBackground
            imageStyle={{ borderRadius: 10 }}
            style={{ ...imageStyle, width: 150, height: 305, borderRadius: 10 }}
            source={{ uri: loaded ? imageKeys[1] : randomPlaceholder }}
          />
        </View>
      )
    } else {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <ImageBackground
            imageStyle={{ borderRadius: 10 }}
            style={{ ...imageStyle, width: 200, height: 305, borderRadius: 10 }}
            source={{ uri: loaded ? imageKeys[0] : randomPlaceholder }}
          />
          <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <ImageBackground
              imageStyle={{ borderRadius: 10 }}
              style={{ ...imageStyle, width: 100, height: 150, borderRadius: 10 }}
              source={{ uri: loaded ? imageKeys[1] : randomPlaceholder }}
            />
            <ImageBackground
              imageStyle={{ borderRadius: 10 }}
              style={{ ...imageStyle, width: 100, height: 150, borderRadius: 10 }}
              source={{ uri: loaded ? imageKeys[2] : randomPlaceholder }}
            />
          </View>
        </View>
      )
    }
  }, [imageKeys, loaded, randomPlaceholder])

  if (!loaded) {
    return <SkeletonCard />
  }

  // console.log(item.result)

  return (
    <TouchableOpacity
      onPress={async () => {
        const nParams = await item.result
        nParams && router.navigate({ pathname: '../../[event]', params: nParams })
      }}
    >
      <Card
        style={{
          borderRadius: 10,
          margin: 5
        }}
      >
        <Card.Title
          title={`${item.result?.classification || 'N/A'} - ${item.result?.classificationDescription || 'N/A'}`}
          titleStyle={{ fontWeight: 'bold', color: theme.colors.onBackground }}
          subtitle={item.result?.companySectorDescription || 'N/A'}
          subtitleStyle={{ color: theme.colors.onBackground }}
          right={() => (
            <Text variant='labelMedium' style={{ marginRight: 10, color: theme.colors.onBackground }}>
              {formatDateTime(item.result?.dateTimeEvent)}
            </Text>
          )}
        />
        <Card.Content>
          {renderImages()}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginVertical: 10,
              columnGap: 5
            }}
          >
            {item.risk.RiskDot !== null && (
              <Chip
                elevated
                compact
                textStyle={{ color: 'black' }}
                style={{ backgroundColor: colors.risk[item.risk.RiskDot], width: 'auto' }}
              >
                {item.result?.riskQualification || 'N/A'}
              </Chip>
            )}
            {item.risk.SolutionDot !== null && (
              <Chip
                elevated
                compact
                textStyle={{ color: 'black' }}
                style={{ backgroundColor: colors.solution[item.risk.SolutionDot], width: 'auto' }}
              >
                {item.result?.solutionType || 'N/A'}
              </Chip>
            )}
          </View>
          <Divider bold style={{ marginVertical: 10 }} />
          <Text style={{ marginBottom: 10, color: theme.colors.onBackground }} variant='bodyMedium'>
            {item.result?.ticketCustomDescription?.slice(0, 50) || 'No description'}...
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  )
}

const CustomOverviewTable = ({ params, items }) => {
  const theme = useTheme()
  const [page, setPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10) // Default to 10 items per page
  const numberOfItemsPerPageList = [10, 15] // Options for items per page
  const flatListRef = useRef(null)
  const [sortedItems, setSortedItems] = useState([])

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
    setPage(0) // Reset to first page
    scrollToTop()
  }, [items])

  // Calculate the start and end indices for the current page
  const from = page * itemsPerPage
  const to = Math.min((page + 1) * itemsPerPage, sortedItems.length)
  const numberOfPages = Math.ceil(sortedItems.length / itemsPerPage)

  // Scroll to top function
  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true })
    }
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < numberOfPages) {
      setPage(newPage)
      scrollToTop()
    }
  }

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setPage(0) // Reset to first page
    scrollToTop()
  }

  // Data for the current page
  const paginatedData = sortedItems.slice(from, to)

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={paginatedData}
        renderItem={({ item }) => <TicketCard item={item} />}
        keyExtractor={(item) => item.key.toString()}
        contentContainerStyle={styles.cardContainer}
        ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 20, color: theme.colors.onBackground }}>No items available</Text>}
      />
      <View style={styles.paginationContainer}>
        {/* Pagination Controls */}
        <View style={styles.paginationButtons}>
          <IconButton
            icon='chevron-left'
            mode='contained'
            disabled={page === 0}
            onPress={() => handlePageChange(page - 1)}
            style={styles.paginationButton}
            iconColor={theme.colors.primary}
          />
          <Text style={[styles.paginationText, { color: theme.colors.onBackground }]}>
            {page + 1} / {numberOfPages}
          </Text>
          <IconButton
            icon='chevron-right'
            mode='contained'
            disabled={page === numberOfPages - 1 || numberOfPages === 0}
            onPress={() => handlePageChange(page + 1)}
            style={styles.paginationButton}
            iconColor={theme.colors.primary}
          />
        </View>
        {/* Items Per Page Selector */}
        <View style={styles.itemsPerPageContainer}>
          <Text style={[styles.paginationText, { color: theme.colors.onBackground }]}>
            Items per page:
          </Text>
          {numberOfItemsPerPageList.map((num) => (
            <TouchableOpacity
              key={num}
              onPress={() => handleItemsPerPageChange(num)}
              style={[
                styles.itemsPerPageButton,
                itemsPerPage === num && { backgroundColor: theme.colors.primary }
              ]}
            >
              <Text
                style={[
                  styles.itemsPerPageText, { color: theme.colors.onBackground },
                  itemsPerPage === num && { color: theme.colors.onPrimary }
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.paginationText, { color: theme.colors.onBackground }]}>
          Showing {from + 1}-{to} of {sortedItems.length}
        </Text>
      </View>
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
        <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: theme.colors.onBackground }}>
          {tempArgs?.groupedBy
            ? `${groupedByMapping[tempArgs.groupedBy] || tempArgs.groupedBy} events,\n${tempArgs.fullLabel}`
            : 'Loading...'}
        </Text>
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
