import React, { createContext, useState, useMemo, ReactNode } from 'react'
import { DataContextType } from '../types'

export interface DataContextValue {
  data: DataContextType
  setData: React.Dispatch<React.SetStateAction<DataContextType>>
}

const userDefault: DataContextType = {
  nickName: '',
  password: undefined,
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

export const DataContext = createContext<DataContextValue | undefined>(undefined)

interface DataProviderProps {
  children: ReactNode
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<DataContextType>(userDefault)

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<DataContextValue>(
    () => ({
      data,
      setData
    }),
    [data]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

