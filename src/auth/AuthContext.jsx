import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { getSession, logout, refresh } from '../services/authApi'
import { getAccessToken, setAccessToken } from '../services/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()))
  const [isLoading, setIsLoading] = useState(true)
  const [sessionUser, setSessionUser] = useState(null)

  const initialize = useCallback(async () => {
    try {
      const hasToken = Boolean(getAccessToken())
      if (!hasToken) {
        const refreshed = await refresh()
        setAccessToken(refreshed.access_token)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(true)
      }
      const me = await getSession()
      setSessionUser(me)
    } catch {
      setAccessToken(null)
      setIsAuthenticated(false)
      setSessionUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const onForceLogout = () => {
      setAccessToken(null)
      setIsAuthenticated(false)
      setSessionUser(null)
    }
    window.addEventListener('dv:auth-logout', onForceLogout)
    return () => window.removeEventListener('dv:auth-logout', onForceLogout)
  }, [])

  const markAuthenticated = useCallback(async (accessToken) => {
    if (accessToken) setAccessToken(accessToken)
    setIsAuthenticated(true)
    try {
      const me = await getSession()
      setSessionUser(me)
    } catch {
      // ignore, route guards still rely on auth token state
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logout()
    } finally {
      setAccessToken(null)
      setIsAuthenticated(false)
      setSessionUser(null)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    const refreshed = await refresh()
    if (refreshed?.access_token) {
      setAccessToken(refreshed.access_token)
      setIsAuthenticated(true)
    }
    const me = await getSession()
    setSessionUser(me)
    return me
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      sessionUser,
      markAuthenticated,
      refreshSession,
      signOut,
    }),
    [isAuthenticated, isLoading, sessionUser, markAuthenticated, refreshSession, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
