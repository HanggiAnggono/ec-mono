import ApiClient from "./base-client"
import type { ProductCategory } from './types'

export class ProductCategoryApi extends ApiClient {
  async getCategories(): Promise<ProductCategory[]> {
    return this.request<ProductCategory[]>('/product-category')
  }

  async getCategory(id: number): Promise<ProductCategory> {
    return this.request<ProductCategory>(`/product-category/${id}`)
  }

  async createCategory(data: {
    name: string
    description: string
  }): Promise<ProductCategory> {
    return this.request<ProductCategory>('/product-category', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCategory(
    id: number,
    data: { name?: string; description?: string }
  ): Promise<void> {
    return this.request(`/product-category/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteCategory(id: number): Promise<void> {
    return this.request(`/product-category/${id}`, {
      method: 'DELETE',
    })
  }
}
