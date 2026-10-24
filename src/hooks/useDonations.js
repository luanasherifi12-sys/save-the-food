import { useEffect, useState } from 'react'
import { getDonations, subscribe } from '../lib/donationsStore.js'

// Gives a component the current list of donations and re-renders it when the list changes.
export function useDonations() {
  const [donations, setDonations] = useState(getDonations)

  useEffect(() => {
    // subscribe() returns the "stop listening" function, which React calls on unmount.
    return subscribe(() => setDonations(getDonations()))
  }, [])

  return donations
}
