import { TouchableOpacity, View } from 'react-native'
import { useTheme, Avatar, Card, Text, Chip, Divider } from 'react-native-paper'
import CardEventSummary from '../../../../../globals/components/CardEventSummary.jsx'

const colors = ['#FF0000', '#FF6600', '#FFCC00', '#FFFF00']
const solutionColors = ['#009900', '#FF6600', '#FF9900', '#FF0000']

function switchRisk (risk) {
  const mapping = {
    Catastrophic: 0,
    'Extremely Dangerous': 0,
    'Very Dangerous': 0,
    Dangerous: 1,
    'Very Serious': 1,
    Serious: 2,
    Warning: 2,
    'Low warning': 3,
    Inconsequential: 3,
    'Secure Event': 3
  }

  const index = mapping[risk]
  return typeof index === 'number' ? colors[index] : '#FFFFFF'
}

function switchSolution (solution) {
  const mapping = {
    Resolved: 0,
    'Pending action': 1,
    'Partial action': 2,
    'Immediate action': 3
  }

  const index = mapping[solution]
  return typeof index === 'number' ? solutionColors[index] : '#FFFFFF'
}

const CardComponent = ({ item, onPress }) => {
  const theme = useTheme()
  if (!item || !onPress) return

  const LeftContent = ({ ...props }) => {
    // Determine icon based on item.type
    const icon = item?.type === 'action'
      ? 'alpha-a'
      : item?.type === 'condition'
        ? 'alpha-c'
        : 'alert-circle-outline'
    return <Avatar.Icon {...props} icon={icon} color='red' size={50} style={{ backgroundColor: cardBackgroundColor, borderWidth: 1 }} />
  }

  // console.log('data\n', item)

  const date = new Date(Number(item?.dateTimeEvent))?.toDateString()
  const titleLarge = item?.riskQualification
  const title = `${item?.classification} - ${item?.classificationDescription}`
  const description = item?.ticketCustomDescription

  // Conditional card background color based on classification
  const cardBackgroundColor = item?.type === 'action'
    ? theme.colors.secondaryContainer // Light red background for classification A or C
    : theme.colors.tertiaryContainer // Default white background for other classifications

  const textOnBackground = item?.type === 'action'
    ? theme.colors.onSecondaryContainer // Light on background for classification A or C
    : theme.colors.onTertiaryContainer // Default on background for other classifications

  // Get background color for Chip based on risk qualification
  const chipBackgroundColor = switchRisk(item?.riskQualification)
  const chipSolutionBackgroundColor = switchSolution(item?.solutionType)

  return (

    <TouchableOpacity
      onPress={onPress}
    >
      <Card style={{ borderRadius: 10, margin: 5, backgroundColor: cardBackgroundColor }}>
        <Card.Title
          title={title || 'title'}
          titleStyle={{ fontWeight: 'bold' }}
          subtitle={item?.companySectorDescription || 'subtitle'}
          left={LeftContent}
          right={() => <Text variant='labelMedium' style={{ marginRight: 10, color: theme.colors.onBackground }}>{date}</Text>}
        />
        <Card.Content>
          <CardEventSummary item={item} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginVertical: 10, columnGap: 5 }}>
            <Chip
              elevated
              compact
              textStyle={{ color: 'black' }}
              style={{ backgroundColor: chipBackgroundColor, width: 'auto' }}
            >
              {titleLarge}
            </Chip>
            <Chip
              elevated
              compact
              textStyle={{ color: 'black' }}
              style={{ backgroundColor: chipSolutionBackgroundColor, width: 'auto' }}
            >
              {item?.solutionType}
            </Chip>
          </View>
          <Divider bold style={{ marginVertical: 10 }} />
          <Text style={{ marginBottom: 10, color: textOnBackground }} variant='bodyMedium'>{description?.slice(0, 50)}...</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  )
}

export default CardComponent
