export class ApiClient {
  protected baseUrl: string

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  protected async request<T>(
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
}

export default ApiClient
