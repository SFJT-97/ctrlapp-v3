import { createContext } from 'react'

const UserContext = createContext({
  nickName: '',
  password: '',
  idDevice: '', // este es el idDevice, es como: "ExponentPushToken[HgDUstPTXCZlRXPmas9NZr]"
  userToken: '',
  idUser: '',
  loged: false
})

export default UserContext
