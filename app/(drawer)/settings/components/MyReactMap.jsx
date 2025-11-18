/*
  Este codigo de abajo es para cargar el leaflet mediante una webview
*/

import { useEffect, useRef, useState } from 'react'
import { WebView } from 'react-native-webview'

// // custom modules
import { GetOnlineLocation } from '../../../../globals/components/getLocation'
import { metersToDegrees } from '../../../../globals/functions/functions'

const MyReactMap = ({ selectedSector }) => {
  const polygonCoordinates = useRef(null)
  const [sectorPoint, setSectorPoint] = useState(null) // initial coordinates to locate the selected sector on the screen
  // const [pointsOnScreen, setPointsOnScreen] = useState(0)
  // console.log('selectedSector\n', selectedSector)
  // 1)_ Saber que en mongo a las coordenadas las guardamos en metros.
  // 2)_ Leaflet usa grados decimales.
  // 3)_ Antes de guardar hay que convertir de grados a metros (usar degressToMeters).
  // 4)_ Después de leer un dato de mongo y antes de usarlo para mostrarlo en leaflet, hay que convertirlo a grados (usar metersToDegrees).

  const location = GetOnlineLocation()

  useEffect(() => {
    if (selectedSector) {
      const coords = metersToDegrees(selectedSector.pLine1X, selectedSector.pLine1Y)
      setSectorPoint(coords)
      const temp = []
      if (selectedSector) {
        if (Object.keys(selectedSector).length === 0) return <></>
        for (let i = 1; i <= 12; i++) {
          if (selectedSector[`pLine${i}X`] && selectedSector[`pLine${i}Y`]) {
            const coords = metersToDegrees(selectedSector[`pLine${i}X`], selectedSector[`pLine${i}Y`])
            temp.push([coords.latitude, coords.longitude])
          }
        }
        polygonCoordinates.current = temp
      }
    }
  }, [selectedSector])

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaflet Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/leaflet-editable@1.2.0/src/Leaflet.Editable.js"></script>
    <style>
      body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
      #map { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      document.addEventListener("DOMContentLoaded", function () {
        const center = ${JSON.stringify(sectorPoint ? [sectorPoint.latitude, sectorPoint.longitude] : [37.78825, -122.4324])};

        let radio
        let currentZoom
        radio = 20
        // currentZoom = 12

        const map = L.map('map', {
          center: center,
          zoom: currentZoom ? currentZoom : 15,
          attributionControl: false
        });

        // 🌍 Cargar el mapa de CyclOSM
        // https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png
        L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png').addTo(map);
        map.on("zoomend"), function() {
          currentZoom = map.getZoom();
          if (currentZoom !== 0) {
            radio = 10 / currentZoom /2
            if (radio <= 10) radio = 10
            if (radio >= 200) radio = 200
          }
        }
        map.whenReady(() => {
          // 🔹 Crear el polígono
          var polygon = new L.polygon(${JSON.stringify(polygonCoordinates.current)}, {
            color: 'red',
            fillColor: 'rgba(0, 0, 255, 0.3)',
            fillOpacity: 1
          }).addTo(map);
          L.circle([${JSON.stringify(location ? location.latitude : 37.788825)}, ${JSON.stringify(location ? location.longitude : -122.4324)}], {
            color: 'rgb(50,50,50)',       // Borde del círculo
            fillColor: 'blue',   // Color de relleno
            fillOpacity: 0.5,    // Opacidad del relleno
            radius: radio          // Radio en metros
          }).addTo(map);
          L.marker([${JSON.stringify(location ? location.latitude : 37.78825)}, ${JSON.stringify(location ? location.longitude : -122.4324)}]).addTo(map)

        });        
      });
    </script>
  </body>
  </html>
