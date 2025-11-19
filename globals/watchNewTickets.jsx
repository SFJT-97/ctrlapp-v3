// Builtin modules
import { useEffect, useRef } from 'react'
import { gql, useMutation, useLazyQuery } from '@apollo/client'
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Custom modules
import uploadFile from './uploadFile'
import { useAsyncStorage } from '../context/hooks/ticketNewQH'
import { useRouter } from 'expo-router'
import { getPendingTickets } from './utils/offlineTicketUtils'
import { notifyReportUploaded, notifyVoiceEventReady } from './utils/notificationUtils'

// Global variables
import { API_URL } from './variables/globalVariables'

// useMutation variables
const addNewTicketNewM = gql`
mutation AddNewTicketNew($idUser: ID!, $type: String!, $companyName: String!, $companyBusinessUnitDescription: String!, $companySectorDescription: String!, $dateTimeEvent: String!, $classification: String!, $classificationDescription: String!, $subType: String!, $riskQualification: String!, $ticketCustomDescription: String!, $ticketImage1: String, $ticketImage2: String, $ticketImage3: String, $ticketImage4: String, $ticketVideo: String, $ticketSolved: Boolean!, $ticketLike: Int!, $injuredPeople: Int!, $lostProduction: Int!, $lostProductionTotalTimeDuration: Int!, $ticketClosed: Boolean!, $solutionType: String, $costAsociated: Int) {
  addNewTicketNew(idUser: $idUser, type: $type, companyName: $companyName, companyBusinessUnitDescription: $companyBusinessUnitDescription, companySectorDescription: $companySectorDescription, dateTimeEvent: $dateTimeEvent, classification: $classification, classificationDescription: $classificationDescription, subType: $subType, riskQualification: $riskQualification, ticketCustomDescription: $ticketCustomDescription, ticketImage1: $ticketImage1, ticketImage2: $ticketImage2, ticketImage3: $ticketImage3, ticketImage4: $ticketImage4, ticketVideo: $ticketVideo, ticketSolved: $ticketSolved, ticketLike: $ticketLike, injuredPeople: $injuredPeople, lostProduction: $lostProduction, lostProductionTotalTimeDuration: $lostProductionTotalTimeDuration, ticketClosed: $ticketClosed, solutionType: $solutionType, costAsociated: $costAsociated) {
    idTicketNew
    idUser
    type
    companyName
    companyBusinessUnitDescription
    companySectorDescription
    dateTimeEvent
    classification
    classificationDescription
    subType
    riskQualification
    ticketCustomDescription
    ticketImage1
    ticketImage2
    ticketImage3
    ticketImage4
    ticketVideo
    ticketSolved
    ticketLike
    injuredPeople
    lostProduction
    lostProductionTotalTimeDuration
    dateTimeEventResolved
    ticketClosed
    solutionType
    costAsociated
    ticketExtraFile
  }
}

`

const multipleUploadS3M = gql`
mutation MultipleUploadS3($files: [Upload]) {
  multipleUploadS3(files: $files) {
    filename
    mimetype
    encoding
    success
    message
    location
    url
  }
}

`

const getFileURLQ = gql`
query GetFile($filename: String!) {
  getFile(filename: $filename) {
    url
  }
}

`

const AnswerGPTQ = gql`
query Query($query: String!) {
  AnswerGPT(query: $query)
}

`

const POLLING_INTERVAL = 1000 * 60 * 5 // Smart polling: every 5 minutes (only when tickets exist)

const executeMultipleMutation = async (newFiles, MultipleUploadS3) => {
  // console.log('newFiles\n', newFiles)
  try {
    const result = await MultipleUploadS3({
      variables: { files: newFiles },
      awaitRefetchQueries: true,
      refetchQueries: true
    })
    const data = result?.data?.multipleUploadS3
    // console.log('result', data)
    return data
  } catch (error) {
    console.error('Error executing MultipleUploadS3:', error)
    return null // O manejar el error de otra forma según sea necesario
  }
}

