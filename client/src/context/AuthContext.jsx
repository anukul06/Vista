import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, setAccessToken, onSessionExpired } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    onSessionExpired(clearSession)
  }, [clearSession])

  // On first load, try to silently resume a session from the httpOnly
  // refresh cookie (e.g. user refreshed the page or came back later).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const refreshed = await api.refreshSession()
      if (refreshed) {
        try {
          const { user: me } = await api.get('/auth/me')
          if (!cancelled) setUser(me)
        } catch {
          if (!cancelled) clearSession()
        }
      }
      if (!cancelled) setInitializing(false)
    })()
    return () => {
      cancelled = true
    }
  }, [clearSession])

  const signup = useCallback(async (payload) => {
    const { user: newUser, accessToken } = await api.post('/auth/signup', payload)
    setAccessToken(accessToken)
    setUser(newUser)
    return newUser
  }, [])

  const login = useCallback(async (payload) => {
    const { user: loggedInUser, accessToken } = await api.post('/auth/login', payload)
    setAccessToken(accessToken)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      clearSession()
    }
  }, [clearSession])

  return (
    <AuthContext.Provider value={{ user, initializing, signup, login, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
