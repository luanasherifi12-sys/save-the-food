import { useEffect, useState } from 'react'

// Tailwind's `lg` breakpoint: computer screens.
export const DESKTOP_QUERY = '(min-width: 1024px)'

// true/false for a CSS media query, updated when the window is resized.
// Use CSS (md:, lg:) for looks; use this only when JavaScript must behave differently.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleChange = () => setMatches(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
