import { ReactNativeFile } from 'apollo-upload-client'

/**
 * This function upload to aws s3 service the file provided and returns its location at the correspondent bucket
 * @param {*} mMedia this must be the multi media file, coud be "image" or "video"
 * @param {*} isImage by default this value is true and means that the mMedia is an image, otherwise assumes it is a video
 * @returns the location at the correspondent bucket in AWS S3 service
 */
const uploadFile = (mMedia, isImage = true) => {
  const temp = isImage ? 'image' : 'video'
  let filename = ''
  let criteria
  if (mMedia.uri.toString().includes('://')) {
    if (mMedia.uri.toString().includes('/ImagePicker/')) criteria = '/ImagePicker/'
    if (mMedia.uri.toString().includes('/DocumentPicker/')) criteria = '/DocumentPicker/'
    if (mMedia.uri.toString().includes('/Camera/')) criteria = '/Camera/'
    if (mMedia.uri.toString().includes('/files/')) criteria = '/files/'
    if (mMedia.uri.toString().includes('/Documents/')) criteria = '/Documents/'
  }
  filename = mMedia.uri.split(criteria).pop()
  try {
    // En esta parte se convierten algunas de las propiedades del archivo que se cargó como "userProfileImage"
    let newFile
    if (mMedia.filename === undefined) {
      newFile = { ...mMedia, filename, fileName: filename }
    } else {
      newFile = mMedia
    }
    // console.log('newFile (2)=', newFile)
    // console.log('que hizo=', `${temp}/${newFile.uri.split('.').pop()}`)
    if (mMedia.mimeType === undefined) {
      newFile = { ...newFile, mimeType: `${temp}/${newFile.uri.split('.').pop()}` }
    }
    // Importantísimo convertir el archivo al tipo "ReactNativeFile de apollo-client-upload", sino, no sube.
    newFile = new ReactNativeFile({
      uri: newFile.uri,
      type: newFile.mimeType,
      name: newFile.filename
    })
    // console.log('newFile convertido=', newFile)
    return newFile
  } catch (error) {
    console.log(error)
  }
}

export default uploadFile
