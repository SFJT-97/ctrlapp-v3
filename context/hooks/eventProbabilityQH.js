import { gql, useQuery } from '@apollo/client'

/*
  Query:allEventProbabilities:[eventProbability]!
*/

const QAllEventProbabilities = gql`
query AllEventProbabilities {
  allEventProbabilities {
    idEventProbability
    eventProbabilityLevel
    eventProbabilityDescription
    eventProbabilityCustomDescription
  }
}

`

export const useAllEventProbabilities = () => {
  const { loading, error, data } = useQuery(QAllEventProbabilities)
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  return data.allEventProbabilities // .map(el => JSON.stringify(el))
}
