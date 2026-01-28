import { apiClient } from './client'

export interface DailyVisitsDoctor {
  id: string
  name: string
  count: number
}

export interface DailyVisitsReport {
  total: number
  byStatus: Record<string, number>
  byDoctor: DailyVisitsDoctor[]
}

export interface BillingDoctor {
  id: string
  name: string
  amount: number
}

export interface BillingSummaryReport {
  totalAmount: number
  byType: Record<string, number>
  byDoctor: BillingDoctor[]
}

export interface QueueDoctorStats {
  id: string
  name: string
  totalVisits: number
  avgWaitingMinutes: number
  maxQueue: number
  currentQueue: number
}

export interface QueueStatsReport {
  avgWaitingMinutes: number
  maxQueue: number
  doctors: QueueDoctorStats[]
}

export interface TotalPatientsReport {
  totalPatients: number
}

export const reportsApi = {
  getDailyVisits: async (date: string): Promise<DailyVisitsReport> => {
    const { data } = await apiClient.get<DailyVisitsReport>('/reports/daily-visits', {
      params: { date },
    })
    return data
  },

  getBillingSummary: async (from: string, to: string): Promise<BillingSummaryReport> => {
    const { data } = await apiClient.get<BillingSummaryReport>('/reports/billing-summary', {
      params: { from, to },
    })
    return data
  },

  getQueueStats: async (date: string): Promise<QueueStatsReport> => {
    const { data } = await apiClient.get<QueueStatsReport>('/reports/queue-stats', {
      params: { date },
    })
    return data
  },

  getTotalPatients: async (): Promise<TotalPatientsReport> => {
    const { data } = await apiClient.get<TotalPatientsReport>('/reports/total-patients')
    return data
  },
}

