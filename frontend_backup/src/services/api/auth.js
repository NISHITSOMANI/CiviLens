import { apiClient } from '../apiClient';

export async function register(data) {
  try {
    const res = await apiClient.post('/api/auth/register/', data);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Registration failed' } };
  }
}

export async function login(data) {
  try {
    const res = await apiClient.post('/api/auth/login/', data);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Login failed' } };
  }
}

export async function refresh(refreshToken) {
  try {
    const res = await apiClient.post('/api/auth/refresh/', { refresh: refreshToken });
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Token refresh failed' } };
  }
}

export async function profile() {
  try {
    const res = await apiClient.get('/api/auth/profile/');
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch profile' } };
  }
}

export async function logout(refreshToken) {
  try {
    const res = await apiClient.post('/api/auth/logout/', { refresh: refreshToken });
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Logout failed' } };
  }
}
