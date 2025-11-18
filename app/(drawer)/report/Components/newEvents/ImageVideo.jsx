//
// **** Se modificó para tener en cuenta el uso de la nueva cámara por defecto, es integrada, más liviana y confiable... y más limitada ****
//

// Builtin modules
// import { useState, useEffect } from 'react'
import { View, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native'
import { useTheme, Text } from 'react-native-paper'

// Custom modules
// import { showImageOptions, handleChangeImageFromCamera } from '../../../../../globals/handleImage'
import { showImageOptions } from '../../../../../globals/handleImage'
// import { showVideoOptions, handleChangeVideoFromGallery } from '../../../../../globals/handleVideo'
import { showVideoOptions } from '../../../../../globals/handleVideo'

// Global variables
import { EMARAY_CAMERA_JPG, EMARAY_VIDEORECORDER_JPG } from '../../../../../globals/variables/globalVariables'
const offLineImageThumbnail = '../../../../../assets/eMaray--camera.jpg'
const offLineVideoThumbnail = '../../../../../assets/eMaray--videoRecorder.png'
// const state = await NetInfo.fetch()

const ImageVideo = ({
  setImage1,
  setImage2,
  setImage3,
  setVideo,
  image1,
  image2,
  image3,
  video,
  setIsCameraActive,
  isCameraActive,
  setCameraSelected,
  netState = true
}) => {
  const theme = useTheme()
  const styles = StyleSheet.create({
    container: {
      width: 300,
      height: 300,
      flex: 2,
      marginHorizontal: 'auto',
      alignSelf: 'center'
    },

    row: {
      flexDirection: 'row'
    },

    firstItem: {
      flex: 2,
      backgroundColor: theme.colors.elevation.level3,
      height: 130,
      margin: 10,

      justifyContent: 'center',
      alignItems: 'center'
    },

    secondItem: {
      flex: 2,
      backgroundColor: theme.colors.elevation.level3,
      height: 130,
      margin: 10,

      justifyContent: 'center',
      alignItems: 'center'
    },

    thirdItem: {
      flex: 2,
      backgroundColor: theme.colors.elevation.level3,
      height: 130,
      margin: 10,

      justifyContent: 'center',
      alignItems: 'center'
    },

    fourthItem: {
      flex: 2,
      backgroundColor: theme.colors.elevation.level3,
      height: 130,
      margin: 10,

      justifyContent: 'center',
      alignItems: 'center'
    },

    image: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'center'
    }
  })
  return (
    <View style={{ rowGap: 10 }}>
      <Text variant='headlineSmall'>Gallery</Text>
      <Text>Press the images to take a picture or video</Text>
      <View style={styles.container}>
        <View style={styles.row}>
          <TouchableOpacity
            style={{ width: 150, height: 150 }}
            onLongPress={() => showImageOptions(setImage1)}
            // onPress={async () => await handleChangeImageFromCamera(setImage1, false)}  // Forma viejea (funcional para versiones de Android < 9)
            onPress={() => {
              // Cámara moderna, integrada en la aplicación, super liviana, rápida y confiable y... horrible
              setIsCameraActive(!isCameraActive)
              setCameraSelected(1)
            }}
          >
            <ImageBackground
              style={styles.fourthItem}
              src={!netState ? offLineImageThumbnail : image1?.uri || EMARAY_CAMERA_JPG}
              source={!netState ? offLineImageThumbnail : { uri: image1?.uri || EMARAY_CAMERA_JPG }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ width: 150, height: 150 }}
            onLongPress={() => showImageOptions(setImage2)}
            // onPress={() => handleChangeImageFromCamera(setImage2, false)}
            onPress={() => {
              // Cámara moderna, integrada en la aplicación, super liviana, rápida y confiable y... horrible
              setIsCameraActive(!isCameraActive)
              setCameraSelected(2)
            }}
          >
            <ImageBackground
              style={styles.fourthItem}
              src={!netState ? offLineImageThumbnail : image2?.uri || EMARAY_CAMERA_JPG}
              source={!netState ? offLineImageThumbnail : { uri: image2?.uri || EMARAY_CAMERA_JPG }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={{ width: 150, height: 150 }}
            onLongPress={() => showImageOptions(setImage3)}
            // onPress={() => handleChangeImageFromCamera(setImage3, false)}
            onPress={() => {
              // Cámara moderna, integrada en la aplicación, super liviana, rápida y confiable y... horrible
              setIsCameraActive(!isCameraActive)
              setCameraSelected(3)
            }}
          >
            <ImageBackground
              style={styles.thirdItem}
              src={!netState ? offLineImageThumbnail : image3?.uri || EMARAY_CAMERA_JPG}
              source={!netState ? offLineImageThumbnail : { uri: image3?.uri || EMARAY_CAMERA_JPG }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ width: 150, height: 150 }}
            onLongPress={() => showVideoOptions(setVideo)}
            // onPress={() => handleChangeVideoFromGallery(setVideo)} // Forma viejea (funcional para versiones de Android < 9)
            onPress={() => {
              setIsCameraActive(!isCameraActive)
              setCameraSelected(4)
            }}
          >
            <ImageBackground
              style={styles.fourthItem}
              src={!netState ? offLineVideoThumbnail : video?.uri || EMARAY_VIDEORECORDER_JPG}
              source={!netState ? offLineImageThumbnail : { uri: video?.uri || EMARAY_VIDEORECORDER_JPG }}
            />

          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default ImageVideo

/*
  // // Builtin modules
  // // import { useState, useEffect } from 'react'
  // import { View, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native'
  // import { useTheme, Text, Icon } from 'react-native-paper'

  // // Custom modules
  // import { showImageOptions, handleChangeImageFromCamera } from '../../../../../globals/handleImage'
  // import { showVideoOptions, handleChangeVideoFromGallery } from '../../../../../globals/handleVideo'
  // import { CameraView } from 'expo-camera'
  // import { useRef } from 'react'

  // const ImageVideo = ({ setImage1, setImage2, setImage3, setVideo, image1, image2, image3, video }) => {
  //   const theme = useTheme()
  //   const cameraRef = useRef(null)
  //   const styles = StyleSheet.create({
  //     container: {
  //       width: 300,
  //       height: 300,
  //       flex: 2,
  //       marginHorizontal: 'auto',
  //       alignSelf: 'center'
  //     },

  //     row: {
  //       flexDirection: 'row'
  //     },

  //     firstItem: {
  //       flex: 2,
  //       backgroundColor: theme.colors.elevation.level3,
  //       height: 130,
  //       margin: 10,

  //       justifyContent: 'center',
  //       alignItems: 'center'
  //     },

  //     secondItem: {
  //       flex: 2,
  //       backgroundColor: theme.colors.elevation.level3,
  //       height: 130,
  //       margin: 10,

  //       justifyContent: 'center',
  //       alignItems: 'center'
  //     },

  //     thirdItem: {
  //       flex: 2,
  //       backgroundColor: theme.colors.elevation.level3,
  //       height: 130,
  //       margin: 10,

  //       justifyContent: 'center',
  //       alignItems: 'center'
  //     },

  //     fourthItem: {
  //       flex: 2,
  //       backgroundColor: theme.colors.elevation.level3,
  //       height: 130,
  //       margin: 10,

  //       justifyContent: 'center',
  //       alignItems: 'center'
  //     },

  //     image: {
  //       flex: 1,
  //       resizeMode: 'cover',
  //       justifyContent: 'center'
  //     }
  //   })

  //   // console.log('cameraRef\n', cameraRef.current.cameraRef)
  //   return (
  //     <View style={{ rowGap: 10 }}>
  //       <Text variant='headlineSmall'>Gallery</Text>
  //       <View style={styles.container}>
  //         <CameraView
  //           style={{ flex: 1 }}
  //           facing='back'
  //           ref={cameraRef}
  //         >
  //           <View style={styles.row}>
  //             <TouchableOpacity
  //               style={{ width: 150, height: 150 }}
  //               onLongPress={() => showImageOptions(setImage1)}
  //               onPress={async () => await handleChangeImageFromCamera(setImage1, false, cameraRef)}
  //             >
  //               <ImageBackground
  //                 style={styles.fourthItem}
  //                 src={image1?.uri}
  //               >
  //                 <Icon
  //                   source='camera'
  //                   color={theme.colors.secondary}
  //                   size={40}
  //                 />
  //               </ImageBackground>
  //             </TouchableOpacity>
  //             <TouchableOpacity
  //               style={{ width: 150, height: 150 }}
  //               onLongPress={() => showImageOptions(setImage2)}
  //               onPress={() => handleChangeImageFromCamera(setImage2, false, cameraRef)}
  //             >
  //               <ImageBackground
  //                 style={styles.fourthItem}
  //                 src={image2?.uri}
  //               >
  //                 <Icon
  //                   source='camera'
  //                   color={theme.colors.secondary}
  //                   size={40}
  //                 />
  //               </ImageBackground>
  //             </TouchableOpacity>
  //           </View>
  //           <View style={styles.row}>
  //             <TouchableOpacity
  //               style={{ width: 150, height: 150 }}
  //               onLongPress={() => showImageOptions(setImage3)}
  //               onPress={() => handleChangeImageFromCamera(setImage3, false, cameraRef)}
  //             >
  //               <ImageBackground
  //                 style={styles.thirdItem}
  //                 src={image3?.uri}
  //               >
  //                 <Icon
  //                   source='camera'
  //                   color={theme.colors.secondary}
  //                   size={40}
  //                 />
  //               </ImageBackground>
  //             </TouchableOpacity>
  //             <TouchableOpacity
  //               style={{ width: 150, height: 150 }}
  //               onLongPress={() => showVideoOptions(setVideo)}
  //               onPress={() => handleChangeVideoFromGallery(setVideo)}
  //             >
  //               <ImageBackground
  //                 style={styles.fourthItem}
  //                 src={video?.uri}
  //               >
  //                 <Icon
  //                   source='video'
  //                   color={theme.colors.secondary}
  //                   size={40}
  //                 />
  //               </ImageBackground>
  //             </TouchableOpacity>
  //           </View>
  //         </CameraView>
  //       </View>
  //     </View>
  //   )
  // }

  // export default ImageVideo
*/
