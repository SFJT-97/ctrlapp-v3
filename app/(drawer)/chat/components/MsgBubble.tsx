import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar, useTheme } from 'react-native-paper'
import { createChatStyles } from '../styles'

interface MsgBubbleProps {
  message: string
  messageTime: string
  isSender: boolean
  userToProfileImage?: string
  imageProfile?: string
  showAvatar?: boolean
}

const MsgBubble: React.FC<MsgBubbleProps> = ({
  message = '',
  messageTime = '',
  isSender = true,
  userToProfileImage,
  imageProfile,
  showAvatar = true
}) => {
  const theme = useTheme()
  const styles = createChatStyles(theme)

  const avatarSource = isSender
    ? imageProfile && imageProfile.trim() !== ''
      ? { uri: imageProfile }
      : undefined
    : userToProfileImage && userToProfileImage.trim() !== ''
      ? { uri: userToProfileImage }
      : undefined

  return (
    <View
      style={[
        styles.messageContainer,
        isSender ? styles.messageContainerSender : styles.messageContainerReceiver
      ]}
    >
      {!isSender && showAvatar && (
        avatarSource ? (
          <Avatar.Image
            size={32}
            source={avatarSource}
            style={[styles.messageAvatar, { backgroundColor: theme.colors.surfaceVariant }]}
          />
        ) : (
          <Avatar.Text
            size={32}
            label="U"
            style={[styles.messageAvatar, { backgroundColor: theme.colors.surfaceVariant }]}
          />
        )
      )}
      <View
        style={[
          styles.messageBubble,
          isSender ? styles.messageBubbleSender : styles.messageBubbleReceiver
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isSender ? styles.messageTextSender : styles.messageTextReceiver
          ]}
        >
          {message}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text
            style={[
              styles.messageTime,
              isSender && styles.messageTimeSender
            ]}
          >
            {messageTime}
          </Text>
          {isSender && (
            <Text style={[styles.messageStatus, styles.messageTimeSender]}>
              {' ✓'}
            </Text>
          )}
        </View>
      </View>
      {isSender && showAvatar && (
        avatarSource ? (
          <Avatar.Image
            size={32}
            source={avatarSource}
            style={[styles.messageAvatar, { backgroundColor: theme.colors.surfaceVariant }]}
          />
        ) : (
          <Avatar.Text
            size={32}
            label="M"
            style={[styles.messageAvatar, { backgroundColor: theme.colors.surfaceVariant }]}
          />
        )
      )}
    </View>
  )
}

export default MsgBubble

