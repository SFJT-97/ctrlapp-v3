import React, { Component, ReactNode, ErrorInfo } from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { ERROR_MESSAGES } from '../constants/appConstants'

interface ErrorBoundaryProps {
  children: ReactNode
  onRetry?: () => void
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })

    // You can log to an error reporting service here
    // Example: logErrorToService(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    this.props.onRetry?.()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || ERROR_MESSAGES.UNKNOWN_ERROR}
          </Text>
          {__DEV__ && this.state.errorInfo && (
            <Text style={styles.stackTrace}>
              {this.state.errorInfo.componentStack}
            </Text>
          )}
          <Button title='Try Again' onPress={this.handleReset} />
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000'
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666'
  },
  stackTrace: {
    fontSize: 10,
    marginBottom: 20,
    color: '#999',
    fontFamily: 'monospace'
  }
})

export default ErrorBoundary

