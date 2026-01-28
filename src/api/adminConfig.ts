import { apiClient } from './client'

export interface AdminDoctorConfig {
  id: string
  name: string
  specialization: string
  consultationFee: number
  roomNumber: string
  userId: string
}

export interface AdminRoom {
  id: string
  code: string
  name: string
  floor?: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
  createdAt: string
}

export interface AdminProcedure {
  id: string
  code: string
  name: string
  department?: string | null
  defaultFee: number
  createdAt: string
}

export interface CreateRoomDto {
  code?: string
  name: string
  floor?: string
}

export interface UpdateRoomDto {
  code?: string
  name?: string
  floor?: string
  status?: AdminRoom['status']
}

export interface CreateProcedureDto {
  code?: string
  name: string
  department?: string
  defaultFee: number
}

export interface UpdateProcedureDto {
  code?: string
  name?: string
  department?: string
  defaultFee?: number
}

export interface UpdateDoctorConfigDto {
  name?: string
  specialization?: string
  consultationFee?: number
  roomNumber?: string
}

export const adminConfigApi = {
  listDoctors: async (): Promise<AdminDoctorConfig[]> => {
    const { data } = await apiClient.get<AdminDoctorConfig[]>('/admin/config/doctors')
    return data
  },

  updateDoctor: async (id: string, dto: UpdateDoctorConfigDto): Promise<AdminDoctorConfig> => {
    const { data } = await apiClient.patch<AdminDoctorConfig>(`/admin/config/doctors/${id}`, dto)
    return data
  },

  listRooms: async (): Promise<AdminRoom[]> => {
    const { data } = await apiClient.get<AdminRoom[]>('/admin/config/rooms')
    return data
  },

  createRoom: async (dto: CreateRoomDto): Promise<AdminRoom> => {
    const { data } = await apiClient.post<AdminRoom>('/admin/config/rooms', dto)
    return data
  },

  updateRoom: async (id: string, dto: UpdateRoomDto): Promise<AdminRoom> => {
    const { data } = await apiClient.patch<AdminRoom>(`/admin/config/rooms/${id}`, dto)
    return data
  },

  deleteRoom: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/config/rooms/${id}`)
  },

  listProcedures: async (): Promise<AdminProcedure[]> => {
    const { data } = await apiClient.get<AdminProcedure[]>('/admin/config/procedures')
    return data
  },

  createProcedure: async (dto: CreateProcedureDto): Promise<AdminProcedure> => {
    const { data } = await apiClient.post<AdminProcedure>('/admin/config/procedures', dto)
    return data
  },

  updateProcedure: async (id: string, dto: UpdateProcedureDto): Promise<AdminProcedure> => {
    const { data } = await apiClient.patch<AdminProcedure>(`/admin/config/procedures/${id}`, dto)
    return data
  },

  deleteProcedure: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/config/procedures/${id}`)
  },
}

