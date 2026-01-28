import { useEffect, useState, useCallback } from 'react'
import { socket } from '@/utils/socket'

type Handler = (payload: unknown) => void

export function useSocket() {
  const [connected, setConnected] = useState(socket.connected)

  useEffect(() => {
    const on = () => setConnected(true)
    const off = () => setConnected(false)
    socket.on('connect', on)
    socket.on('disconnect', off)
    setConnected(socket.connected)
    return () => {
      socket.off('connect', on)
      socket.off('disconnect', off)
    }
  }, [])

  const subscribe = useCallback((event: string, handler: Handler) => {
    socket.on(event, handler)
    return () => {
      socket.off(event, handler)
    }
  }, [])

  return { connected, subscribe, socket }
}
