// Builtin modules
// import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

// Custom modules
import TimeDate from './TimeDate'

const DateTime = ({ dateTimeEvent, setDateTimeEvent, isIAEvent = false }) => {
  const theme = useTheme()
  return (
    <View style={{ rowGap: 10 }}>
      <Text variant='headlineSmall' style={{ color: theme.colors.onBackground }}>
        Date & Time
      </Text>
      <View>
        <TimeDate setDateTimeEvent={setDateTimeEvent} dateTimeEvent={dateTimeEvent} isIAEvent={isIAEvent} />
      </View>
    </View>

  )
}

export default DateTime
