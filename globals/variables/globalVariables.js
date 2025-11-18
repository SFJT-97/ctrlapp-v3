/*
const API_URL = 'http://192.168.0.176:4000/' // Esta debe ser una variable global de configuración del sistema
const DEFAULT_IMAGE = `${API_URL}uploads/eMarayProfile.png`
const DEFAULT_IMAGE2 = `${API_URL}uploads/10000920.png`

*/

/*
  API_URL values para apolloClient:
  'http://137.184.22.126:5000/' // server franco
  'http://192.168.0.176:4000/' // localhost
  'http://192.168.136.51:4000/' // celu
*/

// import { Platform } from 'react-native'

// const pl = Platform.OS

// export const API_URL = pl === 'ios' ? 'http://localhost:4000/' : 'http://137.184.22.126:5000/'
const apisUrls = [
  'http://164.92.67.239:5000/', // digital ocean de controlaccion
  'http://137.184.22.126:5000/', // server franco
  'http://192.168.0.176:4000/', // localhost
  'http://192.168.0.176:5000/' // server docker local
]
export const API_URL = apisUrls[1]

export const API_URL_GQL = `${API_URL}graphql`

export const DEFAULT_IMAGE = `${API_URL}uploads/eMarayProfile.png`

export const DEFAULT_IMAGE2 = `${API_URL}uploads/10000920.png`

export const EMARAY_PROF_IMG = `${API_URL}uploads/eMarayProfile.png`

// NUEVOS
export const EMARAY_CAMERA_JPG = `${API_URL}uploads/Whisk_51597510cd--camera.jpg`

export const EMARAY_MOVILE_JPG = `${API_URL}uploads/Whisk_4f79170cfb--movile.jpg`

export const EMARAY_VIDEORECORDER_JPG = `${API_URL}uploads/Whisk_storyboard41803ed5eae34741b1491768--videoRecorder.png`

export const EMARAY_CAMERA_GIF = `${API_URL}uploads/Whisk_gif_jk3ytblyjy--camera.gif`

export const EMARAY_MOVILE_GIF = `${API_URL}uploads/Whisk_gif_drjzwexmgm--movile.gif`

export const EMARAY_VIDEORECORDER_GIF = `${API_URL}uploads/Whisk_gif_wqymdi1zde--videoRecorder.gif`

export const EMARAY_CAMERA_MP4 = `${API_URL}uploads/Whisk_cauajdnmnddkodqwlte4otmtndq5my05nwyylwf--camera.mp4`

export const EMARAY_MOVILE_MP4 = `${API_URL}uploads/Whisk_cauajdnmnddkodqwlte4otmtndq5my05nwyylwf_2--movile.mp4`

export const EMARAY_VIDEORECORDER_MP4 = `${API_URL}uploads/Whisk_cauajdnmnddkodqwlte4otmtndq5my05nwyylwf_1--videoRecorder.mp4`

export const SECURITY_PLACEHOLDER1 = `${API_URL}uploads/bubble0.png`

export const SECURITY_PLACEHOLDER2 = `${API_URL}uploads/bubble4.png`

export const SECURITY_PLACEHOLDER3 = `${API_URL}uploads/bubble15.png`

export const SECURITY_PLACEHOLDER4 = `${API_URL}uploads/bubble16.png`

export const SECURITY_PLACEHOLDER5 = `${API_URL}uploads/bubble17.png`

export const REGISTERED_ICON = `${API_URL}uploads/3295fec9-de68-415e-b346-d955c71fd99c.png`

export const REGISTERED_OFFLINE_ICON = `${API_URL}uploads/ca-registered-icon.png`
