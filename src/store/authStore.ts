import { create } from 'zustand'
import type { User } from '@/types/user'

const TOKEN_KEY = 'hospital_auth_token'
const USER_KEY = 'hospital_auth_user'

interface AuthState {
  user: User | null
  token: string | null
  isInitialized: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  setInitialized: (value: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  isInitialized: false,

  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
    set({ token, user })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
    set({ token: null, user: null })
  },

  setInitialized: (value) => set({ isInitialized: value }),
}))

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}
