export interface ProductCategory {
  id: number
  name: string
  description: string
  products?: unknown[]
}

export interface Product {
  id: number
  name: string
  description: string
  category: {
    id: number
    name: string
    description: string
  }
  categoryId?: number
  variants?: Variant[]
}

export interface Variant {
  id: number
  name: string
  price: number
  stock_quantity: number
}

export interface PaginatedResponse<T> {
  data: T[]
  totalPage: number
  totalRecords: number
  limit: number
  page: number
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
        error: 'Unknown error',
      }))
      throw new Error(error.message || error.error || 'API request failed')
    }

    return response.json()
  }

  // Product Category APIs
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

  // Variant APIs
  async addVariants(productId: number, variants: { name: string; price: number }[]): Promise<Product> {
    return this.request<Product>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variants),
    })
  }

  async updateVariant(variantId: number, data: { name: string; price: number }): Promise<void> {
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

export const apiClient = new ApiClient()
export default ApiClient
