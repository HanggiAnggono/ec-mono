import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services'
import type { User } from '../services/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  signup: (data: {
    username: string
    email: string
    password: string
    phone: string
    firstname: string
    lastname: string
  }) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ec_admin_user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = async () => {
    const token = localStorage.getItem('ec_admin_token')
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const profile = await authApi.getProfile()
      setUser(profile)
      localStorage.setItem('ec_admin_user', JSON.stringify(profile))
    } catch (err: unknown) {
      console.error('Failed to load user profile on mount:', err)
      // If profile fails, token might be invalid or expired
      localStorage.removeItem('ec_admin_token')
      localStorage.removeItem('ec_admin_user')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()

    const handleSessionExpired = () => {
      setUser(null)
      setError('Your session has expired. Please log in again.')
    }

    window.addEventListener('auth_session_expired', handleSessionExpired)
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired)
    }
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await authApi.login({ username, password })
      localStorage.setItem('ec_admin_token', res.token)
      localStorage.setItem('ec_admin_user', JSON.stringify(res.user))
      setUser(res.user)
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Login failed'
      setError(errMsg)
      throw new Error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: {
    username: string
    email: string
    password: string
    phone: string
    firstname: string
    lastname: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await authApi.signup(data)
      localStorage.setItem('ec_admin_token', res.token)
      localStorage.setItem('ec_admin_user', JSON.stringify(res.user))
      setUser(res.user)
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Signup failed'
      setError(errMsg)
      throw new Error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('ec_admin_token')
    localStorage.removeItem('ec_admin_user')
    setUser(null)
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        signup,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
