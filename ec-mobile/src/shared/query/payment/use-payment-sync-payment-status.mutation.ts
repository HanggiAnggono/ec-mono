import { fetchClient } from '@/module/core'
import { GetPaymentDto } from '@/shared/types/api'
import { useMutation } from '@tanstack/react-query'

export const usePaymentSyncPaymentStatus = () => {
  return useMutation({
    mutationKey: ['payment', 'sync-status'],
    mutationFn: async (orderId: string) => {
      const { data, error } = await fetchClient.GET(
        '/payment/{orderId}/sync' as never,
        {
          params: { path: { orderId } },
        } as never
      )

      if (error) {
        throw error
      }

      return data as GetPaymentDto
    },
  })
}
