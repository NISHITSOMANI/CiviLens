// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/chat/

import apiClient from '../apiClient'

let queryClientRef = null

export function setQueryClient(queryClient) {
  queryClientRef = queryClient
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
      // Invalidate chat query cache after successful message send
      if (queryClientRef) {
        queryClientRef.invalidateQueries({ queryKey: ['chat'] })
      }
      return response.data.data
    } else {
      throw new Error(response.data.error?.message || 'Failed to send message')
    }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}
