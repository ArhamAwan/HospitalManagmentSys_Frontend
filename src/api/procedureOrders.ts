import { apiClient } from './client'
import type { ProcedureOrder } from '@/types/visit'

export interface CreateProcedureOrderDto {
  visitId: string
  procedureId: string
  notes?: string
}

export type ProcedureStatus = 'REQUESTED' | 'COMPLETED'

export const procedureOrdersApi = {
  listForVisit: async (visitId: string): Promise<ProcedureOrder[]> => {
    const { data } = await apiClient.get<ProcedureOrder[]>(`/procedure-orders/visit/${visitId}`)
    return data
  },

  listOngoing: async (): Promise<ProcedureOrder[]> => {
    const { data } = await apiClient.get<ProcedureOrder[]>('/procedure-orders/ongoing')
    return data
  },

  listRequested: async (): Promise<ProcedureOrder[]> => {
    const { data } = await apiClient.get<ProcedureOrder[]>('/procedure-orders/requested')
    return data
  },

  create: async (dto: CreateProcedureOrderDto): Promise<ProcedureOrder> => {
    const { data } = await apiClient.post<ProcedureOrder>('/procedure-orders', dto)
    return data
  },

  updateStatus: async (id: string, status: ProcedureStatus): Promise<ProcedureOrder> => {
    const { data } = await apiClient.patch<ProcedureOrder>(`/procedure-orders/${id}/status`, {
      status,
    })
    return data
  },

  startProcedure: async (id: string): Promise<ProcedureOrder> => {
    const { data } = await apiClient.patch<ProcedureOrder>(`/procedure-orders/${id}/start`)
    return data
  },

  completeProcedure: async (id: string): Promise<ProcedureOrder> => {
    const { data } = await apiClient.patch<ProcedureOrder>(`/procedure-orders/${id}/complete`)
    return data
  },
}

