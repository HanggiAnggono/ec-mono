import type { Product, PaginatedResponse } from './types'
import { ApiClient } from './base-client'

export class ProductsApi extends ApiClient {
  async getProducts(params?: {
    page?: number
    take?: number
    name?: string
  }): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.take) searchParams.set('take', String(params.take))
    if (params?.name) searchParams.set('name', params.name)

    const query = searchParams.toString()
    return this.request<PaginatedResponse<Product>>(
      `/products${query ? `?${query}` : ''}`
    )
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`)
  }

  async createProduct(data: {
    name: string
    description?: string
    categoryId?: number
  }): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProduct(
    id: number,
    data: {
      name?: string
      description?: string
      categoryId?: number
    }
  ): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    })
  }
}
