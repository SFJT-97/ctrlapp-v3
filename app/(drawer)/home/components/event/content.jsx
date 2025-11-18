// ==> 2024-10-02
// Builtin moduls
import { useEffect, useState } from 'react'
import { Alert, Dimensions, View } from 'react-native'
import { useTheme, Text } from 'react-native-paper'
import { getFormatedTime } from '../../../../../globals/functions/functions'

// Custom modules
import { useMe } from '../../../../../context/hooks/userQH'

const Content = ({ param }) => {
  const { me } = useMe()
  const [mySector, setMySector] = useState(false)
  const parParam = param
  const theme = useTheme()
  const width = Dimensions.get('window').width

  useEffect(() => {
    if (me && me !== 'Loading...' && me !== 'ApolloError') {
      try {
        setMySector(me.companySectorDescription === parParam.companySectorDescription)
      } catch (error) {
      }
    }
  }, [me])
  return (
    <View style={{ width: width * 0.8, rowGap: 10, margin: 20, display: 'flex', alignItems: 'center' }}>
      <View style={{ rowGap: 10, borderBottomWidth: 0.4, borderColor: theme.colors.onBackground }}>
        <Text variant='headlineMedium' style={{ textAlign: 'center', fontWeight: mySector ? 'bold' : 'normal' }}>
          {
            mySector && <Text onPress={() => Alert.alert('Alert', 'This happens in your sector!')}>⚠️</Text>
          } {parParam.companySectorDescription}: {parParam.subType}
        </Text>
        <Text variant='labelMedium' style={{ textAlign: 'center', fontStyle: 'italic', fontWeight: '400', marginBottom: 10 }}>
          {getFormatedTime(parParam.dateTimeEvent)}
        </Text>
      </View>
      <View style={{ marginTop: 20 }}>
        <Text variant='bodyLarge' style={{ fontWeight: '400' }}>
          {parParam.ticketCustomDescription}
        </Text>
      </View>
    </View>
  )
}

export default Content
