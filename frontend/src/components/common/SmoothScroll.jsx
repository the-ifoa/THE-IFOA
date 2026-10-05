import { createContext, useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const LenisContext = createContext(null)

export function useLenis() {
  return useContext(LenisContext)
}

export function SmoothScroll({ children }) {
  const location = useLocation()

  // Immediately jump to top on route change without lag
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <LenisContext.Provider value={null}>
      {children}
    </LenisContext.Provider>
  )
}

export default SmoothScroll
