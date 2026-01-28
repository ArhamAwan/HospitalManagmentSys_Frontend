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

  changePassword: async (payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.post('/auth/change-password', payload)
  },

  forgotPassword: async (payload: { username: string }): Promise<void> => {
    await apiClient.post('/auth/forgot-password', payload)
  },
}
