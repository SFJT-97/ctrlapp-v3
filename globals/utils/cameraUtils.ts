/**
 * Camera utilities using native camera with immediate deletion
 * Photos are captured, moved to app's private cache, and original deleted immediately
 */

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

export interface CameraResult {
  uri: string
  width?: number
  height?: number
  mimeType?: string
  size?: number
  name?: string
}

/**
 * Request camera permissions
 * Checks current status first, only requests if needed
 */
export const requestCameraPermissions = async (): Promise<{ granted: boolean; canAskAgain: boolean }> => {
  try {
    // Check current permission status first
    const currentStatus = await ImagePicker.getCameraPermissionsAsync()
    
    // If already granted, return immediately
    if (currentStatus.status === 'granted') {
      return { granted: true, canAskAgain: true }
    }
    
    // If permission was permanently denied, we can't request again
    if (currentStatus.status === 'denied' && !currentStatus.canAskAgain) {
      return { granted: false, canAskAgain: false }
    }
    
    // Request permission (will show native dialog if status is 'undetermined' or canAskAgain is true)
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync()
    return { granted: status === 'granted', canAskAgain: canAskAgain ?? true }
  } catch (error) {
    console.error('Error requesting camera permissions:', error)
    return { granted: false, canAskAgain: false }
  }
}

/**
 * Request microphone permissions (for video)
 * Note: expo-image-picker doesn't have getMicrophonePermissionsAsync,
 * so we directly request. The request function is safe to call multiple times
 * and won't show dialog if already granted.
 */
export const requestMicrophonePermissions = async (): Promise<{ granted: boolean; canAskAgain: boolean }> => {
  try {
    // Request permission (will show native dialog if needed, or return current status if already granted)
    const { status, canAskAgain } = await ImagePicker.requestMicrophonePermissionsAsync()
    
    // If already granted, canAskAgain might be undefined, default to true
    return { granted: status === 'granted', canAskAgain: canAskAgain ?? true }
  } catch (error) {
    console.error('Error requesting microphone permissions:', error)
    return { granted: false, canAskAgain: false }
  }
}

/**
 * Take a photo using native camera and immediately move to private cache
 * Original photo is deleted to prevent it from appearing in gallery
 */
export const takePhotoWithNativeCamera = async (
  options?: {
    quality?: number
    allowsEditing?: boolean
    aspect?: [number, number]
  }
): Promise<CameraResult | null> => {
  try {
    // Request permissions
    const permissionResult = await requestCameraPermissions()
    if (!permissionResult.granted) {
      console.error('Camera permission denied')
      return null
    }

    // Launch native camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: options?.quality ?? 0.8,
      allowsEditing: options?.allowsEditing ?? false,
      aspect: options?.aspect,
      // CRITICAL: Don't save to gallery
      // Note: expo-image-picker doesn't have a direct "don't save" option,
      // but we'll move and delete immediately
    })

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null
    }

    const originalAsset = result.assets[0]
    const originalUri = originalAsset.uri

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `photo_${timestamp}.jpg`
    const cachePath = `${FileSystem.cacheDirectory}${filename}`

    // Move file to app's private cache directory
    try {
      await FileSystem.copyAsync({
        from: originalUri,
        to: cachePath
      })

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(cachePath, { size: true })

      // SECURITY: Delete original file immediately
      // On iOS, the original might be in a temporary location
      // On Android, it might be in DCIM/Camera - we'll try to delete it
      try {
        // Check if original file exists and is different from cache path
        if (originalUri !== cachePath) {
          const originalExists = await FileSystem.getInfoAsync(originalUri)
          if (originalExists.exists) {
            await FileSystem.deleteAsync(originalUri, { idempotent: true })
          }
        }
      } catch (deleteError) {
        // If deletion fails, log but don't fail the operation
        // The file might be in a system-managed location we can't delete
        console.warn('Could not delete original photo (may be in system location):', deleteError)
      }

      // Return the new file location
      return {
        uri: cachePath,
        width: originalAsset.width,
        height: originalAsset.height,
        mimeType: originalAsset.mimeType || 'image/jpeg',
        size: fileInfo.size || undefined,
        name: filename
      }
    } catch (moveError) {
      console.error('Error moving photo to cache:', moveError)
      // Try to delete original even if move failed
      try {
        await FileSystem.deleteAsync(originalUri, { idempotent: true })
      } catch {
        // Ignore deletion errors
      }
      return null
    }
  } catch (error) {
    console.error('Error taking photo:', error)
    return null
  }
}

/**
 * Record a video using native camera and immediately move to private cache
 */
export const recordVideoWithNativeCamera = async (
  options?: {
    quality?: ImagePicker.VideoQuality | string
    videoMaxDuration?: number
    allowsEditing?: boolean
  }
): Promise<CameraResult | null> => {
  try {
    // Request permissions
    const cameraPermission = await requestCameraPermissions()
    const micPermission = await requestMicrophonePermissions()

    if (!cameraPermission.granted || !micPermission.granted) {
      console.error('Camera or microphone permission denied')
      return null
    }

    // Launch native camera for video
    const videoQuality = options?.quality ?? ImagePicker.VideoQuality.Medium
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: typeof videoQuality === 'string' 
        ? (videoQuality as ImagePicker.VideoQuality)
        : videoQuality,
      videoMaxDuration: options?.videoMaxDuration ?? 60,
      allowsEditing: options?.allowsEditing ?? false,
    })

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null
    }

    const originalAsset = result.assets[0]
    const originalUri = originalAsset.uri

    // Generate unique filename
    const timestamp = Date.now()
    const extension = originalUri.split('.').pop() || 'mp4'
    const filename = `video_${timestamp}.${extension}`
    const cachePath = `${FileSystem.cacheDirectory}${filename}`

    // Move file to app's private cache directory
    try {
      await FileSystem.copyAsync({
        from: originalUri,
        to: cachePath
      })

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(cachePath, { size: true })

      // SECURITY: Delete original file immediately
      try {
        if (originalUri !== cachePath) {
          const originalExists = await FileSystem.getInfoAsync(originalUri)
          if (originalExists.exists) {
            await FileSystem.deleteAsync(originalUri, { idempotent: true })
          }
        }
      } catch (deleteError) {
        console.warn('Could not delete original video (may be in system location):', deleteError)
      }

      // Return the new file location
      return {
        uri: cachePath,
        width: originalAsset.width,
        height: originalAsset.height,
        mimeType: originalAsset.mimeType || 'video/mp4',
        size: fileInfo.size || undefined,
        name: filename
      }
    } catch (moveError) {
      console.error('Error moving video to cache:', moveError)
      // Try to delete original even if move failed
      try {
        await FileSystem.deleteAsync(originalUri, { idempotent: true })
      } catch {
        // Ignore deletion errors
      }
      return null
    }
  } catch (error) {
    console.error('Error recording video:', error)
    return null
  }
}

/**
 * Clean up temporary camera files from cache
 * Call this after successful upload
 */
export const cleanupCameraFiles = async (fileUris: string[]): Promise<void> => {
  try {
    const deletePromises = fileUris.map(uri => 
      FileSystem.deleteAsync(uri, { idempotent: true }).catch(err => {
        console.warn(`Failed to delete file ${uri}:`, err)
      })
    )
    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error cleaning up camera files:', error)
  }
}

