// ==> 2024-10-02
/**
 * function used to slice strings to the maximum permitted and mostly used for full names.
 * @param {*} firstName Is the first string to consider. Usually the firstName
 * @param {*} lastName Optional parameter, is the last name to consider. Usually the lastname. '' by default
 * @param {*} large Optional parameter, is the maximum length to show. 17 by default
 * @returns firstName, lastName with (large) lenght as maximum.
 */
export function showedName (firstName, lastName = '', large = 17) {
  let name = lastName + ', ' + firstName
  if (name?.length > large) name = name?.slice(0, large) + '...'
  return name
}

//
//
/**
 * Function for evaluating different topics for validation, return true or false
 * @param {*} args What to compare, could be an array or a simple value
 * @param {*} how How to compare (===, !==, >, <)
 * @param {*} conds Conditions. The evaluation indeed
 */
export function evalConds (args, conds, how = '!') {
  let result = true
  const ress = []
  if (!args || !conds) return false
  if (!Array.isArray(args)) {
    // el principal parámetro a comparar no es un arreglo
    if (!Array.isArray(conds)) {
      // las condiciones de validación no son un arreglo ni las condiciones (conds) tampoco
      how === '!' ? result = args !== conds : result = args === conds
      return result
    } else {
      // a este punto se llega si el principal parámetro a comparar (args) no es un arreglo y las condiciones si
      let temp
      conds.forEach(el => {
        how === '!' ? temp = el !== conds : temp = el === conds
        ress.push(temp)
      })
    }
  } else {
    // a este punto se llega si tanto (args) como (conds) son arrays
    let temp
    args.forEach(elArgs => {
      conds.forEach(elCond => {
        how === '!' ? temp = elArgs !== elCond : temp = elArgs === elCond
        ress.push(temp)
      })
    })
  }
  ress.forEach(element => {
    if (element === false) result = false
  })
  return result
}

export const getFormatedTime = (time, withSecs = false, withTime = true, showYear = true) => {
  // console.log('time=', time)
  const fecha = new Date(Number(time))
  // Obtener el año, mes y día de la fecha
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0') // Sumar 1 porque los meses van de 0 a 11
  const day = String(fecha.getDate()).padStart(2, '0')

  // Formatear la fecha en el formato YYYY/MM/DD
  let fechaFormateada
  if (showYear) {
    fechaFormateada = `${year}/${month}/${day}`
  } else {
    fechaFormateada = `${month}/${day}`
  }

  if (!withTime) {
    return fechaFormateada
  }

  // Obtener la hora formateada en inglés
  let horaFormateada
  if (withSecs) {
    horaFormateada = fecha.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      hourCycle: 'h24'
    })
  } else {
    horaFormateada = fecha.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      hourCycle: 'h24'
    })
  }

  // Combinar la fecha y la hora formateadas
  const fechaHoraFormateada = `${fechaFormateada} - ${horaFormateada}`
  return fechaHoraFormateada
}

export function countDecimals (num, decimalsReturned = -1) {
  if (Math.floor(num) === num) return 0 // Si el número es un entero, retorna 0
  let decimalCount = 0
  while (num % 1 !== 0) {
    num *= 10
    decimalCount++
  }

  if (decimalsReturned !== -1) {
    if (decimalCount > decimalsReturned) {
      return roundToDecimals(num, decimalsReturned)
    } else {
      return num
    }
  } else {
    return decimalCount
  }
}

export const roundToDecimals = (num, decimals) => {
  const factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}

export function convertDegreesToDMS (degrees) {
  // Extraemos la parte entera de los grados
  let deg = Math.floor(degrees)

  // Calculamos los minutos a partir del valor decimal restante
  const minutes = (degrees - deg) * 60

  // Extraemos la parte entera de los minutos
  let min = Math.floor(minutes)

  // Calculamos los segundos a partir del valor decimal restante
  const seconds = (minutes - min) * 60

  // Redondeamos los segundos
  let sec = Math.round(seconds)

  // Aseguramos que los segundos no sobrepasen 60
  if (sec === 60) {
    sec = 0
    min += 1
  }

  // Aseguramos que los minutos no sobrepasen 60
  if (min === 60) {
    min = 0
    deg += 1
  }

  return {
    degrees: deg,
    minutes: min,
    seconds: sec
  }
}

export const metersToDegrees = (X, Y) => {
  const latitude = Y / 111320 // 1 grado de latitud ≈ 111.32 km
  const longitude = X / (111320 * Math.cos(latitude * Math.PI / 180)) // Ajusta según la latitud
  return { latitude, longitude }
}

export const degreesToMeters = (longitude, latitude) => {
  const Y = latitude * 111320 // 1 grado de latitud ≈ 111.32 km
  const X = longitude * (111320 * Math.cos(latitude * Math.PI / 180)) // Ajusta según la latitud
  return { X, Y }
}

export const numbToEng = (value, decimals = 1) => {
  let result
  if (value > 1000 && value < 1000000) {
    result = (value / 1000).toFixed(decimals) + 'k'
  } else if (value >= 1000000) {
    result = (value / 1000000).toFixed(decimals) + 'M'
  } else {
    result = value
  }
  return result
}
