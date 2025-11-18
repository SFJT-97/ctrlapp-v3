// ==> 2024-10-02
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'

const LIMIT = 300

const imagesToWEBP = async (image) => {
  let tempHeight = 0
  let tempWidth = 0
  // console.log('image', image)
  const { uri } = image
  // console.log('uri', uri)
  if (image.height) {
    tempHeight = image.height
    tempWidth = image.width
    // console.log('antes, height:', tempHeight)
    // console.log('antes, width:', tempWidth)
    // console.log('relacion original (height / width):\n', (tempWidth / tempHeight))
    if (tempHeight > LIMIT) {
      if (tempHeight > tempWidth) {
        const relation = tempWidth / tempHeight
        // console.log('relation', relation)
        tempHeight = LIMIT
        tempWidth = LIMIT * relation
        // console.log('verificacion (height >>), relacion original (mayor / menor):\n', (tempHeight / tempWidth))
      }
    }
  } else {
    tempHeight = 300
    tempWidth = 255
  }

  // tempHeight = 300
  // tempWidth = 255
  const DEFAULT_SIZE = { height: tempHeight, width: tempWidth }

  try {
    const manipResult = await manipulateAsync(
      uri,
      [{ resize: DEFAULT_SIZE }], { compress: 0.8, format: SaveFormat.JPEG }
    )
    // console.log('manipResult\n', manipResult)
    return manipResult
  } catch (error) {
    console.log('Error changing image size:\n', error)
    return null
  }
}

export default imagesToWEBP
