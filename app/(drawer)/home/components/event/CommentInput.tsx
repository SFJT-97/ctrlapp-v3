import React, { useState, useCallback } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { TextInput, IconButton, useTheme, Text } from 'react-native-paper'

interface CommentInputProps {
  onSubmit: (comment: string) => Promise<void>
  placeholder?: string
  maxLength?: number
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder = 'Add a comment...',
  maxLength = 500
}) => {
  const theme = useTheme()
  const [comment, setComment] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = useCallback(async (): Promise<void> => {
    const trimmedComment = comment.trim()
    if (!trimmedComment || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(trimmedComment)
      setComment('')
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [comment, isSubmitting, onSubmit])

  const canSubmit = comment.trim().length > 0 && !isSubmitting
  const showCounter = comment.length > maxLength * 0.8

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outlineVariant
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 24,
          paddingHorizontal: 4,
          paddingVertical: 4,
          marginRight: 8,
          maxHeight: 100
        }}
      >
        <TextInput
          style={{
            flex: 1,
            fontSize: 14,
            color: theme.colors.onSurface,
            paddingHorizontal: 12,
            paddingVertical: 8,
            maxHeight: 100,
            minHeight: 40,
            backgroundColor: 'transparent'
          }}
          value={comment}
          mode='flat'
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          multiline
          maxLength={maxLength}
          onChangeText={setComment}
          underlineColorAndroid='transparent'
          underlineColor='transparent'
          activeUnderlineColor='transparent'
          contentStyle={{ color: theme.colors.onSurface }}
        />
        <TouchableOpacity
          style={{
            margin: 4,
            backgroundColor: canSubmit ? theme.colors.primary : theme.colors.surfaceDisabled,
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: canSubmit ? 1 : 0.5
          }}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <IconButton
            icon='send'
            size={20}
            iconColor={canSubmit ? theme.colors.onPrimary : theme.colors.onSurfaceDisabled}
            disabled={!canSubmit}
          />
        </TouchableOpacity>
      </View>
      {showCounter && (
        <Text
          style={{
            fontSize: 11,
            color: theme.colors.onSurfaceVariant,
            position: 'absolute',
            bottom: 2,
            right: 20
          }}
        >
          {comment.length}/{maxLength}
        </Text>
      )}
    </View>
  )
}

export default CommentInput

