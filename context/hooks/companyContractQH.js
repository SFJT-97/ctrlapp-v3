import { gql, useQuery } from '@apollo/client'

const findContractQ = gql`
query FindContract($companyName: String!) {
  findContract(companyName: $companyName) {
    idContract
    idCompany
    companyName
    hasCAAdmin
    amountOfCAA
    amountOfUsers
    amountOfChartsAllowed
  }
}

`

export const useFindContract = (companyName) => {
  // console.info(companyName)
  const { loading, error, data } = useQuery(findContractQ, { variables: { companyName } }, { fetchPolicy: 'network-only' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  // console.info('data= \n', data)
  const findContract = data.findContract

  return findContract
}
