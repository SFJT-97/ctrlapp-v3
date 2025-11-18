import { gql, useQuery } from '@apollo/client'

const allSolutionsStatesQH = gql`
query AllSolutionsStates {
  allSolutionsStates {
    idSolutionState
    solutionStateDescription
  }
}

`

export const useAllSolutionsStates = () => {
  const { loading, error, data } = useQuery(allSolutionsStatesQH, { fetchPolicy: 'cache-and-network' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const allSolutionsStates = data
  if (allSolutionsStates) {
    return allSolutionsStates
  } else {
    return {}
  }
}
