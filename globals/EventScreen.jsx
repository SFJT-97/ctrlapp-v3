// Esta pantalla es para tratar de compartir eventos con otras aplicaciónes
import { View, Text, Button } from 'react-native'
import * as Sharing from 'expo-sharing'

const EventScreen = ({ event }) => {
  // Supongamos que tienes un evento con un ID o enlace
  const eventLink = `https://miapp.com/event/${event.id}`

  const shareEvent = async () => {
    try {
      await Sharing.shareAsync(eventLink, {
        dialogTitle: 'Comparte este evento',
        UTI: 'public.plain-text' // Tipo de contenido (opcional)
      })
    } catch (error) {
      console.error('Error al compartir:', error)
    }
  }

  return (
    <View>
      <Text>{event.title}</Text>
      <Text>{event.description}</Text>
      <Button title='Compartir evento' onPress={shareEvent} />
    </View>
  )
}

export default EventScreen
