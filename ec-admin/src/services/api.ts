// Re-export all types and modular APIs from index for backward compatibility
export * from './index'
export { default as ApiClient } from './base-client'

// Create a combined API client for backward compatibility
import { ApiClient as BaseApiClient } from './base-client'
import { ProductCategoryApi } from './product-category.api'
import { ProductsApi } from './products.api'
import { VariantsApi } from './variants.api'

class CombinedApiClient extends BaseApiClient {
  productCategoryApi: ProductCategoryApi
  productsApi: ProductsApi
  variantsApi: VariantsApi

  constructor(baseUrl?: string) {
    super(baseUrl)
    this.productCategoryApi = new ProductCategoryApi()
    this.productsApi = new ProductsApi()
    this.variantsApi = new VariantsApi()
  }

  // Product Category APIs (for backward compatibility)
  async getCategories() {
    return this.productCategoryApi.getCategories()
  }

  async getCategory(id: number) {
    return this.productCategoryApi.getCategory(id)
  }

  async createCategory(data: { name: string; description: string }) {
    return this.productCategoryApi.createCategory(data)
  }

  async updateCategory(id: number, data: { name?: string; description?: string }) {
    return this.productCategoryApi.updateCategory(id, data)
  }

  async deleteCategory(id: number) {
    return this.productCategoryApi.deleteCategory(id)
  }

  // Product APIs (for backward compatibility)
  async getProducts(params?: { page?: number; take?: number; name?: string }) {
    return this.productsApi.getProducts(params)
  }

  async getProduct(id: number) {
    return this.productsApi.getProduct(id)
  }

  async createProduct(data: { name: string; description?: string; categoryId?: number }) {
    return this.productsApi.createProduct(data)
  }

  async updateProduct(id: number, data: { name?: string; description?: string; categoryId?: number }) {
    return this.productsApi.updateProduct(id, data)
  }

  async deleteProduct(id: number) {
    return this.productsApi.deleteProduct(id)
  }

  // Variant APIs (for backward compatibility)
  async addVariants(productId: number, variants: { name: string; price: number }[]) {
    return this.variantsApi.addVariants(productId, variants)
  }

  async updateVariant(variantId: number, data: { name: string; price: number }) {
    return this.variantsApi.updateVariant(variantId, data)
  }

  async deleteVariant(variantId: number) {
    return this.variantsApi.deleteVariant(variantId)
  }
}

export const apiClient = new CombinedApiClient()
export { apiClient as default }
