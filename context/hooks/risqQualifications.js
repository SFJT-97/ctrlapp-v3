import { gql, useQuery } from '@apollo/client'

const allRiskQualificationsQ = gql`
query AllRiskQualifications {
  allRiskQualifications {
    idRiskQualification
    riskQualificationLevel
    riskQualificationInitials
    riskQualificationDescription
  }
}

`

export const useAllRiskQualifications = () => {
  const { loading, error, data } = useQuery(allRiskQualificationsQ, { fetchPolicy: 'cache-and-network' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const allRiskQualifications = data
  if (allRiskQualifications) {
    return allRiskQualifications
  } else {
    return {}
  }
}
