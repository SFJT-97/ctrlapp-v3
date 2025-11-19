/**
 * MediaGallery Component - Modern media capture UI
 * Replaces the old 4-button grid with a streamlined bottom sheet approach
 */

import React, { useState, useCallback, useMemo, useRef } from 'react'
import { View, StyleSheet, Alert, ScrollView } from 'react-native'
import {
  useTheme,
  Button,
  Text,
  Surface,
  IconButton,
  ActivityIndicator
} from 'react-native-paper'
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import MediaSlot from './MediaSlot'
import CameraComponent from './CameraComponent'
import { showImageOptions } from '../../../../../globals/handleImage'
import { showVideoOptions } from '../../../../../globals/handleVideo'

interface MediaGalleryProps {
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

type CaptureMode = 'photo' | 'video' | null
type TargetSlot = 1 | 2 | 3 | 'video' | null

export default function MediaGallery({
  image1,
  image2,
  image3,
  video,
  setImage1,
  setImage2,
  setImage3,
  setVideo,
  netState = true
}: MediaGalleryProps): React.JSX.Element {
  const theme = useTheme()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [captureMode, setCaptureMode] = useState<CaptureMode>(null)
  const [targetSlot, setTargetSlot] = useState<TargetSlot>(null)
  const [isAddingAnother, setIsAddingAnother] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  const snapPoints = useMemo(() => ['50%', '75%'], [])

  // Find next available photo slot
  const getNextAvailablePhotoSlot = useCallback((): 1 | 2 | 3 | null => {
    if (!image1) return 1
    if (!image2) return 2
    if (!image3) return 3
    return null
  }, [image1, image2, image3])

  // Get media count for display
  const mediaCount = useMemo(() => {
    let count = 0
    if (image1) count++
    if (image2) count++
    if (image3) count++
    if (video) count++
    return count
  }, [image1, image2, image3, video])

  // Handle media capture completion
  const handleMediaCaptured = useCallback(
    (media: { uri: string; mimeType?: string; name?: string; size?: number }) => {
      if (targetSlot === 'video') {
        setVideo(media)
      } else if (targetSlot === 1) {
        setImage1(media)
      } else if (targetSlot === 2) {
        setImage2(media)
      } else if (targetSlot === 3) {
        setImage3(media)
      }

      setIsCameraActive(false)

      // Show "Add Another" action sheet
      const nextPhotoSlot = getNextAvailablePhotoSlot()
      const hasVideo = !!video
      const alertButtons: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }> = []

      if (captureMode === 'photo' && nextPhotoSlot) {
        alertButtons.push({
          text: 'Add Another Photo',
          onPress: () => {
            setTargetSlot(nextPhotoSlot)
            setCaptureMode('photo')
            setIsAddingAnother(true)
            setIsCameraActive(true)
          }
        })
      }
      if (captureMode === 'photo' && !hasVideo) {
        alertButtons.push({
          text: 'Record Video',
          onPress: () => {
            setTargetSlot('video')
            setCaptureMode('video')
            setIsAddingAnother(true)
            setIsCameraActive(true)
          }
        })
      }
      if (captureMode === 'video' && nextPhotoSlot) {
        alertButtons.push({
          text: 'Take Photo',
          onPress: () => {
            setTargetSlot(nextPhotoSlot)
            setCaptureMode('photo')
            setIsAddingAnother(true)
            setIsCameraActive(true)
          }
        })
      }
      alertButtons.push({
        text: 'Done',
        onPress: () => {
      setIsAddingAnother(false)
      setTargetSlot(null)
      setCaptureMode(null)
      setIsBottomSheetOpen(true)
      bottomSheetRef.current?.snapToIndex(0)
        }
      })
      alertButtons.push({
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          setIsAddingAnother(false)
          setTargetSlot(null)
          setCaptureMode(null)
        }
      })

      Alert.alert(
        'Media Added',
        'What would you like to do next?',
        alertButtons,
        { cancelable: true }
      )
    },
    [targetSlot, captureMode, video, getNextAvailablePhotoSlot, setImage1, setImage2, setImage3, setVideo]
  )

  // Handle slot press
  const handleSlotPress = useCallback(
    (slot: 1 | 2 | 3 | 'video') => {
      if (slot === 'video') {
        if (video) {
          // Show replace/delete options
          Alert.alert('Video', 'What would you like to do?', [
            {
              text: 'Replace',
              onPress: () => {
                setTargetSlot('video')
                setCaptureMode('video')
                setIsCameraActive(true)
              }
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => setVideo(null)
            },
            { text: 'Cancel', style: 'cancel' }
          ])
        } else {
          setTargetSlot('video')
          setCaptureMode('video')
          setIsCameraActive(true)
        }
      } else {
        const currentImage = slot === 1 ? image1 : slot === 2 ? image2 : image3
        if (currentImage) {
          // Show replace/delete options
          Alert.alert(`Photo ${slot}`, 'What would you like to do?', [
            {
              text: 'Replace',
              onPress: () => {
                setTargetSlot(slot)
                setCaptureMode('photo')
                setIsCameraActive(true)
              }
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                if (slot === 1) setImage1(null)
                if (slot === 2) setImage2(null)
                if (slot === 3) setImage3(null)
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ])
        } else {
          setTargetSlot(slot)
          setCaptureMode('photo')
          setIsCameraActive(true)
        }
      }
    },
    [image1, image2, image3, video, setImage1, setImage2, setImage3, setVideo]
  )

  // Handle action buttons
  const handleTakePhoto = useCallback(() => {
    const nextSlot = getNextAvailablePhotoSlot()
    if (nextSlot) {
      setTargetSlot(nextSlot)
      setCaptureMode('photo')
      setIsCameraActive(true)
      setIsBottomSheetOpen(false)
      bottomSheetRef.current?.close()
    } else {
      Alert.alert('All photo slots are filled', 'Replace an existing photo or delete one first.')
    }
  }, [getNextAvailablePhotoSlot])

  const handleRecordVideo = useCallback(() => {
    if (video) {
      Alert.alert('Video slot is filled', 'Replace the existing video or delete it first.')
    } else {
      setTargetSlot('video')
      setCaptureMode('video')
      setIsCameraActive(true)
      setIsBottomSheetOpen(false)
      bottomSheetRef.current?.close()
    }
  }, [video])

  const handleChooseFromGallery = useCallback(() => {
    const nextSlot = getNextAvailablePhotoSlot()
    if (nextSlot) {
      const setter = nextSlot === 1 ? setImage1 : nextSlot === 2 ? setImage2 : setImage3
      setIsBottomSheetOpen(false)
      bottomSheetRef.current?.close()
      showImageOptions(setter, 'Select Photo', 'Choose a photo from:', false, false)
    } else {
      Alert.alert('All photo slots are filled', 'Replace an existing photo or delete one first.')
    }
  }, [getNextAvailablePhotoSlot, setImage1, setImage2, setImage3])

  const handleChooseVideoFromGallery = useCallback(() => {
    if (video) {
      Alert.alert('Video slot is filled', 'Replace the existing video or delete it first.')
    } else {
      setIsBottomSheetOpen(false)
      bottomSheetRef.current?.close()
      showVideoOptions(setVideo, 'Select Video', 'Choose a video from:')
    }
  }, [video, setVideo])

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  )

  // Get setter for current target slot
  const getCurrentSetter = useCallback(() => {
    if (targetSlot === 'video') return setVideo
    if (targetSlot === 1) return setImage1
    if (targetSlot === 2) return setImage2
    if (targetSlot === 3) return setImage3
    return null
  }, [targetSlot, setImage1, setImage2, setImage3, setVideo])

  if (isCameraActive && targetSlot && captureMode) {
    const setter = getCurrentSetter()
    if (!setter) return <View />

    return (
      <CameraComponent
        isCameraActive={isCameraActive}
        setIsCameraActive={setIsCameraActive}
        mode={captureMode}
        setImageVideo={handleMediaCaptured}
      />
    )
  }

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={() => {
          setIsBottomSheetOpen(true)
          bottomSheetRef.current?.snapToIndex(0)
        }}
        icon="camera"
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        contentStyle={styles.addButtonContent}
      >
        <Text variant="titleMedium" style={{ color: 'white' }}>
          Add Photos & Video
        </Text>
        {mediaCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.secondary }]}>
            <Text variant="labelSmall" style={{ color: 'white' }}>
              {mediaCount}/4
            </Text>
          </View>
        )}
      </Button>

      <BottomSheet
        ref={bottomSheetRef}
        index={isBottomSheetOpen ? 0 : -1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={(index) => {
          setIsBottomSheetOpen(index >= 0)
        }}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.header}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
              Media ({mediaCount}/4)
            </Text>
            <IconButton
              icon="close"
              size={24}
              iconColor={theme.colors.onSurface}
              onPress={() => {
                setIsBottomSheetOpen(false)
                bottomSheetRef.current?.close()
              }}
            />
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              <MediaSlot
                slotType="photo"
                slotNumber={1}
                media={image1}
                onPress={() => handleSlotPress(1)}
                onDelete={() => setImage1(null)}
              />
              <MediaSlot
                slotType="photo"
                slotNumber={2}
                media={image2}
                onPress={() => handleSlotPress(2)}
                onDelete={() => setImage2(null)}
              />
              <MediaSlot
                slotType="photo"
                slotNumber={3}
                media={image3}
                onPress={() => handleSlotPress(3)}
                onDelete={() => setImage3(null)}
              />
              <MediaSlot
                slotType="video"
                isVideo
                media={video}
                onPress={() => handleSlotPress('video')}
                onDelete={() => setVideo(null)}
              />
            </View>

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handleTakePhoto}
                icon="camera"
                style={styles.actionButton}
                disabled={!getNextAvailablePhotoSlot()}
              >
                Take Photo
              </Button>
              <Button
                mode="outlined"
                onPress={handleRecordVideo}
                icon="video"
                style={styles.actionButton}
                disabled={!!video}
              >
                Record Video
              </Button>
              <Button
                mode="outlined"
                onPress={handleChooseFromGallery}
                icon="image"
                style={styles.actionButton}
                disabled={!getNextAvailablePhotoSlot()}
              >
                Choose Photo
              </Button>
              <Button
                mode="outlined"
                onPress={handleChooseVideoFromGallery}
                icon="video-box"
                style={styles.actionButton}
                disabled={!!video}
              >
                Choose Video
              </Button>
            </View>
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8
  },
  addButton: {
    borderRadius: 12,
    paddingVertical: 12,
    position: 'relative'
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16
  },
  scrollView: {
    flex: 1
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24
  },
  actions: {
    gap: 12,
    paddingBottom: 24
  },
  actionButton: {
    marginVertical: 4
  }
})

