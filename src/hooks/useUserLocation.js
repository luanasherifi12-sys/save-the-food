import { useEffect, useState } from 'react'

// The user's position from the browser. status: 'idle' | 'loading' | 'granted' | 'error'
// We only ask when the user taps the button (requestLocation), never by surprise.
export function useUserLocation() {
  const [location, setLocation] = useState({ position: null, status: 'idle' })

  function requestLocation() {
    if (!('geolocation' in navigator)) {
      setLocation({ position: null, status: 'error' })
      return
    }
    setLocation((current) => ({ ...current, status: 'loading' }))
    navigator.geolocation.getCurrentPosition(
      (result) =>
        setLocation({
          position: { lat: result.coords.latitude, lng: result.coords.longitude },
          status: 'granted',
        }),
      // Permission denied, no signal or timeout
      () => setLocation({ position: null, status: 'error' }),
      { timeout: 10000, maximumAge: 60000 },
    )
  }

  // If the user already allowed location earlier, use it right away without asking again.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((permission) => {
        if (permission.state === 'granted') requestLocation()
      })
      .catch(() => {}) // some browsers do not support this check; the button still works
  }, [])

  return { ...location, requestLocation }
}
