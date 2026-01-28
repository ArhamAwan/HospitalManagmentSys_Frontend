import { apiClient } from './client'
import type { Prescription } from '@/types/visit'

export interface MedicineInput {
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface CreatePrescriptionDto {
  visitId: string
  diagnosis?: string
  clinicalNotes?: string
  medicines: MedicineInput[]
}

export const prescriptionsApi = {
  create: async (dto: CreatePrescriptionDto): Promise<Prescription> => {
    const { data } = await apiClient.post<Prescription>('/prescriptions', dto)
    return data
  },

  getById: async (id: string): Promise<Prescription> => {
    const { data } = await apiClient.get<Prescription>(`/prescriptions/${id}`)
    return data
  },

  getForVisit: async (visitId: string): Promise<Prescription | null> => {
    const { data } = await apiClient.get<Prescription | null>('/prescriptions', {
      params: { visitId },
    })
    return data
  },
}

