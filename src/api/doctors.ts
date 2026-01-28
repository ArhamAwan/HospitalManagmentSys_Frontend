import { apiClient } from './client'
import type { Doctor } from '@/types/visit'
import type { QueueItem } from '@/types/visit'

export const doctorsApi = {
  getAll: async (): Promise<Doctor[]> => {
    const { data } = await apiClient.get<Doctor[]>('/doctors')
    return data
  },

  getQueue: async (id: string): Promise<QueueItem[]> => {
    const { data } = await apiClient.get<QueueItem[]>(`/doctors/${id}/queue`)
    return data
  },
}
