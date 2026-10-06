import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function RouteProgressBar() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const isFirstMount = useRef(true)

  useEffect(() => {
    // Avoid showing on the initial page mount, and for in-page switches
    // (e.g. a course's location switch) that are not a page change.
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    if (location.state?.keepScroll) return

    // Reset and trigger ultra-smooth progress
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading/reset state at the start of an effect that syncs with an external source
    setVisible(true)
    setOpacity(1)
    setProgress(20)

    const t1 = setTimeout(() => {
      setProgress(65)
    }, 80)

    const t2 = setTimeout(() => {
      setProgress(90)
    }, 220)

    const t3 = setTimeout(() => {
      setProgress(100)
    }, 380)

    const t4 = setTimeout(() => {
      setOpacity(0)
    }, 550)

    const t5 = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 850)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  if (!visible && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[2.5px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="relative h-full bg-gradient-to-r from-emerald-500 via-[#34E06E] to-[#4ade80]"
        style={{
          width: `${progress}%`,
          opacity,
          transition: `width ${progress === 100 ? '250ms' : '200ms'} cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease-out`,
          boxShadow: '0 0 10px rgba(52, 224, 110, 0.7), 0 0 4px rgba(52, 224, 110, 0.4)'
        }}
      >
        {/* Leading subtle spark at the head of the bar */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/50" />
      </div>
    </div>
  )
}

export default RouteProgressBar
