import { fetchClient } from '@/module/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface AddressResponse {
  id: number
  label: string
  address: string
  description?: string
  latitude?: number
  longitude?: number
  userId: number
  createdAt: string
  updatedAt: string
}

export interface SaveAddressPayload {
  userId: number
  label: string
  address: string
  description?: string
  latitude?: number
  longitude?: number
}

export const useGetAddress = (userId: number | undefined) =>
  useQuery<AddressResponse | null>({
    queryKey: ['address', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data } = await fetchClient.GET('/user/address/{userId}' as any, {
        params: { path: { userId: String(userId) } },
      } as any)
      return (data as any) ?? null
    },
    enabled: !!userId,
  })

export const useSaveAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: SaveAddressPayload) => {
      const { data } = await fetchClient.POST('/user/address' as any, {
        body: payload,
      } as any)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['address'] })
    },
  })
}
