// ==> 2024-10-02
import { gql, useQuery } from '@apollo/client'

/*
  Query:allcompanySectors(companyName:String!):[companySector]!
*/

const QAllcompanySectors = gql`
query AllcompanySectors($companyName: String!) {
  allcompanySectors(companyName: $companyName) {
    idCompanySector
    idCompany
    companyName
    idCompanyBusinessUnit
    companyBusinessUnitDescription
    idStandardSector
    standardSectorDescription
    companySectorDescription
    companySectorPLineQuantity
    pLine1X
    pLine1Y
    pLine1Z
    pLine2X
    pLine2Y
    pLine2Z
    pLine3X
    pLine3Y
    pLine3Z
    pLine4X
    pLine4Y
    pLine4Z
    pLine5X
    pLine5Y
    pLine5Z
    pLine6X
    pLine6Y
    pLine6Z
    pLine7X
    pLine7Y
    pLine7Z
    pLine8X
    pLine8Y
    pLine8Z
    pLine9X
    pLine9Y
    pLine9Z
    pLine10X
    pLine10Y
    pLine10Z
    pLine11X
    pLine11Y
    pLine11Z
    pLine12X
    pLine12Y
    pLine12Z
    colorLine
    colorBackground
  }
}

`

export const useAllCompanySectors = (companyName) => {
  // console.log('inside useAllCompanySectors\n', companyName)
  const { loading, error, data } = useQuery(QAllcompanySectors, { variables: { companyName } }, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  return data.allcompanySectors // .map(el => JSON.stringify(el))
}

const myCompanySectorsQH = gql`
query MyCompanySectors {
  myCompanySectors {
    idCompany
    companyName
    idCompanyBusinessUnit
    companyBusinessUnitDescription
    idStandardSector
    standardSectorDescription
    companySectorDescription
    companySectorPLineQuantity
    pLine1X
    pLine1Y
    pLine1Z
    pLine2X
    pLine2Y
    pLine2Z
    pLine3X
    pLine3Y
    pLine3Z
    pLine4X
    pLine4Y
    pLine4Z
    pLine5X
    pLine5Y
    pLine5Z
    pLine6X
    pLine6Y
    pLine6Z
    pLine7X
    pLine7Y
    pLine7Z
    pLine8X
    pLine8Y
    pLine8Z
    pLine9X
    pLine9Y
    pLine9Z
    pLine10X
    pLine10Y
    pLine10Z
    pLine11X
    pLine11Y
    pLine11Z
    pLine12X
    pLine12Y
    pLine12Z
    idCompanySector
    colorLine
    colorBackground
  }
}

`

export const useMyCompanySectors = () => {
  const { data } = useQuery(myCompanySectorsQH, { fetchPolicy: 'cache-and-network' })
  // if (loading) {
  //   return 'Loading...'
  // }
  // if (error) {
  //   return `Error! ${error}`
  // }

  const myCompanySectors = data
  if (myCompanySectors) {
    return myCompanySectors
  } else {
    return {}
  }
}
