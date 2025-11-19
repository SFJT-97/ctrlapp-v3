import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

interface EventCardHeaderProps {
  classification?: string
  classificationDescription?: string
  companySectorDescription?: string
  dateTimeEvent?: string | number
  userName?: string
  onPress?: () => void
}

const EventCardHeader: React.FC<EventCardHeaderProps> = ({
  classification,
  classificationDescription,
  companySectorDescription,
  dateTimeEvent,
  userName,
  onPress
}) => {
  const theme = useTheme()

  const formatDateTime = (timestamp?: string | number): string => {
    if (!timestamp && timestamp !== 0) return 'Just now'
    const date = new Date(Number(timestamp))
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.surface
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.onSurface,
              marginRight: 8
            }}
            numberOfLines={1}
          >
            {userName || companySectorDescription || 'Event'}
          </Text>
          {classification && (
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.onSurfaceVariant,
                marginLeft: 4
              }}
            >
              • {classification}
            </Text>
          )}
        </View>
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.onSurfaceVariant
          }}
        >
          {formatDateTime(dateTimeEvent)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          // Placeholder for future menu functionality
        }}
        style={{ padding: 4 }}
      >
        <Text style={{ fontSize: 20, color: theme.colors.onSurfaceVariant }}>⋯</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

export default EventCardHeader

