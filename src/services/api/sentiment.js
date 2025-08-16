// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/sentiment/overview/, /api/sentiment/trends/?scheme_id=&region=&start=&end=, /api/sentiment/regions/

import apiClient from '../apiClient'

/**
 * Fetch sentiment overview data
 * GET /api/sentiment/overview/
 */
export async function overview() {
  try {
    const response = await apiClient.get('/sentiment/overview/')
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch sentiment overview')
    }
  } catch (error) {
    console.error('Error fetching sentiment overview:', error)
    throw error
  }
}

/**
 * Fetch sentiment trends data
 * GET /api/sentiment/trends/?scheme_id=&region=&start=&end=
 */
export async function trends(params = {}) {
  try {
    const response = await apiClient.get('/sentiment/trends/', { params })
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch sentiment trends')
    }
  } catch (error) {
    console.error('Error fetching sentiment trends:', error)
    throw error
  }
}

/**
 * Fetch sentiment data by regions
 * GET /api/sentiment/regions/
 */
export async function regions() {
  try {
    const response = await apiClient.get('/sentiment/regions/')
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch sentiment by regions')
    }
  } catch (error) {
    console.error('Error fetching sentiment by regions:', error)
    throw error
  }
}
