import { apiClient } from './client'
import type { Visit, CreateVisitDto } from '@/types/visit'

export const visitsApi = {
  create: async (dto: CreateVisitDto): Promise<Visit> => {
    const { data } = await apiClient.post<Visit>('/visits', dto)
    return data
  },

  getById: async (id: string): Promise<Visit> => {
    const { data } = await apiClient.get<Visit>(`/visits/${id}`)
    return data
  },

  callNext: async (id: string): Promise<Visit> => {
    const { data } = await apiClient.patch<Visit>(`/visits/${id}/call`)
    return data
  },

  getToday: async (): Promise<Visit[]> => {
    const { data } = await apiClient.get<Visit[]>('/visits/today')
    return data
  },
}
