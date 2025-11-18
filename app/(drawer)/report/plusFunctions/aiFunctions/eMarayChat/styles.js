import { StyleSheet /*, Dimensions */ } from 'react-native'

// const w = Dimensions.get('screen').width
// console.log(w)

const chatlist = StyleSheet.create({
  chatListRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  chatListContent: {
    flexDirection: 'row',
    width: 220
  }
})

const msginput = StyleSheet.create({
  textInputRow: {
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  textInputBox: {
    width: 430,
    margin: 15
  }
})

const msgbubble = StyleSheet.create({
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
    maxWidth: 400
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F1F0',
    flexWrap: 'wrap',
    margin: 10,
    columnGap: 5,
    maxWidth: 400
  },
  message: {
    fontSize: 20,
    color: '#000000',
    flexShrink: 1
  },
  timeSenderMessage: {
    textAlign: 'right',
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '700',
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
    fontWeight: '700',
    marginVertical: 3
  }
})

export { chatlist, msginput, msgbubble }
