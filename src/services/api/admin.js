// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/admin/users/, /api/admin/users/{id}/, /api/admin/stats/

import apiClient from '../apiClient'

/**
 * Fetch all users (admin only)
 * GET /api/admin/users/
 */
export async function getUsers() {
  try {
    const response = await apiClient.get('/admin/users/')
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch users')
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

/**
 * Update user status (activate/deactivate)
 * PATCH /api/admin/users/{id}/
 */
export async function updateUserStatus(userId, isActive) {
  try {
    const response = await apiClient.patch(`/admin/users/${userId}/`, { is_active: isActive })
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to update user status')
    }
  } catch (error) {
    console.error('Error updating user status:', error)
    throw error
  }
}

/**
 * Delete a user
 * DELETE /api/admin/users/{id}/
 */
export async function deleteUser(userId) {
  try {
    const response = await apiClient.delete(`/admin/users/${userId}/`)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to delete user')
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

/**
 * Fetch admin dashboard stats
 * GET /api/admin/stats/
 */
export async function getStats() {
  try {
    const response = await apiClient.get('/admin/stats/')
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch admin stats')
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    throw error
  }
}
