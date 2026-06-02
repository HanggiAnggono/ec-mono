import type { Product } from './types'
import { ApiClient } from './base-client'

export class VariantsApi extends ApiClient {
  async addVariants(
    productId: number,
    variants: { name: string; price: number }[]
  ): Promise<Product> {
    return this.request<Product>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variants),
    })
  }

  async updateVariant(
    variantId: number,
    data: { name: string; price: number }
  ): Promise<void> {
    return this.request(`/products/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteVariant(variantId: number): Promise<void> {
    return this.request(`/products/variants/${variantId}`, {
      method: 'DELETE',
    })
  }
}
