/* import React, { useEffect, useState, Component } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView
} from 'react-native'
// import Voice from '@react-native-voice/voice'

const TestRecordAudio = () => {
  const [messages, setMessages] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')

  useEffect(() => {
    try {
      Voice.getSpeechRecognitionServices()
    } catch (error) {
      console.log(error)
    }
    Voice.onSpeechStart = onSpeechStart
    Voice.onSpeechEnd = stopListining
    Voice.onSpeechResults = onSpeechResults
    Voice.onSpeechError = (err) => console.log('onSpeechError:', err)

    return () => {
      Voice.destroy().then(Voice.removeAllListeners)
    }
  }, [])

  const onSpeechStart = (event) => {
    console.log('Recording started....:', event)
  }
  const onSpeechResults = (event) => {
    console.log('🚀 ~ file: recordAudio.jsx: 34 ~ onSpeechResults ~ event:', event)
    const text = event.value[0]
    setRecognizedText(text)
  }
  // const onSpeechError = () => { }
  const startListining = async () => {
    setIsListening(true)
    try {
      await Voice.start('en-US')
    } catch (error) {
      console.log('🚀 ~ file: recordAudio.jsx:38 ~ StartListining ~ error:', error)
    }
  }

  const stopListining = async () => {
    try {
      Voice.removeAllListeners()
      await Voice.stop()
      setIsListening(false)
    } catch (error) {
      console.log('🚀 ~ file: recordAudio.jsx:50 ~ StartListining ~ error:', error)
    }
  }

  const sendMessage = () => {
    if (recognizedText) {
      setMessages([...messages, { text: recognizedText, sender: 'user' }])
      setRecognizedText('')
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <ScrollView contentContainerStyle={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              {
                alignSelf:
                  message.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor:
                  message.sender === 'user' ? '#BB2525' : '#141E46'
              }
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Type your message...'
          value={recognizedText}
          onChangeText={text => setRecognizedText(text)}
        />
        <TouchableOpacity
          onPress={() => {
            isListening ? stopListining() : startListining()
          }}
          style={styles.voiceButton}
        >
          {isListening
            ? (
              <Text style={styles.voiceButtonText}>•••</Text>
              )
            : (
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/4980/4980251.png'
                }}
                style={{ width: 45, height: 45 }}
              />
              )}
        </TouchableOpacity>
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#FFF5E0'
  },
  messagesContainer: {
    padding: 10
  },
  messageBubble: {
    maxWidth: '70%',
    marginVertical: 5,
    borderRadius: 10,
    padding: 10
  },
  messageText: {
    color: 'white',
    fontSize: 16
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white'
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#EFEFEF'
  },
  voiceButton: {
    marginLeft: 10,
    fontSize: 24
  },
  voiceButtonText: {
    fontSize: 24,
    height: 45
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF6969',
    borderRadius: 20
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16
  }
})

export default TestRecordAudio */
/*
  import React, { useEffect } from 'react'
  import { View, Button } from 'react-native'
  import Voice from '@react-native-voice/voice'

  const TestRecordAudio = () => {
    useEffect(() => {
      // Inicializa react-native-voice al montar el componente
      Voice.onSpeechStart = () => console.log('Inicio de la grabación')
      Voice.onSpeechEnd = () => console.log('Fin de la grabación')
      Voice.onSpeechResults = (e) => console.log('Resultados de la grabación', e.value)

      return () => {
        // Limpia los listeners al desmontar el componente
        Voice.removeAllListeners()
      }
    }, [])

    const startRecording = async () => {
      try {
        await Voice.start('en_US')
      } catch (error) {
        console.error('Error al iniciar la grabación:', error)
      }
    }

    return (
      <View>
        <Button title='Iniciar grabación' onPress={startRecording} />
      </View>
    )
  }
  export default App;

*/
