// ==> 2024-10-02
// Builtin modules
import { useState, useEffect, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { useTheme, Surface, Text, IconButton } from 'react-native-paper'
import * as Location from 'expo-location'
import { useTranslation } from 'react-i18next'

// Custom modules
import { calcularDistancia, pointInCompanySector } from '../../../../globals/components/getLocation'
import { gql, useLazyQuery } from '@apollo/client'
import AsyncStorage from '@react-native-async-storage/async-storage'

const allMyOpenTicketsSectorQ = gql`
query AllMyOpenTicketsSector {
  allMyOpenTicketsSector {
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

const allOpenTicketsNewFromSectorQ = gql`
query AllOpenTicketsNewFromSector($companySectorDescription: String!) {
  allOpenTicketsNewFromSector(companySectorDescription: $companySectorDescription) {
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
    idChatIA
  }
}
`

const timeInterval = 1 * 20 // Query every 30 seconds
const MIN_EVAL_DISTANCE = 10 // distancia en metros

const Position = (args) => {
  const { t } = useTranslation('position')
  const { positionValues, setSectorEvent, altMsg = null } = args
  const [time, setTime] = useState(new Date())
  const [minutes, setMinutes] = useState(0)
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [sector, setSector] = useState('')
  const [isInSector, setIsInSector] = useState(false)
  const [msg, setMsg] = useState('')
  const notificated = useRef()
  const [auxTimeInterval, setAuxTimeInterval] = useState(timeInterval)

  const [allMyOpenTicketsSector] = useLazyQuery(allMyOpenTicketsSectorQ, { fetchPolicy: 'cache-and-network' })
  const [allOpenTicketsNewFromSector] = useLazyQuery(allOpenTicketsNewFromSectorQ, { fetchPolicy: 'cache-and-network' })

  const theme = useTheme()

  const styles = StyleSheet.create({
    surface: {
      height: 160,
      width: 250,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      rowGap: 10,
      backgroundColor: theme.colors.surface,
      borderRadius: 10
    },
    items: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      rowGap: 5
    }
  })

  const calcMinutes = () => {
    const now = new Date()
    const diffMs = now - time
    const diffMin = Math.floor(diffMs / 60000)
    return diffMin
  }

  let actualPosition
  useEffect(() => {
    let currentSector = {}
    let lastLocation
    let lastSector
    let verificar = false
    let locationInterval
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg(t('permissionDenied'))
        console.log(errorMsg)
        return
      }
      locationInterval = setInterval(async () => {
        setMsg('Checking your location...') // console.log('entró al interval...')
        const location = await Location.getCurrentPositionAsync({})
        actualPosition = location
        setLocation(location)
        lastLocation = JSON.parse(await AsyncStorage.getItem('lastLocation'))
        lastSector = JSON.parse(await AsyncStorage.getItem('lastSector'))
        if (lastLocation && lastSector) {
          setMsg('Comparing current & previous location')
          const distancia = calcularDistancia(
            lastLocation?.coords?.latitude,
            lastLocation?.coords?.longitude,
            actualPosition?.coords?.latitude,
            actualPosition?.coords?.longitude) * 1000
          if (distancia <= MIN_EVAL_DISTANCE) {
            setSector(lastSector?.companySectorDescription)
            setIsInSector(true)
            setMsg('Still in the same sector')
            if (notificated.current) {
              verificar = false
            } else {
              verificar = true
              notificated.current = true
            }
            await AsyncStorage.setItem('lastLocation', JSON.stringify(location))
          } else {
            setMsg('Checking due to minimum distance exceeded')
            verificar = true
          }
        } else {
          setMsg('Checking due to unknown previous sector/location')
          verificar = true
        }
        if (verificar) {
          // await AsyncStorage.removeItem('lastLocation')
          // await AsyncStorage.removeItem('lastSector')
          currentSector = pointInCompanySector(positionValues.myCompanySectors, actualPosition)
          setSector(currentSector?.companySectorDescription)
          setIsInSector(currentSector?.result)

          // New logic based on comments from line 153:
          // 1) Determine the user's current sector; currentSector.result is false if not in a known company sector
          if (currentSector.result) {
            // 2) User is in a known sector, query open tickets for that sector
            const tempEventSearch = currentSector.companySectorDescription
            setMsg(`You are in ${tempEventSearch}`)
            const { data: sectorData, loading, error } = await allOpenTicketsNewFromSector({
              variables: { companySectorDescription: tempEventSearch }
            })
            // 3) If tickets exist, set the first one as the sector event
            if (!loading && !error && sectorData?.allOpenTicketsNewFromSector?.length > 0) {
              setSectorEvent(sectorData.allOpenTicketsNewFromSector[0])
            } else {
              // 4) No tickets in current sector, query tickets in the user's assigned sector
              setMsg('Checking open events in your sector')
              const { data: assignedData, loading: assignedLoading, error: assignedError } = await allMyOpenTicketsSector()
              // 5) If tickets exist in assigned sector, set the first one
              if (!assignedLoading && !assignedError && assignedData?.allMyOpenTicketsSector?.length > 0) {
                setSectorEvent(assignedData.allMyOpenTicketsSector[0])
              } else {
                // 6) No tickets found anywhere, clear sector event
                setSectorEvent('')
                // Note: The comment mentions displaying "Greetings, you have no insecurity alarms in your area"
                // and disabling a "Learn More" button, but no such UI exists in this component yet.
                // You could add: <Text>{t('noInsecurityAlarms')}</Text> if desired.
              }
            }
          } else {
            // 4) User not in a known sector, query tickets in the user's assigned sector
            setMsg('Checking open events in your sector')
            const { data: assignedData, loading: assignedLoading, error: assignedError } = await allMyOpenTicketsSector()
            // 5) If tickets exist in assigned sector, set the first one
            if (!assignedLoading && !assignedError && assignedData?.allMyOpenTicketsSector?.length > 0) {
              setSectorEvent(assignedData.allMyOpenTicketsSector[0])
            } else {
              // 6) No tickets found, clear sector event
              setSectorEvent('')
              // Optional: Add UI message as noted above
            }
          }
        }

        setMinutes(calcMinutes())
      }, auxTimeInterval * 1000) // Corrected to milliseconds (10 minutes = 600,000 ms)
    })()
    // Cleanup interval on unmount
    console.log('location', location) // console a borrar
    return () => clearInterval(locationInterval)
  }, [actualPosition])
  useEffect(() => {
    if (altMsg) {
      setMsg(altMsg)
    }
  }, [altMsg])
  return (
    <View>
      <Surface style={styles.surface} elevation={2}>
        <View style={styles.items}>
          <Text variant='bodyLarge' style={{ textAlign: 'center' }}>
            {t('currentSector')}
          </Text>
          <Text variant='bodyLarge' style={{ textAlign: 'center' }}>
            {sector
              ? (
                <Text style={{ fontWeight: 'bold' }}>&ldquo;{sector}&ldquo;</Text>
                )
              : (
                <Text>
                  {isInSector ? t('unknown') : t('searching')}
                </Text>
                )}
          </Text>
          <IconButton
            iconColor='green'
            mode='default'
            icon='refresh'
            size={22}
            onPress={() => {
              setMinutes(0)
              setAuxTimeInterval(auxTimeInterval === 6 ? timeInterval : 6)
              setSector('')
              setIsInSector(!isInSector)
              setTime(new Date())
            }}
          />
          <>
            <Text variant='labelSmall' style={{ fontStyle: 'italic', fontWeight: 300 }}>
              {t('refreshedMinutesAgo', { minutes })}
            </Text>
            <Text variant='labelSmall' style={{ fontStyle: 'italic', fontWeight: 300 }}>
              {`${msg?.length > 35 ? msg?.slice(0, 35) + '...' : msg} ✍️`}
            </Text>
          </>
        </View>
      </Surface>
    </View>
  )
}

export default Position
