import { gql, useQuery } from '@apollo/client'

/*
  Query: chartsCount
*/

// Query definition from BE. All constants definitions used for useQuery hooks, will have a Q letter at the end
const chartsCountQ = gql`
query ChartsCount {
  chartsCount
}

`

export const useChartsCount = () => {
  const { loading, error, data } = useQuery(chartsCountQ, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const chartsCountData = data.chartsCount // En este caso, solo devuelve un valor.

  return { chartsCountData }
}

/*
  Query: allCharts
*/

// Query definition from BE. All constants definitions used for useQuery hooks, will have a Q letter at the end
const allChartsQ = gql`
query AllCharts {
  allCharts {
    idChart
    chartDescription
    chartHeight
    chartWidth
    fromDay
    isAndroidChart
    isIOSChart
    isWebChart
    labelX1
    labelX2
    labelX3
    labelX4
    labelY1
    labelY2
    labelY3
    labelY4
    maxNumberSeries
    showLabelX1
    showLabelX2
    showLabelX3
    showLabelX4
    showLabelY1
    showLabelY2
    showLabelY3
    showLabelY4
    showTitle
    title
    toDay
    x1
    x2
    x3
    x4
    y1DataField
    y1DataGroupingWay
    y1Value
    y2DataField
    y2DataGroupingWay    
    y2Value
    y3DataField
    y3DataGroupingWay
    y3Value
    y4DataField
    y4DataGroupingWay
    y4Value    
  }
}

`

export const useAllCharts = () => {
  const { loading, error, data } = useQuery(allChartsQ, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const allChartsData = data.allCharts.map(el => el)
  return { allChartsData }
}
