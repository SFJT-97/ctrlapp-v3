import { gql, useQuery } from '@apollo/client'

/*
  Query:allEventConsequences:[eventConsequence]!
*/

const QAllEventConsequences = gql`
query AllEventConsequences {
  allEventConsequences {
    idEventConsequence
    eventConsequenceLevel
    eventConsequenceDescription
    eventConsequenceCustomDescription
  }
}

`

export const useAllEventConsequences = () => {
  const { loading, error, data } = useQuery(QAllEventConsequences)
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  return data.allEventConsequences // .map(el => JSON.stringify(el))
}
