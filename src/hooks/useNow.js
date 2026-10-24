import { useEffect, useState } from 'react'

// The current time (ms), updated every `intervalMs`. Used for countdowns.
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(intervalId) // stop the timer when the component disappears
  }, [intervalMs])

  return now
}
