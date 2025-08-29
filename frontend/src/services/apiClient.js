import axios from 'axios';

// Get base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// In-memory access token (more secure than localStorage)
let accessToken = null;

// Create axios instance with configuration
const apiClient = axios.create({
  baseURL: `${API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL}/api`,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies if using session-based auth
});

// Log the API base URL for debugging (removed in production)
if (import.meta.env.DEV) {
  console.log(`API Base URL: ${apiClient.defaults.baseURL}`);
}

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
    
    // If error is 401 (unauthorized) OR 403 (forbidden due to missing/expired token)
    // and we haven't tried to refresh token yet, attempt refresh.
    const status = error.response?.status
    const hadAuthHeader = !!originalRequest?.headers?.Authorization
    if ((status === 401 || (status === 403 && !hadAuthHeader)) && !originalRequest._retry) {
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
