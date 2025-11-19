import { API_URL, DEFAULT_IMAGE } from '../variables/globalVariables'

/**
 * Safely constructs an image URL from various formats
 * @param userProfileImage - The user profile image path or URL
 * @returns A valid image URL
 */
export const getImageUrl = (userProfileImage: string | undefined | null): string => {
  if (!userProfileImage) {
    return DEFAULT_IMAGE
  }

  const imageStr = userProfileImage.toString()

  // If it's already a full URL (AWS or other), return as-is
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    return imageStr
  }

  // If it contains 'uploads', construct relative URL
  const uploadsIndex = imageStr.indexOf('uploads')
  if (uploadsIndex !== -1) {
    return API_URL + imageStr.slice(uploadsIndex)
  }

  // Fallback to default image
  return DEFAULT_IMAGE
}

