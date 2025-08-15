import { apiClient } from '../apiClient';

export async function listUsers(params = {}) {
  try {
    const res = await apiClient.get('/api/admin/users/', { params });
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch users' } };
  }
}

export async function getMetrics() {
  try {
    const res = await apiClient.get('/api/admin/metrics/');
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch metrics' } };
  }
}

export async function updateUser(id, payload) {
  try {
    const res = await apiClient.post(`/api/admin/users/${id}/`, payload);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to update user' } };
  }
}
