import React from 'react'
import { View, Text } from 'react-native'
import { useTheme } from 'react-native-paper'
import { createChatStyles } from '../styles'

interface DateSeparatorProps {
  date: string
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const theme = useTheme()
  const styles = createChatStyles(theme)

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Today'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // Try parsing as timestamp if string date fails
        const timestamp = Number(dateString)
        if (!isNaN(timestamp)) {
          const dateFromTimestamp = new Date(timestamp)
          if (!isNaN(dateFromTimestamp.getTime())) {
            return formatDateFromDate(dateFromTimestamp)
          }
        }
        return 'Today'
      }
      
      return formatDateFromDate(date)
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Today'
    }
  }

  const formatDateFromDate = (date: Date): string => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const isToday = date.toDateString() === today.toDateString()
    const isYesterday = date.toDateString() === yesterday.toDateString()

    if (isToday) {
      return 'Today'
    } else if (isYesterday) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  return (
    <View style={styles.dateSeparator}>
      <Text style={styles.dateSeparatorText}>{formatDate(date)}</Text>
    </View>
  )
}

export default DateSeparator

