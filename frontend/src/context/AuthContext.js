'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

function setTokenCookie(token) {
  document.cookie = `taskapp_token=${token}; path=/; max-age=86400; SameSite=Lax`
}

function clearTokenCookie() {
  document.cookie = 'taskapp_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Restore auth state from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (savedUser && token) {
        setUser(JSON.parse(savedUser))
      }
    } catch {
      // ignore parse errors
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const res = await authApi.login({ email, password })
      const data = res.data.data || res.data

      // Support various Spring Boot JWT response shapes
      const token = data.token || data.accessToken || data.jwt
      const userData = data.user || {
        id:       data.id,
        email:    data.email || email,
        username: data.username || data.name || email,
        role:     data.role || (data.roles?.[0]) || 'USER',
      }

      // Clear any previous session data before saving to avoid stale roles
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setTokenCookie(token)
      setUser(userData)
      return userData
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        throw new Error('username or password is wrong')
      }
      throw err
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await authApi.register({ name, email, password })
    const data = res.data.data || res.data

    // Some backends auto-login on register, others don't
    if (data.token || data.accessToken) {
      const token = data.token || data.accessToken
      const userData = data.user || { username: name, email, role: 'USER' }
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setTokenCookie(token)
      setUser(userData)
    }
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    clearTokenCookie()
    setUser(null)
    router.push('/login')
    toast.success('Logged out successfully')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
