// FUNCION QUE SE REPETIRÁ CADA X MINUTOS PARA VERIFICAR LOS 8 DISTINTOS TIPOS DE DATOS QUE SON NECESARIOS PARA
// LA PANTALLA REPORTSCREEN QUE ES LA QUE PERMITE CARGAR NUEVOS TICKETS (DE VOZ O MANUALES) Y BUSCAR TICKETS CARGADOS.
import { useEffect } from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'

const meQ = gql`
query Me {
  me {
    idUser
    idEmployee
    password
    firstName
    secondName
    lastName
    secondLastName
    nickName
    email
    phone
    idCompany
    fullName
    companyName
    idCompanyBusinessUnit
    companyBusinessUnitDescription
    idCompanySector
    companySectorDescription
    idStandardJobRole
    standardJobRoleDescription
    idcompanyJobRole
    companyJobRoleDescription
    userProfileImage
    isCompanyAppAdmin
    hiredDate
    active
    isSuperUser
    gender
    birthday
    age
  }
}

`

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

const allTicketNewClassificationQ = gql`
query AllTicketNewClassification {
  allTicketNewClassification {
    idTicketNewClassification
    idClassification
    classification
    description
  }
}

`

const allTicketNewSubTypeQ = gql`
query AllTicketNewSubType {
  allTicketNewSubType {
    idTicketNewSubType
    subTypeDescription
  }
}

`

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

const myCompanySectorsQ = gql`
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

const allSolutionsStatesQ = gql`
query AllSolutionsStates {
  allSolutionsStates {
    idSolutionState
    solutionStateDescription
  }
}

`

const AllMyCompanyOpenTicketsNewQ = gql`
query AllMyCompanyOpenTicketsNew {
  allMyCompanyOpenTicketsNew {
    classification
    classificationDescription
    companySectorDescription
    costAsociated
    dateTimeEvent
    injuredPeople
    lostProduction
    lostProductionTotalTimeDuration
    riskQualification
    solutionType
    subType
    type
    ticketCustomDescription
    ticketImage1
    ticketImage2
    ticketImage3
    ticketVideo
    companyBusinessUnitDescription
    companyName
    dateTimeEventResolved
    idChatIA
    idTicketNew
    idUser
    ticketClosed
    ticketExtraFile
    ticketImage4
    ticketLike
    ticketSolved
  }
}

`

const allMyCompanyTicketsNewQ = gql`
query Query {
  allMyCompanyTicketsNew
}

`

const allUserFromMyCompanyQ = gql`
query AllUsersFromMyCompany {
  allUsersFromMyCompany {
    idUser
    idEmployee
    firstName
    lastName
    nickName
    email
    phone
    idCompany
    fullName
    companyName
    companyBusinessUnitDescription
    companySectorDescription
    companyJobRoleDescription
    userProfileImage
    active
    age
    gender
  }
}

