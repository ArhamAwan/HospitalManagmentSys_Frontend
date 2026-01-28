import { apiClient } from './client'
import type { LoginCredentials, AuthResponse, User } from '@/types/user'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },
}
