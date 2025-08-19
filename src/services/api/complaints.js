// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/complaints/, /api/complaints/:id/, /api/complaints/heatmap/

import apiClient from '../apiClient'

let queryClientRef = null

export function setQueryClient(queryClient) {
  queryClientRef = queryClient
}

/**
 * Create a new complaint
 * POST /api/complaints/
 */
export async function createComplaint(complaintData) {
  try {
    const isFormData = typeof FormData !== 'undefined' && complaintData instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
    const response = await apiClient.post('/complaints/', complaintData, config)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      // Invalidate complaints query cache after successful creation
      if (queryClientRef) {
        queryClientRef.invalidateQueries({ queryKey: ['complaints'] })
      }
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to create complaint')
    }
  } catch (error) {
    console.error('Error creating complaint:', error)
    throw error
  }
}

/**
 * Fetch list of complaints
 * GET /api/complaints/
 */
export async function listComplaints(params) {
  try {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : ''
    const response = await apiClient.get(`/complaints/${qs}`)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch complaints')
    }
  } catch (error) {
    console.error('Error fetching complaints:', error)
    throw error
  }
}

/**
 * Fetch details of a specific complaint
 * GET /api/complaints/:id/
 */
export async function getComplaint(id) {
  try {
    const response = await apiClient.get(`/complaints/${id}/`)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch complaint')
    }
  } catch (error) {
    console.error(`Error fetching complaint ${id}:`, error)
    throw error
  }
}

/**
 * Update a specific complaint
 * PATCH /api/complaints/:id/
 */
export async function updateComplaint(id, updateData) {
  try {
    const response = await apiClient.patch(`/complaints/${id}/`, updateData)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      // Invalidate complaints query cache after successful update
      if (queryClientRef) {
        queryClientRef.invalidateQueries({ queryKey: ['complaints'] })
      }
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to update complaint')
    }
  } catch (error) {
    console.error(`Error updating complaint ${id}:`, error)
    throw error
  }
}

/**
 * Upvote a specific complaint (one upvote per user enforced server-side)
 * POST /api/complaints/:id/upvote/
 */
export async function upvoteComplaint(id) {
  try {
    const response = await apiClient.post(`/complaints/${id}/upvote/`)
    if (response.data.success) {
      // Invalidate caches so UI updates counts and sorting
      if (queryClientRef) {
        queryClientRef.invalidateQueries({ queryKey: ['complaints'] })
        queryClientRef.invalidateQueries({ queryKey: ['complaint', id] })
      }
      return response.data.data // { upvotes, already_upvoted }
    } else {
      throw new Error(response.data.error?.message || 'Failed to upvote complaint')
    }
  } catch (error) {
    console.error(`Error upvoting complaint ${id}:`, error)
    throw error
  }
}

/**
 * Fetch complaint heatmap data
 * GET /api/complaints/heatmap/
 */
export async function heatmap(params) {
  try {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : ''
    const response = await apiClient.get(`/complaints/heatmap/${qs}`)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch heatmap data')
    }
  } catch (error) {
    console.error('Error fetching heatmap data:', error)
    throw error
  }
}
