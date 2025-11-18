import { gql, useQuery } from '@apollo/client'

const allDevicesFromUserQ = gql`
query AllDevicesFromUser($idUser: ID!) {
  allDevicesFromUser(idUser: $idUser) {
    idUserDevice
    idUser
    token
  }
}

`

export const useAllDevicesFromUser = ({ idUser }) => {
  const { loading, error, data } = useQuery(allDevicesFromUserQ, { variables: { idUser } }, { fetchPolicy: 'network-only' })
  if (loading) return 'loading'
  if (error) return `Error ${error}`

  const allDevicesFromUser = data.allDevicesFromUser.map(el => el)
  console.info('useAllDevicesFromUser= \n', { allDevicesFromUser })
  return { allDevicesFromUser }
}
