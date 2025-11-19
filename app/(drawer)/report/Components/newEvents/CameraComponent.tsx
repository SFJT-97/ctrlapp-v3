/**
 * Modern Camera Component using Native Camera with Immediate Deletion
 * Uses native phone camera for better UX, then immediately moves photos to private cache
 * and deletes originals to prevent gallery saves
 */

import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Alert, BackHandler } from 'react-native'
import { Button, IconButton, Surface, useTheme, ActivityIndicator, Text } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import * as ImagePicker from 'expo-image-picker'
import { takePhotoWithNativeCamera, recordVideoWithNativeCamera } from '../../../../../globals/utils/cameraUtils'

interface CameraComponentProps {
  setImageVideo: (result: { uri: string; mimeType?: string; name?: string; size?: number }) => void
  mode: 'picture' | 'video'
  setIsCameraActive: (active: boolean) => void
  isCameraActive: boolean
  wichCamera?: 'back' | 'front'
  optionOnlyShot?: boolean
}

export default function CameraComponent({
  setImageVideo,
  mode,
  setIsCameraActive,
  isCameraActive,
  wichCamera = 'back',
  optionOnlyShot = false
}: CameraComponentProps): React.JSX.Element {
  const { t } = useTranslation('report')
  const theme = useTheme()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  // Handle back button
  useEffect(() => {
    const onBackPress = () => {
      if (isProcessing) {
        // Prevent closing while processing
        return true
      }
      setIsCameraActive(false)
      return true
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress)
    return () => backHandler.remove()
  }, [isProcessing, setIsCameraActive])

  const handleCapture = async (): Promise<void> => {
    if (isProcessing) return

    setIsProcessing(true)

    try {
      if (mode === 'picture') {
        const result = await takePhotoWithNativeCamera({
          quality: 0.8,
          allowsEditing: false
        })

        if (result) {
          setImageVideo({
            uri: result.uri,
            mimeType: result.mimeType,
            name: result.name,
            size: result.size
          })
          // Close camera - MediaGrid will handle smart continuation flow
          // (automatically highlights next available slot)
          setIsCameraActive(false)
        } else {
          Alert.alert(t('alerts.error'), t('media.captureError'))
          setIsCameraActive(false)
        }
      } else if (mode === 'video') {
        if (isRecording) {
          // For native camera, recording is handled by the system
          // This button would stop recording, but with native camera
          // the recording is already complete when user returns
          setIsRecording(false)
        } else {
          setIsRecording(true)
          const result = await recordVideoWithNativeCamera({
            quality: ImagePicker.VideoQuality.High,
            videoMaxDuration: 60,
            allowsEditing: false
          })

          if (result) {
            setImageVideo({
              uri: result.uri,
              mimeType: result.mimeType,
              name: result.name,
              size: result.size
            })
            // Don't close camera here - let parent component handle the flow
            setIsCameraActive(false)
          } else {
            Alert.alert(t('alerts.error'), t('media.recordError'))
            setIsCameraActive(false)
          }
          setIsRecording(false)
        }
      }
    } catch (error) {
      console.error('Error in handleCapture:', error)
      Alert.alert(t('alerts.error'), t('media.mediaError'))
    } finally {
      setIsProcessing(false)
    }
  }

  if (optionOnlyShot) {
    return (
      <View style={styles.simpleContainer}>
        <View style={styles.simpleContent}>
          <Text variant="titleMedium" style={{ marginBottom: 16, textAlign: 'center' }}>
            Tap button to open camera
          </Text>
          <Button
            mode="contained"
            onPress={handleCapture}
            disabled={isProcessing}
            style={{ marginTop: 12 }}
            icon="camera"
          >
            {isProcessing ? 'Processing...' : 'Take Photo'}
          </Button>
          {isProcessing && (
            <ActivityIndicator size="small" style={{ marginTop: 16 }} />
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          {mode === 'picture' ? 'Take Photo' : 'Record Video'}
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {mode === 'picture'
            ? 'Tap the button below to open your camera'
            : 'Tap the button below to record a video'}
        </Text>

        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.processingText, { color: theme.colors.onSurface }]}>
              Processing...
            </Text>
          </View>
        )}

        <Surface style={[styles.controls, { backgroundColor: theme.colors.surface }]}>
          <IconButton
            icon={mode === 'video' ? (isRecording ? 'stop' : 'video') : 'camera'}
            iconColor={theme.colors.primary}
            size={40}
            onPress={handleCapture}
            disabled={isProcessing}
            style={styles.captureButton}
          />
          <IconButton
            icon="close"
            iconColor={theme.colors.error}
            size={28}
            onPress={() => setIsCameraActive(false)}
            disabled={isProcessing}
          />
        </Surface>

        <Text variant="bodySmall" style={[styles.securityNote, { color: theme.colors.onSurfaceVariant }]}>
          Photos and videos are stored securely and will not be saved to your gallery
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 20
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center'
  },
  title: {
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center'
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 24
  },
  processingText: {
    marginTop: 12,
    fontSize: 14
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginVertical: 24,
    gap: 16
  },
  captureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  securityNote: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
    paddingHorizontal: 20
  },
  simpleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  simpleContent: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center'
  }
})

