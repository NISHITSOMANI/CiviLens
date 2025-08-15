import { apiClient } from '../apiClient';

export async function listRegions(params = {}) {
  try {
    const res = await apiClient.get('/api/regions/', { params });
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch regions' } };
  }
}

export async function getRegion(id) {
  try {
    const res = await apiClient.get(`/api/regions/${id}/`);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch region' } };
  }
}

export async function getRegionMetrics(id) {
  try {
    const res = await apiClient.get(`/api/regions/${id}/metrics/`);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch region metrics' } };
  }
}
