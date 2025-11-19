import { gql, useQuery, QueryHookOptions } from '@apollo/client'
import { CompanySector } from '../../types'
import { UseMyCompanySectorsReturn } from './types'

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

export const useAllCompanySectors = (
  companyName: string
): CompanySector[] | 'Loading...' | string => {
  const options: QueryHookOptions = {
    fetchPolicy: 'cache-first', // Company sectors rarely change, use cache-first
    variables: { companyName }
  }

  const { loading, error, data } = useQuery<{
    allcompanySectors: CompanySector[]
  }>(QAllcompanySectors, options)

  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }

  return data?.allcompanySectors ?? []
}

// CRITICAL FIX: useMyCompanySectors now returns proper structure
export const useMyCompanySectors = (): UseMyCompanySectorsReturn => {
  const { loading, error, data } = useQuery<{
    myCompanySectors: CompanySector[]
  }>(myCompanySectorsQH, { fetchPolicy: 'cache-and-network' })

  if (loading) {
    return { loading: true, sectors: null, error: null }
  }

  if (error) {
    return { loading: false, sectors: null, error }
  }

  return {
    loading: false,
    sectors: data?.myCompanySectors ?? null,
    error: null
  }
}

