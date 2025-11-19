/**
 * MediaSlot Component - Reusable component for displaying media slots
 * Shows either empty placeholder or filled thumbnail with actions
 */

import React from 'react'
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useTheme, IconButton, Text, Badge } from 'react-native-paper'
import { EMARAY_CAMERA_JPG, EMARAY_VIDEORECORDER_JPG } from '../../../../../globals/variables/globalVariables'

interface MediaSlotProps {
  slotType: 'photo' | 'video'
  slotNumber?: number // 1, 2, 3 for photos
  media?: { uri: string; mimeType?: string; name?: string; size?: number } | null
  onPress: () => void
  onLongPress?: () => void
  onDelete?: () => void
  isVideo?: boolean
}

export default function MediaSlot({
  slotType,
  slotNumber,
  media,
  onPress,
  onLongPress,
  onDelete,
  isVideo = false
}: MediaSlotProps): React.JSX.Element {
  const theme = useTheme()
  const hasMedia = !!media?.uri

  if (hasMedia) {
  return (
    <TouchableOpacity
      style={[styles.container, styles.filledContainer, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
        <Image
          source={{ uri: media.uri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          {slotType === 'photo' && slotNumber && (
            <Badge style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              {slotNumber}
            </Badge>
          )}
          {isVideo && (
            <Badge style={[styles.badge, { backgroundColor: theme.colors.error }]}>
              <Text style={{ color: 'white', fontSize: 10 }}>VIDEO</Text>
            </Badge>
          )}
          {onDelete && (
            <IconButton
              icon="close-circle"
              size={20}
              iconColor={theme.colors.error}
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  // Empty slot
  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles.emptyContainer,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outline,
          borderWidth: 2,
          borderStyle: 'dashed'
        }
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.emptyContent}>
        {isVideo ? (
          <>
            <IconButton
              icon="video-plus"
              size={32}
              iconColor={theme.colors.primary}
            />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Add Video
            </Text>
          </>
        ) : (
          <>
            <IconButton
              icon="camera-plus"
              size={32}
              iconColor={theme.colors.primary}
            />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {slotNumber ? `Photo ${slotNumber}` : 'Add Photo'}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  filledContainer: {
    elevation: 2
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 4
  },
  badge: {
    position: 'absolute',
    top: 4,
    left: 4
  },
  deleteButton: {
    margin: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16
  }
})

