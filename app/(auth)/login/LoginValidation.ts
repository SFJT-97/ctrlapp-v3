import * as yup from 'yup'
import { NOT_ALLOWED_CHARACTERS } from '../../../globals/constants/appConstants'

// Custom test to check if value contains any invalid characters
const containsInvalidChars = (value: string | undefined): boolean => {
  if (!value) return false
  return NOT_ALLOWED_CHARACTERS.some(char => value.includes(char))
}

export const loginValidationSchema = yup.object().shape({
  nickName: yup
    .string()
    .min(3, 'Too short!')
    .max(30, 'Too long!')
    .required('Nickname (user name) is required')
    .test('no-invalid-chars', 'Contains invalid characters', (value) => !containsInvalidChars(value)),
  password: yup
    .string()
    .min(5, 'Too short!')
    .max(100, 'Too long!')
    .required('Password is required')
    .test('no-invalid-chars', 'Contains invalid characters', (value) => !containsInvalidChars(value))
})

