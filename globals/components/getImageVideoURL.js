import { gql, useQuery } from '@apollo/client'

const getFileQ = gql`
query GetFile($filename: String!) {
  getFile(filename: $filename) {
    url
  }
}

`

export const GetImageVideoURL = (filename) => {
  const name = filename?.split('/').pop()
  const { data } = useQuery(getFileQ, { variables: { filename: name } }, { fetchPolicy: 'network-only' })
  if (filename === undefined) return

  console.log('data=', data)
  const result = data
  if (result) {
    return result?.getFile?.url
  }
}

export default GetImageVideoURL
