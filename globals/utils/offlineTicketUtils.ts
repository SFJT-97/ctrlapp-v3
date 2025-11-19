/**
 * Shared utilities for offline ticket management
 * Handles saving tickets and files locally when offline
 */

import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'

// FIXED: Use consistent key without timestamp
const PENDING_UPLOADS_KEY = 'PendingTickets'

export interface MediaFile {
  uri: string
  mimeType?: string | null
  name?: string
  size?: number | null
  filename?: string
  lastModified?: number | null
}

export interface PendingTicketData {
  data: Record<string, unknown>
  files: MediaFile[]
  fromVoiceOffLine?: boolean
  timestamp?: number
}

/**
 * Save files locally to cache directory (not gallery)
 * SECURITY: Using cacheDirectory ensures files are not accessible via gallery
 */
export const saveFileLocally = async (
  file: MediaFile
): Promise<MediaFile | null> => {
  const filename = file.uri.split('/').pop()
  if (!filename) return null

  // Use cacheDirectory instead of documentDirectory for better privacy
  // Cache directory is app-private and system may clear it when needed
  const newPath = `${FileSystem.cacheDirectory}${filename}`

  try {
    // If file is already in cache, no need to copy
    if (file.uri.startsWith(FileSystem.cacheDirectory || '')) {
      const fileInfo = await FileSystem.getInfoAsync(file.uri, { size: true })
      return {
        uri: file.uri,
        name: filename,
        mimeType: file.mimeType || null,
        size: fileInfo.size || null,
        filename: file.uri,
        lastModified: fileInfo.modificationTime || null
      } as MediaFile
    }

    // Copy to cache directory
    await FileSystem.copyAsync({ from: file.uri, to: newPath })

    const fileInfo = await FileSystem.getInfoAsync(newPath, { size: true })

    // Try to delete original if it's not in cache (security measure)
    try {
      if (!file.uri.startsWith(FileSystem.cacheDirectory || '')) {
        await FileSystem.deleteAsync(file.uri, { idempotent: true })
      }
    } catch (deleteError) {
      // Ignore deletion errors - file might be in system location
      console.warn('Could not delete original file:', deleteError)
    }

    return {
      uri: newPath,
      name: filename,
      mimeType: file.mimeType || null,
      size: fileInfo.size || null,
      filename: newPath,
      lastModified: fileInfo.modificationTime || null
    } as MediaFile
  } catch (error) {
    console.error('Error saving file locally:', error)
    return null
  }
}

/**
 * Save a pending ticket to AsyncStorage
 * Uses consistent key format: 'PendingTickets' (single array)
 */
export const savePendingTicket = async (ticketData: PendingTicketData): Promise<void> => {
  try {
    const existingTickets = await AsyncStorage.getItem(PENDING_UPLOADS_KEY)
    const pendingTickets: PendingTicketData[] = existingTickets
      ? JSON.parse(existingTickets)
      : []
    
    // Add timestamp if not present
    const ticketWithTimestamp = {
      ...ticketData,
      timestamp: ticketData.timestamp || Date.now()
    }
    
    pendingTickets.push(ticketWithTimestamp)
    await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pendingTickets))
  } catch (error) {
    console.error('Error saving pending ticket:', error)
    throw error
  }
}

/**
 * Get all pending tickets from AsyncStorage
 */
export const getPendingTickets = async (): Promise<PendingTicketData[]> => {
  try {
    const existingTickets = await AsyncStorage.getItem(PENDING_UPLOADS_KEY)
    return existingTickets ? JSON.parse(existingTickets) : []
  } catch (error) {
    console.error('Error getting pending tickets:', error)
    return []
  }
}

/**
 * Remove a pending ticket from AsyncStorage
 * Can be used after successful upload
 */
export const removePendingTicket = async (index: number): Promise<void> => {
  try {
    const pendingTickets = await getPendingTickets()
    if (index >= 0 && index < pendingTickets.length) {
      pendingTickets.splice(index, 1)
      await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pendingTickets))
    }
  } catch (error) {
    console.error('Error removing pending ticket:', error)
    throw error
  }
}

/**
 * Clear all pending tickets from AsyncStorage
 */
export const clearPendingTickets = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PENDING_UPLOADS_KEY)
  } catch (error) {
    console.error('Error clearing pending tickets:', error)
    throw error
  }
}

