import { apiClient } from '../apiClient';

export async function healthCheck() {
  try {
    const res = await apiClient.get('/api/health/');
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to perform health check' } };
  }
}
