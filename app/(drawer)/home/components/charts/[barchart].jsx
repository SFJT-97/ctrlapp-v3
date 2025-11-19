import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ScrollView, View, TouchableOpacity, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native'
import { useTheme, Text, Surface, TextInput } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { useLazyQuery, gql, useMutation } from '@apollo/client'
import { BarChart } from 'react-native-gifted-charts'
import { BottomSheetModal, BottomSheetView, BottomSheetModalProvider, BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useMyCompanySectors } from '../../../../../context/hooks/companySectorQ'
import { useMe } from '../../../../../context/hooks/userQH'

const firstQuery = gql`
  query GroupMyCompanyTicketsNew($args: TicketNewInput) {
    groupMyCompanyTicketsNew(args: $args) {
      type
      companySectorDescription
      subType
      classificationDescription
      riskQualification
      solutionType
      qtty
    }
  }
`

const addNewTempValueM = gql`
  mutation AddNewTempValue($idUser: ID!, $args: String!) {
    addNewTempValue(idUser: $idUser, args: $args) {
      idTempValue
      idUser
      args
    }
  }
`

const BottomSheetSelector = ({ title, options, onSelect, selectedValue, theme, bottomSheetRef }) => {
  const [search, setSearch] = useState('')
  const filteredOptions = useMemo(
    () => {
      if (!Array.isArray(options) || options.length === 0) return []
      return options.filter((option) => {
        const searchValue = search.toLowerCase()
        const optionValue = option?.value?.toLowerCase() || ''
        const optionShow = option?.show?.toLowerCase() || ''
        return optionValue.includes(searchValue) || optionShow.includes(searchValue)
      })
    },
    [options, search]
  )

  // Header component for the FlatList
  const ListHeaderComponent = useCallback(() => (
    <View style={styles.headerContainer}>
      <Text style={[styles.sheetTitle, { color: theme.colors.onBackground }]}>{title}</Text>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.searchContainer}
      >
        <TextInput
          label='Search'
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize='none'
          mode='outlined'
          theme={{ colors: { background: theme.colors.background } }}
        />
      </KeyboardAvoidingView>
    </View>
  ), [title, theme, search])

  // Empty component
  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        {options.length === 0 ? 'No options available' : 'No results found'}
      </Text>
    </View>
  ), [options.length, theme])

  const renderItem = useCallback(({ item }) => {
    if (!item || !item.key) return null
    return (
      <TouchableOpacity
        style={[
          styles.option,
          { backgroundColor: theme.colors.surface },
          item.value === selectedValue && { backgroundColor: theme.colors.elevation.level5 }
        ]}
        onPress={() => {
          onSelect(item.value)
          setSearch('')
          bottomSheetRef.current?.dismiss()
        }}
      >
        <Text style={[styles.optionText, { color: theme.colors.onBackground }]}>
          {item.show || item.value}
        </Text>
      </TouchableOpacity>
    )
  }, [selectedValue, theme, onSelect, bottomSheetRef])

  return (
    <BottomSheetFlatList
      data={filteredOptions}
      renderItem={renderItem}
      keyExtractor={(item) => item?.key || String(item?.value || Math.random())}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={styles.listContentContainer}
      keyboardShouldPersistTaps='handled'
    />
  )
}

