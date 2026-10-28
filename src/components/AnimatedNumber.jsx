import { useCountUp } from '../hooks/useCountUp.js'

// A number that counts up to `value`, formatted the Albanian way (1.234,5).
function AnimatedNumber({ value, decimals = 0 }) {
  const shown = useCountUp(value)
  return shown.toLocaleString('sq-AL', { maximumFractionDigits: decimals, minimumFractionDigits: 0 })
}

export default AnimatedNumber
