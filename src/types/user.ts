export type UserRole = 'ADMIN' | 'RECEPTION' | 'DOCTOR' | 'NURSE' | 'DISPLAY'

export interface User {
  id: string
  username: string
  role: UserRole
  doctorId?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}
