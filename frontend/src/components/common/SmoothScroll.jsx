import { createContext, useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const LenisContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export function useLenis() {
  return useContext(LenisContext)
}

export function SmoothScroll({ children }) {
  const location = useLocation()

  // Immediately jump to top on route change without lag - except in-page
  // switches (e.g. a course's location switch), which keep the position.
  useEffect(() => {
    if (location.state?.keepScroll) return
    window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <LenisContext.Provider value={null}>
      {children}
    </LenisContext.Provider>
  )
}

export default SmoothScroll
