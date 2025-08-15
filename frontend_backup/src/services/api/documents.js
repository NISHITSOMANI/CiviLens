import { apiClient } from '../apiClient';

export async function uploadDocument(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await apiClient.post('/api/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to upload document' } };
  }
}

export async function listDocuments(params = {}) {
  try {
    const res = await apiClient.get('/api/documents/', { params });
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to fetch documents' } };
  }
}

export async function deleteDocument(id) {
  try {
    const res = await apiClient.delete(`/api/documents/${id}/`);
    return res.data;
  } catch (error) {
    // Handle error and return consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    return { success: false, error: { message: error.message || 'Failed to delete document' } };
  }
}
