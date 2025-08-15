import React, { createContext, useState, useEffect, useContext } from 'react'
import * as authApi from '../services/api/auth'

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

  useEffect(() => {
    // Check if user is logged in on app start
    const accessToken = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')
    
    if (accessToken && userData && userData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userData)
        if (parsedUser) {
          setUser(parsedUser)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Clear invalid user data
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    }
    setLoading(false)
  }, [])

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData)
      if (response.success) {
        // Store tokens and user data
        localStorage.setItem('accessToken', response.data.access)
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
        // Store tokens and user data
        localStorage.setItem('accessToken', response.data.access)
        localStorage.setItem('refreshToken', response.data.refresh)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        setUser(response.data.user)
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
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const refresh = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await authApi.refresh({ refresh: refreshToken })
      if (response.success) {
        // Update access token
        localStorage.setItem('accessToken', response.data.access)
        return response.data.access
      } else {
        throw new Error(response.error?.message || 'Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      // If refresh fails, logout user
      await logout()
      throw error
    }
  }

  const getProfile = async () => {
    try {
      const response = await authApi.getProfile()
      // Check if the response has data directly (some endpoints return data directly)
      // or if it's in a success/error format
      if (response.user) {
        // Response has user data directly
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
        return response.user
      } else if (response.data?.user) {
        // Response is in {success: true, data: {user: {...}}} format
        localStorage.setItem('user', JSON.stringify(response.data.user))
        setUser(response.data.user)
        return response.data.user
      } else {
        // Handle error response
        const errorMessage = response.error?.message || response.message || 'Failed to fetch profile'
        console.error('Profile fetch failed:', errorMessage)
        throw new Error(errorMessage)
      }
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
    refresh,
    getProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