const FilterSelector = ({
  sectors,
  setChartData,
  theme,
  ac,
  setTotal,
  setAuxSector,
  setFieldSelected
}) => {
  const bottomSheetRefGroupBy = useRef(null)
  const bottomSheetRefSector = useRef(null)
  const snapPoints = useMemo(() => ['25%', '50%'], [])
  const [selected, setSelected] = useState('subType')
  const [mSelected, setMSelected] = useState('')
  const [groupMyCompanyTicketsNew] = useLazyQuery(firstQuery, { fetchPolicy: 'network-only' })

  const data = [
    { key: '0', value: 'subType', show: 'Subtype' },
    { key: '1', value: 'classificationDescription', show: 'Classification' },
    { key: '2', value: 'riskQualification', show: 'Risk' },
    { key: '3', value: 'solutionType', show: 'Solution' }
  ]

  const chartColors = {
    colors: {
      colorOne: '#006A00',
      colorTwo: '#00586a'
    }
  }

  const likedData = useCallback(
    (data) => {
      let acum = 0
      const fTS = selected
      const result = data.map((el) => {
        acum += el.qtty
        return {
          value: el.qtty,
          frontColor: ac === 'action' ? chartColors.colors.colorOne : chartColors.colors.colorTwo,
          spacing: data.length < 4 ? 30 : 10,
          label: el[fTS].length < 8 ? el[fTS] : el[fTS].slice(0, 8) + '...',
          fullLabel: el[fTS]
        }
      })
      setTotal(acum)
      return result
    },
    [selected, ac, setTotal]
  )

  useEffect(() => {
    const fetchTicketsNew = async () => {
      try {
        const tempArgs = {
          type: ac,
          [selected]: null,
          ticketClosed: false,
          companySectorDescription: mSelected
        }
        const result = await groupMyCompanyTicketsNew({
          variables: {
            args: mSelected ? tempArgs : { type: ac, ticketClosed: false, [selected]: null }
          }
        })
        if (result?.data?.groupMyCompanyTicketsNew) {
          const tempData = result.data.groupMyCompanyTicketsNew.filter(
            (item) => item.value !== null && item !== 'ticketGrouped'
          )
          const res = likedData(tempData)
          setChartData(res)
        }
      } catch (error) {
        console.error('Error fetching tickets:', error)
      }
    }
    fetchTicketsNew()
  }, [mSelected, selected, groupMyCompanyTicketsNew, likedData, ac, setChartData])

  const handlePresentGroupBy = useCallback(() => {
    bottomSheetRefGroupBy.current?.present()
  }, [])

  const handlePresentSector = useCallback(() => {
    console.log('Opening sector modal, sectors data:', sectors)
    console.log('Sectors length:', sectors?.length)
    bottomSheetRefSector.current?.present()
  }, [sectors])

  return (
    <View style={styles.filterContainer}>
      <View style={styles.filterItem}>
        <Text variant='labelLarge'>GROUP BY</Text>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.colors.elevation.level5 }]}
          onPress={handlePresentGroupBy}
        >
          <Text style={[styles.filterText, { color: theme.colors.onBackground }]}>
            {data.find((item) => item.value === selected)?.show || selected}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterItem}>
        <Text variant='labelLarge'>SECTOR (filter by)</Text>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.colors.elevation.level5 }]}
          onPress={handlePresentSector}
        >
          <Text style={[styles.filterText, { color: theme.colors.onBackground }]}>
            {mSelected || 'Select Sector'}
          </Text>
        </TouchableOpacity>
      </View>
      <BottomSheetModal
        ref={bottomSheetRefGroupBy}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        enablePanDownToClose
        onChange={(index) => console.log('Group By Modal index:', index)}
      >
        <BottomSheetSelector
          title='Select Group By'
          options={data}
          onSelect={(val) => {
            setSelected(val)
            setFieldSelected(val)
          }}
          selectedValue={selected}
          theme={theme}
          bottomSheetRef={bottomSheetRefGroupBy}
        />
      </BottomSheetModal>
      <BottomSheetModal
        ref={bottomSheetRefSector}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        enablePanDownToClose
        onChange={(index) => {
          console.log('Sector Modal index:', index)
          if (index === -1) {
            console.log('Sector modal closed')
          }
        }}
      >
        <BottomSheetSelector
          title='Select Sector'
          options={Array.isArray(sectors) ? sectors : []}
          onSelect={(val) => {
            console.log('Sector selected:', val)
            setMSelected(val)
            setAuxSector(val)
          }}
          selectedValue={mSelected}
          theme={theme}
          bottomSheetRef={bottomSheetRefSector}
        />
      </BottomSheetModal>
    </View>
  )
}

