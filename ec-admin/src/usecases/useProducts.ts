import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../services/api'

/** Hook to fetch product list with optional pagination params. */
export const useProducts = (params?: { page?: number; take?: number; name?: string }) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => apiClient.getProducts(params),
    staleTime: 5 * 60 * 1000,
  })
}

