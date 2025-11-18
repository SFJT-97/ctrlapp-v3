// StyledTextInput.js
import React from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'

const getStyles = (theme) => StyleSheet.create({
  TextInput: {
    color: theme.colors.onBackground,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'darkgrey',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10
  },
  error: {
    borderColor: 'red'
  }
})

const StyledTextInput = ({ style = {}, error, ...props }) => {
  const theme = useTheme()
  const styles = getStyles(theme)

  const inputStyle = [
    styles.TextInput,
    style,
    error && styles.error
  ]

  return (
    <TextInput
      style={inputStyle}
      {...props}
      placeholderTextColor={theme.colors.onSurface}
    />
  )
}

export default StyledTextInput
