import { useCallback, useMemo, useState } from 'react'
import { apiRequest } from '../api/client'
import { AuthContext } from './auth-context'

const STORAGE_KEY = 'expense-tracker-user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  })

  const saveUser = (nextUser) => {
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
  }

  const login = useCallback(async (credentials) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    })
    saveUser(data)
  }, [])

  const register = useCallback(async (payload) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: payload,
    })
    saveUser(data)
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const data = await apiRequest('/auth/profile', {
      method: 'PUT',
      token: user?.token,
      body: payload,
    })
    saveUser(data)
  }, [user?.token])

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      user,
      token: user?.token,
      isAuthenticated: Boolean(user?.token),
      login,
      register,
      updateProfile,
      logout,
    }),
    [login, register, updateProfile, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
