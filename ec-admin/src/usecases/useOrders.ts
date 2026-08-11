import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../services/api'
import type { OrderStatus } from '../services/types'

/** Hook to fetch admin order list with optional pagination/status filter. */
export const useOrders = (params?: { page?: number; take?: number; status?: OrderStatus }) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => apiClient.getOrders(params),
    staleTime: 5 * 60 * 1000,
  })
}
