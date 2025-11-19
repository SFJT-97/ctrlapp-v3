import React, { useState, useEffect, useCallback } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text, useTheme, IconButton, Chip } from 'react-native-paper'
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useMe } from '../../../../context/hooks/userQH'

const findTicketNewLikeQ = gql`
  query FindTicketNewLike($idTicketNew: ID!) {
    findTicketNewLike(idTicketNew: $idTicketNew) {
      idTicketNewLike
      idTicketNew
      idUser
      companyName
      ticketLike
      ticketDisLike
    }
  }
`

const addNewTicketNewLikeM = gql`
  mutation AddNewTicketNewLike($idTicketNew: ID!, $idUser: ID!, $companyName: String!, $ticketLike: Boolean!, $ticketDisLike: Boolean!) {
    addNewTicketNewLike(idTicketNew: $idTicketNew, idUser: $idUser, companyName: $companyName, ticketLike: $ticketLike, ticketDisLike: $ticketDisLike) {
      idTicketNewLike
      idTicketNew
      idUser
      companyName
      ticketLike
      ticketDisLike
    }
  }
`

const editTicketNewLikeM = gql`
  mutation EditTicketNewLike($idTicketNewLike: ID!, $ticketLike: Boolean, $ticketDisLike: Boolean) {
    editTicketNewLike(idTicketNewLike: $idTicketNewLike, ticketLike: $ticketLike, ticketDisLike: $ticketDisLike) {
      idTicketNewLike
      idTicketNew
      idUser
      companyName
      ticketLike
      ticketDisLike
    }
  }
`

const countTicketNewLikesQ = gql`
  query CountTicketNewLikes($idTicketNew: ID!) {
    countTicketNewLikes(idTicketNew: $idTicketNew)
  }
`

interface EventCardFooterProps {
  description?: string
  riskQualification?: string
  solutionType?: string
  type?: string
  comments?: number
  onComment?: () => void
  onShare?: () => void
  riskColor?: string
  solutionColor?: string
  idTicketNew?: string
  upvotes?: number
  downvotes?: number
}