`

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: htmlContent }}
    />
  )
}

export default MyReactMap

// Esto que está comentado abajo, es mediante la utilización de google maps, "react-native-maps", necesita una key que no quiero usar por ahora
// Ya está hecho y funciona perfecto, solo tiene un bug o 2, pero es funcional.
/*

  // ==> 2024-10-02
  // built in modules
  import { useEffect, useState } from 'react'
  import { View, Text, StyleSheet } from 'react-native'
  import MapView, { Polygon } from 'react-native-maps'
  import { useTheme } from 'react-native-paper'

  // custom modules
  import { GetOnlineLocation } from '../../../../globals/components/getLocation'
  import { metersToDegrees } from '../../../../globals/functions/functions'
  // import { metersToDegrees, degreesToMeters } from '../../../../globals/functions/functions'

  export default function MyReactMap (args) {
    // hooks
    const [sectorPoint, setSectorPoint] = useState(null) // initial coordinates to locate the selected sector on the screen
    const [pointsOnScreen, setPointsOnScreen] = useState(0)
    const theme = useTheme()
    // constants
    const location = GetOnlineLocation()
    const { companySector, polygonCoordinates, setVertices } = args

    useEffect(() => {
      if (companySector) {
        const coords = metersToDegrees(companySector.pLine1X, companySector.pLine1Y)
        setSectorPoint(coords)
      }
    }, [companySector])

    useEffect(() => {
      setVertices(pointsOnScreen)
    }, [pointsOnScreen])
    return (
      <View style={styles.container}>
        <View style={{ padding: 2, alignSelf: 'flex-start' }}>
          {
            location && (
              <Text
                style={
                  {
                    fontSize: pointsOnScreen === 12 ? 18 : 14,
                    color: pointsOnScreen === 12 ? theme.colors.error : theme.colors.primary
                  }
                }
              >
                Total vertices of the sector:
                <Text style={{ fontWeight: 'bold' }}> {pointsOnScreen}{pointsOnScreen === 12 ? ' !' : ''}</Text>
              </Text>
            )
          }
        </View>
        {location
          ? (
            <MapView
              style={styles.map}
              showsUserLocation
              loadingEnabled
              showsMyLocationButton
              region={{
                latitude: sectorPoint === null ? location.latitude : sectorPoint.latitude,
                longitude: sectorPoint === null ? location.longitude : sectorPoint.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005
              }}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.005, // 0.0922,
                longitudeDelta: 0.005 // 0.0421
              }}
              onPress={(event) => handleMapViewPress(event, polygonCoordinates, setPointsOnScreen, setVertices)}
            >
              <DrawPolygon polygonCoordinates={polygonCoordinates} companySector={companySector} pointsOnScreen={pointsOnScreen} />
            </MapView>
            )
          : (
            <Text>getting your location...</Text>
            )}
      </View>
    )
  }

  const DrawPolygon = ({ polygonCoordinates, companySector, pointsOnScreen }) => {
    const temp = []
    let dens
    if (pointsOnScreen === 12) {
      dens = 0.8
    } else {
      dens = 0.4
    }
    if (polygonCoordinates?.current === null) {
      if (companySector) {
        if (Object.keys(companySector).length === 0) return <></>
        for (let i = 1; i <= 12; i++) {
          if (companySector[`pLine${i}X`] !== null && companySector[`pLine${i}Y`] !== null) {
            const coords = metersToDegrees(companySector[`pLine${i}X`], companySector[`pLine${i}Y`])
            temp.push(
              {
                longitude: Number(coords.longitude),
                latitude: Number(coords.latitude)
              }
            )
          }
        }
        return (
          <Polygon
            coordinates={temp}
            fillColor={polygonCoordinates?.current?.length === 0 ? 'rgba(100, 0, 0, 0.8)' : `rgba(0, 200, 0, ${dens})`}
            strokeColor='#000' // Color del borde
            strokeWidth={3} // Grosor del borde
            // tappable
            // onPress={(event) => SectorPolygon(event, true)}
          />
        )
      }
    } else {
      // setVertices(polygonCoordinates?.current?.length)
      return (
        <Polygon
          coordinates={polygonCoordinates?.current}
          fillColor={polygonCoordinates?.current?.length === 0 ? 'rgba(100, 0, 0, 0.8)' : `rgba(0, 200, 0, ${dens})`}
          strokeColor='#000' // Color del borde
          strokeWidth={3} // Grosor del borde
          // tappable
          // onPress={(event) => SectorPolygon(event, true)}
        />
      )
    }
  }

  const handleMapViewPress = (event, polygonCoordinates, setPointsOnScreen) => {
    const { latitude, longitude } = event.nativeEvent.coordinate
    if (polygonCoordinates.current === null) {
      polygonCoordinates.current = { latitude, longitude }
    } else {
      const temp = []
      for (let i = 0; i < polygonCoordinates?.current?.length; i++) {
        if (i < 11) {
          temp.push(polygonCoordinates?.current[i])
        }
      }
      temp.push({ latitude, longitude })
      polygonCoordinates.current = temp
      setPointsOnScreen(temp.length)
    }
  }

  const styles = StyleSheet.create({
    container: {
      height: 400,
      justifyContent: 'center',
      alignItems: 'center'
    },
    map: {
      width: '100%',
      height: '100%'
    }
  })
*/
