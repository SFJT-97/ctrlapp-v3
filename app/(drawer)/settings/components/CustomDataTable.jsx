// ==> 2024-10-02
import { useState, useEffect } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { DataTable, Text, useTheme } from 'react-native-paper'

const numberOfItemsPerPageList = [6]

const items = [
  {
    key: 1,
    name: 'Page 1'
  },
  {
    key: 2,
    name: 'Page 2'
  }
]

const CustomDataTable = (props) => {
  // hooks
  const theme = useTheme()

  // states
  const [page, setPage] = useState(0)
  const [fromRow, setFromRow] = useState(1)
  const [toRow, setToRow] = useState(7)
  // variables
  const from = page * 6
  const to = Math.min((page + 1) * 6, (page + 1) * 6 + items.length - 1)
  const { myCompanySectors } = props

  // console.log('myCompanySectors\n', myCompanySectors)

  const handleSetPoint = (i) => {
    console.log('Pressed', i)
  }

  /**
   * Function that returns true or false if the actual coordinates of the point "i" are null or not.
   * @param {*} i the vertice i of the sector's polyline. "Point i"
   * @param {*} editPoint This is an optional parameter, by default is false and meens that will only return true or false
   * in case the point's coordinates are null or not.
   * @returns true or false
   */
  const enabledSetButton = (i, editPoint = false) => {
    if (myCompanySectors[0][`pLine${i}X`] === null || myCompanySectors[0][`pLine${i}Y`] === null) {
      if (!editPoint) {
        if (i > 1) {
          if (myCompanySectors[0][`pLine${i - 1}X`] !== null && myCompanySectors[0][`pLine${i - 1}Y`] !== null) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      } else {
        handleSetPoint(i)
        return false
      }
    } else {
      return true
    }
  }

  useEffect(() => {
    setPage(page)
  }, [])
  // console.log('myCompanySectors=', myCompanySectors)
  const GetRows = () => {
    const temp = []
    if (myCompanySectors) {
      if (Object.keys(myCompanySectors).length === 0) return <></>
      for (let i = fromRow; i < toRow; i++) {
        temp.push(
          <View key={Math.random(1000)}>
            <DataTable.Row key={Math.random(1000)}>
              <DataTable.Cell key={Math.random(1000)} textStyle={{ fontSize: 9 }}> {i}</DataTable.Cell>
              <DataTable.Cell key={Math.random(1000)} textStyle={{ fontSize: 9 }}>{myCompanySectors[0][`pLine${i}X`] === null ? '    0' : myCompanySectors[0][`pLine${i}X`]}</DataTable.Cell>
              <DataTable.Cell key={Math.random(1000)}> </DataTable.Cell>
              <DataTable.Cell key={Math.random(1000)} textStyle={{ fontSize: 9 }}>{myCompanySectors[0][`pLine${i}Y`] === null ? '    0' : myCompanySectors[0][`pLine${i}Y`]}</DataTable.Cell>
              <DataTable.Cell key={Math.random(1000)}> </DataTable.Cell>
              {/* <DataTable.Cell key={Math.random(1000)} textStyle={{ fontSize: 10 }}>{myCompanySectors[0][`pLine${i}Z`]}</DataTable.Cell> */}
              <DataTable.Cell key={Math.random(1000)} style={{ display: 'flex' }}>
                <TouchableOpacity key={Math.random(1000)} disabled={!enabledSetButton(i)} onPress={() => handleSetPoint(i)}>
                  <Text key={Math.random(1000)} style={{ fontWeight: 'bold', color: theme.colors.primary }}>{enabledSetButton(i) ? '  set' : '  ...'}</Text>
                </TouchableOpacity>
              </DataTable.Cell>
            </DataTable.Row>
          </View>
        )
      }
    }
    return temp
  }

  return (
    <ScrollView key={Math.random(1000)}>
      <View key={Math.random(1000)}>
        <DataTable key={Math.random(1000)}>
          <DataTable.Header key={Math.random(1000)}>
            <DataTable.Title key={Math.random(1000)} textStyle={{ color: theme.colors.tertiary, fontWeight: '700', fontStyle: 'italic' }}>i</DataTable.Title>
            <DataTable.Title key={Math.random(1000)} textStyle={{ color: theme.colors.tertiary, fontWeight: '700' }}>   X</DataTable.Title>
            <DataTable.Title key={Math.random(1000)} textStyle={{ color: theme.colors.tertiary, fontWeight: '700' }}> </DataTable.Title>
            <DataTable.Title key={Math.random(1000)} textStyle={{ color: theme.colors.tertiary, fontWeight: '700' }}>   Y</DataTable.Title>
            <DataTable.Title key={Math.random(1000)} textStyle={{ color: theme.colors.tertiary, fontWeight: '700' }}> </DataTable.Title>
            {/* <DataTable.Title key={Math.random(1000)} textStyle={{ color: theme.colors.tertiary, fontWeight: '700' }}>   Z</DataTable.Title> */}
            <DataTable.Title key={Math.random(1000)} textStyle={{ color: theme.colors.tertiary, fontWeight: '700', fontStyle: 'italic' }}>Action</DataTable.Title>
          </DataTable.Header>

          <GetRows />

          <DataTable.Pagination
            key={Math.random(1000)}
            page={page}
            numberOfPages={Math.ceil(2)}
            onPageChange={page => {
              setFromRow(fromRow === 1 ? 7 : 1)
              setToRow(toRow === 7 ? 13 : 7)
              setPage(page)
            }}
            label={`${from + 1}-${to} of ${items.length * numberOfItemsPerPageList}`}
            showFastPaginationControls
            numberOfItemsPerPageList={numberOfItemsPerPageList}
            numberOfItemsPerPage={6}
          />
        </DataTable>
      </View>
    </ScrollView>
  )
}

export default CustomDataTable
