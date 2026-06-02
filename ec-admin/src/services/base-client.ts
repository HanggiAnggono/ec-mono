export class ApiClient {
  protected baseUrl: string

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  protected async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = localStorage.getItem('ec_admin_token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('ec_admin_token')
        localStorage.removeItem('ec_admin_user')
        window.dispatchEvent(new Event('auth_session_expired'))
      }
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
