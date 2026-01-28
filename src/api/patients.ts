import { apiClient } from './client'
import type { Patient, CreatePatientDto } from '@/types/patient'
import type { Visit } from '@/types/visit'

export const patientsApi = {
  create: async (data: CreatePatientDto): Promise<Patient> => {
    const { data: res } = await apiClient.post<Patient>('/patients', data)
    return res
  },

  search: async (query: string): Promise<Patient[]> => {
    const { data } = await apiClient.get<Patient[]>('/patients/search', {
      params: { q: query },
    })
    return data
  },

  getById: async (id: string): Promise<Patient> => {
    const { data } = await apiClient.get<Patient>(`/patients/${id}`)
    return data
  },

  getHistory: async (id: string): Promise<Visit[]> => {
    const { data } = await apiClient.get<Visit[]>(`/patients/${id}/history`)
    return data
  },
}
