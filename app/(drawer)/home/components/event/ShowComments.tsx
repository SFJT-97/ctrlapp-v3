import React, { useState, useEffect, useCallback } from 'react'
import { View, FlatList, TouchableOpacity, AppState, AppStateStatus } from 'react-native'
import { Text, useTheme, Button, ActivityIndicator } from 'react-native-paper'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useIsFocused } from '@react-navigation/native'

import CommentItem from './CommentItem'
import CommentInput from './CommentInput'
import { useMe } from '../../../../../context/hooks/userQH'
import { DEFAULT_IMAGE } from '../../../../../globals/variables/globalVariables'
import { getImageUrl } from '../../../../../globals/functions/imageUtils'

const addNewTicketNewCommentM = gql`
  mutation AddNewTicketNewComment($idTicketNew: ID!, $comment: String) {
    addNewTicketNewComment(idTicketNew: $idTicketNew, comment: $comment) {
      comment
      createdAt
      updatedAt
      idTicketNewComment
    }
  }
`

const allCommentsFromTicketNewQ = gql`
  query AllCommentsFromTicketNew($idTicketNew: ID!) {
    allCommentsFromTicketNew(idTicketNew: $idTicketNew) {
      idTicketNewComment
      comment
      nickName
      createdAt
      updatedAt
      userProfileImage
    }
  }
`

const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
    getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
      signedUrl
    }
  }
`

interface Comment {
  idTicketNewComment: string
  comment: string
  nickName: string
  createdAt: string
  updatedAt: string
  userProfileImage?: string
}

interface ShowCommentsProps {
  idTicketNew: string
}

const COMMENTS_PER_PAGE = 10

const ShowComments: React.FC<ShowCommentsProps> = ({ idTicketNew }) => {
  const theme = useTheme()
  const { me } = useMe()
  const isFocused = useIsFocused()
  const [appState, setAppState] = useState<AppStateStatus>(() => {
    try {
      return AppState.currentState || 'active'
    } catch {
      return 'active'
    }
  })

  // FIXED: Smart polling - only when screen is focused and app is active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState)
    return () => subscription?.remove()
  }, [])

  const shouldPoll = isFocused && appState === 'active'

  const [addNewTicketNewComment] = useMutation(addNewTicketNewCommentM, {
    fetchPolicy: 'network-only'
  })

  const comments = useQuery(allCommentsFromTicketNewQ, {
    variables: { idTicketNew },
    fetchPolicy: 'cache-and-network',
    pollInterval: shouldPoll ? 15000 : 0,
    notifyOnNetworkStatusChange: false
  })

  const [displayedComments, setDisplayedComments] = useState<Comment[]>([])
  const [visibleCount, setVisibleCount] = useState<number>(COMMENTS_PER_PAGE)
  const [userProfileImages, setUserProfileImages] = useState<Record<string, string>>({})

  // Update displayed comments when data changes
  useEffect(() => {
    if (comments?.data?.allCommentsFromTicketNew) {
      const allComments = comments.data.allCommentsFromTicketNew as Comment[]
      // Sort by creation date (newest first)
      const sortedComments = [...allComments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setDisplayedComments(sortedComments.slice(0, visibleCount))
    }
  }, [comments?.data?.allCommentsFromTicketNew, visibleCount])

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + COMMENTS_PER_PAGE)
  }, [])

  const handleSubmitComment = useCallback(
    async (commentText: string): Promise<void> => {
      try {
        await addNewTicketNewComment({
          variables: {
            idTicketNew,
            comment: commentText
          }
        })
        // Refetch comments to show the new one
        await comments.refetch()
      } catch (error) {
        console.error('Error adding comment:', error)
        throw error
      }
    },
    [idTicketNew, addNewTicketNewComment, comments]
  )

  const hasMoreComments =
    comments?.data?.allCommentsFromTicketNew &&
    visibleCount < (comments.data.allCommentsFromTicketNew as Comment[]).length

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => {
      const userImage = userProfileImages[item.nickName] || DEFAULT_IMAGE

      return (
        <CommentItem
          id={item.idTicketNewComment}
          comment={item.comment}
          nickName={item.nickName}
          createdAt={item.createdAt}
          userProfileImage={userImage}
          onLike={(id) => {
            // Placeholder for future like functionality
            console.log('Like comment:', id)
          }}
        />
      )
    },
    [userProfileImages]
  )

  const renderEmptyState = () => {
    if (comments.loading) {
      return (
        <View style={{ padding: 32, alignItems: 'center' }}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Loading comments...
          </Text>
        </View>
      )
    }

    if (comments.error) {
      return (
        <View style={{ padding: 32, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.error }}>
            Error loading comments. Please try again.
          </Text>
        </View>
      )
    }

    if (displayedComments.length === 0) {
      return (
        <View style={{ padding: 32, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            No comments yet. Be the first to comment!
          </Text>
        </View>
      )
    }

    return null
  }

  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <View
        style={{
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.onSurface
          }}
        >
          Comments ({comments?.data?.allCommentsFromTicketNew?.length || 0})
        </Text>
      </View>
      <FlatList
        data={displayedComments}
        keyExtractor={(item) => item.idTicketNewComment}
        renderItem={renderComment}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          hasMoreComments ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Button
                mode='outlined'
                onPress={handleLoadMore}
                style={{ minWidth: 120 }}
              >
                Load More
              </Button>
            </View>
          ) : null
        }
        scrollEnabled={false}
        removeClippedSubviews={false}
      />
      <CommentInput onSubmit={handleSubmitComment} />
    </View>
  )
}

export default ShowComments

