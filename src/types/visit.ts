import type { Patient } from './patient'

export type ProcedureStatus = 'REQUESTED' | 'COMPLETED'

export interface ProcedureSummary {
  id: string
  code: string
  name: string
  department?: string | null
  defaultFee: number
}

export interface ProcedureOrder {
  id: string
  visitId: string
  procedureId: string
  procedure: ProcedureSummary
  notes?: string | null
  status: ProcedureStatus
  createdAt: string
}

export interface PrescriptionMedicine {
  id: string
  prescriptionId: string
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface Prescription {
  id: string
  visitId: string
  diagnosis?: string
  clinicalNotes?: string
  medicines: PrescriptionMedicine[]
  createdAt: string
}

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
  prescription?: Prescription
  procedureOrders?: ProcedureOrder[]
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