const EventCardFooter: React.FC<EventCardFooterProps> = ({
  description,
  riskQualification,
  solutionType,
  type,
  comments = 0,
  onComment,
  onShare,
  riskColor,
  solutionColor,
  idTicketNew,
  upvotes: initialUpvotes = 0,
  downvotes: initialDownvotes = 0
}) => {
  const theme = useTheme()
  const { me } = useMe()
  const [expanded, setExpanded] = useState(false)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [voteId, setVoteId] = useState<string | null>(null)

  const [findTicketNewLike] = useLazyQuery(findTicketNewLikeQ, { fetchPolicy: 'cache-and-network' })
  const [addNewTicketNewLike] = useMutation(addNewTicketNewLikeM, { fetchPolicy: 'network-only' })
  const [editTicketNewLike] = useMutation(editTicketNewLikeM, { fetchPolicy: 'network-only' })
  
  // Fetch total upvote/downvote count
  const { data: countData } = useQuery(countTicketNewLikesQ, {
    variables: { idTicketNew },
    skip: !idTicketNew,
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000 // Poll every 30 seconds
  })

  // Fetch user's current vote
  useEffect(() => {
    if (idTicketNew && me?.idUser) {
      findTicketNewLike({
        variables: { idTicketNew }
      }).then((result) => {
        if (result?.data?.findTicketNewLike) {
          const like = result.data.findTicketNewLike
          setVoteId(like.idTicketNewLike)
          if (like.ticketLike) {
            setUserVote('up')
          } else if (like.ticketDisLike) {
            setUserVote('down')
          } else {
            setUserVote(null)
          }
        }
      }).catch(() => {
        // Ignore errors, user might not have voted
      })
    }
  }, [idTicketNew, me?.idUser, findTicketNewLike])

  // Update counts from query
  useEffect(() => {
    if (countData?.countTicketNewLikes !== undefined) {
      // countTicketNewLikes returns net count (upvotes - downvotes)
      // We'll use it as upvotes for now, or we can adjust based on actual API response
      // For now, assume positive = upvotes, negative = downvotes
      const netCount = countData.countTicketNewLikes
      if (netCount > 0) {
        setUpvotes(netCount)
        setDownvotes(0)
      } else if (netCount < 0) {
        setUpvotes(0)
        setDownvotes(Math.abs(netCount))
      } else {
        setUpvotes(0)
        setDownvotes(0)
      }
    }
  }, [countData])

  const handleUpvote = async (): Promise<void> => {
    if (!idTicketNew || !me?.idUser) return

    const newVote = userVote === 'up' ? null : 'up'
    const ticketLike = newVote === 'up'
    const ticketDisLike = false

    try {
      if (voteId) {
        // Edit existing vote
        await editTicketNewLike({
          variables: {
            idTicketNewLike: voteId,
            ticketLike: ticketLike,
            ticketDisLike: ticketDisLike
          }
        })
      } else {
        // Create new vote
        const result = await addNewTicketNewLike({
          variables: {
            idTicketNew: idTicketNew,
            idUser: me.idUser,
            companyName: me.companyName || '',
            ticketLike: ticketLike,
            ticketDisLike: ticketDisLike
          }
        })
        if (result?.data?.addNewTicketNewLike?.idTicketNewLike) {
          setVoteId(result.data.addNewTicketNewLike.idTicketNewLike)
        }
      }

      // Optimistic update
      setUserVote(newVote)
      if (newVote === 'up') {
        if (userVote === 'down') {
          setUpvotes((prev) => prev + 1)
          setDownvotes((prev) => Math.max(0, prev - 1))
        } else {
          setUpvotes((prev) => prev + 1)
        }
      } else {
        setUpvotes((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error handling upvote:', error)
    }
  }

  const handleDownvote = async (): Promise<void> => {
    if (!idTicketNew || !me?.idUser) return

    const newVote = userVote === 'down' ? null : 'down'
    const ticketLike = false
    const ticketDisLike = newVote === 'down'

    try {
      if (voteId) {
        // Edit existing vote
        await editTicketNewLike({
          variables: {
            idTicketNewLike: voteId,
            ticketLike: ticketLike,
            ticketDisLike: ticketDisLike
          }
        })
      } else {
        // Create new vote
        const result = await addNewTicketNewLike({
          variables: {
            idTicketNew: idTicketNew,
            idUser: me.idUser,
            companyName: me.companyName || '',
            ticketLike: ticketLike,
            ticketDisLike: ticketDisLike
          }
        })
        if (result?.data?.addNewTicketNewLike?.idTicketNewLike) {
          setVoteId(result.data.addNewTicketNewLike.idTicketNewLike)
        }
      }

      // Optimistic update
      setUserVote(newVote)
      if (newVote === 'down') {
        if (userVote === 'up') {
          setDownvotes((prev) => prev + 1)
          setUpvotes((prev) => Math.max(0, prev - 1))
        } else {
          setDownvotes((prev) => prev + 1)
        }
      } else {
        setDownvotes((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error handling downvote:', error)
    }
  }

  const netCount = upvotes - downvotes

  const shouldTruncate = description && description.length > 150
  const displayDescription = shouldTruncate && !expanded
    ? `${description.slice(0, 150)}...`
    : description

  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      {/* Chips Section */}
      {(riskQualification || solutionType || type) && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 12,
            gap: 8
          }}
        >
          {type && (
            <Chip
              compact
              textStyle={{ 
                fontSize: 12, 
                color: theme.colors.onPrimary,
                paddingHorizontal: 4,
                lineHeight: 16
              }}
              style={{
                backgroundColor: theme.colors.primary,
                height: 28,
                paddingHorizontal: 8
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Chip>
          )}
          {riskQualification && riskColor && (
            <Chip
              compact
              textStyle={{ 
                fontSize: 12, 
                color: '#FFFFFF',
                paddingHorizontal: 4,
                lineHeight: 16,
                fontWeight: '500'
              }}
              style={{
                backgroundColor: riskColor,
                height: 28,
                paddingHorizontal: 8
              }}
            >
              {riskQualification}
            </Chip>
          )}
          {solutionType && solutionColor && (
            <Chip
              compact
              textStyle={{ 
                fontSize: 12, 
                color: '#000000',
                paddingHorizontal: 4,
                lineHeight: 16,
                fontWeight: '500'
              }}
              style={{
                backgroundColor: solutionColor,
                height: 28,
                paddingHorizontal: 8
              }}
            >
              {solutionType}
            </Chip>
          )}
        </View>
      )}

      {/* Description */}
      {description && (
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.onSurface,
              lineHeight: 20
            }}
          >
            {displayDescription}
          </Text>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.primary,
                  marginTop: 4,
                  fontWeight: '500'
                }}
              >
                {expanded ? 'Show less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Engagement Section */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outlineVariant,
          marginTop: 12
        }}
      >
        {/* Upvote/Downvote Section */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TouchableOpacity
            onPress={handleUpvote}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <IconButton
              icon='arrow-up'
              size={24}
              iconColor={userVote === 'up' ? theme.colors.primary : theme.colors.onSurfaceVariant}
              style={{ margin: 0 }}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 14,
              color: netCount > 0 ? theme.colors.primary : netCount < 0 ? theme.colors.error : theme.colors.onSurfaceVariant,
              fontWeight: '600',
              minWidth: 30,
              textAlign: 'center'
            }}
          >
            {netCount !== 0 ? (netCount > 0 ? `+${netCount}` : `${netCount}`) : '0'}
          </Text>
          <TouchableOpacity
            onPress={handleDownvote}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <IconButton
              icon='arrow-down'
              size={24}
              iconColor={userVote === 'down' ? theme.colors.error : theme.colors.onSurfaceVariant}
              style={{ margin: 0 }}
            />
          </TouchableOpacity>
        </View>

        {/* Comment Section */}
        <TouchableOpacity
          onPress={onComment}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <IconButton
            icon='comment-outline'
            size={24}
            iconColor={theme.colors.onSurfaceVariant}
            style={{ margin: 0 }}
          />
          {comments > 0 && (
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.onSurface,
                fontWeight: '500',
                marginLeft: -8
              }}
            >
              {comments}
            </Text>
          )}
        </TouchableOpacity>

        {/* Share Section */}
        <TouchableOpacity
          onPress={onShare}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <IconButton
            icon='share-variant'
            size={24}
            iconColor={theme.colors.onSurfaceVariant}
            style={{ margin: 0 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default EventCardFooter

