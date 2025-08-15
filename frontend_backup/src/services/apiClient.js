import axios from 'axios';

// Create axios instance with base URL from environment variable
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Accept': 'application/json',
  },
});

// Temporary storage for access token (in-memory)
// TODO: Replace with secure httpOnly cookies in production
let accessToken = null;

// Function to set access token (for initial token injection)
export const setAccessToken = (token) => {
  accessToken = token;
};

// Request interceptor to attach Authorization header
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors and attempt token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/refresh/`,
            { refresh: refreshToken }
          );
          
          if (response.data.success) {
            // Update tokens
            const newAccessToken = response.data.data.access;
            const newRefreshToken = response.data.data.refresh;
            
            // Update in-memory access token
            setAccessToken(newAccessToken);
            
            // Update refresh token in localStorage
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // Update Authorization header and retry original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('refreshToken');
          setAccessToken(null);
          // TODO: Redirect to login page
          window.location.href = '/login';
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };
