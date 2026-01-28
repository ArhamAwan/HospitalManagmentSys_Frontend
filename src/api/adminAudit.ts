import { apiClient } from './client'

export interface AdminAuditLog {
  id: string
  userId: string
  userUsername: string
  actorId?: string | null
  actorUsername?: string | null
  action: string
  details?: Record<string, unknown> | null
  createdAt: string
}

export interface AdminAuditResponse {
  total: number
  page: number
  pageSize: number
  items: AdminAuditLog[]
}

export const adminAuditApi = {
  list: async (params?: { page?: number; pageSize?: number; action?: string }): Promise<AdminAuditResponse> => {
    const { data } = await apiClient.get<AdminAuditResponse>('/admin/audit-logs', {
      params,
    })
    return data
  },
}

