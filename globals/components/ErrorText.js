import { Text } from 'react-native'
export const ErrorText = ({ errors }) => {
  let result
  if (Object.keys(errors).length !== 0) {
    result = <Text name='errorText' id='errorText' style={{ color: 'red', alignSelf: 'stretch' }}> Please, verify fill errors... </Text>
  } else {
    result = <Text name='errorText' id='errorText'> </Text>
  }
  return result
}
