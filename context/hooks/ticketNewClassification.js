import { gql, useQuery } from '@apollo/client'

const allTicketNewClassificationQ = gql`
query AllTicketNewClassification {
  allTicketNewClassification {
    idTicketNewClassification
    idClassification
    classification
    description
  }
}

`

export const useAllTicketNewClassification = () => {
  const { loading, error, data } = useQuery(allTicketNewClassificationQ, { fetchPolicy: 'cache-and-network' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const allTicketNewClassification = data
  if (allTicketNewClassification) {
    return allTicketNewClassification
  } else {
    return {}
  }
}
