import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('expense_token'))
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('expense_user') || 'null'))

  useEffect(() => {
    const handleExpired = () => { setToken(null); setUser(null) }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  const persistUser = (nextUser) => {
    const safeUser = nextUser || user || {}
    localStorage.setItem('expense_user', JSON.stringify(safeUser))
    setUser(safeUser)
    return safeUser
  }

  const signIn = async (credentials) => {
    const result = await authApi.login(credentials)
    const nextToken = result?.token || result?.accessToken || result?.jwt
    if (!nextToken) throw new Error('The server did not return a JWT token.')
    const nextUser = result?.user || { email: credentials.email, name: result?.name || credentials.email.split('@')[0] }
    localStorage.setItem('expense_token', nextToken)
    persistUser(nextUser)
    setToken(nextToken)
  }

  const signUp = async (payload) => authApi.register(payload)

  const updateProfile = async (payload) => {
    const result = await authApi.updateProfile(payload)
    const nextUser = { ...(user || {}), id: result?.id ?? user?.id, name: result?.name ?? user?.name, email: result?.email ?? user?.email }
    persistUser(nextUser)
    return nextUser
  }

  const updateProfilePhoto = (avatar) => {
    const nextUser = { ...(user || {}), avatar }
    persistUser(nextUser)
  }

  const signOut = () => { localStorage.removeItem('expense_token'); localStorage.removeItem('expense_user'); setToken(null); setUser(null) }

  const deleteAccount = async (payload) => {
    await authApi.deleteAccount(payload)
    signOut()
  }

  const value = useMemo(() => ({ token, user, isAuthenticated: Boolean(token), signIn, signUp, signOut, updateProfile, updateProfilePhoto, deleteAccount }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
