import ApiClient from "./base-client"
import type { LoginResponse, User } from "./types"

export class AuthApi extends ApiClient {
  async login(data: Record<string, string>): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async signup(data: Record<string, string>): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/user/profile')
  }
}
