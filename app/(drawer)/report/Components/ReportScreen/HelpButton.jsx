import { IconButton } from 'react-native-paper'

const HelpButton = () => {
  return (
    <IconButton
      icon='information-variant'
      iconColor='#0BA6FF'
      size={25}
      style={{ paddingBottom: 13, animate: true }}
      onPress={() => console.log('Information Button Pressed')}
    />
  )
}

export default HelpButton
