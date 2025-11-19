// API Configuration
// Uses environment variable for API URL selection

const getApiUrl = (): string => {
  // Check for environment variable first
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  }

  // Fallback to hardcoded values (for development)
  // TODO: Remove hardcoded values once all environments use .env files
  const apisUrls: readonly string[] = [
    'http://164.92.67.239:5000/', // digital ocean de controlaccion
    'http://137.184.22.126:5000/', // server franco
    'http://192.168.0.176:4000/', // localhost
    'http://192.168.0.176:5000/' // server docker local
  ]

  // Default to server franco (index 1)
  const defaultIndex = 1
  return apisUrls[defaultIndex] || apisUrls[0]
}

export const API_URL: string = getApiUrl()
export const API_URL_GQL: string = `${API_URL}graphql`

// Default images
export const DEFAULT_IMAGE: string = `${API_URL}uploads/eMarayProfile.png`
export const DEFAULT_IMAGE2: string = `${API_URL}uploads/10000920.png`
export const EMARAY_PROF_IMG: string = `${API_URL}uploads/eMarayProfile.png`

// eMaray media assets
export const EMARAY_CAMERA_JPG: string = `${API_URL}uploads/Whisk_51597510cd--camera.jpg`
export const EMARAY_MOVILE_JPG: string = `${API_URL}uploads/Whisk_4f79170cfb--movile.jpg`
export const EMARAY_VIDEORECORDER_JPG: string = `${API_URL}uploads/Whisk_storyboard41803ed5eae34741b1491768--videoRecorder.png`
export const EMARAY_CAMERA_GIF: string = `${API_URL}uploads/Whisk_gif_jk3ytblyjy--camera.gif`
export const EMARAY_MOVILE_GIF: string = `${API_URL}uploads/Whisk_gif_drjzwexmgm--movile.gif`
export const EMARAY_VIDEORECORDER_GIF: string = `${API_URL}uploads/Whisk_gif_wqymdi1zde--videoRecorder.gif`
export const EMARAY_CAMERA_MP4: string = `${API_URL}uploads/Whisk_cauajdnmnddkodqwlte4otmtndq5my05nwyylwf--camera.mp4`
export const EMARAY_MOVILE_MP4: string = `${API_URL}uploads/Whisk_cauajdnmnddkodqwlte4otmtndq5my05nwyylwf_2--movile.mp4`
export const EMARAY_VIDEORECORDER_MP4: string = `${API_URL}uploads/Whisk_cauajdnmnddkodqwlte4otmtndq5my05nwyylwf_1--videoRecorder.mp4`

// Security placeholders
export const SECURITY_PLACEHOLDER1: string = `${API_URL}uploads/bubble0.png`
export const SECURITY_PLACEHOLDER2: string = `${API_URL}uploads/bubble4.png`
export const SECURITY_PLACEHOLDER3: string = `${API_URL}uploads/bubble15.png`
export const SECURITY_PLACEHOLDER4: string = `${API_URL}uploads/bubble16.png`
export const SECURITY_PLACEHOLDER5: string = `${API_URL}uploads/bubble17.png`

// Icons
export const REGISTERED_ICON: string = `${API_URL}uploads/3295fec9-de68-415e-b346-d955c71fd99c.png`
export const REGISTERED_OFFLINE_ICON: string = `${API_URL}uploads/ca-registered-icon.png`

