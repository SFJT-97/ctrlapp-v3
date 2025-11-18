// app/(drawer)/home/components/charts/donutCharts.jsx
// ==> 2024-10-02
// Used in the homePage

// Builtin modules
import { gql, useQuery } from '@apollo/client'
import { useState, useEffect, useRef } from 'react'
import { View, Dimensions, TouchableOpacity, Animated } from 'react-native'
import { useTheme, Text, Button } from 'react-native-paper'
import { PieChart } from 'react-native-gifted-charts'
import { useTranslation } from 'react-i18next'

// Custom modules
import { useRouter } from 'expo-router'
import { numbToEng } from '../../../../../globals/functions/functions'

const aCQ = gql`
  query GroupMyCompanyTicketsNew($args: TicketNewInput) {
    groupMyCompanyTicketsNew(args: $args) {
      type
      qtty
    }
  }
`

export default function DonutCharts () {
  const { t, i18n } = useTranslation('donutCharts')

  /* ============ useQueries ============ */
  const aCData = useQuery(aCQ, {
    variables: { args: { type: null, ticketClosed: false } },
    fetchPolicy: 'cache-and-network',
    pollInterval: 5000
  })

  /* ============ useStates for charts ============ */
  const [data, setData] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [total, setTotal] = useState(0)
  const [displayMode, setDisplayMode] = useState('numbers')
  /* ============ useStates for navigation ============ */
  const [dataTo, setDataTo] = useState({})
  const [goNextChart, setGoNextChart] = useState(false)

  const router = useRouter()
  const theme = useTheme()
  const fadeAnim = useRef(new Animated.Value(0.3)).current

  /* ============ Chart Color & Theme ============ */
  const chartColors = {
    colors: {
      colorOne: theme.colors.primaryContainer,
      colorTwo: theme.colors.secondaryContainer
    }
  }

  const textColorMap = {
    [theme.colors.primaryContainer]: theme.colors.onPrimaryContainer,
    [theme.colors.secondaryContainer]: theme.colors.onSecondaryContainer
  }

  const width = Dimensions.get('window').width

  // Map GraphQL type values to translation keys
  const typeToTranslationKey = {
    action: 'action',
    condition: 'condition',
    Action: 'action', // Handle case variations if needed
    Condition: 'condition'
  }

  function linkedData (data, chartColors, mode) {
    let cc = 0
    let acum = 0
    data.forEach((el) => {
      acum += el.qtty
    })
    const result = data.map((el) => {
      cc++
      const color = getColor(cc, chartColors)
      const text =
        mode === 'numbers'
          ? numbToEng(el.qtty, 0)
          : `${(el.qtty / acum * 100).toFixed(1)}%`
      return {
        value: el.qtty,
        color,
        field: el.type,
        translatedField: t(typeToTranslationKey[el.type] || el.type.toLowerCase()), // Pre-translate
        text,
        textColor: textColorMap[color] || theme.colors.onSurface
      }
    })
    setTotal(acum)
    return result
  }

  /* ============ Skeleton Chart Component ============ */
  const SkeletonChart = () => {
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      ).start()
    }, [])

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={{ alignItems: 'center', rowGap: 30 }}>
          <View
            style={{
              width: 300,
              height: 300,
              borderRadius: 150,
              backgroundColor: theme.colors.surfaceDisabled
            }}
          />
          <View
            style={{
              width,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              columnGap: 15,
              rowGap: 15
            }}
          >
            {[...Array(4)].map((_, index) => (
              <View
                key={index}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 3,
                    backgroundColor: theme.colors.surfaceDisabled,
                    marginRight: 10
                  }}
                />
                <View
                  style={{
                    width: 80,
                    height: 16,
                    backgroundColor: theme.colors.surfaceDisabled,
                    borderRadius: 4
                  }}
                />
              </View>
            ))}
          </View>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 100,
                height: 18,
                backgroundColor: theme.colors.surfaceDisabled,
                borderRadius: 4,
                marginBottom: 10
              }}
            />
            <View
              style={{
                width: 60,
                height: 36,
                backgroundColor: theme.colors.surfaceDisabled,
                borderRadius: 4
              }}
            />
          </View>
          <View
            style={{
              width: 150,
              height: 40,
              backgroundColor: theme.colors.surfaceDisabled,
              borderRadius: theme.roundness,
              marginTop: 10
            }}
          />
        </View>
      </Animated.View>
    )
  }

  /* ============ Individual Charts ============ */
  const ACChart = () => {
    const renderLegend = (text, translatedText, color) => (
      <View key={text} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            height: 22,
            width: 22,
            marginRight: 10,
            borderRadius: 3,
            backgroundColor: color || theme.colors.background
          }}
        />
        <Text style={{ fontSize: 16, textTransform: 'capitalize' }}>
          {translatedText || text}
        </Text>
      </View>
    )

    function getLegends (data) {
      const tempData = data.filter((_, index) => index < 6)
      return tempData
        .map((el) => (
          <TouchableOpacity
            key={el.field}
            onPress={() => {
              const temp = {
                ...el,
                prevQuery: 'type',
                description: 'action/condition'
              }
              setDataTo(temp)
              setGoNextChart(true)
            }}
          >
            {renderLegend(el.field, el.translatedField, el.color)}
          </TouchableOpacity>
        ))
        .reverse()
    }

    return (
      <View style={{ display: 'flex', alignItems: 'center', rowGap: 30 }}>
        <View
          style={{
            width,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            flexWrap: 'wrap',
            rowGap: 10
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              columnGap: 15,
              rowGap: 15,
              justifyContent: 'center'
            }}
          >
            {loaded && getLegends(data)}
          </View>
        </View>
        {loaded
          ? (
            <View>
              <PieChart
                strokeColor={theme.colors.background}
                strokeWidth={4}
                radius={150}
                data={data}
                showText
                textSize={20}
                onPress={(item) => {
                  const temp = {
                    ...item,
                    prevQuery: 'type',
                    description: 'action/condition'
                  }
                  setDataTo(temp)
                  setGoNextChart(true)
                }}
              />
            </View>
            )
          : (
            <SkeletonChart />
            )}
        <View>
          <Text style={{ fontSize: 18, textAlign: 'center' }}>
            {t('totalEvents')}
          </Text>
          <Text style={{ fontSize: 36, textAlign: 'center' }}>
            {loaded ? numbToEng(total, 0) : ''}
          </Text>
        </View>
        <Button
          mode='contained'
          onPress={() =>
            setDisplayMode(displayMode === 'numbers' ? 'percentage' : 'numbers')}
          style={{ marginTop: 10, color: theme.colors.onPrimaryContainer }}
          disabled={!loaded}
        >
          {t(displayMode === 'numbers' ? 'showPercentage' : 'showNumbers')}
        </Button>
      </View>
    )
  }

  useEffect(() => {
    if (
      aCData?.data?.groupMyCompanyTicketsNew &&
      !aCData.loading &&
      !aCData.error
    ) {
      const res = linkedData(
        aCData.data.groupMyCompanyTicketsNew,
        chartColors,
        displayMode
      )
      setData(res)
      setLoaded(true)
    }
  }, [
    aCData.loading,
    aCData.error,
    aCData?.data?.groupMyCompanyTicketsNew,
    theme,
    displayMode,
    i18n.language // Re-run on language change
  ])

  /* console.log('Types:', aCData?.data?.groupMyCompanyTicketsNew?.map((el) => el.type)) */
  /* console.log('Language:', i18n.language, t('action'), t('condition')) */

  useEffect(() => {
    if (goNextChart) {
      router.navigate({
        pathname: 'home/components/charts/[barchart]',
        params: dataTo
      })
      setGoNextChart(false)
    }
  }, [goNextChart, dataTo])

  return (
    <View style={{ width: width * 0.8, rowGap: 10 }}>
      <ACChart />
    </View>
  )
}

function getColor (index, chartColors) {
  if (index < 1) return chartColors.colors.colorOne
  const temp = ((index - 1) % 2) + 1
  switch (temp) {
    case 1:
      return chartColors.colors.colorOne
    case 2:
      return chartColors.colors.colorTwo
    default:
      return chartColors.colors.colorOne
  }
}
