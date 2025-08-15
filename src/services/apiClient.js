import axios from 'axios'

// Create axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
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
        const response = await axios.post('http://localhost:8000/api/auth/refresh/', {
          refresh: refreshToken
        })
        
        if (response.data.success) {
          // Store new access token
          localStorage.setItem('accessToken', response.data.data.access)
          
          // Update Authorization header
          originalRequest.headers.Authorization = `Bearer ${response.data.data.access}`
          
          // Retry original request
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // If refresh fails, clear auth data and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
