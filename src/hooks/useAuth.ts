import { useEffect, useCallback } from 'react'
import { useAuthStore, getStoredToken, getStoredUser } from '@/store/authStore'
import { authApi } from '@/api/auth'
import type { LoginCredentials, User } from '@/types/user'

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true'

function createMockUser(username: string): User {
  return {
    id: 'mock-1',
    username,
    role: 'ADMIN',
  }
}

export function useAuth() {
  const { user, token, isInitialized, setAuth, logout, setInitialized } = useAuthStore()

  const initAuth = useCallback(async () => {
    const stored = useAuthStore.getState().token ?? getStoredToken()
    if (!stored) {
      setInitialized(true)
      return
    }
    if (MOCK_AUTH) {
      const storedUser = getStoredUser()
      if (storedUser) {
        useAuthStore.setState({ user: storedUser })
      } else {
        useAuthStore.getState().logout()
      }
      setInitialized(true)
      return
    }
    try {
      const me = await authApi.getMe()
      useAuthStore.setState({ user: me })
    } catch {
      useAuthStore.getState().logout()
    } finally {
      setInitialized(true)
    }
  }, [setInitialized])

  useEffect(() => {
    initAuth()
  }, [initAuth])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      if (MOCK_AUTH) {
        const mockUser = createMockUser(credentials.username)
        const mockToken = `mock-token-${Date.now()}`
        setAuth(mockToken, mockUser)
        return { token: mockToken, user: mockUser }
      }
      const res = await authApi.login(credentials)
      setAuth(res.token, res.user)
      return res
    },
    [setAuth]
  )

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading: !isInitialized,
    login,
    logout,
  }
}
