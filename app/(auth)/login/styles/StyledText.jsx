import React from 'react'
import { Text, StyleSheet } from 'react-native'
import theme from './theme'

const styles = StyleSheet.create({
  text: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeigths.normal
  },
  colorPrimary: {
    color: theme.colors.primary
  },
  colorSecondary: {
    color: theme.colors.textSecondary
  },
  bold: {
    fontWeight: theme.fontWeigths.bold
  },
  subheading: {
    fontSize: theme.fontSizes.subheading
  },
  textAlignCenter: {
    textAlign: 'center'
  }
})

export default function StyledText ({ align, children, color, fontSize, fontWeight, style, ...restofProps }) {
  const textStyles = [
    styles.text,
    align === 'center' && styles.textAlignCenter,
    color === 'primary' && styles.colorPrimary,
    color === 'secondary' && styles.colorSecondary,
    fontSize === 'subheading' && styles.subheading,
    fontSize === 'bold' && style.bold,
    style
  ]
  return (
    <Text style={textStyles} {...restofProps}>
      {children}
    </Text>
  )
}
