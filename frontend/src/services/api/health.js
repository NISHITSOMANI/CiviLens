// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/health/

import apiClient from '../apiClient'

/**
 * Check application health
 * GET /api/health/
 */
export async function checkHealth() {
  try {
    const response = await apiClient.get('/health/')
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Health check failed')
    }
  } catch (error) {
    console.error('Health check error:', error)
    throw error
  }
}
