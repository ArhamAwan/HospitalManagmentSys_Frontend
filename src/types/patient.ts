export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export interface Patient {
  id: string
  patientId: string
  name: string
  age: number
  gender: Gender
  phone: string
  address?: string
  createdAt: string
}

export interface CreatePatientDto {
  name: string
  age: number
  gender: Gender
  phone: string
  address?: string
}
