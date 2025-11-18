import { gql, useQuery } from '@apollo/client'

/*
  Query:allEventConsequences:[eventConsequence]!
*/

const allEventConsequencesQ = gql`
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
  const { loading, error, data } = useQuery(allEventConsequencesQ)
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  // console.info('data.allEventConsequences\n', data.allEventConsequences)
  return data.allEventConsequences // .map(el => JSON.stringify(el))
}
