// Builtin modules
import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { SelectList } from 'react-native-dropdown-select-list'

const EventSubtype = ({ allTicketNewSubType, setEventSubType, eventSubTypeValue, fromAIReport }) => {
  const theme = useTheme()
  const [value, setValue] = useState('')
  const [eventSubtype, setEventSubtype] = useState({ key: 0, value: '' })

  useEffect(() => {
    if (allTicketNewSubType) {
      const temp = allTicketNewSubType.map(el => {
        return (
          {
            key: el.idTicketNewSubType,
            value: el.subTypeDescription
          }
        )
      })
      setEventSubtype(temp)
    }
  }, [allTicketNewSubType])

  useEffect(() => {
    if (!fromAIReport) {
      setValue(value)
    }
  }, [])

  useEffect(() => {
    if (eventSubTypeValue && fromAIReport && eventSubTypeValue !== '-') {
      setEventSubType(eventSubTypeValue)
      setValue(eventSubTypeValue)
    }
  }, [eventSubTypeValue])

  return (
    <View style={{ rowGap: 10 }}>
      <Text variant='headlineSmall' style={{ color: theme.colors.onBackground }}>Subtype</Text>
      <SelectList
        setSelected={(val) => {
          setValue(val)
          setEventSubType(val)
        }}
        placeholder={fromAIReport & eventSubTypeValue !== '-' ? eventSubTypeValue : 'Select Option'}
        data={eventSubtype}
        dropdownTextStyles={{ color: theme.colors.onBackground }}
        inputStyles={{ color: theme.colors.onBackground }} // texto adentro de la caja
        disabledItemStyles={{ backgroundColor: theme.colors.background }}
        disabledTextStyles={{ color: theme.colors.onSurfaceDisabled }}
        boxStyles={{ backgroundColor: theme.colors.elevation.level5 }}
        save='value'
      />
    </View>

  )
}

export default EventSubtype
