import { useEffect, useState } from 'react'
import { getProfile, subscribeToProfile } from '../lib/profileStore.js'

// The profile for `role`, re-rendered when it changes (also from another tab).
export function useProfile(role) {
  const [profile, setProfile] = useState(() => getProfile(role))

  useEffect(() => {
    setProfile(getProfile(role)) // the role may have changed
    return subscribeToProfile(() => setProfile(getProfile(role)))
  }, [role])

  return profile
}
