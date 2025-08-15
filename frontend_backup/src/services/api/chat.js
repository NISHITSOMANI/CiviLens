import { apiClient } from '../apiClient';

export async function sendMessage(message) {
  try {
    const res = await apiClient.post('/api/chat/', { message });
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to send message' } };
  }
}