`

const GENERAL_DATA_TIME = 1000 * 60 * 5 // una consulta cada 5 min
const TICKETS_DATA_TIME = 1000 * 60 * 2 // una consulta cada 2 min

export const WatchNewValues = () => {
  // Llamado a los useLazyQueries -- DATOS que no cambian casi nunca y que traen poca info clave y que se usa en muchas pantallas. (timmer largo)
  const [getMe] = useLazyQuery(meQ, { fetchPolicy: 'cache-and-network' })
  const [getMyCompanyData] = useLazyQuery(myCompanyDataQ, { fetchPolicy: 'cache-and-network' })
  const [getMyBusinessUnitCompany] = useLazyQuery(myBusinessUnitCompanyQ, { fetchPolicy: 'cache-and-network' })
  const [getAllTicketNewClassification] = useLazyQuery(allTicketNewClassificationQ, { fetchPolicy: 'cache-and-network' })
  const [getAllTicketNewSubType] = useLazyQuery(allTicketNewSubTypeQ, { fetchPolicy: 'cache-and-network' })
  const [getAllRiskQualifications] = useLazyQuery(allRiskQualificationsQ, { fetchPolicy: 'cache-and-network' })
  const [getMyCompanySectors] = useLazyQuery(myCompanySectorsQ, { fetchPolicy: 'cache-and-network' })
  const [getAllSolutionsStates] = useLazyQuery(allSolutionsStatesQ, { fetchPolicy: 'cache-and-network' })
  const [getAllUsersFromMyCompany] = useLazyQuery(allUserFromMyCompanyQ, { fetchPolicy: 'cache-and-network' })

  const [getAllMyCompanyTicketsNew] = useLazyQuery(allMyCompanyTicketsNewQ, { fetchPolicy: 'cache-and-network' })

  // Llamado al useLazyQuery -- que cambiará todo el tiempo, que trae mucha información y que se usa para las pantallas "CardSearch", para la tabla que muestra
  // el resumen de los tickets seleccionados desde el gráfico principal y que puede usarse en el "reel". (timmer corto)
  const [getAllMyCompanyOpenTicketsNew] = useLazyQuery(AllMyCompanyOpenTicketsNewQ, { fetchPolicy: 'network-only' })

  // internal function to add new queries
  async function addNewQuery (query, varName, generalData) {
    const tempVar = await query({ fetchPolicy: 'cache-and-network' })
    if (tempVar && !tempVar?.loading && !tempVar?.error) {
      const result = { ...generalData, ...{ [varName]: tempVar?.data[varName] } }
      return result
    }
  }

  // fetchGeneralData, verifica información general y de baja probabilidad de cambio. Son 8 consultas en total
  const fetchGeneralData = async () => {
    let generalData = {}
    try {
      const state = await NetInfo.fetch()
      if (state.isConnected) {
        // (01 QUERY)
        generalData = await addNewQuery(getMe, 'me', generalData)
        // (02 QUERY)
        generalData = await addNewQuery(getMyCompanyData, 'myCompanyData', generalData)
        // (03 QUERY)
        generalData = await addNewQuery(getMyBusinessUnitCompany, 'myBusinessUnitsCompany', generalData)
        // (04 QUERY)
        generalData = await addNewQuery(getAllTicketNewClassification, 'allTicketNewClassification', generalData)
        // (05 QUERY)
        generalData = await addNewQuery(getAllTicketNewSubType, 'allTicketNewSubType', generalData)
        // (06 QUERY)
        generalData = await addNewQuery(getAllRiskQualifications, 'allRiskQualifications', generalData)
        // (07 QUERY)
        generalData = await addNewQuery(getMyCompanySectors, 'myCompanySectors', generalData)
        // (08 QUERY)
        generalData = await addNewQuery(getAllSolutionsStates, 'allSolutionsStates', generalData)
        // (09 QUERY)
        generalData = await addNewQuery(getAllMyCompanyTicketsNew, 'allMyCompanyTicketsNew', generalData)
        // (10 QUERY)
        generalData = await addNewQuery(getAllUsersFromMyCompany, 'allUsersFromMyCompany', generalData)
      } else {
        // en este punto no hay conexión, si generalData no tiene valores de antes
        // no se pueden leer nuevos valores, así que no queda otra que esperar a que exista conexión
        // si generaldata ya tenía valores de antes, entonces no pasa nada, se utiliza ese valor
      }
    } catch (error) {
      console.log(error)
    }

    // En esta parte primero hay que borrar el item "CTRLA_GENERAL_DATA" y
    // luego grabar un nuevo item "CTRLA_GENERAL_DATA"
    await AsyncStorage.removeItem('CTRLA_GENERAL_DATA')
    await AsyncStorage.setItem('CTRLA_GENERAL_DATA', JSON.stringify(generalData))
  }

  // fetchTicketData, verifica que cambios se produjeron en los tickets publicados. 1 sola consulta de cambio rápido y resultado voluminoso
  const fetchTicketsData = async () => {
    let ticketsData = {}
    try {
      const state = await NetInfo.fetch()
      if (state.isConnected) {
        // (11 QUERY)
        let allMyCompanyOpenTicketsNew = await getAllMyCompanyOpenTicketsNew({ fetchPolicy: 'network-only' })
        if (allMyCompanyOpenTicketsNew && !allMyCompanyOpenTicketsNew.loading && !allMyCompanyOpenTicketsNew.error) {
          allMyCompanyOpenTicketsNew = allMyCompanyOpenTicketsNew?.data?.allMyCompanyOpenTicketsNew
          ticketsData = allMyCompanyOpenTicketsNew
        }
      } else {
        // No se hace nada en este caso...
      }
    } catch (error) {
      console.log(error)
    }

    // En esta parte primero hay que borrar el item "CTRLA_TICKETS_DATA" y
    // luego grabar un nuevo item "CTRLA_TICKETS_DATA"
    await AsyncStorage.removeItem('CTRLA_TICKETS_DATA')
    await AsyncStorage.setItem('CTRLA_TICKETS_DATA', JSON.stringify(ticketsData))
  }

  useEffect(() => {
    const fetchAndLog = async (fetchFn, label) => {
      try {
        console.log(`checking ${label}...`)
        await fetchFn()
      } catch (error) {
        console.error(`Error fetching ${label}:`, error)
      }
    }

    const init = async () => {
      await fetchGeneralData()
      await fetchTicketsData()
    }
    init()

    const slowInterval = setInterval(() => fetchAndLog(fetchGeneralData, 'general data'), GENERAL_DATA_TIME)
    const fastInterval = setInterval(() => fetchAndLog(fetchTicketsData, 'tickets data'), TICKETS_DATA_TIME)

    return () => {
      clearInterval(slowInterval)
      clearInterval(fastInterval)
    }
  }, [])

  return (
    <></>
  )
}
