import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Text, SegmentedButtons } from 'react-native-paper'

const ActionConditionButton = ({ setEventType, eventType, fromAIReport }) => {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (fromAIReport && eventType && eventType !== '-') {
      setEventType(eventType.toLowerCase())
      setValue(eventType.toLowerCase())
    }
  }, [eventType])

  return (
    <View style={{ rowGap: 10 }}>
      <Text variant='headlineSmall'>Type</Text>
      <SegmentedButtons
        value={value}
        onValueChange={(val) => {
          setValue(val)
          setEventType(val)
        }}
        buttons={[
          {
            value: 'action',
            label: 'Action'
          },
          {
            value: 'condition',
            label: 'Condition'
          }
        ]}
      />
    </View>
  )
}

export default ActionConditionButton
