import type { Order, OrderStatus, PaginatedResponse } from './types'
import { ApiClient } from './base-client'

export class OrdersApi extends ApiClient {
  async getOrders(params?: {
    page?: number
    take?: number
    status?: OrderStatus
  }): Promise<PaginatedResponse<Order>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.take) searchParams.set('take', String(params.take))
    if (params?.status) searchParams.set('status', params.status)

    const query = searchParams.toString()
    return this.request<PaginatedResponse<Order>>(
      `/order/admin${query ? `?${query}` : ''}`
    )
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.request<Order>(`/order/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }
}
