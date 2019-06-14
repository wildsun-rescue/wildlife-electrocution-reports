import { useState, useEffect } from 'react'

// const defaultCenter = [9.7135339, -85.10903189999999]
const defaultCenter = [0, 0]

const useGeoLocation = (onLoad = () => {}) => {
  const supportsGeoLocation = 'geolocation' in navigator

  if (!supportsGeoLocation) {
    return {
      coords: defaultCenter,
      loading: false,
    }
  }

  const [state, setState] = useState({
    coords: defaultCenter,
    loading: true,
    requestLocation: () => {
      new Promise(resolve => (
        console.log('requesting GPS') ||
        navigator.geolocation.getCurrentPosition(resolve)
      )).then((result) => {
        const { coords: { latitude, longitude } } = result

        console.log('GPS loaded', [latitude, longitude])
        onLoad([latitude, longitude])
        setState({
          coords: [latitude, longitude],
          loading: false,
          requestLocation: state.requestLocation,
        })
      })
    },
  })

  useEffect(state.requestLocation, [])

  return state
}

export default useGeoLocation
