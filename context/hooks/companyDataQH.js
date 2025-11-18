import { gql, useQuery } from '@apollo/client'

/*
  Query: allCompanies
*/

// Query definition from BE. All constants definitions used for useQuery hooks, will have a Q letter at the end
const allCompaniesQ = gql`
query AllCompanies {
  allCompanies {
    idCompany
    companyName
    companyCategory
    headQuartersCountry
    headQuartersCity
    headQuartersStreet
    headQuartersNumber
    headQuartersZipCode
    address
    headQuartersMainContactPhone
    headQuartersMainContactEmail
    companyInternalDescription
    companyLogo
  }
}

`

export const useAllCompanies = () => {
  const { loading, error, data } = useQuery(allCompaniesQ, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  // cuando devuelve un arreglo, hay que hacer lo siguiente. Mapear el arreglo y devolverlo como objeto
  const allCompaniesData = data.allCompanies.map(el => el)

  return { allCompaniesData }
}

/*
  Query: findCompany
*/

// Query definition from BE. All constants definitions used for useQuery hooks, will have a Q letter at the end

const findCompanyQ = gql`
query FindCompany($companyName: String!) {
  findCompany(companyName: $companyName) {
    idCompany
    companyName
    companyCategory
    headQuartersCountry
    headQuartersCity
    headQuartersStreet
    headQuartersNumber
    headQuartersZipCode
    address
    headQuartersMainContactPhone
    headQuartersMainContactEmail
    companyInternalDescription
    companyLogo
  }
}

`

export const useFindCompany = (companyName) => {
  const { loading, error, data } = useQuery(findCompanyQ, { variables: { companyName } }, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  // cuando devuelve un solo objeto, no hay que mapearlo (porque no es un arreglo) y se devuelve el objeto tal como está, es decir sin los {}
  const findCompanyData = data.findCompany

  return findCompanyData
}

const myCompanyDataQ = gql`
query MyCompanyData {
  myCompanyData {
    idCompany
    companyName
    companyCategory
    headQuartersCountry
    headQuartersCity
    headQuartersStreet
    headQuartersNumber
    headQuartersZipCode
    address
    headQuartersMainContactPhone
    headQuartersMainContactEmail
    companyInternalDescription
    companyLogo
  }
}

`

export const useMyCompanyData = () => {
  const { loading, error, data } = useQuery(myCompanyDataQ, { fetchPolicy: 'cache-and-network' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const myCompanyData = data
  if (myCompanyData) {
    return myCompanyData
  } else {
    return {}
  }
}
