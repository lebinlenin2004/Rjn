import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi, clearTokens, getAccessToken, setTokens } from './api'
import { AuthContext } from './authStore'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(Boolean(getAccessToken()))

  useEffect(() => {
    if (!getAccessToken()) {
      setLoading(false)
      return undefined
    }

    authApi.me()
      .then((data) => {
        setProfile(data)
        setSession({ user: data })
      })
      .catch(() => {
        clearTokens()
        setProfile(null)
        setSession(null)
      })
      .finally(() => setLoading(false))

    return undefined
  }, [])

  const login = useCallback(async (email, password) => {
    const tokens = await authApi.login(email, password)
    setTokens(tokens)
    const data = await authApi.me()
    setProfile(data)
    setSession({ user: data })
    return data
  }, [])

  const register = useCallback(async (payload) => {
    return authApi.register(payload)
  }, [])

  const refreshProfile = useCallback(async () => {
    const data = await authApi.me()
    setProfile(data)
    setSession({ user: data })
    return data
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setProfile(null)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ apiReady: true, loading, login, logout, profile, refreshProfile, register, session, supabaseReady: true }),
    [loading, login, logout, profile, refreshProfile, register, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
