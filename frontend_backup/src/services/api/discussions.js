import { apiClient } from '../apiClient';

export async function listDiscussions(params = {}) {
  try {
    const res = await apiClient.get('/api/discussions/', { params });
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch discussions' } };
  }
}

export async function createDiscussion(payload) {
  try {
    const res = await apiClient.post('/api/discussions/', payload);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to create discussion' } };
  }
}

export async function getDiscussion(id) {
  try {
    const res = await apiClient.get(`/api/discussions/${id}/`);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch discussion' } };
  }
}

export async function addComment(discussionId, payload) {
  try {
    const res = await apiClient.post(`/api/discussions/${discussionId}/comments/`, payload);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to add comment' } };
  }
}
