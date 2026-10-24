import { useEffect, useState } from 'react'
import { getDonations, subscribe } from '../lib/donationsStore.js'

// Time alone can change the data (e.g. expired samples get recreated), so we also re-read regularly.
const REFRESH_MS = 30 * 1000

// Gives a component the current list of donations and re-renders it when the list changes.
export function useDonations() {
  const [donations, setDonations] = useState(getDonations)

  useEffect(() => {
    const refresh = () => setDonations(getDonations())
    const unsubscribe = subscribe(refresh)
    const intervalId = setInterval(refresh, REFRESH_MS)

    // Cleanup: React calls this when the component disappears.
    return () => {
      unsubscribe()
      clearInterval(intervalId)
    }
  }, [])

  return donations
}
