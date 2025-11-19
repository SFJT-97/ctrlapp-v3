import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar, IconButton, useTheme } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { createChatStyles } from '../styles'

interface ChatHeaderProps {
  name: string
  userProfileImage?: string
  idUserTo?: string
  companyJobRoleDescription?: string
  onBack?: () => void
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  userProfileImage,
  idUserTo,
  companyJobRoleDescription,
  onBack
}) => {
  const theme = useTheme()
  const router = useRouter()
  const styles = createChatStyles(theme)

  const handleBack = (): void => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const avatarSource = userProfileImage && userProfileImage.trim() !== ''
    ? { uri: userProfileImage }
    : undefined

  return (
    <View style={styles.chatHeader}>
      <TouchableOpacity onPress={handleBack} style={{ marginRight: 8 }}>
        <IconButton icon='arrow-left' size={24} iconColor={theme.colors.onSurface} />
      </TouchableOpacity>
      {avatarSource ? (
        <Avatar.Image
          size={40}
          source={avatarSource}
          style={{ backgroundColor: theme.colors.surfaceVariant }}
        />
      ) : (
        <Avatar.Text
          size={40}
          label={name?.[0]?.toUpperCase() || 'U'}
          style={{ backgroundColor: theme.colors.surfaceVariant }}
        />
      )}
      <View style={styles.chatHeaderContent}>
        <Text style={styles.chatHeaderName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.chatHeaderStatus}>
          {companyJobRoleDescription || 'Employee'}
        </Text>
      </View>
      <IconButton
        icon='dots-vertical'
        size={24}
        iconColor={theme.colors.onSurface}
        onPress={() => {
          // Placeholder for future menu functionality
        }}
      />
    </View>
  )
}

export default ChatHeader

