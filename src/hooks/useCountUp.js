import { useEffect, useRef, useState } from 'react'

// Animates a number from what is on screen now to `target` (0 -> 1234 the first time).
// People who turned on "reduce motion" in their phone settings see the final number right away.
export function useCountUp(target, durationMs = 1200) {
  const [value, setValue] = useState(0)
  const shownRef = useRef(0) // the number currently on screen (also mid-animation)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = shownRef.current
    if (reduceMotion || from === target) {
      shownRef.current = target
      setValue(target)
      return
    }

    let frameId
    const start = performance.now()
    function step(time) {
      const progress = Math.min(1, (time - start) / durationMs)
      const eased = 1 - (1 - progress) ** 3 // fast at first, slow at the end
      shownRef.current = from + (target - from) * eased
      setValue(shownRef.current)
      if (progress < 1) frameId = requestAnimationFrame(step)
    }
    frameId = requestAnimationFrame(step)

    // If the target changes mid-animation, the next run starts from shownRef (where we are now).
    return () => cancelAnimationFrame(frameId)
  }, [target, durationMs])

  return value
}
