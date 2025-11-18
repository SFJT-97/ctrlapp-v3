import { gql, useQuery } from '@apollo/client'

const allStandardTicketsQ = gql`
query AllStandardTickets {
  allStandardTickets {
    idStandardTicket
    idEventProbability
    eventProbabilityLevel
    eventProbabilityDescription
    idEventConsequence
    eventConsequenceLevel
    eventConsequenceDescription
    standardTicketDescription
    format1Image
    format2Image
    format3Image
    format1Video
    format2Video
    format3Video
    maxVideoDuration
  }
}

`

export const useAllStandardTickets = () => {
  const { loading, error, data } = useQuery(allStandardTicketsQ)
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  return data.allStandardTickets // .map(el => JSON.stringify(el))
}
