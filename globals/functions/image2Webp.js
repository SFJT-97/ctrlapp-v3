// ==> 2024-10-02
// 🔒 Guardado para uso futuro - herramienta personalizada - no borrar por ahora
// import createResizedImage from 'react-native-image-resizer'
// import * as FileSystem from 'expo-file-system'

// export const imageToThumbnail = async (image) => {
//   const imageUri = image.uri
//   console.log(imageUri)

//   try {
//     const resizedImageUri = await createResizedImage(
//       imageUri,
//       800,
//       600,
//       'PNG',
//       80
//     )

//     const newUri = `${FileSystem.documentDirectory}${resizedImageUri.name}`
//     console.log(newUri, newUri)

//     await FileSystem.moveAsync({
//       from: resizedImageUri.uri,
//       to: newUri
//     })
//     return newUri
//   } catch (error) {
//     console.error('Error converting image to WEBP:', error)
//     return null
//   }
// }

// // Convertir una imagen a formato WEBP
// const imagesToWEBP = async (image) => {
//   const sourceUri = image.uri
//   try {
//     const webpUri = await RNWebp.convert(sourceUri, {
//       quality: 80 // calidad de la conversión
//     })
//     console.log('Imagen convertida a WEBP:', webpUri)
//     return webpUri
//   } catch (error) {
//     console.error('Error al convertir imagen a WEBP:', error)
//     return null
//   }
// }

// export default imagesToWEBP

// // Ejemplo de uso
// const sourceImageUri = 'path/to/source/image.jpg'
// convertToWebp(sourceImageUri)
