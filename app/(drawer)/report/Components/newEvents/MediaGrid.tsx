/**
 * MediaGrid Component - Enhanced inline grid with smart continuation flow
 * Always-visible 2x2 grid with automatic highlighting of next available slot
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { View, StyleSheet, Animated, Alert, ActivityIndicator } from 'react-native'
import { useTheme, Text, Surface } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import MediaSlot from './MediaSlot'
import { showImageOptions } from '../../../../../globals/handleImage'
import { showVideoOptions } from '../../../../../globals/handleVideo'
import {
  takePhotoWithNativeCamera,
  recordVideoWithNativeCamera,
  requestCameraPermissions,
  requestMicrophonePermissions
} from '../../../../../globals/utils/cameraUtils'
import * as ImagePicker from 'expo-image-picker'

interface MediaGridProps {
  image1?: { uri: string; mimeType?: string; name?: string; size?: number } | null
  image2?: { uri: string; mimeType?: string; name?: string; size?: number } | null
  image3?: { uri: string; mimeType?: string; name?: string; size?: number } | null
  video?: { uri: string; mimeType?: string; name?: string; size?: number } | null
  setImage1: (media: { uri: string; mimeType?: string; name?: string; size?: number } | null) => void
  setImage2: (media: { uri: string; mimeType?: string; name?: string; size?: number } | null) => void
  setImage3: (media: { uri: string; mimeType?: string; name?: string; size?: number } | null) => void
  setVideo: (media: { uri: string; mimeType?: string; name?: string; size?: number } | null) => void
  netState?: boolean
}

type TargetSlot = 1 | 2 | 3 | 'video' | null

export default function MediaGrid({
  image1,
  image2,
  image3,
  video,
  setImage1,
  setImage2,
  setImage3,
  setVideo,
  netState = true
}: MediaGridProps): React.JSX.Element {
  const { t } = useTranslation('report')
  const { t: tCommon } = useTranslation()
  const theme = useTheme()
  const [highlightedSlot, setHighlightedSlot] = useState<TargetSlot>(null)
  const [processingSlot, setProcessingSlot] = useState<TargetSlot>(null)
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Pulse animation for highlighted slot
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Start pulse animation when slot is highlighted
  useEffect(() => {
    if (highlightedSlot) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      )
      pulse.start()
      return () => pulse.stop()
    } else {
      pulseAnim.setValue(1)
    }
  }, [highlightedSlot, pulseAnim])

  // Get next available slot
  const getNextAvailableSlot = useCallback((): TargetSlot => {
    if (!image1) return 1
    if (!image2) return 2
    if (!image3) return 3
    if (!video) return 'video'
    return null
  }, [image1, image2, image3, video])

  // Get media count
  const mediaCount = (() => {
    let count = 0
    if (image1) count++
    if (image2) count++
    if (image3) count++
    if (video) count++
    return count
  })()

  // Handle media capture completion
  const handleMediaCaptured = useCallback(
    (media: { uri: string; mimeType?: string; name?: string; size?: number }, slot: TargetSlot) => {
      if (slot === 'video') {
        setVideo(media)
      } else if (slot === 1) {
        setImage1(media)
      } else if (slot === 2) {
        setImage2(media)
      } else if (slot === 3) {
        setImage3(media)
      }

      setProcessingSlot(null)

      // Smart continuation: highlight next available slot
      const nextSlot = getNextAvailableSlot()
      if (nextSlot) {
        setHighlightedSlot(nextSlot)
        // Auto-remove highlight after 3 seconds
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current)
        }
        highlightTimeoutRef.current = setTimeout(() => {
          setHighlightedSlot(null)
        }, 3000)
      }
    },
    [getNextAvailableSlot, setImage1, setImage2, setImage3, setVideo]
  )

  // Handle slot press - launches native camera immediately
  const handleSlotPress = useCallback(
    async (slot: 1 | 2 | 3 | 'video') => {
      // Clear any existing highlight
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
        highlightTimeoutRef.current = null
      }
      setHighlightedSlot(null)

      if (slot === 'video') {
        if (video) {
          // Show replace/delete options
          Alert.alert(t('media.video'), t('media.videoOptions'), [
            {
              text: t('media.replace'),
              onPress: async () => {
                setProcessingSlot('video')
                try {
                  // Request permissions
                  const cameraPermission = await requestCameraPermissions()
                  const micPermission = await requestMicrophonePermissions()

                  if (!cameraPermission.granted || !micPermission.granted) {
                    const needsSettings = !cameraPermission.canAskAgain || !micPermission.canAskAgain
                    Alert.alert(
                      t('media.permissionsRequired'),
                      needsSettings
                        ? t('media.cameraMicRequiredSettings')
                        : t('media.cameraMicRequired'),
                      needsSettings
                        ? [
                            { text: tCommon('buttons.cancel'), style: 'cancel' },
                            { text: t('media.openSettings'), onPress: () => {
                              // Note: Linking.openSettings() would go here if needed
                              setProcessingSlot(null)
                            }}
                          ]
                        : [{ text: t('media.ok'), onPress: () => setProcessingSlot(null) }]
                    )
                    setProcessingSlot(null)
                    return
                  }

                  // Launch native camera for video
                  const result = await recordVideoWithNativeCamera({
                    quality: ImagePicker.VideoQuality.High,
                    videoMaxDuration: 60,
                    allowsEditing: false
                  })

                  if (result) {
                    handleMediaCaptured(result, 'video')
                  } else {
                    // User cancelled or error occurred
                    setProcessingSlot(null)
                  }
                } catch (error) {
                  console.error('Error recording video:', error)
                  Alert.alert(t('alerts.error'), t('media.recordError'))
                  setProcessingSlot(null)
                }
              }
            },
            {
              text: t('media.delete'),
              style: 'destructive',
              onPress: () => setVideo(null)
            },
            { text: tCommon('buttons.cancel'), style: 'cancel' }
          ])
        } else {
          // Launch camera immediately for empty video slot
          setProcessingSlot('video')
          try {
            // Request permissions
            const cameraPermission = await requestCameraPermissions()
            const micPermission = await requestMicrophonePermissions()

            if (!cameraPermission.granted || !micPermission.granted) {
              const needsSettings = !cameraPermission.canAskAgain || !micPermission.canAskAgain
              Alert.alert(
                t('media.permissionsRequired'),
                needsSettings
                  ? t('media.cameraMicRequiredSettings')
                  : t('media.cameraMicRequired'),
                needsSettings
                  ? [
                      { text: tCommon('buttons.cancel'), style: 'cancel' },
                      { text: t('media.openSettings'), onPress: () => {
                        // Note: Linking.openSettings() would go here if needed
                        setProcessingSlot(null)
                      }}
                    ]
                  : [{ text: t('media.ok'), onPress: () => setProcessingSlot(null) }]
              )
              setProcessingSlot(null)
              return
            }

            // Launch native camera for video
            const result = await recordVideoWithNativeCamera({
              quality: ImagePicker.VideoQuality.High,
              videoMaxDuration: 60,
              allowsEditing: false
            })

            if (result) {
              handleMediaCaptured(result, 'video')
            } else {
              // User cancelled
              setProcessingSlot(null)
            }
          } catch (error) {
            console.error('Error recording video:', error)
            Alert.alert('Error', 'Failed to record video. Please try again.')
            setProcessingSlot(null)
          }
        }
      } else {
        // Photo slot
        const currentImage = slot === 1 ? image1 : slot === 2 ? image2 : image3
        if (currentImage) {
          // Show replace/delete options
          Alert.alert(t('media.video'), t('media.videoOptions'), [
            {
              text: t('media.replace'),
              onPress: async () => {
                setProcessingSlot(slot)
                try {
                  // Request permissions
                  const permissionResult = await requestCameraPermissions()
                  if (!permissionResult.granted) {
                    Alert.alert(
                      t('media.permissionsRequired'),
                      !permissionResult.canAskAgain
                        ? t('media.cameraMicRequiredSettings')
                        : t('media.cameraMicRequired'),
                      !permissionResult.canAskAgain
                        ? [
                            { text: tCommon('buttons.cancel'), style: 'cancel' },
                            { text: t('media.openSettings'), onPress: () => {
                              // Note: Linking.openSettings() would go here if needed
                              setProcessingSlot(null)
                            }}
                          ]
                        : [{ text: t('media.ok'), onPress: () => setProcessingSlot(null) }]
                    )
                    setProcessingSlot(null)
                    return
                  }

                  // Launch native camera for photo
                  const result = await takePhotoWithNativeCamera({
                    quality: 0.8,
                    allowsEditing: false
                  })

                  if (result) {
                    handleMediaCaptured(result, slot)
                  } else {
                    // User cancelled
                    setProcessingSlot(null)
                  }
                } catch (error) {
                  console.error('Error taking photo:', error)
                  Alert.alert(t('alerts.error'), t('media.captureError'))
                  setProcessingSlot(null)
                }
              }
            },
            {
              text: t('media.delete'),
              style: 'destructive',
              onPress: () => {
                if (slot === 1) setImage1(null)
                if (slot === 2) setImage2(null)
                if (slot === 3) setImage3(null)
              }
            },
            { text: tCommon('buttons.cancel'), style: 'cancel' }
          ])
        } else {
          // Launch camera immediately for empty photo slot
          setProcessingSlot(slot)
          try {
            // Request permissions
            const permissionResult = await requestCameraPermissions()
            if (!permissionResult.granted) {
              Alert.alert(
                t('media.permissionsRequired'),
                !permissionResult.canAskAgain
                  ? t('media.cameraMicRequiredSettings')
                  : t('media.cameraMicRequired'),
                !permissionResult.canAskAgain
                  ? [
                      { text: tCommon('buttons.cancel'), style: 'cancel' },
                      { text: t('media.openSettings'), onPress: () => {
                        // Note: Linking.openSettings() would go here if needed
                        setProcessingSlot(null)
                      }}
                    ]
                  : [{ text: t('media.ok'), onPress: () => setProcessingSlot(null) }]
              )
              setProcessingSlot(null)
              return
            }

            // Launch native camera for photo
            const result = await takePhotoWithNativeCamera({
              quality: 0.8,
              allowsEditing: false
            })

            if (result) {
              handleMediaCaptured(result, slot)
            } else {
              // User cancelled
              setProcessingSlot(null)
            }
          } catch (error) {
            console.error('Error taking photo:', error)
            Alert.alert('Error', 'Failed to take photo. Please try again.')
            setProcessingSlot(null)
          }
        }
      }
    },
    [image1, image2, image3, video, setImage1, setImage2, setImage3, setVideo, handleMediaCaptured]
  )

  // Handle long press (gallery options)
  const handleLongPress = useCallback(
    (slot: 1 | 2 | 3 | 'video') => {
      if (slot === 'video') {
        showVideoOptions(setVideo, 'Select Video', 'Choose a video from:')
      } else {
        const setter = slot === 1 ? setImage1 : slot === 2 ? setImage2 : setImage3
        showImageOptions(setter, 'Select Photo', 'Choose a photo from:', false, false)
      }
    },
    [setImage1, setImage2, setImage3, setVideo]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          Media
        </Text>
        {mediaCount > 0 && (
          <Surface style={[styles.progressBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer }}>
              {mediaCount}/4
            </Text>
          </Surface>
        )}
      </View>

      <View style={styles.grid}>
        <Animated.View
          style={[
            styles.slotWrapper,
            highlightedSlot === 1 && {
              transform: [{ scale: pulseAnim }],
              borderColor: theme.colors.primary,
              borderWidth: 2,
              borderRadius: 12
            }
          ]}
        >
          {processingSlot === 1 && (
            <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          <MediaSlot
            slotType="photo"
            slotNumber={1}
            media={image1}
            onPress={() => handleSlotPress(1)}
            onLongPress={() => handleLongPress(1)}
            onDelete={() => setImage1(null)}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.slotWrapper,
            highlightedSlot === 2 && {
              transform: [{ scale: pulseAnim }],
              borderColor: theme.colors.primary,
              borderWidth: 2,
              borderRadius: 12
            }
          ]}
        >
          {processingSlot === 2 && (
            <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          <MediaSlot
            slotType="photo"
            slotNumber={2}
            media={image2}
            onPress={() => handleSlotPress(2)}
            onLongPress={() => handleLongPress(2)}
            onDelete={() => setImage2(null)}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.slotWrapper,
            highlightedSlot === 3 && {
              transform: [{ scale: pulseAnim }],
              borderColor: theme.colors.primary,
              borderWidth: 2,
              borderRadius: 12
            }
          ]}
        >
          {processingSlot === 3 && (
            <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          <MediaSlot
            slotType="photo"
            slotNumber={3}
            media={image3}
            onPress={() => handleSlotPress(3)}
            onLongPress={() => handleLongPress(3)}
            onDelete={() => setImage3(null)}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.slotWrapper,
            highlightedSlot === 'video' && {
              transform: [{ scale: pulseAnim }],
              borderColor: theme.colors.primary,
              borderWidth: 2,
              borderRadius: 12
            }
          ]}
        >
          {processingSlot === 'video' && (
            <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          <MediaSlot
            slotType="video"
            isVideo
            media={video}
            onPress={() => handleSlotPress('video')}
            onLongPress={() => handleLongPress('video')}
            onDelete={() => setVideo(null)}
          />
        </Animated.View>
      </View>

      {mediaCount > 0 && mediaCount < 4 && (
        <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          Tap an empty slot to add more media
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  slotWrapper: {
    width: '47%',
    aspectRatio: 1,
    marginBottom: 12
  },
  hint: {
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  }
})

