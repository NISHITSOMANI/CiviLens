// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/chat/

import apiClient from '../apiClient'

export const getMessages = async () => {
  try {
    const res = await apiClient.get('/chat/messages/')
    if (res?.data?.success) return res.data.data
    throw new Error(res?.data?.error?.message || 'Failed to load messages')
  } catch (err) {
    const status = err?.response?.status
    // If unauthorized (e.g., token lost after a refresh), don't blow away local UI
    if (status === 401) return []
    throw err
  }
}

/**
 * Get distinct scheme categories for Quick Ask chips
 * GET /api/chat/categories/
 */
export const getCategories = async () => {
  const res = await apiClient.get('/chat/categories/')
  if (res?.data?.success) return res.data.data || []
  return []
}

/**
 * Send a message to the chatbot
 * POST /api/chat/
 */
export async function sendMessage(messageData) {
  try {
    const response = await apiClient.post('/chat/', messageData)
    // Return data directly if success, otherwise throw error
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to send message')
    }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}
