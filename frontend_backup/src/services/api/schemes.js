import { apiClient } from '../apiClient';

export async function listSchemes({ limit=20, offset=0, q='', region='', category='' } = {}) {
  const params = { limit, offset };
  if (q) params.q = q;
  if (region) params.region = region;
  if (category) params.category = category;
  
  try {
    const res = await apiClient.get('/api/schemes/', { params });
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch schemes' } };
  }
}

export async function getScheme(id) {
  try {
    const res = await apiClient.get(`/api/schemes/${id}/`);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch scheme' } };
  }
}

export async function searchSchemes(filters) {
  try {
    const res = await apiClient.post('/api/schemes/search/', filters);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to search schemes' } };
  }
}

export async function createScheme(data) {
  try {
    const res = await apiClient.post('/api/schemes/', data);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to create scheme' } };
  }
}

export async function categories() {
  try {
    const res = await apiClient.get('/api/schemes/categories/');
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch categories' } };
  }
}
