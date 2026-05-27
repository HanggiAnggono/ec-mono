interface ProductCategory {
  id: number
  name: string
  description: string
  imageUrl?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  products?: any[]
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:3000') {
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
}

export const apiClient = new ApiClient()
export default ApiClient