import { apiClient } from './client'
import type { UserRole } from '@/types/user'

export type UserStatus = 'ACTIVE' | 'LOCKED' | 'DISABLED'

export interface AdminUser {
  id: string
  username: string
  role: UserRole
  status: UserStatus
  doctorName?: string | null
  createdAt: string
}

export interface CreateAdminUserDto {
  username: string
  password: string
  role: UserRole
}

export interface UpdateAdminUserDto {
  username?: string
  role?: UserRole
  status?: UserStatus
}

export const adminUsersApi = {
  list: async (): Promise<AdminUser[]> => {
    const { data } = await apiClient.get<AdminUser[]>('/admin/users')
    return data
  },

  create: async (dto: CreateAdminUserDto): Promise<AdminUser> => {
    const { data } = await apiClient.post<AdminUser>('/admin/users', dto)
    return data
  },

  update: async (id: string, dto: UpdateAdminUserDto): Promise<AdminUser> => {
    const { data } = await apiClient.patch<AdminUser>(`/admin/users/${id}`, dto)
    return data
  },

  resetPassword: async (id: string, password: string): Promise<void> => {
    await apiClient.post(`/admin/users/${id}/reset-password`, { password })
  },
}

