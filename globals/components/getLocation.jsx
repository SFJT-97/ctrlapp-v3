// ==> 2024-10-02
import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import * as Location from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * This function evaluete the distance between users location and some evalPoint
 * @param {*} evalPoint This point must be object type with this 2 parameters inside {latitude: xx, longitude: yy}.\n
 * Could be the coords sub object included in one "location" object. evaluatedLocation.coords
 * @returns The distance this 2 evaluated points in km
 */
export const DistanceFromMe = (evalPoint, justDistance = false) => {
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  console.log('lala\n', evalPoint)
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        return
      }
      console.log('evalPoint', evalPoint)
      const location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    })()
  }, [])

  // ! Si se pudre todo, pasarlo al useState y useEffect debajo de los IF
  if (!evalPoint) return 'error in evalPoint, this parameter must be included'
  if (evalPoint?.latitude === undefined || evalPoint?.longitude === undefined) {
    return 'error, evalPoint must be object type with this 2 parameters inside {latitude: xx, longitude: yy}'
  }

  let content
  let distancia
  if (errorMsg) {
    content = <Text>{errorMsg}</Text>
  } else if (location) {
    distancia = calcularDistancia(location.coords.latitude, location.coords.longitude, evalPoint.latitude, evalPoint.longitude)
    content = <Text>Distancia desde tu ubicación actual: {distancia.toFixed(2)} km</Text>
  } else {
    content = <Text>Obteniendo ubicación...</Text>
  }

  if (justDistance) {
    return Number(distancia)
  } else {
    return (
      <View>
        {content}
      </View>
    )
  }
}

// Función para calcular la distancia entre dos puntos georeferenciados
export function calcularDistancia (lat1, lon1, lat2, lon2) {
  const radioTierra = 6371 // Radio medio de la Tierra en kilómetros
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distancia = radioTierra * c // Distancia en kilómetros
  return distancia
}

// Función auxiliar para convertir grados a radianes
function toRad (grados) {
  return grados * (Math.PI / 180)
}

/**
 * This fuction returns the current gps position of the device logged, if timeInterval === 0, the query will be executed only once, otherwise
 * it will activate one timmer with the time interval indicated in SECONDS.
 * @param {*} timeInterval It is the time interval of the timmer in SECONDS. By default is equal to zero and indicates this function will be executed only once.
 * @returns the current gps position
 */
export const GetLocation = (timeInterval = 0) => {
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        return
      }
      if (timeInterval === 0) {
        const location = await Location.getCurrentPositionAsync({})
        setLocation(location)
      } else {
        const locationInterval = setInterval(async () => {
          const location = await Location.getCurrentPositionAsync({})
          setLocation(location)
        }, timeInterval * 1000)
        return () => clearInterval(locationInterval)
      }
      setLocation(location)
    })()
  }, [])

  let result
  if (errorMsg) {
    result = errorMsg
  } else if (location) {
    result = location // returns the location object, including speed, coordinates and high
    // console.log('result', result)
  }

  return result
}

// Función para determinar si un punto está dentro de un polígono utilizando Ray Casting
/**
 * This function determines wheter or not the evaluated point (punto) is inside the polygon (poligono)
 * @param {*} punto Is the point the user is looking for. By default is the user location.
 * @param {*} poligono This is the borderline of the polygon under evaluation. And, must be an array of object types with longitude and latitude properties inside
 * @returns True if the evaluated point is inside the polygon or false if it is not
 */
export function puntoEnPoligono (poligono, punto) {
  // console.log('poligono =', poligono)
  // console.log('punto =', punto)
  let point
  if (!poligono) return 'error, "poligono" must be included'
  if (punto !== undefined) {
    if (punto.latitude === undefined || punto.longitude === undefined) return 'error punto must be object type with latitude and longitude properties inside'
    point = punto
  } else {
    try {
      point = GetLocation()?.coords
    } catch (error) {
      return false
    }
  }

  let dentro = false
  const latitudPunto = point.latitude
  const longitudPunto = point.longitude

  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const latitud1 = poligono[i].latitude
    const longitud1 = poligono[i].longitude
    const latitud2 = poligono[j].latitude
    const longitud2 = poligono[j].longitude

    // Verifica si el punto está en el lado izquierdo de la línea
    if (
      (longitud1 < longitudPunto && longitud2 >= longitudPunto) ||
      (longitud2 < longitudPunto && longitud1 >= longitudPunto)
    ) {
      // Verifica si el punto está arriba o abajo de la línea
      if (latitud1 + (longitudPunto - longitud1) / (longitud2 - longitud1) * (latitud2 - latitud1) < latitudPunto) {
        dentro = !dentro
      }
    }
  }
  return dentro
}

