/* PaperProvider & registerRootComponent son necesarios para el funcionamiento de React Native Paper */

/* Theme:
    ThemeProvider de Expo, en lugar de Navigation.Container para construir Tema para Nav (https://docs.expo.dev/router/appearance/#react-navigation-themes)
    Investigar porque al pasar el prop de theme, el resto de la app no lo recibe para llamar los colores del tema construido en Paper (https://www.youtube.com/watch?v=ltOccWcwnxw)
*/

import 'react-native-gesture-handler'
import { Redirect } from 'expo-router'

export default function HomeScreen () {
  return (
    <Redirect href='/(auth)/login' />
  )
}
