import { gql, useQuery } from '@apollo/client'

/*
  Query: allCompanyJobRoles
*/

// Query definition from BE. All constants definitions used for useQuery hooks, will have a Q letter at the end

const allCompanyJobRolesQ = gql`
query AllCompanyJobRoles($companyName: String!) {
  allCompanyJobRoles(companyName: $companyName) {
    idCompanyJobRole
    idCompany
    companyName
    idCompanyBusinessUnit
    companyBusinessUnitDescription
    idCompanySector
    companySectorDescription
    idStandardJobRole
    standardJobRoleDescription
    companyJobRoleDescription
  }
}

`

export const useAllCompanyJobRoles = (companyName) => {
  // console.log('companyName desde el useAllCompanyJobRoles=', companyName)
  const { loading, error, data } = useQuery(allCompanyJobRolesQ, { variables: { companyName } }, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  // console.log(data)
  const allCompanyJobRolesData = data.allCompanyJobRoles.map(el => el)

  return allCompanyJobRolesData
}
