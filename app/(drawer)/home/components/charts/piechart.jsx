// ==> 2024-10-02
// Builtin modules
import { useLazyQuery, gql } from '@apollo/client'
import { useState, useEffect } from 'react'
import { Dimensions, View } from 'react-native'
import { useTheme, Text } from 'react-native-paper'
import { PieChart } from 'react-native-gifted-charts'
import MultipleSelectList from '../../../../../globals/components/forms/MultipleSelectList'

const firstQuery = gql`
  query GroupMyCompanyTicketsNew($args: TicketNewInput) {groupMyCompanyTicketsNew(args: $args) {
    type
    companySectorDescription
    subType 
    classificationDescription
    riskQualification
    solutionType
    qtty
  }}`

const width = Dimensions.get('window').width
const tempFields = [
  'type',
  'companySectorDescription',
  'subType',
  'classificationDescription',
  'riskQualification',
  'solutionType'
]

const chartColors = {
  colors: {
    colorOne: '#006A6A',
    colorTwo: '#6DF2E8',
    colorThree: '#6DF2BB',
    colorFour: '#7DF26D',
    colorFive: '#6DD2F2',
    colorSix: '#BEF2DC',
    colorSeven: '#97B4F6',
    colorEight: '#E57AA0',
    colorNine: '#993CA0',
    colorTen: '#FD50CB'
  }
}

const ACPieChart = () => {
  // console.log(sectorEvent)
  const theme = useTheme()
  const [fieldsSelected, setFieldsSelected] = useState([])
  const [total, setTotal] = useState(0)
  const [data, setData] = useState([])

  const [groupMyCompanyTicketsNew] = useLazyQuery(firstQuery)

  const renderLegend = (text, color) => {
    return (
      <View key={color} style={{ flexDirection: 'row' }}>
        <View
          style={{
            height: 18,
            width: 18,
            marginRight: 10,
            borderRadius: 4,
            backgroundColor: color || theme.colors.background
          }}
        />
        <Text style={{ fontSize: 16 }}>{text || ''}</Text>
      </View>
    )
  }

  function getLegends (data) {
    return data.map(el => renderLegend(el.field, el.color))
  }

  function likedData (data, chartColors) {
    let cc = 0
    let acum = 0
    const fTS = fieldsSelected?.length === 0 ? 'type' : fieldsSelected[0]
    const result = data.map(el => {
      cc++
      acum += el.qtty
      return (
        {
          value: el.qtty,
          color: getColor(cc, chartColors),
          field: el[fTS]
        }
      )
    })
    setTotal(acum)
    return result
  }

  useEffect(() => {
    const fetchTicketsNew = async () => {
      // console.log('fieldsSelected=', fieldsSelected)
      try {
        const tempArgs = fieldsSelected.reduce((acc, item) => {
          acc[item] = null
          return acc
        }, {})
        // console.log('tempArgs=', tempArgs)
        const result = await groupMyCompanyTicketsNew({
          variables: {
            args: fieldsSelected.length === 0
              ? ({ type: null })
              : (tempArgs)
          }
        }, { fetchPolicy: 'network-only' })
        if (result && result !== 'Loading...' && result !== 'ApolloError') {
          const tempResult = result?.data?.groupMyCompanyTicketsNew
          // console.log('tempResult\n', tempResult)
          const tempData = []
          for (let i = 0; i < tempResult.length; i++) {
            if (tempResult[i].value !== null && tempResult[i] !== 'ticketGrouped') tempData.push(tempResult[i])
          }
          const res = likedData(tempData, chartColors)
          // console.log('res\n', res)
          setData(res)
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchTicketsNew()
  }, [fieldsSelected])

  return (
    <View>
      <View style={{ padding: 10 }}>
        <MultipleSelectList fields={tempFields} setFieldsSelected={setFieldsSelected} />
      </View>
      <View style={{ display: 'flex', alignItems: 'center', rowGap: 30 }}>
        <View
          style={{
            width,
            flexDirection: 'row',
            justifyContent: 'space-evenly'
          }}
        >
          {getLegends(data)}
        </View>
        <View>
          <PieChart
            strokeColor={theme.colors.background}
            strokeWidth={4}
            donut
            radius={150}
            data={data}
            innerCircleColor={theme.colors.background}
            innerCircleBorderWidth={5}
            innerCircleBorderColor={theme.colors.background}
            showValuesAsLabels
            showText
            textColor={theme.colors.background}
            onPress={(item, index) => {
              console.log(item, index)
            }}
            textSize={20}
            centerLabelComponent={() => {
              return (
                <View>
                  <Text style={{ fontSize: 36, textAlign: 'center' }}>{total}</Text>
                  <Text style={{ fontSize: 18, textAlign: 'center' }}>Total</Text>
                </View>
              )
            }}
          />
        </View>
      </View>
    </View>
  )
}

function getColor (index, chartColors) {
  if (index < 1) return
  const temp = ((index - 1) % 10) + 1 // Con esta operación se logra que sea cual sea "index", el color elegido siempre esté entre 1 y 10

  let result
  switch (temp) {
    case 1:
      result = chartColors.colors.colorOne
      break
    case 2:
      result = chartColors.colors.colorTwo
      break
    case 3:
      result = chartColors.colors.colorThree
      break
    case 4:
      result = chartColors.colors.colorFour
      break
    case 5:
      result = chartColors.colors.colorFive
      break
    case 6:
      result = chartColors.colors.colorSix
      break
    case 7:
      result = chartColors.colors.colorSeven
      break
    case 8:
      result = chartColors.colors.colorEight
      break
    case 9:
      result = chartColors.colors.colorNine
      break
    case 10:
      result = chartColors.colors.colorTen
      break
  }
  return result
}

export default ACPieChart
