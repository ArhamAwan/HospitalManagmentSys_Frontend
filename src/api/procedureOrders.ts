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
}

