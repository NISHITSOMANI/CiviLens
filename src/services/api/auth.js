import apiClient from '../apiClient'

export async function register(userData) {
  try {
    const response = await apiClient.post('/auth/register/', userData)
    return response.data
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data
    }
    return { success: false, error: { message: error.message || 'Registration failed' } }
  }
}

export async function login(credentials) {
  try {
    const response = await apiClient.post('/auth/login/', credentials)
    return response.data
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data
    }
    return { success: false, error: { message: error.message || 'Login failed' } }
  }
}

export async function logout(refreshToken) {
  try {
    const response = await apiClient.post('/auth/logout/', refreshToken)
    return response.data
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data
    }
    return { success: false, error: { message: error.message || 'Logout failed' } }
  }
}

export async function refresh(refreshToken) {
  try {
    const response = await apiClient.post('/auth/refresh/', refreshToken)
    return response.data
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data
    }
    return { success: false, error: { message: error.message || 'Token refresh failed' } }
  }
}

export async function getProfile() {
  try {
    const response = await apiClient.get('/auth/profile/')
    return response.data
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data
    }
    return { success: false, error: { message: error.message || 'Failed to fetch profile' } }
  }
}
