import * as yup from 'yup'

const notAllowedCharacters = ['*', '%', '(', ')', '>', '/', '<', '=', '"', '\\', '<', '`', '\'']

export const loginValidationSchema = yup.object().shape({
  nickName: yup
    .string()
    .min(3, 'Too short!')
    .max(30, 'Too long!')
    .required('Nickname (user name) is required')
    .notOneOf(notAllowedCharacters),
  password: yup
    .string()
    .min(5, 'Too short!')
    .max(100, 'Too long!')
    .required('Password is required')
    .notOneOf(notAllowedCharacters),
  userName: yup
    .string()
    .min(3, 'Too short!')
    .max(30, 'Too long!'),
  name: yup
    .string()
    .min(3, 'Too short!')
    .max(30, 'Too long!')
})
