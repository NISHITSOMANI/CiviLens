// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/regions/, /api/regions/:id/, /api/regions/:id/metrics/

import apiClient from '../apiClient'

export async function listRegions() {
  // Return a static list of Indian states and union territories
  return [
    { id: 1, name: 'Andhra Pradesh' },
    { id: 2, name: 'Arunachal Pradesh' },
    { id: 3, name: 'Assam' },
    { id: 4, name: 'Bihar' },
    { id: 5, name: 'Chhattisgarh' },
    { id: 6, name: 'Goa' },
    { id: 7, name: 'Gujarat' },
    { id: 8, name: 'Haryana' },
    { id: 9, name: 'Himachal Pradesh' },
    { id: 10, name: 'Jharkhand' },
    { id: 11, name: 'Karnataka' },
    { id: 12, name: 'Kerala' },
    { id: 13, name: 'Madhya Pradesh' },
    { id: 14, name: 'Maharashtra' },
    { id: 15, name: 'Manipur' },
    { id: 16, name: 'Meghalaya' },
    { id: 17, name: 'Mizoram' },
    { id: 18, name: 'Nagaland' },
    { id: 19, name: 'Odisha' },
    { id: 20, name: 'Punjab' },
    { id: 21, name: 'Rajasthan' },
    { id: 22, name: 'Sikkim' },
    { id: 23, name: 'Tamil Nadu' },
    { id: 24, name: 'Telangana' },
    { id: 25, name: 'Tripura' },
    { id: 26, name: 'Uttar Pradesh' },
    { id: 27, name: 'Uttarakhand' },
    { id: 28, name: 'West Bengal' },
    { id: 29, name: 'Andaman and Nicobar Islands' },
    { id: 30, name: 'Chandigarh' },
    { id: 31, name: 'Dadra and Nagar Haveli and Daman and Diu' },
    { id: 32, name: 'Delhi' },
    { id: 33, name: 'Jammu and Kashmir' },
    { id: 34, name: 'Ladakh' },
    { id: 35, name: 'Lakshadweep' },
    { id: 36, name: 'Puducherry' }
  ];
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