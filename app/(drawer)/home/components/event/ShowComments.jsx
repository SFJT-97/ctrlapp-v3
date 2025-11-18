import { gql, useQuery, useMutation } from '@apollo/client'
import { View } from 'react-native'
import { Divider, IconButton, Text, TextInput, useTheme } from 'react-native-paper'

import { msginput } from '../../../chat/styles'
import { useState, useEffect } from 'react'
import { getFormatedTime } from '../../../../../globals/functions/functions'

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
  }
}

`

// Terminar de armar esta función para que agregue todos los comentarios.
// A su vez necesitará tener un "TextInput" para agregar nuevos comentarios desde donde se llamará a "addNewTicketNewComment"
const ShowComments = ({ idTicketNew }) => {
  const [addNewTicketNewComment] = useMutation(addNewTicketNewCommentM, { fetchPolicy: 'network-only' })
  const comments = useQuery(allCommentsFromTicketNewQ, { variables: { idTicketNew }, fetchPolicy: 'cache-and-network', pollInterval: 3000 })
  const [ticketComments, setTicketComments] = useState('')
  const [fromPos, setFromPos] = useState(0)
  const theme = useTheme()

  useEffect(() => {
    if (comments && !comments.loading && !comments.error) {
      setTicketComments(comments.data.allCommentsFromTicketNew)
    }
  }, [comments, comments.loading, comments.error])
  // console.log(fromPos)
  const RenderComments = () => {
    if (ticketComments !== '') {
      const result = ticketComments.slice(fromPos, fromPos + 5).map((el, index) => (
        <View key={el.idTicketNewComment} style={{ paddingLeft: 2 }}>
          <View
            style={
              {
                backgroundColor: index % 2 === 0 ? theme.colors.tertiaryContainer : 'rgb(160,210,210)',
                margin: 1,
                borderRadius: 5,
                paddingHorizontal: 10
              }
            }
          >
            <Text style={{ fontSize: 14, fontStyle: 'italic', fontWeight: '800', textAlign: 'right' }}>
              {`${el.nickName} - ${getFormatedTime(el.createdAt)}:`}
            </Text>
            <Text style={{ fontSize: 12, fontStyle: 'normal', fontWeight: '200' }}>
              {el.comment}...
            </Text>
            {index === 4 && (
              <View style={{ paddintTop: 2 }}>
                <Text
                  style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'right' }}
                  onPress={() => setFromPos(fromPos + 5)}
                >
                  ...Show next 5 comments
                </Text>
              </View>
            )}
            {ticketComments.length === fromPos + index + 1 && (
              <View style={{ paddintTop: 2 }}>
                <Text
                  style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'right' }}
                  onPress={() => setFromPos(0)}
                >
                  ...Reload comments
                </Text>
              </View>
            )}
          </View>
        </View>
      )
      )
      return result
    }
  }

  const SendCommentBox = () => {
    let commentText
    return (
      <View style={msginput.textInputRow}>
        <TextInput
          style={msginput.textInputBox}
          value={commentText}
          mode='outlined'
          placeholder='Comment...'
          multiline
          maxLength={140}
          onChange={val => {
            commentText = val.nativeEvent.text
          }}
        />
        <IconButton
          icon='send-circle'
          size={50}
          animated
          onPress={async () => {
            try {
              await addNewTicketNewComment({
                variables: {
                  idTicketNew,
                  comment: commentText
                }
              }
              )
              // console.log(temp)
            } catch (error) {
              console.log('error\n', error)
            }
          }}
        />
      </View>
    )
  }

  return (
    <View>
      <Divider style={{ height: 1, paddingBottom: 2 }} />
      <RenderComments />
      <SendCommentBox />
    </View>
  )
}

export default ShowComments
