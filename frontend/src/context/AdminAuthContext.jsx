import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'

const AdminAuthContext = createContext(null)

// Not a credential (the session is an httpOnly cookie) - just a hint that this
// browser has logged in before, so public visitors never trigger a 401 from
// the session check.
const HINT_KEY = 'ifoa-admin-session'
const readHint = () => {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return false
  }
}
const writeHint = (on) => {
  try {
    if (on) localStorage.setItem(HINT_KEY, '1')
    else localStorage.removeItem(HINT_KEY)
  } catch {
    // Storage blocked: the admin area still asks the server directly.
  }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  // Session lives in an httpOnly cookie, so the only way to know whether we're
  // logged in is to ask the server - but only inside /admin or after a login
  // in this browser.
  const shouldCheck = () =>
    typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || readHint())
  const [loading, setLoading] = useState(shouldCheck)

  useEffect(() => {
    if (!shouldCheck()) return
    api
      .me()
      .then((data) => {
        setAdmin(data.admin)
        writeHint(true)
      })
      .catch(() => {
        setAdmin(null)
        writeHint(false)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password)
    setAdmin(data.admin)
    writeHint(true)
    return data.admin
  }, [])

  const logout = useCallback(async () => {
    await api.logout().catch(() => {})
    setAdmin(null)
    writeHint(false)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}
