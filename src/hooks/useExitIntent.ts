import { useEffect, useRef } from 'react'

const STORAGE_KEY = 'vv-exit-intent-shown'
const DELAY_MS = 12000 // show after 12s if no exit movement

export function useExitIntent(onTrigger: () => void, enabled = true) {
  const triggered = useRef(false)

  const fire = () => {
    if (triggered.current) return
    if (sessionStorage.getItem(STORAGE_KEY)) return
    triggered.current = true
    sessionStorage.setItem(STORAGE_KEY, '1')
    onTrigger()
  }

  useEffect(() => {
    if (!enabled) return

    // Desktop: mouse leaves toward top of viewport (tab/back button area)
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) fire()
    }

    // Fallback timer for mobile / non-movers
    const timer = setTimeout(fire, DELAY_MS)

    document.addEventListener('mouseleave', onMouseLeave)
    return () => {
      document.removeEventListener('mouseleave', onMouseLeave)
      clearTimeout(timer)
    }
  }, [enabled])
}
