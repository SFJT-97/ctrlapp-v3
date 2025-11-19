import { gql, useMutation } from '@apollo/client'
import { useState, useEffect } from 'react'
import { UseGetSignedUrlFromCacheReturn } from './types'

const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
    getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
      signedUrl
    }
  }
`

interface MediaItem {
  result: {
    ticketImage1?: string
    ticketImage2?: string
    ticketImage3?: string
    ticketVideo?: string
  }
}

interface GetResultParams {
  key: string
  media: 'image' | 'video'
  getURL: (params: { variables: { idSiMMediaURL: string } }) => Promise<{
    data?: {
      getSignedUrlFromCache?: {
        signedUrl: string
      }
    }
  }>
}

const getResult = async ({
  key,
  media,
  getURL
}: GetResultParams): Promise<{
  id: string
  uri: string | null
  type: 'image' | 'video'
} | null> => {
  try {
    const uri = await getURL({ variables: { idSiMMediaURL: key } })
    const signedUrl =
      uri?.data?.getSignedUrlFromCache?.signedUrl ?? null

    return {
      id: key,
      uri: signedUrl,
      type: media
    }
  } catch (error) {
    console.error('Error getting signed URL:', error)
    return null
  }
}

// CRITICAL FIX: Now properly handles async operations with useEffect
export const useGetSignedUrlFromCache = (
  items: MediaItem[]
): UseGetSignedUrlFromCacheReturn => {
  const [getURL] = useMutation<{
    getSignedUrlFromCache: { signedUrl: string }
  }>(getSignedUrlFromCacheQ)

  const [urls, setUrls] = useState<
    Array<{
      id: string
      uri: string | null
      type: 'image' | 'video'
    }>
  >([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUrls = async (): Promise<void> => {
      if (!items || items.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const results = await Promise.all(
          items.map(async (el) => {
            const mediaItems: Array<{
              id: string
              uri: string | null
              type: 'image' | 'video'
            }> = []

            // Process ticketImage1
            if (el.result.ticketImage1) {
              const result = await getResult({
                key: el.result.ticketImage1,
                media: 'image',
                getURL
              })
              if (result) mediaItems.push(result)
            }

            // Process ticketImage2
            if (el.result.ticketImage2) {
              const result = await getResult({
                key: el.result.ticketImage2,
                media: 'image',
                getURL
              })
              if (result) mediaItems.push(result)
            }

            // Process ticketImage3
            if (el.result.ticketImage3) {
              const result = await getResult({
                key: el.result.ticketImage3,
                media: 'image',
                getURL
              })
              if (result) mediaItems.push(result)
            }

            // Process ticketVideo
            if (el.result.ticketVideo) {
              const result = await getResult({
                key: el.result.ticketVideo,
                media: 'video',
                getURL
              })
              if (result) mediaItems.push(result)
            }

            return mediaItems
          })
        )

        // Flatten the results
        const flattenedResults = results.flat()
        setUrls(flattenedResults)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchUrls()
  }, [items, getURL])

  return { urls, loading, error }
}

