// // Builtin modules
// import { useState, useEffect } from 'react'
// import { View, Text, Button } from 'react-native'

// // Custom modules
// import { requestAudioPermission } from '../getAndroidPermissions'

// const ChatGPTWithAudioJSON = ({ defaultValues }) => {
//   const preValues = JSON.parse(defaultValues)

//   const [isRecording, setIsRecording] = useState(false)
//   const [error, setError] = useState('')
//   const [result, setResult] = useState('')

//   const [responseJSON, setResponseJSON] = useState(null)
//   const [audioPermission, setAudioPermission] = useState(false)

//   // my variables for IA module
//   const lOfCS = '"' + preValues.myCompanySectors.map(el => el.companySectorDescription).join('", "') + '"' // myCompanySectors
//   const lOfQR = '"' + preValues.allRiskQualifications.map(el => el.riskQualificationDescription).join('", "') + '"' // allRiskQualifications
//   const lOfSS = '"' + preValues.allSolutionsStates.map(el => el.solutionStateDescription).join('", "') + '"' // allSolutionsStates
//   const lOfTNClass = '"' + preValues.allTicketNewClassification.map(el => el.idClassification + ' - ' + el.classification).join('", "') + '"' // allTicketNewClassification
//   const lOfNSType = '"' + preValues.allTicketNewSubType.map(el => el.subTypeDescription).join('", "') + '"' // allTicketNewSubType

//   let IAJSONResponse = {}

//   console.log('hassPermission =', hassPermission)
//   const hassPermission = audioPermission
//   const startRecording = async () => {
//     try {
//       setIsRecording(true)
//       if (hassPermission) {
//         let lala
//         await Voice.start('en-US', lala)
//       }
//     } catch (err) {
//       setError(err)
//       setIsRecording(false)
//       console.log('Error starting voice recognition:', err.message)
//     }
//   }

//   // const onSpeechStart = (event) => {
//   //   console.log('Recording started...', event)
//   // }
//   // const onSpeechEnd = () => {}
//   // const onSpeechResults = () => {}

//   const stopRecording = async () => {
//     console.log('...parando')
//     try {
//       // en este punto hay que llamar a la mutación de
//       const voiceResults = await Voice.stop()
//       const userQuery = voiceResults.value[0]
//       const formatedQuery = buildQuery(userQuery, lOfCS, lOfQR, lOfSS, lOfTNClass, lOfNSType)
//       const chatGPTResponse = await chatGPT(formatedQuery)
//       // En esta parte hay que recorrer preValues y llamar un campo a la vez a getInfoFromResponse
//       IAJSONResponse = {
//         companySectorDescription: getInfoFromResponse(chatGPTResponse, 'Sector de la Empresa'),
//         type: getInfoFromResponse(chatGPTResponse, 'Tipo de Evento'),
//         dateTimeEvent: getInfoFromResponse(chatGPTResponse, 'Fecha y hora del evento'),
//         ticketCustomDescription: getInfoFromResponse(chatGPTResponse, 'Descripción del evento'),
//         subTypeDescription: getInfoFromResponse(chatGPTResponse, 'Sub tipo'),
//         solutionStateDescription: getInfoFromResponse(chatGPTResponse, 'Estado de la Solución'),
//         eventClassification: getInfoFromResponse(chatGPTResponse, 'Clasificación de evento')
//       }
//       //
//       setResponseJSON(chatGPTResponse)
//       setIsRecording(false)
//     } catch (error) {
//       console.log('Error stopping voice recognition:', error.message)
//     }
//   }

//   // console.log('choices4AI\n', choices4AI)

//   useEffect(() => {
//     (async () => {
//       const audioStatus = await requestAudioPermission() // ImagePicker.requestMediaLibraryPermissionsAsync()
//       setAudioPermission(audioStatus)
//     })()
//     // Voice.onSpeechStart = onSpeechStart
//     // Voice.onSpeechEnd = onSpeechEnd
//     // Voice.onSpeechResults = onSpeechResults
//     // Voice.onSpeechError = (error) => console.log('onSpeechError:', error)

//     return () => {
//       // Voice.destroy().then(Voice.removeAllListeners)
//     }
//   }, [])

//   return (

//     <View>
//       <Text>{responseJSON ? JSON.stringify(responseJSON, null, 2) : 'No response yet'}</Text>
//       <Button
//         title={isRecording ? 'Stop Recording' : 'Start Recording'}
//         onPress={() => {
//           isRecording ? stopRecording() : startRecording()
//         }}
//       />
//       {/* guarda con el press y el long press */}
//     </View>
//   )
// }

// const getInfoFromResponse = (response, field) => {
//   const matches = response.match(new RegExp(field + ':\\s?(.*)'))
//   if (matches.length > 0) {
//     return matches[1]
//   }
//   return null
// }

// const buildQuery = (query, lOfCS, lOfQR, lOfSS, lOfTNClass, lOfNSType) => `
// Dado el siguiente evento: "${query}", completa la siguiente información. Cuando un dato no aparezca simplemente coloca "-".
// El tema es sobre inseguridad en empresas.
// En el caso de "Tipo de evento", puede tener 2 resultados posibles. "Action", "Condition". Action es cuando una persona comete un acto inseguro para su persona, para otras personas,
// o para la propia empresa. Condition es cuando existe infraestructura propia de la empresa que no es apta para el trabajo o está deteriorada o con falta de mantenimiento.
// Si existe solapamiento de criterios respecto de "Tipo de evento", seleccionar "Condition".
// "Sector de la empresa" es el sector de la empresa que es afectado por el evento de inseguridad. Este valor deberá ser uno de los siguientes posibles ${lOfCS}.
// "Calificación de riesgo" es la medición del nivel de riesgo asociado al evento y puede tener uno de los siguientes valores posibles ${lOfQR}.
// "Sub tipo" hace referencia al tipo de infraestructura o actividad que es causante del evento, sus valores solo pueden ser uno de los siguientes posibles ${lOfNSType}.
// "Estado de solución" hace referencia al estado de la solución al problema que se indica en la descripción del evento, sus valores solo puede ser uno de los siguientes ${lOfSS}.
// "Clasificación de evento" hace referencia un sistema de clasificación de los riesgos y puede estar relacionado tanto a cuestiones de actitud como de infraestructura. Sus valores solo pueden ser uno de los siguientes posibles ${lOfTNClass}

// El formato de fechas es YYYY/MM/DD hh:mm

// type: <Tipo de evento>
// companySectorDescription: <Sector de la empresa>
// dateTimeEvent: <Fecha y hora del evento>
// ticketCustomDescription: <Descripción del evento>
// riskQualificationDescription: <Calificación de riesgo>
// solutionStateDescription: <Estado de la solución>
// eventClassification: <Clasificación de evento>

// `

// export default ChatGPTWithAudioJSON
