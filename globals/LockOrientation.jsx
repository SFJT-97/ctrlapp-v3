import { useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'

const LockOrientation = ({ orientation }) => {
  useEffect(() => {
    const lock = async () => {
      await ScreenOrientation.lockAsync(orientation || ScreenOrientation.OrientationLock.PORTRAIT_UP)
    }
    lock()

    return () => {
      ScreenOrientation.unlockAsync()
    }
  }, [orientation])

  return null // No renderiza nada
}

export default LockOrientation
