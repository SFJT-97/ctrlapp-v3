// Buitlin modules
import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { SelectList } from 'react-native-dropdown-select-list'

const EventClassification = ({ allTicketNewClassification, setEventClassification, eventType, fromAIReport, eventClassificationValue }) => {
  const theme = useTheme()

  const [value, setValue] = useState('')

  let eventClassification = allTicketNewClassification?.filter(el => el?.idClassification !== 'ARI' && el?.idClassification !== 'PEI')

  eventClassification = eventClassification?.map(el => {
    // armar una lista desplegable según evenType
    // console.log('eventClassification =', el.idClassification + ' - ' + el.classification, ' === ', (el.idClassification + ' - ' + el.classification) === eventClassificationValue)
    return (
      {
        key: el?.idClassification + ' - ' + el?.classification,
        value: el?.idClassification + ' - ' + el?.classification,
        disabled: eventType === undefined
      }
    )
  })

  useEffect(() => {
    if (fromAIReport && eventClassificationValue && eventClassificationValue !== '-') {
      setEventClassification(eventClassificationValue)
      setValue(eventClassificationValue)
    } else {
      setValue(value)
    }
  }, [eventClassificationValue])

  useEffect(() => {
    if (!fromAIReport) {
      setValue(value)
    }
  }, [])

  return (
    <View style={{ rowGap: 10 }}>
      <Text style={{ color: theme.colors.onBackground }} variant='headlineSmall'>Classification</Text>
      <SelectList
        setSelected={(val) => {
          // console.log(val)
          setValue(val)
          setEventClassification(val)
        }}
        placeholder={fromAIReport && eventClassificationValue !== '-' ? eventClassificationValue : 'Select Option'}
        data={eventClassification}
        dropdownTextStyles={{ color: theme.colors.onBackground }}
        inputStyles={{ color: theme.colors.onBackground }} // texto adentro de la caja
        disabledItemStyles={{ backgroundColor: theme.colors.background }}
        disabledTextStyles={{ color: theme.colors.onSurfaceDisabled }}
        boxStyles={{ backgroundColor: theme.colors.elevation.level5 }}
        save='key'
      />
    </View>

  )
}

export default EventClassification
