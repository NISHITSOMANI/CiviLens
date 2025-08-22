// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/schemes/?limit=&offset=&q=&region=&category=, /api/schemes/:id/, /api/schemes/categories/, /api/schemes/search/

import apiClient from '../apiClient'

/**
 * Fetch list of schemes with optional filters
 * GET /api/schemes/?limit=&offset=&q=&region=&category=
 */
export async function listSchemes(params = {}) {
  try {
    const response = await apiClient.get('/schemes/', { params })
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch schemes')
    }
  } catch (error) {
    console.error('Error fetching schemes:', error)
    throw error
  }
}

/**
 * Fetch details of a specific scheme
 * GET /api/schemes/:id/
 */
export async function getScheme(id) {
  try {
    const response = await apiClient.get(`/schemes/${id}/`)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch scheme')
    }
  } catch (error) {
    console.error(`Error fetching scheme ${id}:`, error)
    throw error
  }
}

/**
 * Fetch list of scheme categories
 * GET /api/schemes/categories/
 */
export async function getCategories() {
  try {
    const response = await apiClient.get('/schemes/categories/')
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch categories')
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

/**
 * Search schemes with filters
 * POST /api/schemes/search/
 */
export async function searchSchemes(filters = {}) {
  try {
    const response = await apiClient.post('/schemes/search/', filters)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to search schemes')
    }
  } catch (error) {
    console.error('Error searching schemes:', error)
    throw error
  }
}

/**
 * Create a new scheme (admin only)
 * POST /api/schemes/
 */
export async function createScheme(payload) {
  try {
    const response = await apiClient.post('/schemes/', payload)
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to create scheme')
    }
  } catch (error) {
    console.error('Error creating scheme:', error)
    throw error
  }
}

/**
 * Update a scheme (admin only)
 * PATCH /api/schemes/:id/
 */
export async function updateScheme(id, payload) {
  try {
    const response = await apiClient.patch(`/schemes/${id}/`, payload)
    if (response.data.success) {
      return true
    } else {
      throw new Error(response.data.error?.message || 'Failed to update scheme')
    }
  } catch (error) {
    console.error(`Error updating scheme ${id}:`, error)
    throw error
  }
}

/**
 * Delete a scheme (admin only)
 * DELETE /api/schemes/:id/
 */
export async function deleteScheme(id) {
  try {
    const response = await apiClient.delete(`/schemes/${id}/`)
    if (response.data.success) {
      return true
    } else {
      throw new Error(response.data.error?.message || 'Failed to delete scheme')
    }
  } catch (error) {
    console.error(`Error deleting scheme ${id}:`, error)
    throw error
  }
}

/**
 * Run verification scorer for a scheme
 * POST /api/schemes/:id/verify/
 */
export async function verifyScheme(id) {
  try {
    const response = await apiClient.post(`/schemes/${id}/verify/`)
    if (response.data.success) {
      return response.data.data // { risk_score, label, signals, ... }
    } else {
      throw new Error(response.data.error?.message || 'Failed to verify scheme')
    }
  } catch (error) {
    console.error(`Error verifying scheme ${id}:`, error)
    throw error
  }
}

/**
 * Verify arbitrary message text using same rules+ML as scheme verify
 * POST /api/schemes/verify_message/
 */
export async function verifyMessage({ text, source_url = '' }) {
  try {
    const response = await apiClient.post('/schemes/verify_message/', { text, source_url })
    if (response.data.success) {
      return response.data.data // { risk_score, label, signals, ... }
    } else {
      throw new Error(response.data.error?.message || 'Failed to verify message')
    }
  } catch (error) {
    console.error('Error verifying message:', error)
    throw error
  }
}

/**
 * Admin: override verification label
 * POST /api/schemes/:id/verify/mark/
 */
export async function markSchemeVerification(id, label) {
  try {
    const response = await apiClient.post(`/schemes/${id}/verify/mark/`, { label })
    if (response.data.success) {
      return true
    } else {
      throw new Error(response.data.error?.message || 'Failed to mark verification')
    }
  } catch (error) {
    console.error(`Error marking verification for ${id}:`, error)
    throw error
  }
}
