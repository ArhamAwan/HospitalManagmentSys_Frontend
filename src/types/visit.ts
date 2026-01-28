import type { Patient } from './patient'

export type VisitStatus = 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED'

export interface Doctor {
  id: string
  name: string
  specialization: string
  consultationFee: number
  roomNumber: string
}

export interface Visit {
  id: string
  patientId: string
  doctorId: string
  tokenNumber: number
  visitDate: string
  status: VisitStatus
  isEmergency: boolean
  consultationFee: number
  patient?: Patient
  doctor?: Doctor
}

export interface QueueItem {
  visit: Visit
  patient: Patient
  timeWaiting: number
}

export interface CreateVisitDto {
  patientId: string
  doctorId: string
  isEmergency?: boolean
}
