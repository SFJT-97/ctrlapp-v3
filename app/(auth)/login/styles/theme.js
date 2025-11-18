import { Platform } from 'react-native'

const theme = {
  AppBar: {
    primary: '#24292e',
    textPrimary: 'blue',
    textSecondary: 'grey'
  },
  colors: {
    textPrimary: 'black',
    textSecondary: 'green',
    primary: 'blue',
    white: 'grey'
  },
  fontSizes: {
    body: 14,
    subheading: 16
  },
  fonts: {
    main: Platform.select({
      ios: 'system',
      android: 'Roboto',
      default: 'system'
    })
  },
  fontWeigths: {
    normal: '400',
    bold: '700'
  }
}

export default theme
