// Builtin modules
import { Dimensions, View } from 'react-native'
import { useTheme, Chip, Text } from 'react-native-paper'

const Chips = ({ param }) => {
  const theme = useTheme()

  const width = Dimensions.get('window').width
  // Para la versión 2, conviene ver de activar los tooltips
  if (param?.classification === 'ARI' || param?.classification === 'PEI') {
    return (
      <View style={{ width, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {/* <Tooltip title='action, condition' leaveTouchDelay={3000}> */}
        <Chip style={{ backgroundColor: theme.colors.errorContainer }}>
          <Text style={{ textTransform: 'capitalize' }}>
            {param?.type}
          </Text>
        </Chip>
        {/* </Tooltip> */}
        {/* <Tooltip title='' leaveTouchDelay={3000}> */}
        <Chip style={{ backgroundColor: theme.colors.errorContainer }}>
          <Text style={{ textTransform: 'capitalize' }}>
            {param?.companySectorDescription}
          </Text>
        </Chip>
        {/* </Tooltip> */}
        {/* <Tooltip title='' leaveTouchDelay={3000}> */}
        <Chip style={{ backgroundColor: theme.colors.errorContainer }}>
          <Text style={{ textTransform: 'capitalize' }}>
            {param?.classificationDescription}
          </Text>
        </Chip>
        {/* </Tooltip> */}
        {/* <Tooltip title='' leaveTouchDelay={3000}> */}
        <Chip style={{ backgroundColor: theme.colors.errorContainer }}>
          <Text style={{ textTransform: 'capitalize' }}>
            {param?.subType}
          </Text>
        </Chip>
        {/* </Tooltip> */}
      </View>
    )
  } else {
    return (
      <View style={{ width, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        <Chip>
          <Text style={{ textTransform: 'capitalize' }}>
            {param?.type}
          </Text>
        </Chip>
        <Chip>
          <Text style={{ textTransform: 'capitalize' }}>
            {param?.companySectorDescription}
          </Text>
        </Chip>
        <Chip>
          <Text style={{ textTransform: 'capitalize' }}>
            {param?.classificationDescription}
          </Text>
        </Chip>
        <Chip>
          <Text style={{ textTransform: 'capitalize' }}>
            {param?.subType}
          </Text>
        </Chip>
        <Chip>
          <Text style={{ textTransform: 'capitalize' }}>
            {param?.riskQualification}
          </Text>
        </Chip>
        <Chip>
          <Text style={{ textTransform: 'capitalize' }}>
            {param?.solutionType}
          </Text>
        </Chip>
      </View>
    )
  }
}

export default Chips
