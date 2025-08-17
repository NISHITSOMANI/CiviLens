// Assumptions:
// - Using @tanstack/react-query for data fetching and caching
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token

import { QueryClient } from '@tanstack/react-query'
import * as documentsApi from './api/documents'
import * as complaintsApi from './api/complaints'
import * as discussionsApi from './api/discussions'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Set query client references for cache invalidation
documentsApi.setQueryClient(queryClient)
complaintsApi.setQueryClient(queryClient)
discussionsApi.setQueryClient(queryClient)

export default queryClient
