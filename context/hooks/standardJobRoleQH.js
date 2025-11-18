import { gql, useQuery } from '@apollo/client'

/*
Query:allStandardJobRoles: [standardJobRole]!
*/

// Query definition from BE. All constants definitions used for useQuery hooks, will have a Q letter at the end
const allStandardJobRolesQ = gql`
query AllStandardJobRoles {
  allStandardJobRoles {
    idStandardJobRole
    standardJobRoleDescription
    internalId
    reserved
  }
}

`

export const useAllStandardJobRoles = () => {
  const { loading, error, data } = useQuery(allStandardJobRolesQ)
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  return data.allStandardJobRoles
}