const CustomBarChart = () => {
  const theme = useTheme()
  const { field, prevQuery, value } = useLocalSearchParams()
  const router = useRouter()
  const [addNewTempValue] = useMutation(addNewTempValueM, { fetchPolicy: 'network-only' })
  const { sectors: myCompanySectors, loading: sectorsLoading, error: sectorsError } = useMyCompanySectors()
  const { me } = useMe()

  const [data, setData] = useState([])
  const [fieldSelected, setFieldSelected] = useState('subType')
  const [total, setTotal] = useState(0)
  const [auxIdUser, setAuxIdUser] = useState('')
  const [chartData, setChartData] = useState([
    { value: 1, frontColor: theme.colors.primary, spacing: 6, label: '...' },
    { value: 2, frontColor: theme.colors.primary, spacing: 6, label: '...' },
    { value: 4, frontColor: theme.colors.primary, spacing: 6, label: '...' }
  ])
  const [goNextChart, setGoNextChart] = useState(false)
  const [dataTo, setDataTo] = useState({})
  const [auxSector, setAuxSector] = useState('')

  const barChartTitle = field.charAt(0).toUpperCase() + field.slice(1).toLowerCase()

  useEffect(() => {
    if (goNextChart) {
      router.navigate({ pathname: '/home/components/charts/overview', params: JSON.stringify(dataTo) })
      setGoNextChart(false)
    }
  }, [goNextChart, dataTo, router])

  useEffect(() => {
    console.log('myCompanySectors changed:', myCompanySectors)
    console.log('sectorsLoading:', sectorsLoading)
    console.log('sectorsError:', sectorsError)
    
    if (sectorsLoading) {
      console.log('Sectors are still loading...')
      return
    }
    
    if (sectorsError) {
      console.log('Sectors error:', sectorsError)
      setData([])
      return
    }
    
    if (myCompanySectors && Array.isArray(myCompanySectors) && myCompanySectors.length > 0) {
      const temp = myCompanySectors
        .filter((el) => el && el.idCompanySector && el.companySectorDescription)
        .map((el) => ({
          key: String(el.idCompanySector),
          value: String(el.companySectorDescription),
          show: String(el.companySectorDescription)
        }))
      console.log('Processed sectors data:', temp)
      setData(temp)
    } else {
      console.log('Sectors data is empty or invalid:', myCompanySectors)
      setData([])
    }
  }, [myCompanySectors, sectorsLoading, sectorsError])

  useEffect(() => {
    if (me && me !== 'Loading...' && me !== 'ApolloError') {
      setAuxIdUser(me.idUser)
    }
  }, [me])

  const handleAddNewTempValue = async (temp) => {
    try {
      await addNewTempValue({
        variables: {
          idUser: auxIdUser,
          args: JSON.stringify(temp)
        }
      })
      setGoNextChart(true)
    } catch (error) {
      console.error('Error in addNewTempValue:', error)
    }
  }

  const values = chartData.map((item) => item.value)
  const maxValue = Math.max(...values, 10)
  const stepValue = Math.ceil(maxValue / 5) || 5

  return (
    <BottomSheetModalProvider>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
      >
        <Drawer.Screen
          options={{
            title: `${barChartTitle} tickets...`,
            headerShown: true
          }}
        />
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            barWidth={60}
            initialSpacing={10}
            spacing={14}
            barBorderRadius={4}
            yAxisThickness={0}
            xAxisType='dashed'
            animationDuration={300}
            xAxisColor={theme.colors.surfaceVariant}
            yAxisTextStyle={{ color: theme.colors.onBackground }}
            autoShiftLabels
            labelWidth={0}
            xAxisLabelTextStyle={{ color: theme.colors.onBackground, textAlign: 'center', fontSize: 12 }}
            isAnimated
            maxValue={maxValue}
            stepValue={stepValue}
            onPress={(item, index) => {
              const temp = {
                ...item,
                index,
                totalEvents: total,
                ac: field,
                groupedBy: fieldSelected,
                sector: auxSector
              }
              setDataTo(temp)
              handleAddNewTempValue(temp)
            }}
          />
        </View>
        <View style={styles.contentContainer}>
          <FilterSelector
            sectors={data}
            setChartData={setChartData}
            theme={theme}
            ac={field}
            setTotal={setTotal}
            setAuxSector={setAuxSector}
            setFieldSelected={setFieldSelected}
          />
        </View>
        <View style={styles.summaryContainer}>
          <Surface style={styles.surface} elevation={2}>
            <View style={styles.items}>
              {auxSector
                ? (
                  <View>
                    <Text variant='labelLarge' style={{ fontWeight: 'bold' }}>
                      {barChartTitle} <Text>events in</Text>
                    </Text>
                    <Text variant='labelLarge'>
                      &ldquo;{auxSector}&ldquo;: {total}
                    </Text>
                  </View>
                  )
                : (
                  <View>
                    <Text variant='labelLarge' style={{ fontWeight: 'bold' }}>
                      {barChartTitle} events: {total}
                    </Text>
                  </View>
                  )}
              <Text style={[styles.percentageText, { color: theme.colors.primary }]}>
                {Math.round((total / value) * 100 * 100) / 100}% of total
              </Text>
            </View>
          </Surface>
        </View>
      </ScrollView>
    </BottomSheetModalProvider>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    borderRadius: 20,
    rowGap: 25,
    maxWidth: '100%'
  },
  contentContainer: {
    rowGap: 15,
    margin: 10,
    padding: 16
  },
  filterContainer: {
    rowGap: 20
  },
  filterItem: {
    rowGap: 5
  },
  filterButton: {
    padding: 12,
    borderRadius: 8
  },
  filterText: {
    fontSize: 16
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  searchContainer: {
    marginBottom: 16
  },
  searchInput: {
    height: 40
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  option: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  optionText: {
    fontSize: 16
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center'
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20
  },
  summaryContainer: {
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 10
  },
  surface: {
    height: 110,
    width: 250,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 10,
    borderRadius: 10
  },
  items: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 10
  },
  percentageText: {
    fontWeight: 'bold',
    fontSize: 20
  }
})

export default CustomBarChart
