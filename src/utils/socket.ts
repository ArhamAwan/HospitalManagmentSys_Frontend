import { io } from 'socket.io-client'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const wsUrl = import.meta.env.VITE_WS_URL ?? apiUrl.replace(/\/api\/?$/, '')

export const socket = io(wsUrl, {
  path: '/socket.io',
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

export function connectSocket() {
  if (!socket.connected) socket.connect()
}

export function disconnectSocket() {
  socket.disconnect()
}
