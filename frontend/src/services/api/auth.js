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
  console.log('Auth service - login called with:', { ...credentials, password: '***' });
  try {
    // Ensure we're sending email instead of username
    const { email, password } = credentials;
    console.log('Sending login request to /auth/login/');
    
    const response = await apiClient.post('/auth/login/', { 
      email, 
      password 
    });
    
    console.log('Login response received:', response);
    return response.data;
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    // Handle error and return consistent format
    if (error.response?.data) {
      return { 
        success: false, 
        error: typeof error.response.data === 'object' 
          ? error.response.data 
          : { message: error.response.data }
      };
    }
    
    return { 
      success: false, 
      error: { 
        message: error.message || 'Login failed. Please check your email and password.' 
      } 
    };
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

export async function updateProfile(profileData) {
  try {
    const response = await apiClient.put('/auth/profile/', profileData)
    return response.data
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data
    }
    return { success: false, error: { message: error.message || 'Failed to update profile' } }
  }
}
