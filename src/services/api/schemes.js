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