export function pointInPolygonXY (point, polygon) {
  let inside = false
  const x = point.x
  const y = point.y

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersect = ((yi > y) !== (yj > y)) &&
                      (x < (xj - xi) * (y - yi) / (yj - yi + 1e-10) + xi)
    if (intersect) inside = !inside
  }

  return inside
}

// export const pointInCompanySector = (myCompanySectors, location, setValue, setCompanySector, setLocating) => {
//   // Definimos las variables básicas para el algorítmo
//   if (!myCompanySectors) return
//   const totalSectors = myCompanySectors.length
//   // console.log('----------------------------------------------------')
//   // console.log('myCompanySectors\n', myCompanySectors)
//   // console.log('totalSectors ==> ', totalSectors)
//   // console.log('----------------------------------------------------')
//   const sectorsLocations = []
//   let companySectorDescription = ''
//   let result = { result: false, companySectorDescription }
//   // console.log('location ==> ', location)
//   if (location !== undefined) {
//     // console.log('location inside ==> ', location)
//     /*
//       Considerar que esto funciona cuando se guardaron las coordenadas del poligono que forma el sector según las siguientes consideraciones:
//       1)_ Que pLine X, Y o Z estén guardados en coordenadas en metros, este algoritmo los convierte a grados con la función metersToDegrees
//       2)_ Que la forma del polígono tenga como máximo 12 vértices
//       3)_ Que la forma del polígono no sea demasiado irregular, en esos casos puede fallar.
//                     _______
//                     \
//                      \ *
//               ________\

//       En este ejemplo * puede ser considerado dentro de la zona. Esto además de la consideración de la presición del GPS, la cual no es muy buena.

//       Ahora extraigo todas las coordenadas válidas del arreglo myCompanySectors */
//     try {
//       for (let i = 0; i < totalSectors; i++) {
//         for (let j = 0; j < 12; j++) {
//           if (myCompanySectors[i][`pLine${j}X`] !== null && myCompanySectors[i][`pLine${j}X`] !== '' && myCompanySectors[i][`pLine${j}X`] !== '0' && myCompanySectors[i][`pLine${j}X`] !== undefined &&
//               myCompanySectors[i][`pLine${j}Y`] !== null && myCompanySectors[i][`pLine${j}Y`] !== '' && myCompanySectors[i][`pLine${j}Y`] !== '0' && myCompanySectors[i][`pLine${j}Y`] !== undefined &&
//               myCompanySectors[i][`pLine${j}Z`] !== null && myCompanySectors[i][`pLine${j}Z`] !== '' && myCompanySectors[i][`pLine${j}Z`] !== '0' && myCompanySectors[i][`pLine${j}Z`] !== undefined) {
//             sectorsLocations.push(
//               {
//                 longitude: metersToDegrees(myCompanySectors[i][`pLine${j}X`], myCompanySectors[i][`pLine${j}Y`]).longitude,
//                 latitude: metersToDegrees(myCompanySectors[i][`pLine${j}X`], myCompanySectors[i][`pLine${j}Y`]).latitude,
//                 altitude: myCompanySectors[i][`pLine${j}Z`],
//                 idCompanySector: myCompanySectors[i].idCompanySector,
//                 companySectorDescription: myCompanySectors[i].companySectorDescription
//               }
//             )
//           }
//         }
//         // En este punto debo revisar si el punto está dentro del polígono. Si es true, entonces abandono el for y le asigno al usuario el sector encontrado
//         // console.log('sectorsLocations ===>> ', sectorsLocations)
//         // console.log('por entrar...')
//         if (puntoEnPoligono(sectorsLocations, location.coords)) {
//           // console.log('===========checkeando===============')
//           companySectorDescription = myCompanySectors[i].companySectorDescription
//           // console.log(myCompanySectors[i])
//           if (setValue) setValue(companySectorDescription)
//           if (setCompanySector) setCompanySector(companySectorDescription)
//           if (setLocating) setLocating(false)
//           result = { result: true, companySectorDescription }
//           break
//         }
//         if (companySectorDescription !== '') break
//       }
//     } catch (error) {
//       console.log(error)
//     }
//     if (setLocating) setLocating(false)
//   }
//   return result
// }

