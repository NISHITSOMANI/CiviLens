// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/discussions/?limit=&offset=, /api/discussions/, /api/discussions/:id/, /api/discussions/:id/comments/

import apiClient from '../apiClient'

let queryClientRef = null

export function setQueryClient(queryClient) {
  queryClientRef = queryClient
}

/**
 * Fetch list of discussions with pagination
 * GET /api/discussions/?limit=&offset=
 */
export async function listDiscussions(params = {}) {
  try {
    const response = await apiClient.get('/discussions/', { params })
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch discussions')
    }
  } catch (error) {
    console.error('Error fetching discussions:', error)
    throw error
  }
}

/**
 * Create a new discussion
 * POST /api/discussions/
 */
export async function createDiscussion(discussionData) {
  try {
    const response = await apiClient.post('/discussions/', discussionData)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      // Invalidate discussions query cache after successful creation
      if (queryClientRef) {
        queryClientRef.invalidateQueries({ queryKey: ['discussions'] })
      }
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to create discussion')
    }
  } catch (error) {
    console.error('Error creating discussion:', error)
    throw error
  }
}

/**
 * Fetch details of a specific discussion
 * GET /api/discussions/:id/
 */
export async function getDiscussion(id) {
  try {
    const response = await apiClient.get(`/discussions/${id}/`)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch discussion')
    }
  } catch (error) {
    console.error(`Error fetching discussion ${id}:`, error)
    throw error
  }
}

/**
 * Add a comment to a specific discussion
 * POST /api/discussions/:id/comments/
 */
export async function addComment(discussionId, commentData) {
  try {
    const response = await apiClient.post(`/discussions/${discussionId}/comments/`, commentData)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      // Invalidate discussions query cache after successful comment addition
      if (queryClientRef) {
        queryClientRef.invalidateQueries({ queryKey: ['discussions'] })
      }
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to add comment')
    }
  } catch (error) {
    console.error(`Error adding comment to discussion ${discussionId}:`, error)
    throw error
  }
}
