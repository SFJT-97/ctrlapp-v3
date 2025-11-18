// Builtin Modules
import { useState } from 'react'
import { View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { SelectList } from 'react-native-dropdown-select-list'

const DateEventsDropDown = ({ eventsDays, setDayEvent }) => {
  const theme = useTheme()
  const [value, setValue] = useState(undefined)
  const companySectors = eventsDays?.map(el => {
    return (
      {
        key: el,
        value: el
      }
    )
  })

  return (
    <View style={{ rowGap: 10 }}>
      <Text variant='headlineSmall'>
        Event Days
      </Text>
      <SelectList
        setSelected={(val) => {
          setValue(val)
          setDayEvent(val)
        }}
        placeholder='Select day of event'
        data={companySectors}
        save='value'
        boxStyles={value ? { backgroundColor: theme.colors.elevation.level5 } : undefined}
      />
    </View>

  )
}

export default DateEventsDropDown
