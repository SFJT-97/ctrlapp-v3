import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Avatar, Text, useTheme, IconButton } from 'react-native-paper'
import { getFormatedTime } from '../../../../../globals/functions/functions'

interface CommentItemProps {
  id: string
  comment: string
  nickName: string
  createdAt: string
  userProfileImage?: string
  onLike?: (id: string) => void
  liked?: boolean
  likeCount?: number
}

const CommentItem: React.FC<CommentItemProps> = ({
  id,
  comment,
  nickName,
  createdAt,
  userProfileImage,
  onLike,
  liked = false,
  likeCount = 0
}) => {
  const theme = useTheme()

  const avatarSource = userProfileImage && userProfileImage.trim() !== ''
    ? { uri: userProfileImage }
    : undefined

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant
      }}
    >
      {avatarSource ? (
        <Avatar.Image
          size={40}
          source={avatarSource}
          style={{ backgroundColor: theme.colors.surfaceVariant, marginRight: 12 }}
        />
      ) : (
        <Avatar.Text
          size={40}
          label={nickName?.[0]?.toUpperCase() || 'U'}
          style={{ backgroundColor: theme.colors.surfaceVariant, marginRight: 12 }}
        />
      )}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.onSurface,
              marginRight: 8
            }}
          >
            {nickName}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.onSurfaceVariant
            }}
          >
            {getFormatedTime(createdAt)}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.onSurface,
            lineHeight: 20,
            marginBottom: 8
          }}
        >
          {comment}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => onLike?.(id)}
            style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
          >
            <IconButton
              icon={liked ? 'heart' : 'heart-outline'}
              size={18}
              iconColor={liked ? theme.colors.error : theme.colors.onSurfaceVariant}
              style={{ margin: 0 }}
            />
            {likeCount > 0 && (
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.onSurfaceVariant,
                  marginLeft: -8
                }}
              >
                {likeCount}
              </Text>
            )}
          </TouchableOpacity>
          {/* Placeholder for reply functionality */}
          {/* <TouchableOpacity>
            <Text style={{ fontSize: 12, color: theme.colors.primary }}>Reply</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  )
}

export default CommentItem