export const pointInCompanySector = (myCompanySectors, location, setValue, setCompanySector, setLocating) => {
  if (!myCompanySectors) return
  const totalSectors = myCompanySectors.length
  let companySectorDescription = ''
  let result = { result: false, companySectorDescription }
  const sectorsLocations = []

  if (location !== undefined) {
    const { X, Y } = DegreesToMeters(location.coords.longitude, location.coords.latitude) // Convertís SOLO el punto GPS
    const point = { x: X, y: Y }

    try {
      for (let i = 0; i < totalSectors; i++) {
        const polygon = []

        for (let j = 0; j < 12; j++) {
          const x = myCompanySectors[i][`pLine${j}X`]
          const y = myCompanySectors[i][`pLine${j}Y`]
          const z = myCompanySectors[i][`pLine${j}Z`]

          if (x && y && x !== '0' && y !== '0') {
            const xFloat = parseFloat(x)
            const yFloat = parseFloat(y)

            polygon.push({ x: xFloat, y: yFloat })

            const { longitude, latitude } = metersToDegrees(xFloat, yFloat)

            sectorsLocations.push({
              longitude,
              latitude,
              altitude: z,
              idCompanySector: myCompanySectors[i].idCompanySector,
              companySectorDescription: myCompanySectors[i].companySectorDescription
            })
          }
        }

        const fetchAsyncItems = async (item, value) => {
          await AsyncStorage.setItem(item, JSON.stringify(value))
        }

        if (pointInPolygonXY(point, polygon)) {
          companySectorDescription = myCompanySectors[i].companySectorDescription
          if (setValue) setValue(companySectorDescription)
          if (setCompanySector) setCompanySector(companySectorDescription)
          if (setLocating) setLocating(false)
          result = { result: true, companySectorDescription, sectorsLocations }
          fetchAsyncItems('lastSector', myCompanySectors[i])
          fetchAsyncItems('lastLocation', location)
          break
        }
      }
    } catch (error) {
      console.log(error)
    }

    if (setLocating) setLocating(false)
  }

  return result
}

const metersToDegrees = (X, Y) => {
  const latitude = Y / 111320
  const longitude = X / (111320 * Math.cos(latitude * Math.PI / 180))
  const coordsInDegrees = {
    latitude,
    longitude
  }
  return (coordsInDegrees)
}

const DegreesToMeters = (longitude, latitude) => {
  const EARTH_RADIUS_METERS = 6378137 // Radio de la Tierra en metros
  const Y = latitude * 111320
  const X = longitude * (Math.PI / 180) * EARTH_RADIUS_METERS * Math.cos(latitude * Math.PI / 180)
  const coordsInMeters = {
    X,
    Y
  }
  return coordsInMeters
}

// ** FUNCION PARA DETERMINAR EN VIVO LA UBICACIÓN DEL USUARIO A MEDIDA QUE SE DESPLAZA

export function GetOnlineLocation () {
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        console.log('Error message:\n', errorMsg)
        return
      }

      const locationSubscription = Location.watchPositionAsync({}, newLocation => {
        setLocation(newLocation)
      })

      return () => {
        if (locationSubscription) {
          locationSubscription.remove()
        }
      }
    })()
  }, [])

  if (location) {
    const result = {
      X: DegreesToMeters(location.coords.latitude, location.coords.longitude).X,
      Y: DegreesToMeters(location.coords.latitude, location.coords.longitude).Y,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude
    }
    return result
  } else {
    return null
  }
}
