// Global type definitions

export interface User {
  idUser: string
  idEmployee: string
  nickName: string
  firstName: string
  secondName?: string
  lastName: string
  secondLastName?: string
  email: string
  phone?: string
  password?: string
  idCompany: string
  companyName: string
  idCompanyBusinessUnit?: string
  companyBusinessUnitDescription?: string
  idCompanySector?: string
  companySectorDescription?: string
  idStandardJobRole?: string
  standardJobRoleDescription?: string
  idcompanyJobRole?: string
  companyJobRoleDescription?: string
  userProfileImage?: string
}

export interface UserConfiguration {
  idUserConfiguration?: string
  idUser: string
  idEmployee: string
  userProfileImage?: string
  theme?: 'light' | 'dark'
  showNotificationsToLevel?: number
  personalPhone?: string
  personalEmail?: string
  personalAddress?: string
  aboutMe?: string
}

export interface CompanySector {
  idCompanySector: string
  companySectorDescription: string
  [key: string]: unknown
}

export interface ChatMessage {
  idChat: string
  idConversation: string
  idUser: string
  idUserTo: string
  chatText: string
  chatDateTimePost: string
  messageRead: boolean
}

export interface ChatListItem {
  idChat: string
  idUser: string
  nickName: string
  firstName: string
  lastName: string
  userProfileImage: string
  lastMsgWithMe: string
  dateTimeLastMsgWithMe: string
  totalUnReadChatsByIdUser: number
  idConversation: string
  messageRead: boolean
}

export interface DataContextType {
  nickName: string
  password?: string
  idDevice: string
  userToken: string
  idUser: string
  loged: boolean
  idCompany: string
  companyName: string
  fabView: boolean
  userToChat: string
  newMsg: string
  theme: string
  tokenDevice?: string
}

export interface HookReturn<T> {
  loading: boolean
  data: T | null
  error: Error | null
}

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectNumber: string
  projectId: string
  storageBucket: string
  appId: string
  messagingSenderId: string
  serverKey: string
}

declare module '*.png' {
  const value: number
  export default value
}

declare module '*.jpg' {
  const value: number
  export default value
}

declare module '*.webp' {
  const value: number
  export default value
}

declare module '*.gif' {
  const value: number
  export default value
}

declare module '*.mp4' {
  const value: number
  export default value
}

