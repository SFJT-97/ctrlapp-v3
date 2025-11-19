import { View, Text } from 'react-native'
import { Avatar } from 'react-native-paper'
import { msgbubble } from '../eMarayChat/styles'
import { getFormatedTime } from '../../../../../../globals/functions/functions'

const MsgBubble = ({ message = '', messageTime = '', isSender = true, userToProfileImage, imageProfile, bigImage = false }) => {
  let bothImages = false
  if (userToProfileImage && userToProfileImage !== '' && imageProfile && imageProfile !== '') bothImages = true
  return (
    <View>
      <View
        style={[
          msgbubble.container,
          isSender ? msgbubble.senderContainer : msgbubble.receiverContainer, { display: 'flex', justifyItems: 'center' }
        ]}
      >
        {bothImages && (
          <View>
            <Avatar.Image size={bigImage || 30} source={{ uri: isSender ? imageProfile : userToProfileImage }} style={{ margin: 2 }} />
          </View>
        )}

        <Text
          style={[
            msgbubble.message,
            isSender ? msgbubble.senderMessage : msgbubble.receiverMessage, { alignSelf: 'center' }
          ]}
        >
          {message}
        </Text>
      </View>
      <Text
        style={[
          msgbubble.message,
          isSender ? msgbubble.timeSenderMessage : msgbubble.timeReceiveMessage
        ]}
      >
        {messageTime || getFormatedTime(new Date())}
      </Text>
    </View>
  )
}

export default MsgBubble