export const WatchNewTickets = () => {
  const router = useRouter()
  // // Llamo a los useMutation
  const [addNewTicketNew] = useMutation(addNewTicketNewM, { fetchedPolicy: 'network-only' })
  const [MultipleUploadS3] = useMutation(multipleUploadS3M, { fetchedPolicy: 'network-only' })
  // Llamado a los useLazyQueries
  const [AnswerGPT] = useLazyQuery(AnswerGPTQ, { fetchPolicy: 'network-only' })
  const [getSignedImageURL] = useLazyQuery(getFileURLQ, { fetchPolicy: 'network-only' })
  const { value: generalData, loading, error: generalError } = useAsyncStorage('CTRLA_GENERAL_DATA')

  const gData = useRef()

  function sanitizeFiles (files) {
    if (Array.isArray(files) && files?.length === 1 && files[0] === null) {
      return [] // o return [] si preferís eliminar el valor
    }
    return files.map(f => f === null ? '' : f)
  }

  const isImage = (filePath) => {
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filePath)
  }

  // Migrate legacy keys to new format
  const migrateLegacyKeys = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys()
      const legacyKeys = allKeys.filter(key => key.startsWith('PendingTickets-') && key !== 'PendingTickets')
      
      if (legacyKeys.length === 0) return

      // Get current pending tickets
      const currentTickets = await getPendingTickets()
      
      // Migrate all legacy tickets
      for (const legacyKey of legacyKeys) {
        try {
          const legacyTickets = JSON.parse(await AsyncStorage.getItem(legacyKey) || '[]')
          if (Array.isArray(legacyTickets) && legacyTickets.length > 0) {
            currentTickets.push(...legacyTickets)
          }
          // Remove legacy key after migration
          await AsyncStorage.removeItem(legacyKey)
        } catch (error) {
          console.error(`Error migrating key ${legacyKey}:`, error)
        }
      }
      
      // Save all tickets to new format
      if (currentTickets.length > 0) {
        await AsyncStorage.setItem('PendingTickets', JSON.stringify(currentTickets))
      }
    } catch (error) {
      console.error('Error migrating legacy keys:', error)
    }
  }

  const fetchNewTickets = async () => {
    try {
      const state = await NetInfo.fetch()
      // console.log('generalData\n', generalData)
      if (state.isConnected && state.isInternetReachable && generalData) {
        // Migrate legacy keys first
        await migrateLegacyKeys()
        
        // Get all pending tickets (new format)
        const pendingTickets = await getPendingTickets()
        
        let tempTicketData
        // En esta parte habría que agregarle algo que verifique si "waiting_ticket_offLine === true" y ya pasó mucho tiempo que no se resuelve...
        let isTicketOfflineOpened = JSON.parse(await AsyncStorage.getItem('waiting_ticket_offLine') || 'false')
        if (!isTicketOfflineOpened) isTicketOfflineOpened = false
        
        if (pendingTickets?.length > 0 && !isTicketOfflineOpened) {
          // Process tickets in reverse order to avoid index shifting when removing
          const indicesToRemove = []
          for (let i = pendingTickets.length - 1; i >= 0; i--) {
            const ticket = pendingTickets[i]
            // En este punto, cada "i" será un ticket cargado y sin subir.
            let mMedia = []
            
            // Check if ticket offline screen is opened
            isTicketOfflineOpened = JSON.parse(await AsyncStorage.getItem('waiting_ticket_offLine') || 'false')
            if (!isTicketOfflineOpened) {
                // ticket.data tiene la info del nuevo ticketNew que hay que subir y ticket.files tiene la info de los archivos multimedia de ese ticket
                tempTicketData = ticket?.data
                const tempFiles = sanitizeFiles(ticket?.files)
                if (tempFiles?.length > 0) {
                  // Acá se está adentro del arreglo de ticket.files
                  try {
                    for (let j = 0; j < tempFiles?.length; j++) {
                      const tempMedia = {
                        name: tempFiles[j]?.name.toString().split('/').pop(),
                        type: tempFiles[j]?.mimeType,
                        uri: tempFiles[j]?.uri
                      }
                      if (!ticket.fromVoiceOffLine) {
                        mMedia.push(uploadFile(tempMedia, isImage(tempMedia?.uri)))
                      } else {
                        mMedia.push(tempMedia)
                      }
                    }
                    if (!ticket.fromVoiceOffLine) mMedia = await executeMultipleMutation(mMedia, MultipleUploadS3) // mMedia será un arreglo "asíncrono" con toda la info de los archivos subidos
                  } catch (error) {
                    console.log('error\n', error)
                    mMedia = []
                  }
                  // Ahora se extrae de los nombres las ubicaciónes (location) en el bucket de AWS S3
                  let locationImage1 = ''
                  let locationImage2 = ''
                  let locationImage3 = ''
                  let locationImage4 = `${API_URL}uploads/ctrla-icon.png`
                  let locationVideo = ''
                  if (mMedia !== undefined && !ticket.fromVoiceOffLine) {
                    for (let i = 0; i < mMedia?.length; i++) {
                      if (mMedia[i]?.mimetype?.toString().includes('image')) {
                        switch (i) {
                          case 0:
                            locationImage1 = mMedia[i]?.location
                            try {
                              const tempImg = await getSignedImageURL({ variables: { filename: locationImage1?.split('/').pop() } })
                              if (tempImg?.data?.getFile?.url) {
                                locationImage4 = tempImg?.data?.getFile?.url
                                if (locationImage4 === undefined) locationImage4 = `${API_URL}uploads/ctrla-icon.png`
                              }
                            } catch (error) {
                              locationImage4 = `${API_URL}uploads/ctrla-icon.png`
                              console.log('error getting ImageVideoURL', error)
                            }
                            break
                          case 1:
                            locationImage2 = mMedia[i]?.location; break
                          case 2:
                            locationImage3 = mMedia[i]?.location; break
                        }
                      } else {
                        locationVideo = mMedia[i]?.location
                      }
                    }
                  }
                  if (ticket.fromVoiceOffLine) {
                    let tempExt = ''
                    let tempIsImg = true
                    for (let i = 0; i < mMedia?.length; i++) {
                      tempExt = mMedia[i]?.uri?.split('/').pop().split('.').pop()
                      tempIsImg = isImage(mMedia[i]?.uri)
                      mMedia[i].type = tempIsImg ? 'image/' + tempExt : 'video/' + tempExt
                      if (tempIsImg) {
                        switch (i) {
                          case 0:
                            locationImage1 = mMedia[i]; break
                          case 1:
                            locationImage2 = mMedia[i]; break
                          case 2:
                            locationImage3 = mMedia[i]; break
                        }
                      } else {
                        locationVideo = mMedia[i]
                      }
                    }
                  }
                  tempTicketData = {
                    ...tempTicketData,
                    ticketImage1: locationImage1,
                    ticketImage2: locationImage2,
                    ticketImage3: locationImage3,
                    ticketImage4: locationImage4,
                    ticketVideo: locationVideo
                  }
                } else {
                  tempTicketData = {
                    ...tempTicketData,
                    ticketImage1: '',
                    ticketImage2: '',
                    ticketImage3: '',
                    ticketImage4: `${API_URL}uploads/ctrla-icon.png`,
                    ticketVideo: ''
                  }
                }
                try {
                  // En esta parte se averigua si el ticket se había subido desde un "new voice offLine event" o desde un "new event"
                  if (!ticket.fromVoiceOffLine) {
                    // new event
                    const result = await addNewTicketNew({ variables: tempTicketData })
                    const ticketId = result?.data?.addNewTicketNew?.idTicketNew
                    const classification = tempTicketData?.classificationDescription
                    
                    // Send notification that report was uploaded
                    await notifyReportUploaded(ticketId, classification)
                    
                    // Mark for removal
                    indicesToRemove.push(i)
                  } else {
                    if (!gData) return // Para evitar que se cargue mal el formulario por si hubo algún error de lectura del asyncStorage
                    // new voice offLine event
                    // 1)_
                    const tTData = tempTicketData
                    const tGData = gData.current
                    const userQuery = tTData?.ticketCustomDescription

                    // 2)_
                    const lOfCS = '"' + tGData?.myCompanySectors?.map(el => el?.companySectorDescription).join('", "') + '"' // myCompanySectors
                    const lOfQR = '"' + tGData?.allRiskQualifications?.map(el => el?.riskQualificationDescription).join('", "') + '"' // allRiskQualifications
                    const lOfSS = '"' + tGData?.allSolutionsStates?.map(el => el?.solutionStateDescription).join('", "') + '"' // allSolutionsStates
                    const lOfTNClass = '"' + tGData?.allTicketNewClassification?.map(el => el?.idClassification + ' - ' + el?.classification).join('", "') + '"' // allTicketNewClassification
                    const lOfNSType = '"' + tGData?.allTicketNewSubType?.map(el => el?.subTypeDescription).join('", "') + '"' // allTicketNewSubType
                    let IAJSONResponse = {}
                    const formatedQuery = buildQuery(userQuery, lOfCS, lOfQR, lOfSS, lOfTNClass, lOfNSType)
                    // 3)_
                    try {
                      const chatGPTResponse = await AnswerGPT({ variables: { query: formatedQuery } }, { fetchPolicy: 'network-only' })
                      const response = await chatGPTResponse?.data?.AnswerGPT
                      IAJSONResponse = JSON.parse(response)

                      const completeData = {
                        ...tGData,
                        ...tTData
                      }
                      // Ya le estoy pasando la info de las imagenes en tTData que está dentro de completeData, pasa como "strDefaultValues"
                      const params = {
                        ticketsAcount: JSON.stringify(tGData?.allMyCompanyTicketsNew),
                        name: JSON.stringify(generalData?.me?.firstName),
                        strDefaultValues: JSON.stringify(completeData),

                        // Acá debería ir la info de "imagenes precargadas..."
                        responseJSON: JSON.stringify(IAJSONResponse)
                      }
                      // Acá hay que guardar el `waiting_ticket_offLine` en AsyncStorage con el valor "true"
                      await AsyncStorage.setItem('waiting_ticket_offLine', JSON.stringify(true))
                      
                      // Send notification that AI is ready to process
                      await notifyVoiceEventReady()
                      
                      // Mark for removal
                      indicesToRemove.push(i)
                      
                      // 4)_
                      router.navigate({
                        pathname: '/report/newvoice/upload/[upload]',
                        params
                      })
                    } catch (error) {
                      console.log('error', error)
                      // Keep ticket in queue for retry
                    }
                  }
                  // en este punto se subió el nuevo ticket a mongoDB y es el BE el que selecciona a que usuarios mandar las notitifaciones
                } catch (error) {
                  console.log('Error...', error)
                  // Keep ticket in queue for retry
                }
              }
            }
          
          // Remove successfully processed tickets (after processing all tickets)
          if (indicesToRemove.length > 0) {
            const updatedTickets = await getPendingTickets()
            // Sort indices in descending order to remove from end first
            indicesToRemove.sort((a, b) => b - a)
            for (const index of indicesToRemove) {
              updatedTickets.splice(index, 1)
            }
            await AsyncStorage.setItem('PendingTickets', JSON.stringify(updatedTickets))
          }
        } else {
          console.log('no pending tickets...')
        }
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  const buildQuery = (query, lOfCS, lOfQR, lOfSS, lOfTNClass, lOfNSType) => `
Considera el siguiente evento que es sobre inserguridad en empresas: "${query}".
Cuando un dato no aparezca, simplemente coloca "-".

En el caso de "Tipo de evento", sólo puede tener 2 resultados posibles. "Action", "Condition". "Action" es cuando una persona comete un acto inseguro para su persona, para otras personas,
o para la propia empresa, también está relacionado con las personas que no respetan las reglas de seguridad de la empresa. "Condition" es cuando existe infraestructura propia de la empresa que no es apta para el trabajo o está deteriorada o con falta de mantenimiento.
Si existe solapamiento de criterios respecto de "Tipo de evento", seleccionar "Condition".

"Sector de la empresa" es el sector de la empresa que es afectado por el evento de inseguridad. Este valor deberá ser uno de los siguientes posibles ${lOfCS}.

"Calificación de riesgo" es la medición del nivel de riesgo asociado al evento y puede tener uno de los siguientes valores posibles ${lOfQR}.

"Sub tipo" hace referencia a la intalación  que es causante o que está involucrada en el evento enunciado, también a tareas de las personas llevadas a cabo de forma riesgosa. Sus valores solo pueden ser uno de los siguientes posibles ${lOfNSType}.

"Estado de solución" hace referencia al estado de la solución al problema que se indica en la descripción del evento, sus valores solo puede ser uno de los siguientes ${lOfSS}.

"Clasificación de evento" hace referencia a un sistema de clasificación de los riesgos y puede estar relacionado tanto a cuestiones de actitud como de infraestructura. Sus valores solo pueden ser uno de los siguientes posibles ${lOfTNClass}

"Descripción del evento" será siempre en la lengua original en la que se realizó.

"Clasificación de evento", tener en cuenta que las opciones "ARI - High Risk" o "PEI - INMINENT RISK" solamente deberán ser consideradas en casos extremos de gran riesgo fisico para las personas.

Para la "Fecha y hora del evento", cuando no son proporcionadas en la descripción del evento, asignar la fecha y hora local del dispositivo, al momento de recibir esta consulta.
Respecto de lo que se mencione en el evento, ten como referencia que hoy es ${new Date()}. Por ejemplo, cuando en el evento se dice "ayer" es un dia menos que la fecha que debes considerar como hoy.

Considerar que toda la respuesta debe ser un objeto JSON como sigue:

type: <Tipo de evento>
companySectorDescription: <Sector de la empresa>
subType: <Sub tipo>
dateTimeEvent: <Fecha y hora del evento>
ticketCustomDescription: <Descripción del evento>
riskQualificationDescription: <Calificación de riesgo>
solutionStateDescription: <Estado de la solución>
eventClassification: <Clasificación de evento>
`

  useEffect(() => {
    if (generalData && !loading && !generalError) {
      gData.current = generalData
    }
    console.log('gData\n', gData.current)
  }, [generalData, loading, generalError])

  useEffect(() => {
    // Event-driven: Immediate response when connection restored
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('Connection restored, checking for pending tickets...')
        fetchNewTickets().catch(error => {
          console.error('Error fetching tickets on connection restore:', error)
        })
      }
    })

    // Smart polling fallback: Check every 5 minutes, only when tickets exist
    const checkPendingTickets = async () => {
      try {
        const pendingTickets = await getPendingTickets()
        if (pendingTickets && pendingTickets.length > 0) {
          const state = await NetInfo.fetch()
          if (state.isConnected && state.isInternetReachable) {
            console.log('Smart polling: checking pending tickets...')
            await fetchNewTickets()
          }
        }
      } catch (error) {
        console.error('Error in smart polling:', error)
      }
    }

    const interval = setInterval(checkPendingTickets, POLLING_INTERVAL)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  return (
    <></>
  )
}

// // Builtin modules
// import { useEffect, useRef } from 'react'
// import { gql, useMutation, useLazyQuery } from '@apollo/client'
// import NetInfo from '@react-native-community/netinfo'
// import AsyncStorage from '@react-native-async-storage/async-storage'

// // Custom modules
// import uploadFile from './uploadFile'
// import { useAsyncStorage } from '../context/hooks/ticketNewQH'
// import { useRouter } from 'expo-router'

// // Global variables
// import { API_URL } from './variables/globalVariables'

// // useMutation variables
// const addNewTicketNewM = gql`
// mutation AddNewTicketNew($idUser: ID!, $type: String!, $companyName: String!, $companyBusinessUnitDescription: String!, $companySectorDescription: String!, $dateTimeEvent: String!, $classification: String!, $classificationDescription: String!, $subType: String!, $riskQualification: String!, $ticketCustomDescription: String!, $ticketImage1: String, $ticketImage2: String, $ticketImage3: String, $ticketImage4: String, $ticketVideo: String, $ticketSolved: Boolean!, $ticketLike: Int!, $injuredPeople: Int!, $lostProduction: Int!, $lostProductionTotalTimeDuration: Int!, $ticketClosed: Boolean!, $solutionType: String, $costAsociated: Int) {
//   addNewTicketNew(idUser: $idUser, type: $type, companyName: $companyName, companyBusinessUnitDescription: $companyBusinessUnitDescription, companySectorDescription: $companySectorDescription, dateTimeEvent: $dateTimeEvent, classification: $classification, classificationDescription: $classificationDescription, subType: $subType, riskQualification: $riskQualification, ticketCustomDescription: $ticketCustomDescription, ticketImage1: $ticketImage1, ticketImage2: $ticketImage2, ticketImage3: $ticketImage3, ticketImage4: $ticketImage4, ticketVideo: $ticketVideo, ticketSolved: $ticketSolved, ticketLike: $ticketLike, injuredPeople: $injuredPeople, lostProduction: $lostProduction, lostProductionTotalTimeDuration: $lostProductionTotalTimeDuration, ticketClosed: $ticketClosed, solutionType: $solutionType, costAsociated: $costAsociated) {
//     idTicketNew
//     idUser
//     type
//     companyName
//     companyBusinessUnitDescription
//     companySectorDescription
//     dateTimeEvent
//     classification
//     classificationDescription
//     subType
//     riskQualification
//     ticketCustomDescription
//     ticketImage1
//     ticketImage2
//     ticketImage3
//     ticketImage4
//     ticketVideo
//     ticketSolved
//     ticketLike
//     injuredPeople
//     lostProduction
//     lostProductionTotalTimeDuration
//     dateTimeEventResolved
//     ticketClosed
//     solutionType
//     costAsociated
//     ticketExtraFile
//   }
// }

// `

// const multipleUploadS3M = gql`
// mutation MultipleUploadS3($files: [Upload]) {
//   multipleUploadS3(files: $files) {
//     filename
//     mimetype
//     encoding
//     success
//     message
//     location
//     url
//   }
// }

// `

// const getFileURLQ = gql`
// query GetFile($filename: String!) {
//   getFile(filename: $filename) {
//     url
//   }
// }

// `

// const AnswerGPTQ = gql`
// query Query($query: String!) {
//   AnswerGPT(query: $query)
// }

// `

// const WATCHTICKET_TIME = 1000 * 20 // Buscará si hay nuevos tickets cada 2 minutos

// const executeMultipleMutation = async (newFiles, MultipleUploadS3) => {
//   // console.log('newFiles\n', newFiles)
//   try {
//     const result = await MultipleUploadS3({
//       variables: { files: newFiles },
//       awaitRefetchQueries: true,
//       refetchQueries: true
//     })
//     const data = result?.data?.multipleUploadS3
//     // console.log('result', data)
//     return data
//   } catch (error) {
//     console.error('Error executing MultipleUploadS3:', error)
//     return null // O manejar el error de otra forma según sea necesario
//   }
// }

// export const WatchNewTickets = () => {
//   const router = useRouter()
//   // // Llamo a los useMutation
//   const [addNewTicketNew] = useMutation(addNewTicketNewM, { fetchedPolicy: 'network-only' })
//   const [MultipleUploadS3] = useMutation(multipleUploadS3M, { fetchedPolicy: 'network-only' })
//   // Llamado a los useLazyQueries
//   const [AnswerGPT] = useLazyQuery(AnswerGPTQ, { fetchPolicy: 'network-only' })
//   const [getSignedImageURL] = useLazyQuery(getFileURLQ, { fetchPolicy: 'network-only' })
//   const { value: generalData, loading, error: generalError } = useAsyncStorage('CTRLA_GENERAL_DATA')

//   const gData = useRef()

//   function sanitizeFiles (files) {
//     if (Array.isArray(files) && files?.length === 1 && files[0] === null) {
//       return [] // o return [] si preferís eliminar el valor
//     }
//     return files.map(f => f === null ? '' : f)
//   }

//   const isImage = (filePath) => {
//     return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filePath)
//   }

//   const fetchNewTickets = async () => {
//     try {
//       const state = await NetInfo.fetch()
//       // console.log('generalData\n', generalData)
//       if (state.isConnected && generalData) {
//         // console.log('conected')
//         const allKeys = await AsyncStorage.getAllKeys()
//         const pendingKeys = allKeys.filter(key => key.startsWith('PendingTickets-'))
//         let tempTicketData
//         const isTicketOfflineOpened = JSON.parse(await AsyncStorage.getItem('waiting_ticket_offLine' || false))
//         if (pendingKeys?.length > 0 && !isTicketOfflineOpened) {
//           // console.log('pendingKeys.length', pendingKeys.length)
//           for (let i = 0; i < pendingKeys?.length; i++) {
//             // En este punto, cada "i" será un ticket cargado y sin subir.
//             let mMedia = []
//             const tickets = JSON.parse(await AsyncStorage.getItem(pendingKeys[i]))

//             // await AsyncStorage.removeItem(pendingKeys[i])

//             for (const ticket of tickets) {
//               if (isTicketOfflineOpened) return
//               // ticket.data tiene la info del nuevo ticketNew que hay que subir y ticket.files tiene la info de los archivos multimedia de ese ticket
//               tempTicketData = ticket?.data
//               const tempFiles = sanitizeFiles(ticket?.files)
//               if (tempFiles?.length > 0) {
//                 // Acá se está adentro del arreglo de ticket.files
//                 try {
//                   for (let j = 0; j < tempFiles?.length; j++) {
//                     const tempMedia = {
//                       name: tempFiles[j]?.name.toString().split('/').pop(),
//                       type: tempFiles[j]?.mimeType,
//                       uri: tempFiles[j]?.uri
//                     }
//                     if (!ticket.fromVoiceOffLine) {
//                       mMedia.push(uploadFile(tempMedia, isImage(tempMedia?.uri)))
//                     } else {
//                       mMedia.push(tempMedia)
//                     }
//                   }
//                   if (!ticket.fromVoiceOffLine) mMedia = await executeMultipleMutation(mMedia, MultipleUploadS3) // mMedia será un arreglo "asíncrono" con toda la info de los archivos subidos
//                 } catch (error) {
//                   console.log('error\n', error)
//                   mMedia = []
//                 }
//                 // Ahora se extrae de los nombres las ubicaciónes (location) en el bucket de AWS S3
//                 let locationImage1 = ''
//                 let locationImage2 = ''
//                 let locationImage3 = ''
//                 let locationImage4 = `${API_URL}uploads/ctrla-icon.png`
//                 let locationVideo = ''
//                 if (mMedia !== undefined && !ticket.fromVoiceOffLine) {
//                   for (let i = 0; i < mMedia?.length; i++) {
//                     if (mMedia[i]?.mimetype?.toString().includes('image')) {
//                       switch (i) {
//                         case 0:
//                           locationImage1 = mMedia[i]?.location
//                           try {
//                             const tempImg = await getSignedImageURL({ variables: { filename: locationImage1?.split('/').pop() } })
//                             if (tempImg?.data?.getFile?.url) {
//                               locationImage4 = tempImg?.data?.getFile?.url
//                               if (locationImage4 === undefined) locationImage4 = `${API_URL}uploads/ctrla-icon.png`
//                             }
//                           } catch (error) {
//                             locationImage4 = `${API_URL}uploads/ctrla-icon.png`
//                             console.log('error getting ImageVideoURL', error)
//                           }
//                           break
//                         case 1:
//                           locationImage2 = mMedia[i]?.location; break
//                         case 2:
//                           locationImage3 = mMedia[i]?.location; break
//                       }
//                     } else {
//                       locationVideo = mMedia[i]?.location
//                     }
//                   }
//                 }
//                 if (ticket.fromVoiceOffLine) {
//                   let tempExt = ''
//                   let tempIsImg = true
//                   for (let i = 0; i < mMedia?.length; i++) {
//                     if (!mMedia[i].type || mMedia[i].type === null) {
//                       tempExt = mMedia[0].uri.split('/').pop().split('.').pop()
//                       tempIsImg = isImage(mMedia[0].uri)
//                       mMedia[i].type = tempIsImg ? 'image/' : 'video/' + tempExt
//                     }

//                     if (tempIsImg) {
//                       switch (i) {
//                         case 0:
//                           locationImage1 = mMedia[i]; break
//                         case 1:
//                           locationImage2 = mMedia[i]; break
//                         case 2:
//                           locationImage3 = mMedia[i]; break
//                       }
//                     } else {
//                       locationVideo = mMedia[i]
//                     }
//                   }
//                 }
//                 tempTicketData = {
//                   ...tempTicketData,
//                   ticketImage1: locationImage1,
//                   ticketImage2: locationImage2,
//                   ticketImage3: locationImage3,
//                   ticketImage4: locationImage4,
//                   ticketVideo: locationVideo
//                 }
//               } else {
//                 tempTicketData = {
//                   ...tempTicketData,
//                   ticketImage1: '',
//                   ticketImage2: '',
//                   ticketImage3: '',
//                   ticketImage4: `${API_URL}uploads/ctrla-icon.png`,
//                   ticketVideo: ''
//                 }
//               }
//               try {
//                 // En esta parte se averigua si el ticket se había subido desde un "new voice offLine event" o desde un "new event"
//                 if (!ticket.fromVoiceOffLine) {
//                   // new event
//                   await addNewTicketNew({ variables: tempTicketData })
//                 } else {
//                   if (!gData) return // Para evitar que se cargue mal el formulario por si hubo algún error de lectura del asyncStorage
//                   // new voice offLine event
//                   // 1)_
//                   const tTData = tempTicketData
//                   const tGData = gData.current
//                   const userQuery = tTData?.ticketCustomDescription

//                   // 2)_
//                   const lOfCS = '"' + tGData?.myCompanySectors?.map(el => el?.companySectorDescription).join('", "') + '"' // myCompanySectors
//                   const lOfQR = '"' + tGData?.allRiskQualifications?.map(el => el?.riskQualificationDescription).join('", "') + '"' // allRiskQualifications
//                   const lOfSS = '"' + tGData?.allSolutionsStates?.map(el => el?.solutionStateDescription).join('", "') + '"' // allSolutionsStates
//                   const lOfTNClass = '"' + tGData?.allTicketNewClassification?.map(el => el?.idClassification + ' - ' + el?.classification).join('", "') + '"' // allTicketNewClassification
//                   const lOfNSType = '"' + tGData?.allTicketNewSubType?.map(el => el?.subTypeDescription).join('", "') + '"' // allTicketNewSubType
//                   let IAJSONResponse = {}
//                   const formatedQuery = buildQuery(userQuery, lOfCS, lOfQR, lOfSS, lOfTNClass, lOfNSType)
//                   // 3)_
//                   try {
//                     const chatGPTResponse = await AnswerGPT({ variables: { query: formatedQuery } }, { fetchPolicy: 'network-only' })
//                     const response = await chatGPTResponse?.data?.AnswerGPT
//                     IAJSONResponse = JSON.parse(response)

//                     const completeData = {
//                       ...tGData,
//                       ...tTData
//                     }
//                     // Ya le estoy pasando la info de las imagenes en tTData que está dentro de completeData, pasa como "strDefaultValues"
//                     const params = {
//                       ticketsAcount: JSON.stringify(tGData?.allMyCompanyTicketsNew),
//                       name: JSON.stringify(generalData?.me?.firstName),
//                       strDefaultValues: JSON.stringify(completeData),

//                       // Acá debería ir la info de "imagenes precargadas..."
//                       responseJSON: JSON.stringify(IAJSONResponse)
//                     }

//                     // Acá hay que guardar el `waiting_ticket_offLine` en AsyncStorage con el valor "true"
//                     await AsyncStorage.setItem('waiting_ticket_offLine', JSON.stringify(true))
//                     // 4)_
//                     router.navigate({
//                       pathname: '/report/newvoice/upload/[upload]',
//                       params
//                     })
//                   } catch (error) {
//                     console.log('error', error)
//                   }
//                 }
//                 // en este punto se subió el nuevo ticket a mongoDB y es el BE el que selecciona a que usuarios mandar las notitifaciones
//                 await AsyncStorage.removeItem(pendingKeys[i])
//               } catch (error) {
//                 console.log('Error...', error)
//               }
//             }
//           }
//         } else {
//           console.log('no pending tickets...')
//         }
//       }
//     } catch (error) {
//       console.log('error', error)
//     }
//   }

//   const buildQuery = (query, lOfCS, lOfQR, lOfSS, lOfTNClass, lOfNSType) => `
// Considera el siguiente evento que es sobre inserguridad en empresas: "${query}".
// Cuando un dato no aparezca, simplemente coloca "-".

// En el caso de "Tipo de evento", sólo puede tener 2 resultados posibles. "Action", "Condition". "Action" es cuando una persona comete un acto inseguro para su persona, para otras personas,
// o para la propia empresa, también está relacionado con las personas que no respetan las reglas de seguridad de la empresa. "Condition" es cuando existe infraestructura propia de la empresa que no es apta para el trabajo o está deteriorada o con falta de mantenimiento.
// Si existe solapamiento de criterios respecto de "Tipo de evento", seleccionar "Condition".

// "Sector de la empresa" es el sector de la empresa que es afectado por el evento de inseguridad. Este valor deberá ser uno de los siguientes posibles ${lOfCS}.

// "Calificación de riesgo" es la medición del nivel de riesgo asociado al evento y puede tener uno de los siguientes valores posibles ${lOfQR}.

// "Sub tipo" hace referencia a la intalación  que es causante o que está involucrada en el evento enunciado, también a tareas de las personas llevadas a cabo de forma riesgosa. Sus valores solo pueden ser uno de los siguientes posibles ${lOfNSType}.

// "Estado de solución" hace referencia al estado de la solución al problema que se indica en la descripción del evento, sus valores solo puede ser uno de los siguientes ${lOfSS}.

// "Clasificación de evento" hace referencia a un sistema de clasificación de los riesgos y puede estar relacionado tanto a cuestiones de actitud como de infraestructura. Sus valores solo pueden ser uno de los siguientes posibles ${lOfTNClass}

// "Descripción del evento" será siempre en la lengua original en la que se realizó.

// "Clasificación de evento", tener en cuenta que las opciones "ARI - High Risk" o "PEI - INMINENT RISK" solamente deberán ser consideradas en casos extremos de gran riesgo fisico para las personas.

// Para la "Fecha y hora del evento", cuando no son proporcionadas en la descripción del evento, asignar la fecha y hora local del dispositivo, al momento de recibir esta consulta.
// Respecto de lo que se mencione en el evento, ten como referencia que hoy es ${new Date()}. Por ejemplo, cuando en el evento se dice "ayer" es un dia menos que la fecha que debes considerar como hoy.

// Considerar que toda la respuesta debe ser un objeto JSON como sigue:

// type: <Tipo de evento>
// companySectorDescription: <Sector de la empresa>
// subType: <Sub tipo>
// dateTimeEvent: <Fecha y hora del evento>
// ticketCustomDescription: <Descripción del evento>
// riskQualificationDescription: <Calificación de riesgo>
// solutionStateDescription: <Estado de la solución>
// eventClassification: <Clasificación de evento>
// `

//   useEffect(() => {
//     if (generalData && !loading && !generalError) {
//       gData.current = generalData
//     }
//     console.log('gData\n', gData.current)
//   }, [generalData, loading, generalError])

//   useEffect(() => {
//     // Esta función verificará cada "WATCHTICKET_TIME" si se cargaron o no nuevos tickets
//     const interval = setInterval(async () => {
//       console.log('buscando nuevos tickets...\n')
//       await fetchNewTickets()
//     }, WATCHTICKET_TIME)
//     return () => clearInterval(interval) // limpiar al desmontar
//   }, [])

//   return (
//     <></>
//   )
// }

