import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token ?? localStorage.getItem('hospital_auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Handle network errors (connection refused, etc.)
    if (!err.response && err.code === 'ERR_NETWORK') {
      console.error('Network error: Backend server may be unavailable', err)
      // Don't redirect on network errors - let components handle it
      return Promise.reject(err)
    }
    
    // Handle 401 Unauthorized
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.replace('/login')
    }
    return Promise.reject(err)
  }
)
