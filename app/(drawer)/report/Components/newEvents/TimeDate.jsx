import React, { useState, useEffect } from 'react'
import { View, Text, Platform, StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme, Button } from 'react-native-paper'

// Validate date
const isValidDate = (date) => date instanceof Date && !isNaN(date)

// Format date as dd/mm/yyyy, hh:mm AM/PM
const formatDateTime = (date) => {
  if (!isValidDate(date)) return 'Invalid date'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const year = date.getFullYear()
  const hours = date.getHours() % 12 || 12 // Convert to 12-hour format
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM'
  return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`
}

const TimeDate = ({ dateTimeEvent, setDateTimeEvent, isIAEvent = false }) => {
  const theme = useTheme()

  // Initialize date from dateTimeEvent or current date
  const initialDate = isIAEvent && isValidDate(new Date(dateTimeEvent))
    ? new Date(dateTimeEvent)
    : new Date()

  // State for date, picker visibility, and temporary date
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [tempDate, setTempDate] = useState(initialDate) // Temporary state for iOS
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  useEffect(() => {
    if (isIAEvent && isValidDate(new Date(dateTimeEvent))) {
      const newDate = new Date(dateTimeEvent)
      setSelectedDate(newDate)
      setTempDate(newDate)
    }
  }, [isIAEvent, dateTimeEvent])

  // Handle date picker changes
  const onDateChange = (event, selected) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false) // Close picker on Android
      if (selected) {
        setSelectedDate(selected)
        setTempDate(selected)
        setDateTimeEvent(selected.toISOString())
      }
    } else {
      // iOS: Update tempDate without closing picker
      if (selected) {
        setTempDate(selected)
      }
    }
  }

  // Handle time picker changes
  const onTimeChange = (event, selected) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false) // Close picker on Android
      if (selected) {
        setSelectedDate(selected)
        setTempDate(selected)
        setDateTimeEvent(selected.toISOString())
      }
    } else {
      // iOS: Update tempDate without closing picker
      if (selected) {
        setTempDate(selected)
      }
    }
  }

  // Confirm iOS selection
  const handleConfirm = () => {
    setSelectedDate(tempDate)
    setDateTimeEvent(tempDate.toISOString())
    setShowDatePicker(false)
    setShowTimePicker(false)
  }

  // Cancel iOS selection
  const handleCancel = () => {
    setTempDate(selectedDate) // Revert to last confirmed date
    setShowDatePicker(false)
    setShowTimePicker(false)
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.onBackground }]}>
        Selected Date & Time:
      </Text>
      <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
        {formatDateTime(selectedDate)}
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          onPress={() => setShowDatePicker(true)}
          contentStyle={styles.buttonContent}
          buttonColor={theme.colors.inverseSurface}
          textColor={theme.colors.inverseOnSurface}
          icon='calendar-alert'
        >
          Select date
        </Button>
        <Button
          onPress={() => setShowTimePicker(true)}
          contentStyle={styles.buttonContent}
          buttonColor={theme.colors.inverseSurface}
          textColor={theme.colors.inverseOnSurface}
          icon='calendar-clock-outline'
        >
          Select time
        </Button>
      </View>
      {showDatePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={isValidDate(tempDate) ? tempDate : new Date()}
            mode='date'
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.iosButtonContainer}>
              <Button
                onPress={handleCancel}
                contentStyle={styles.buttonContent}
                buttonColor={theme.colors.errorContainer}
                textColor={theme.colors.onErrorContainer}
              >
                Cancel
              </Button>
              <Button
                onPress={handleConfirm}
                contentStyle={styles.buttonContent}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
              >
                Done
              </Button>
            </View>
          )}
        </View>
      )}
      {showTimePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={isValidDate(tempDate) ? tempDate : new Date()}
            mode='time'
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.iosButtonContainer}>
              <Button
                onPress={handleCancel}
                contentStyle={styles.buttonContent}
                buttonColor={theme.colors.errorContainer}
                textColor={theme.colors.onErrorContainer}
              >
                Cancel
              </Button>
              <Button
                onPress={handleConfirm}
                contentStyle={styles.buttonContent}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
              >
                Done
              </Button>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 1
  },
  label: {
    marginBottom: 10,
    fontSize: 16
  },
  buttonContainer: {
    rowGap: 20,
    marginTop: 20
  },
  buttonContent: {
    padding: 5
  },
  pickerContainer: {
    marginTop: 10
  },
  iosButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  }
})

export default TimeDate

/*

  import { useState, useEffect, useRef } from 'react'
  import { View } from 'react-native'
  import { useTheme } from 'react-native-paper'
  import DatePicker, { getFormatedDate } from 'react-native-modern-datepicker'

  const TimeDate = ({ dateTimeEvent, setDateTimeEvent, isIAEvent = false }) => {
    const theme = useTheme()

    // Usamos useRef para mantener la fecha inicial sin cambiarla al renderizar nuevamente
    const initialDateRef = useRef(isIAEvent && dateTimeEvent ? dateTimeEvent : getFormatedDate(new Date().toISOString(), 'YYYY/MM/DD h:m'))
    const initialTimeRef = useRef(isIAEvent && dateTimeEvent ? dateTimeEvent : getFormatedDate(new Date().toISOString(), 'YYYY/MM/DD h:m'))

    const [selectedDate, setSelectedDate] = useState(initialDateRef.current)
    const [selectedTime, setSelectedTime] = useState(initialTimeRef.current)

    useEffect(() => {
      if (isIAEvent && dateTimeEvent) {
        setSelectedDate(dateTimeEvent)
        setSelectedTime(dateTimeEvent)
      }
    }, [isIAEvent, dateTimeEvent])

    return (
      <View>
        <DatePicker
          onSelectedChange={(date) => {
            setSelectedDate(date)
            setDateTimeEvent(date)
          }}
          onTimeChange={time => {
            setSelectedTime(time)
          }}
          selected={selectedDate}
          current={selectedTime}
          options={{
            backgroundColor: theme.colors.background,
            textHeaderColor: theme.colors.primary,
            textDefaultColor: theme.colors.onBackground,
            selectedTextColor: '#fff',
            mainColor: theme.colors.primary,
            textSecondaryColor: theme.colors.onBackground,
            borderColor: theme.colors.background
          }}
        />
      </View>
    )
  }

  export default TimeDate
*/
