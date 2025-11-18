import { gql, useMutation } from '@apollo/client'

const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
  getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
    signedUrl
  }
}
`

const getResult = async (key, media, getURL) => {
  let uri
  try {
    uri = await getURL({ variables: { idSiMMediaURL: key } })
    if (uri && uri !== 'Loading...' && uri !== 'ApolloError') {
      console.log('uri.data.getSignedUrlFromCache.signedUrl', uri.data.getSignedUrlFromCache.signedUrl)
      uri = uri.data.getSignedUrlFromCache.signedUrl
    }
    const result = {
      id: key,
      uri,
      type: media
    }
    console.log('result', result)
    return result
  } catch (error) {
    console.log('error', error)
  }
}

export const useGetSignedUrlFromCache = (items) => {
  console.log('items\n', items)
  const [getURL] = useMutation(getSignedUrlFromCacheQ)

  const reelsData = items.map(async el => {
    let tempData
    let temp
    temp = el.result.ticketImage1
    if (temp) {
      const temp2 = await getResult(temp, 'image', getURL)
      tempData = {
        ...tempData,
        temp2
      }
    }
    temp = el.result.ticketImage2
    if (temp) {
      const temp2 = await getResult(temp, 'image', getURL)
      tempData = {
        ...tempData,
        temp2
      }
    }
    temp = el.result.ticketImage3
    if (temp) {
      const temp2 = await getResult(temp, 'image', getURL)
      tempData = {
        ...tempData,
        temp2
      }
    }
    temp = el.result.ticketVideo
    if (temp) {
      const temp2 = await getResult(temp, 'video', getURL)
      tempData = {
        ...tempData,
        temp2
      }
    }
    console.log('tempData\n', tempData)
    return tempData
  })
  if (reelsData) return reelsData
}
