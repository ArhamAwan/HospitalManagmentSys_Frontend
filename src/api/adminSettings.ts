import { apiClient } from './client'

export interface AdminSettings {
  tokenResetTime: string
  emergencyProtocolEnabled: boolean
}

export const adminSettingsApi = {
  get: async (): Promise<AdminSettings> => {
    const { data } = await apiClient.get<AdminSettings>('/admin/settings')
    return data
  },

  update: async (settings: Partial<AdminSettings>): Promise<AdminSettings> => {
    const { data } = await apiClient.put<AdminSettings>('/admin/settings', settings)
    return data
  },
}

