import { fetchClient } from '@/module/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface AddressResponse {
  id: number
  label: string
  address: string
  description?: string
  latitude?: number
  longitude?: number
  createdAt: string
  updatedAt: string
}

export interface CreateAddressPayload {
  userId: number
  label: string
  address: string
  description?: string
  latitude?: number
  longitude?: number
}

export interface UpdateAddressPayload {
  label?: string
  address?: string
  description?: string
  latitude?: number
  longitude?: number
}

export const useGetAddresses = (userId: number | undefined) =>
  useQuery<AddressResponse[]>({
    queryKey: ['addresses', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await fetchClient.GET(
        '/user/addresses/{userId}' as any,
        { params: { path: { userId: String(userId) } } } as any,
      )
      if (error) throw error
      return (data as any) ?? []
    },
    enabled: !!userId,
  })

export const useCreateAddress = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateAddressPayload) => {
      const { data, error } = await fetchClient.POST(
        '/user/addresses' as any,
        { body: payload } as any,
      )
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  })
}

export const useUpdateAddress = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateAddressPayload & { id: number }) => {
      const { data, error } = await fetchClient.PATCH(
        '/user/addresses/{id}' as any,
        { params: { path: { id: String(id) } }, body: payload } as any,
      )
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  })
}

export const useDeleteAddress = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await fetchClient.DELETE(
        '/user/addresses/{id}' as any,
        { params: { path: { id: String(id) } } } as any,
      )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  })
}
