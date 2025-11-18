// ==> 2024-10-02
import { gql, useQuery } from '@apollo/client'

const getFileQ = gql`
query GetFile($filename: String!) {
  getFile(filename: $filename) {
    url
  }
}

`

export const useGetFile = (filename) => {
  const name = filename?.split('/').pop()
  const { loading, error, data } = useQuery(getFileQ, { variables: { filename: name }, fetchPolicy: 'cache-and-network' })
  if (filename === undefined) return
  // console.log('filename=', filename)
  // console.log('name=', name)
  if (loading) return
  if (error) {
    console.error(error.message)
    return `Error... ${error}`
  }
  const result = data
  // console.log('result\n', result)
  if (result && result !== 'Loading') {
    return result?.getFile?.url
  }
}

const getStoredFileQ = gql`
query GetStoredFile($filename: String!) {
  getStoredFile(filename: $filename) {
    filename
    mimetype
    encoding
    success
    message
    location
    url
  }
}

`

export const useGetStoredFile = (filename) => {
  const name = filename?.split('/').pop()

  const { loading, error, data } = useQuery(getStoredFileQ, { variables: { filename: name } }, { fetchPolicy: 'network-only' })
  if (filename === undefined) return

  if (loading) return
  if (error) {
    console.error(error.message)
    return `Error... ${error}`
  }
  const result = data
  // console.log('data from useGetStoredFile\n', data)
  if (result && result !== 'Loading...') {
    return result?.getStoredFile
  }
}

const getFileURLQ = gql`
  query GetFileURL($filename: String!) {
    getFileURL(filename: $filename)
  }

`

export const useGetFileURL = (filename) => {
  const name = filename?.split('/').pop()
  const { loading, error, data } = useQuery(getFileURLQ, { variables: { filename: name } }, { fetchPolicy: 'network-only' })
  if (filename === undefined) return

  if (loading) return
  if (error) {
    console.error(error.message)
    return `Error... ${error}`
  }
  const result = data
  // console.info('data from useGetFileURL\n', result)

  if (result && result !== 'Loading...') {
    return result?.getFileURL
  }
}
