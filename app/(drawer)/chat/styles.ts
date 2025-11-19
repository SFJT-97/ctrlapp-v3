import { StyleSheet, Platform } from 'react-native'
import { MD3Theme } from 'react-native-paper'

export const createChatStyles = (theme: MD3Theme) => {
  return StyleSheet.create({
    // Chat List Styles
    chatListContainer: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    chatListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outlineVariant
    },
    chatListItemContent: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'center'
    },
    chatListItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4
    },
    chatListItemName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1
    },
    chatListItemTime: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginLeft: 8
    },
    chatListItemMessage: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2
    },
    chatListItemUnread: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      paddingHorizontal: 6,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4
    },
    chatListItemUnreadText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
      fontWeight: '600'
    },
    chatListEmpty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32
    },
    chatListEmptyText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 16
    },
    avatarContainer: {
      position: 'relative'
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#4CAF50',
      borderWidth: 2,
      borderColor: theme.colors.surface
    },

    // Chat Screen Styles
    chatScreenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    chatMessagesContainer: {
      flex: 1,
      paddingHorizontal: 8
    },
    chatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outlineVariant,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4
    },
    chatHeaderContent: {
      flex: 1,
      marginLeft: 12
    },
    chatHeaderName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface
    },
    chatHeaderStatus: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2
    },
    dateSeparator: {
      alignSelf: 'center',
      marginVertical: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 16
    },
    dateSeparatorText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500'
    },

    // Message Bubble Styles
    messageContainer: {
      flexDirection: 'row',
      marginVertical: 6,
      paddingHorizontal: 12,
      alignItems: 'flex-end'
    },
    messageContainerSender: {
      justifyContent: 'flex-end'
    },
    messageContainerReceiver: {
      justifyContent: 'flex-start'
    },
    messageBubble: {
      maxWidth: '75%',
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginHorizontal: 4,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2
        },
        android: {
          elevation: 2
        }
      })
    },
    messageBubbleSender: {
      backgroundColor: theme.colors.primaryContainer,
      borderBottomRightRadius: 4
    },
    messageBubbleReceiver: {
      backgroundColor: theme.colors.surfaceVariant,
      borderBottomLeftRadius: 4
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
      color: theme.colors.onSurface
    },
    messageTextSender: {
      color: theme.colors.onPrimaryContainer
    },
    messageTextReceiver: {
      color: theme.colors.onSurfaceVariant
    },
    messageTime: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
      alignSelf: 'flex-end'
    },
    messageTimeSender: {
      color: theme.colors.onPrimaryContainer,
      opacity: 0.7
    },
    messageAvatar: {
      marginHorizontal: 8,
      marginBottom: 4
    },
    messageStatus: {
      fontSize: 10,
      marginLeft: 4,
      opacity: 0.6
    },

    // Message Input Styles
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.outlineVariant
    },
    inputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 24,
      paddingHorizontal: 4,
      paddingVertical: 4,
      marginHorizontal: 8,
      maxHeight: 100
    },
    textInput: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.onSurface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      maxHeight: 100,
      minHeight: 40,
      backgroundColor: 'transparent'
    },
    sendButtonContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center'
    },
    inputButton: {
      margin: 4,
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center'
    },
    inputButtonDisabled: {
      backgroundColor: theme.colors.surfaceDisabled,
      opacity: 0.5
    },
    attachmentButton: {
      margin: 4,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center'
    },
    characterCounter: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'right',
      paddingHorizontal: 12,
      paddingTop: 4
    }
  })
}

// Legacy exports for backward compatibility (will be removed)
export const chatlist = StyleSheet.create({
  chatListRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  chatListContent: {
    flexDirection: 'row',
    width: 220
  }
})

export const msginput = StyleSheet.create({
  textInputRow: {
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  textInputBox: {
    width: 330,
    margin: 15
  }
})

export const msgbubble = StyleSheet.create({
  container: {
    maxWidth: '80%',
    borderRadius: 8,
    padding: 6,
    height: 'auto',
    marginVertical: 2,
    flexDirection: 'row'
  },
  senderContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#CCE8E7',
    flexWrap: 'wrap',
    margin: 10,
    columnGap: 5,
    maxWidth: 350
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F1F0',
    flexWrap: 'wrap',
    margin: 10,
    columnGap: 5,
    maxWidth: 350
  },
  message: {
    fontSize: 18,
    color: '#000000',
    flexShrink: 1
  },
  timeSenderMessage: {
    textAlign: 'right',
    fontSize: 11,
    fontStyle: 'italic',
    marginHorizontal: 10,
    marginVertical: 3
  },
  senderMessage: {
    textAlign: 'right'
  },
  receiverMessage: {
    textAlign: 'left'
  },
  timeReceiveMessage: {
    textAlign: 'left',
    fontSize: 11,
    fontStyle: 'italic',
    marginHorizontal: 10,
    marginVertical: 3
  }
})

