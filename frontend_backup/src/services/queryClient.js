import { QueryClient } from '@tanstack/react-query';

// Create and export react-query QueryClient with global default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
    },
  },
});
