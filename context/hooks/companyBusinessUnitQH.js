import { gql, useQuery } from '@apollo/client'

const myBusinessUnitCompanyQ = gql`
query MyBusinessUnitsCompany {
  myBusinessUnitsCompany {
    idCompanyBusinessUnit
    idCompany
    companyName
    companyBusinessUnitDescription
  }
}

`

export const useMyCompanyBussinesUnits = () => {
  const { loading, error, data } = useQuery(myBusinessUnitCompanyQ, { fetchPolicy: 'cache-and-network' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const myBusinessUnitsCompany = data
  if (myBusinessUnitsCompany) {
    return myBusinessUnitsCompany
  } else {
    return {}
  }
}
