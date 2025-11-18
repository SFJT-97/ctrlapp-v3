// Builtin modules
import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Text, TextInput, useTheme } from 'react-native-paper'

const EventDescription = ({ setDescription, descriptionValue, fromAIReport }) => {
  const [value, setValue] = useState('')
  const theme = useTheme()

  useEffect(() => {
    if (fromAIReport && descriptionValue && descriptionValue !== '-') {
      setDescription(descriptionValue)
      setValue(descriptionValue)
    }
  }, [descriptionValue])

  return (
    <View style={{ rowGap: 10 }}>
      <Text variant='headlineSmall' style={{ color: theme.colors.onBackground }}>Description</Text>
      <TextInput
        mode='outlined'
        value={value}
        onChangeText={description => {
          setDescription(description)
          setValue(description)
        }}
        multiline
        style={{ textAlignVertical: 'center', color: theme.colors.primary }}
      />
    </View>
  )
}

export default EventDescription
