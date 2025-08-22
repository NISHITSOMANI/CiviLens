// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/auth/register/, /api/auth/login/, /api/auth/refresh/, /api/auth/logout/, /api/auth/profile/

import React, { createContext, useState, useEffect, useContext, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as authApi from '../services/api/auth'
import { setAccessToken } from '../services/apiClient'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const initRef = useRef(false)
  const refreshingRef = useRef(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    const bootstrap = async () => {
      if (initRef.current) return
      initRef.current = true
      // Check if user is logged in on app start
      const refreshToken = localStorage.getItem('refreshToken')
      const userData = localStorage.getItem('user')
      
      if (refreshToken && userData && userData !== 'undefined') {
        try {
          const parsedUser = JSON.parse(userData)
          if (parsedUser) {
            setUser(parsedUser)
            // Try to refresh token on app start and await completion
            await refreshFromStorage()
          }
        } catch (error) {
          console.error('Error parsing user data:', error)
          // Clear invalid user data
          localStorage.removeItem('user')
          localStorage.removeItem('refreshToken')
        }
      }
      setLoading(false)
    }
    bootstrap()
  }, [])

  const refreshFromStorage = async () => {
    try {
      if (refreshingRef.current) return
      refreshingRef.current = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await authApi.refresh({ refresh: refreshToken })
      if (response.success) {
        // Store access token in memory
        setAccessToken(response.data.access)
        // Persist the new refresh token so next reload uses the latest one
        if (response.data.refresh) {
          localStorage.setItem('refreshToken', response.data.refresh)
        }
        
        // Fetch user profile
        await getProfile()
      } else {
        throw new Error(response.error?.message || 'Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      // If refresh fails, clear local auth state without calling backend logout
      setAccessToken(null)
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setUser(null)
    }
    finally {
      refreshingRef.current = false
    }
  }

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData)
      if (response.success) {
        // Store refresh token in localStorage and access token in memory
        setAccessToken(response.data.access)
        localStorage.setItem('refreshToken', response.data.refresh)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        setUser(response.data.user)
      }
      return response
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials)
      if (response.success) {
        // Store refresh token in localStorage and access token in memory
        setAccessToken(response.data.access)
        localStorage.setItem('refreshToken', response.data.refresh)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        setUser(response.data.user)
        // Clear any stale chat caches from previous sessions
        queryClient.removeQueries({ queryKey: ['chatMessages'] })
        // Clear any stale documents caches from previous sessions
        queryClient.removeQueries({ queryKey: ['documents'] })
        // Clear any stale profile caches so new user fetches fresh profile
        queryClient.removeQueries({ queryKey: ['profile'] })
      }
      return response
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await authApi.logout({ refresh: refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all auth data
      setAccessToken(null)
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setUser(null)
      // Remove all chat-related caches to avoid cross-account leakage
      queryClient.removeQueries({ queryKey: ['chatMessages'] })
      // Remove documents caches as well
      queryClient.removeQueries({ queryKey: ['documents'] })
      // Remove profile caches so next session fetches fresh data
      queryClient.removeQueries({ queryKey: ['profile'] })
      // Optionally clear everything user-specific if needed
      // queryClient.clear()
    }
  }

  const getProfile = async () => {
    try {
      const response = await authApi.getProfile()
      // Normalize various backend shapes
      // 1) Direct user: { user: {...} }
      if (response?.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
        return response.user
      }
      // 2) Wrapped success: { success: true, data: { user: {...} } }
      if (response?.success && response?.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
        setUser(response.data.user)
        return response.data.user
      }
      // 3) Wrapped success with user fields directly in data: { success: true, data: { id, username, ... } }
      if (response?.success && response?.data && (response.data.id || response.data.username || response.data.email)) {
        localStorage.setItem('user', JSON.stringify(response.data))
        setUser(response.data)
        return response.data
      }
      // If none matched, treat as error
      const errorMessage = response?.error?.message || response?.message || 'Failed to fetch profile'
      console.error('Profile fetch failed:', errorMessage)
      throw new Error(errorMessage)
    } catch (error) {
      console.error('Profile fetch error:', error)
      // Only logout if it's specifically an authentication error
      // and not some other type of error
      if (error.response?.status === 401 || error.message?.includes('401')) {
        console.log('Authentication error, logging out...')
        await logout()
      }
      throw error
    }
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    refreshFromStorage,
    getProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
