// ==> 2024-10-02
// Builtin modules
import { useState, useEffect } from 'react'
import { View, AppState, AppStateStatus, TouchableOpacity } from 'react-native'
import { useTheme, IconButton, Text } from 'react-native-paper'
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client'
import { useIsFocused } from '@react-navigation/native'

// Custom modules
import { useMe } from '../../../../../context/hooks/userQH'

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

const countTicketsNewLikesQ = gql`
query Query($idTicketNew: ID!) {
  countTicketNewLikes(idTicketNew: $idTicketNew)
}

`

const Reaction = ({ param }) => {
  const parParam = param
  const isFocused = useIsFocused()
  const [appState, setAppState] = useState(() => {
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

  const [findTicketNewLike] = useLazyQuery(findTicketNewLikeQ, { fetchPolicy: 'network-only' })
  const [addNewTicketNewLike] = useMutation(addNewTicketNewLikeM, { fetchPolicy: 'network-only' })
  const [editTicketNewLike] = useMutation(editTicketNewLikeM, { fetchPolicy: 'network-only' })
  const { me } = useMe()
  const [totalLikesAndDislikes, setTotalLikesAndDislikes] = useState(0)
  // FIXED: Change from 1000ms to 10000ms (10 seconds) with smart polling
  const countTotalTicketsNewLikes = useQuery(countTicketsNewLikesQ, { 
    variables: { idTicketNew: param?.idTicketNew }, 
    fetchPolicy: 'cache-and-network', // FIXED: Use cache
    pollInterval: shouldPoll ? 10000 : 0, // FIXED: 10s instead of 1s
    notifyOnNetworkStatusChange: false
  })

  const theme = useTheme()
  const [userVote, setUserVote] = useState(null) // 'up' | 'down' | null
  const [voteId, setVoteId] = useState(null)

  const handleUpvote = async () => {
    if (!parParam?.idTicketNew || !me?.idUser) return

    const newVote = userVote === 'up' ? null : 'up'
    const ticketLike = newVote === 'up'
    const ticketDisLike = false

    try {
      if (voteId) {
        await editTicketNewLike({
          variables: {
            idTicketNewLike: voteId,
            ticketLike: ticketLike,
            ticketDisLike: ticketDisLike
          }
        })
      } else {
        const result = await addNewTicketNewLike({
          variables: {
            idTicketNew: parParam.idTicketNew,
            idUser: me.idUser,
            companyName: me.companyName,
            ticketLike: ticketLike,
            ticketDisLike: ticketDisLike
          }
        })
        if (result?.data?.addNewTicketNewLike?.idTicketNewLike) {
          setVoteId(result.data.addNewTicketNewLike.idTicketNewLike)
        }
      }
      setUserVote(newVote)
    } catch (error) {
      console.log('Error handling upvote:', error)
    }
  }

  const handleDownvote = async () => {
    if (!parParam?.idTicketNew || !me?.idUser) return

    const newVote = userVote === 'down' ? null : 'down'
    const ticketLike = false
    const ticketDisLike = newVote === 'down'

    try {
      if (voteId) {
        await editTicketNewLike({
          variables: {
            idTicketNewLike: voteId,
            ticketLike: ticketLike,
            ticketDisLike: ticketDisLike
          }
        })
      } else {
        const result = await addNewTicketNewLike({
          variables: {
            idTicketNew: parParam.idTicketNew,
            idUser: me.idUser,
            companyName: me.companyName,
            ticketLike: ticketLike,
            ticketDisLike: ticketDisLike
          }
        })
        if (result?.data?.addNewTicketNewLike?.idTicketNewLike) {
          setVoteId(result.data.addNewTicketNewLike.idTicketNewLike)
        }
      }
      setUserVote(newVote)
    } catch (error) {
      console.log('Error handling downvote:', error)
    }
  }

  // Fetch user's current vote
  useEffect(() => {
    if (parParam?.idTicketNew && me?.idUser) {
      findTicketNewLike({
        variables: { idTicketNew: parParam.idTicketNew }
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
  }, [parParam?.idTicketNew, me?.idUser, findTicketNewLike])
  useEffect(() => {
    if (countTotalTicketsNewLikes && !countTotalTicketsNewLikes.loading && !countTotalTicketsNewLikes.error) {
      setTotalLikesAndDislikes(countTotalTicketsNewLikes.data.countTicketNewLikes)
    }
  }, [countTotalTicketsNewLikes])

  const netCount = totalLikesAndDislikes

  return (
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
  )
}

export default Reaction
