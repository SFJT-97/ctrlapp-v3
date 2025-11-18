import { gql, useQuery } from '@apollo/client'

const allTicketNewSubTypeQ = gql`
query AllTicketNewSubType {
  allTicketNewSubType {
    idTicketNewSubType
    subTypeDescription
  }
}

`

export const useAllTicketNewSubType = () => {
  const { loading, error, data } = useQuery(allTicketNewSubTypeQ, { fetchPolicy: 'cache-and-network' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const allTicketNewSubType = data
  if (allTicketNewSubType) {
    return allTicketNewSubType
  } else {
    return {}
  }
}
