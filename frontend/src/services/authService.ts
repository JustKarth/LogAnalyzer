import apiClient from './api'
import mockApi from './mockApi'

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    username: string
    role: 'admin' | 'analyst' | 'auditor'
    created_at: string
  }
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    if (apiClient.isMock) {
      return mockApi.auth.login(credentials.username, credentials.password)
    }
    const response = await apiClient.instance.post<AuthResponse>('/api/v1/auth/login', credentials)
    return response.data
  },

  logout: async (): Promise<void> => {
    if (apiClient.isMock) {
      await mockApi.auth.logout()
      return
    }
    await apiClient.instance.post('/api/v1/auth/logout')
  },

  getCurrentUser: async () => {
    if (apiClient.isMock) {
      return mockApi.auth.getCurrentUser()
    }
    const response = await apiClient.instance.get('/api/v1/auth/me')
    return response.data
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.instance.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response.data
  },
}