// Built in modules
import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import DatePicker, { getToday } from 'react-native-modern-datepicker'

const MINUTE_INTERVAL = 5
const DateEvent = ({ setTimeEvent, setDateEvent, timeEvent, dateEvent }) => {
  const theme = useTheme()
  const [selectedDate, setSelectedDate] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    setTime(getFormatedTime(timeEvent))
    setTimeEvent(getFormatedTime(timeEvent))
  }, [])
  return (
    <View style={{ rowGap: 10 }}>
      <DatePicker
        onSelectedChange={(val) => {
          setSelectedDate(val)
          setDateEvent(val)
        }}
        mode='calendar'
        selected={getToday()}
        options={{
          backgroundColor: theme.colors.elevation.background,
          textHeaderColor: 'green',
          textDefaultColor: theme.colors.onBackground,
          selectedTextColor: theme.colors.onPrimary,
          mainColor: theme.colors.primary,
          textSecondaryColor: theme.colors.onBackground,
          borderColor: theme.colors.primary
        }}
      />
      <DatePicker
        mode='time'
        minuteInterval={MINUTE_INTERVAL}
        onTimeChange={(val) => {
          setTime(val)
          setTimeEvent(val)
        }}
        selected={time.toString()}
        options={{
          backgroundColor: theme.colors.elevation.background,
          textHeaderColor: 'green',
          textDefaultColor: theme.colors.onBackground,
          selectedTextColor: theme.colors.onPrimary,
          mainColor: theme.colors.primary,
          textSecondaryColor: theme.colors.onBackground,
          borderColor: theme.colors.primary
        }}
      />
    </View>
  )
}

// función que setea la hora de acuerdo al formato de MINUTE_INTERVAL del picker
function getFormatedTime () {
  const hour = new Date().getHours()
  let minute = new Date().getMinutes()
  if (minute % MINUTE_INTERVAL > Math.floor(MINUTE_INTERVAL / 2) && minute < 55) {
    minute += MINUTE_INTERVAL - (minute % MINUTE_INTERVAL)
  } else {
    minute -= (minute % MINUTE_INTERVAL)
  }
  if (minute < 10) minute = '0' + minute
  return hour + ':' + minute
}

export default DateEvent
