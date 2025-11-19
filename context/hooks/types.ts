// Hook return type definitions

import { User, UserConfiguration, CompanySector } from '../../types'

export interface UseMeReturn {
  loading: boolean
  me: User | null
  error: Error | null
}

export interface UseMyConfigReturn {
  loading: boolean
  config: UserConfiguration | null
  error: Error | null
}

export interface UseMyCompanySectorsReturn {
  loading: boolean
  sectors: CompanySector[] | null
  error: Error | null
}

export interface UseAllUsersFromMyCompanyReturn {
  loading: boolean
  users: User[] | null
  error: Error | null
}

export interface UseGetSignedUrlFromCacheReturn {
  urls: Array<{
    id: string
    uri: string | null
    type: 'image' | 'video'
  }>
  loading: boolean
  error: Error | null
}

