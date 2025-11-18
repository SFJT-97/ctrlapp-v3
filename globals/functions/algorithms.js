// // Función para determinar si un punto está dentro de un polígono
// export function pointInPolygon (point, polygon) {
//   let inside = false
//   const latitudePoint = point.latitud
//   const longitudePoint = point.longitud

//   for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
//     const latitud1 = polygon[i].latitud
//     const longitud1 = polygon[i].longitud
//     const latitud2 = polygon[j].latitud
//     const longitud2 = polygon[j].longitud

//     if (
//       ((longitud1 > longitudePoint) !== (longitud2 > longitudePoint)) &&
//       (latitudePoint < (latitud2 - latitud1) * (longitudePoint - longitud1) / (longitud2 - longitud1) + latitud1)
//     ) {
//       inside = !inside
//     }
//   }

//   return inside
// }

// // Ejemplo de uso
// const punto = { latitud: 40.712776, longitud: -74.005974 }
// const polygon = [
//   { latitud: 40.71, longitud: -74.0 },
//   { latitud: 40.72, longitud: -74.0 },
//   { latitud: 40.72, longitud: -74.01 },
//   { latitud: 40.71, longitud: -74.01 }
// ]

// const estaDentro = pointInPolygon(punto, polygon)
// console.log('¿El punto está dentro del polígono?', estaDentro)

// Función para determinar si un punto está dentro de un polígono utilizando Ray Casting
export function puntoEnPoligono (punto, poligono) {
  let dentro = false
  const latitudPunto = punto.latitud
  const longitudPunto = punto.longitud

  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const latitud1 = poligono[i].latitud
    const longitud1 = poligono[i].longitud
    const latitud2 = poligono[j].latitud
    const longitud2 = poligono[j].longitud

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

// // Ejemplo de uso
// const punto = { latitud: 40.712776, longitud: -74.005974 }
// const poligono = [
//   { latitud: 40.71, longitud: -74.0 },
//   { latitud: 40.72, longitud: -74.0 },
//   { latitud: 40.72, longitud: -74.01 },
//   { latitud: 40.71, longitud: -74.01 }
// ]

// const estaDentro = puntoEnPoligono(punto, poligono)
// console.log('¿El punto está dentro del polígono?', estaDentro)
