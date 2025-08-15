import { apiClient } from '../apiClient';

export async function createComplaint(payload) {
  try {
    const res = await apiClient.post('/api/complaints/', payload);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to create complaint' } };
  }
}

export async function listComplaints(params = {}) {
  try {
    const res = await apiClient.get('/api/complaints/', { params });
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch complaints' } };
  }
}

export async function getComplaint(id) {
  try {
    const res = await apiClient.get(`/api/complaints/${id}/`);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch complaint' } };
  }
}

export async function updateComplaint(id, payload) {
  try {
    const res = await apiClient.patch(`/api/complaints/${id}/`, payload);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to update complaint' } };
  }
}

export async function heatmap() {
  try {
    const res = await apiClient.get('/api/complaints/heatmap/');
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch heatmap data' } };
  }
}
