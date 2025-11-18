import { useState, useEffect } from 'react'
import { ProgressBar, MD3Colors } from 'react-native-paper'

/**
 * Shows progress in advance of one process. It uses customized react-native-paper ProgressBar
 * @param {*} progress Mandatory. This number indicates the actual advance of the process
 * @param {*} total The total number of steps the process takes. By default is 100. If this number is not provided then "progress"  argument will assume is a % of the total process
 * @returns the component Progress Bar
 */
const CustomProgressBar = ({ progress, total }) => {
  if (!total || total === undefined) total = 100
  const [advance, setAdvance] = useState(progress / total)
  useEffect(() => setAdvance(progress / total), [progress])

  return (
    <ProgressBar progress={advance} color={MD3Colors.tertiary60} style={{ width: 200, height: 30, borderCurve: 'circular' }} />
  )
}

export default CustomProgressBar
