import { useState, useEffect } from 'react'
import { Chip, Text, useTheme } from 'react-native-paper'
import { useAsyncStorage } from '../../../../../../context/hooks/ticketNewQH'
import { Dimensions, ScrollView, View } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import MsgBubble from '../components/MsgBubble'
import { EMARAY_CAMERA_JPG, EMARAY_MOVILE_JPG } from '../../../../../../globals/variables/globalVariables'
import Conversation from './components/Conversation'

const ChatEmaray = () => {
  // states
  const theme = useTheme()
  const [dataLoaded, setDataLoaded] = useState(false)
  const [netState, setNetState] = useState(false) // Estado de la conexión a internet
  const [defaultValues, setDefaultValues] = useState({})
  const [me, setMe] = useState(null)
  const [option, setOption] = useState(1) // Este es el estado de las opciones que ofrece eMaray al principio, 1 es "procedimientos"
  const { value: generalData = undefined, loading: loadingGeneralData, error: errorGeneralData } = useAsyncStorage('CTRLA_GENERAL_DATA')
  const width = Dimensions.get('window').width
  useEffect(() => {
    if (generalData && typeof generalData === 'object' && !loadingGeneralData) {
      setDefaultValues({ ...generalData })
      setMe({ ...generalData?.me })
      setDataLoaded(true)
      console.log('defaultValues\n', defaultValues?.me)
    } else {
      setDataLoaded(false)
    }
  }, [generalData, errorGeneralData, loadingGeneralData])
  useEffect(() => {
    const checkNet = async () => {
      const state = await NetInfo.fetch()
      setNetState(state?.isConnected)
    }
    checkNet()
  }, [])

  /*
    Esto debería ser así...
    1)_ Al cargar la pantalla, debe aparecer un formato de Chat, con la primer "msgBubble" de eMaray saludando y diciendo "Hola (usuario) ¿en que puedo ayudarte?"
    2)_ Mostrar opciones de temas en los que eMaray los puede ayudar (Procedimientos activo y el resto negado hasta versión 2)

    3)_ Arriba (al lado de la flechita para volver, debe aparecer un icono de un reloj, para cargar el historial de conversaciones)
    4)_ Abajo debe estar el espacio para que el usuario envíe un mensaje y un microfono al lado por si le quiere contar a eMaray cual es su duda
    5)_ Si el usuario escribe o habla, se debe ver a "eMaray" tomando nota... puede ser con un gif animado
    6)_ Se debe limitar cada conversación a un máximo de n preguntas (de 3 a 5 como máximo), cuando se alcanza el limite debe aparecer un cartelito "limite de
    preguntas alcanzado para esta conversación, si desea puede abrir una nueva". Esto porque se debe limitar la cantidad de tokens, ya que cada nueva pregunta
    lleva todo el historial de la conversación incluido, es decir que aumenta en forma exponencial la cantidad de tokens... Alcanzado ese valor "n", se debe
    deshabilitar todo y quedará en el historial.
  */

  return (
    <View>
      {
        netState
          ? dataLoaded
            ? (
              // En esta parte va el código
              <View>
                <View>
                  <MsgBubble
                    userToProfileImage={EMARAY_MOVILE_JPG}
                    imageProfile={EMARAY_CAMERA_JPG}
                    isSender={false}
                    message={`Hola ${me?.firstName || ''}!\nQue bueno que estés acá.\n¿En que puedo ayudarte hoy?\n\nPor favor, selecciona una opción.`}
                    bigImage={60}
                  />
                </View>
                <ScrollView>
                  <View style={{ width, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 5, left: 10 }}>
                    <Chip
                      style={{ backgroundColor: option === 1 ? theme.colors.errorContainer : theme.colors.onTertiaryContainer }}
                      onPress={() => setOption(1)}
                    >
                      <Text style={{ color: option === 1 ? theme.colors.primary : theme.colors.tertiary, fontWeight: option === 1 ? 'bold' : '500' }}>Procedimientos</Text>
                    </Chip>
                    <Chip
                      disabled // temporal hasta que llegue la versión 2
                      style={{ backgroundColor: option === 2 ? theme.colors.errorContainer : theme.colors.onTertiaryContainer }}
                      onPress={() => setOption(2)}
                    >
                      <Text style={{ color: option === 2 ? theme.colors.primary : theme.colors.tertiary, fontWeight: option === 2 ? 'bold' : '500' }}>Estadísticas</Text>
                    </Chip>
                    <Chip
                      disabled // temporal hasta que llegue la versión 2
                      style={{ backgroundColor: option === 3 ? theme.colors.errorContainer : theme.colors.onTertiaryContainer }}
                      onPress={() => setOption(3)}
                    >
                      <Text style={{ color: option === 3 ? theme.colors.primary : theme.colors.tertiary, fontWeight: option === 3 ? 'bold' : '500' }}>Ayuda sobre la aplicación</Text>
                    </Chip>
                  </View>
                  <Conversation option={option} />
                </ScrollView>
              </View>
              )
            : (
              <Text>loading data...</Text>
              )
          : (
            <Text>no internet conection...</Text>
            )
      }
    </View>
  )
}
export default ChatEmaray
