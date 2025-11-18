import { ActivityIndicator, MD2Colors } from 'react-native-paper'

const CustomActivityIndicator = ({ visible = true, size = 'large' }) => {
  return (
    <ActivityIndicator animating={visible} color={MD2Colors.blue500} size={size} hidesWhenStopped />
  )
}

export default CustomActivityIndicator
