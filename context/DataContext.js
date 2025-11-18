import React, { createContext, useState } from 'react'

export const DataContext = createContext()

/*
  idDevice: Es un id del device del user que es único y tiene la forma de: "ExponentPushToken[HgDUstPTXCZlRXPmas9NZr]"
*/

const userDefault = {
  nickName: '',
  password: '',
  idDevice: '',
  userToken: '',
  idUser: '',
  loged: false,
  idCompany: '',
  companyName: '',
  fabView: true,
  userToChat: '',
  newMsg: '',
  theme: ''
}

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(userDefault)
  return (
    <DataContext.Provider value={{
      data,
      setData
    }}
    >
      {children}
    </DataContext.Provider>
  )
}
