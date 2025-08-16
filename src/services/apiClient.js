// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/auth/refresh/

import axios from 'axios'

// In-memory access token (more secure than localStorage)
let accessToken = null

// Create axios instance
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper to set access token (for in-memory storage)
export const setAccessToken = (token) => {
  accessToken = token
}

// Helper to get access token
const getAccessToken = () => {
  return accessToken
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
        
        // Try to refresh token
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/refresh/`, {
          refresh: refreshToken
        })
        
        if (response.data.success) {
          // Store new access token in memory
          setAccessToken(response.data.data.access)
          // Persist the new refresh token so subsequent refreshes use the latest one
          if (response.data.data.refresh) {
            localStorage.setItem('refreshToken', response.data.data.refresh)
          }
          
          // Update Authorization header
          originalRequest.headers.Authorization = `Bearer ${response.data.data.access}`
          
          // Retry original request
          return apiClient(originalRequest)
        } else {
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        // If refresh fails, clear auth data
        setAccessToken(null)
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        
        // Redirect to login
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
