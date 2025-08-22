// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/regions/, /api/regions/:id/, /api/regions/:id/metrics/

import apiClient from '../apiClient'

export async function listRegions() {
  const response = await apiClient.get('/regions/')
  if (response.data?.success) {
    return response.data.data
  }
  throw new Error(response.data?.error?.message || 'Failed to fetch regions')
}

export async function getRegion(id) {
  try {
    const response = await apiClient.get(`/regions/${id}/`)
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch region')
    }
  } catch (error) {
    console.error(`Error fetching region ${id}:`, error)
    throw error
  }
}

export async function getRegionMetrics(id) {
  try {
    const response = await apiClient.get(`/regions/${id}/metrics/`)
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch region metrics')
    }
  } catch (error) {
    console.error(`Error fetching metrics for region ${id}:`, error)
    throw error
  }
}