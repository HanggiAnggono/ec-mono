import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../services/api'

/**
 * Hook to fetch product categories using TanStack Query.
 * It delegates the actual HTTP request to the existing service API layer.
 * Returns the standard query result object containing data, loading state, and error.
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
    // Keep categories fresh for 5 minutes by default (matches QueryClient defaults)
    staleTime: 5 * 60 * 1000,
  })
}

