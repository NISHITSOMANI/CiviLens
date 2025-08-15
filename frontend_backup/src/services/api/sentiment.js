import { apiClient } from '../apiClient';

export async function overview() {
  try {
    const res = await apiClient.get('/api/sentiment/overview/');
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch sentiment overview' } };
  }
}

export async function trends(params = {}) {
  try {
    const res = await apiClient.get('/api/sentiment/trends/', { params });
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch sentiment trends' } };
  }
}

export async function regions() {
  try {
    const res = await apiClient.get('/api/sentiment/regions/');
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch sentiment regions' } };
  }
}
