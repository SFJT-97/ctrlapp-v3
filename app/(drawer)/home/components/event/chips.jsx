// Builtin modules
import { Dimensions, View } from 'react-native'
import { useTheme, Chip, Text } from 'react-native-paper'

// Red scale colors for risk qualification
const getRiskColor = (riskQualification) => {
  const riskColors = {
    'Catastrophic': '#8B0000',
    'Extremely Dangerous': '#8B0000',
    'Very Dangerous': '#8B0000',
    'Dangerous': '#DC143C',
    'Very Serious': '#DC143C',
    'Serious': '#FF6347',
    'Warning': '#FF6347',
    'Low warning': '#FFA07A',
    'Inconsequential': '#FFA07A',
    'Secure Event': '#FFA07A'
  }
  return riskColors[riskQualification] || '#FFE4E1'
}

// Yellow scale colors for solution type
const getSolutionColor = (solutionType) => {
  const solutionColors = {
    'Resolved': '#FFFF99',
    'Pending action': '#FFD700',
    'Partial action': '#FFA500',
    'Immediate action': '#FF8C00'
  }
  return solutionColors[solutionType] || '#FFE4B5'
}

const Chips = ({ param }) => {
  const theme = useTheme()

  const width = Dimensions.get('window').width
  // Para la versión 2, conviene ver de activar los tooltips
  if (param?.classification === 'ARI' || param?.classification === 'PEI') {
    return (
      <View style={{ width, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {param?.type && (
          <Chip style={{ backgroundColor: theme.colors.primary }}>
            <Text style={{ textTransform: 'capitalize', color: theme.colors.onPrimary }}>
              {param.type}
            </Text>
          </Chip>
        )}
        {param?.companySectorDescription && (
          <Chip style={{ backgroundColor: theme.colors.errorContainer }}>
            <Text style={{ textTransform: 'capitalize' }}>
              {param.companySectorDescription}
            </Text>
          </Chip>
        )}
        {param?.classificationDescription && (
          <Chip style={{ backgroundColor: theme.colors.errorContainer }}>
            <Text style={{ textTransform: 'capitalize' }}>
              {param.classificationDescription}
            </Text>
          </Chip>
        )}
        {param?.subType && (
          <Chip style={{ backgroundColor: theme.colors.errorContainer }}>
            <Text style={{ textTransform: 'capitalize' }}>
              {param.subType}
            </Text>
          </Chip>
        )}
      </View>
    )
  } else {
    return (
      <View style={{ width, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {param?.type && (
          <Chip style={{ backgroundColor: theme.colors.primary }}>
            <Text style={{ textTransform: 'capitalize', color: theme.colors.onPrimary }}>
              {param.type}
            </Text>
          </Chip>
        )}
        {param?.companySectorDescription && (
          <Chip>
            <Text style={{ textTransform: 'capitalize' }}>
              {param.companySectorDescription}
            </Text>
          </Chip>
        )}
        {param?.classificationDescription && (
          <Chip>
            <Text style={{ textTransform: 'capitalize' }}>
              {param.classificationDescription}
            </Text>
          </Chip>
        )}
        {param?.subType && (
          <Chip>
            <Text style={{ textTransform: 'capitalize' }}>
              {param.subType}
            </Text>
          </Chip>
        )}
        {param?.riskQualification && (
          <Chip style={{ backgroundColor: getRiskColor(param.riskQualification) }}>
            <Text style={{ textTransform: 'capitalize', color: '#FFFFFF', fontWeight: '500' }}>
              {param.riskQualification}
            </Text>
          </Chip>
        )}
        {param?.solutionType && (
          <Chip style={{ backgroundColor: getSolutionColor(param.solutionType) }}>
            <Text style={{ textTransform: 'capitalize', color: '#000000', fontWeight: '500' }}>
              {param.solutionType}
            </Text>
          </Chip>
        )}
      </View>
    )
  }
}

export default Chips
