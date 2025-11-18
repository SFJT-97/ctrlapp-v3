import { gql, useQuery } from '@apollo/client'

const allMyCompanyTicketsQ = gql`
query Query {
  allMyCompanyTickets
}

`

export const useAllMyCommpanyTicketsCount = () => {
  const { loading, error, data } = useQuery(allMyCompanyTicketsQ, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const allMyCompanyTickets = data
  if (allMyCompanyTickets) {
    return allMyCompanyTickets
  } else {
    return {}
  }
}
