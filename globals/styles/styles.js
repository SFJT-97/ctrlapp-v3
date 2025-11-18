import { StyleSheet } from 'react-native'

export const GlobalStyles = StyleSheet.create({
  ContainerCenter: {
    flex: 1,
    justifyContent: 'center'
  }
})

export const chatlist = StyleSheet.create({
  chatListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
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
    alignItems: 'baseline'
  },
  textInputBox: {
    width: '80%',
    marginLeft: '2%'
  }
})

export const msgbubble = StyleSheet.create({
  container: {
    maxWidth: '80%',
    borderRadius: 8,
    padding: 6,
    height: 'auto',
    marginVertical: 5,
    flexDirection: 'row'
  },
  senderContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#CCE8E7',
    flexWrap: 'wrap'
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F1F0',
    flexWrap: 'wrap'
  },
  message: {
    fontSize: 18,
    color: '#000000',
    flexShrink: 1
    // El flexShrink me cuelga todo a la tobas
  },
  timeSenderMessage: {
    textAlign: 'right',
    fontSize: 11,
    fontStyle: 'italic'
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
    fontStyle: 'italic'
  }
})
