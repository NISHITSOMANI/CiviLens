// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/documents/, /api/documents/:id/

import apiClient from '../apiClient'

/**
 * Upload a document
 * POST /api/documents/ (multipart/form-data)
 */
export async function uploadDocument(file) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to upload document')
    }
  } catch (error) {
    console.error('Error uploading document:', error)
    throw error
  }
}

/**
 * Fetch list of documents
 * GET /api/documents/
 */
export async function listDocuments() {
  try {
    const response = await apiClient.get('/documents/')
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch documents')
    }
  } catch (error) {
    console.error('Error fetching documents:', error)
    throw error
  }
}

/**
 * Delete a specific document
 * DELETE /api/documents/:id/
 */
let queryClientRef = null

export function setQueryClient(queryClient) {
  queryClientRef = queryClient
}

export async function deleteDocument(id) {
  try {
    const response = await apiClient.delete(`/documents/${id}/`)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      // Invalidate documents query cache after successful deletion
      if (queryClientRef) {
        queryClientRef.invalidateQueries({ queryKey: ['documents'] })
      }
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to delete document')
    }
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error)
    throw error
  }
}
