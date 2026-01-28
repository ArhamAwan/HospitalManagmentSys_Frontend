import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { doctorsApi } from '@/api/doctors'
import { useSocket } from '@/hooks/useSocket'
import type { Doctor } from '@/types/visit'

export interface DoctorDisplay {
  doctor: Doctor
  currentToken: number | null
  isEmergency: boolean
}

export function useWaitingDisplay() {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [tokenMap, setTokenMap] = useState<Record<string, { token: number; emergency: boolean }>>({})
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsApi.getAll(),
  })
  const { connected, subscribe } = useSocket()

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const unsubUpdate = subscribe('queue:update', (p: unknown) => {
      const payload = p as { doctorId?: string; currentToken?: number }
      if (payload.doctorId != null) {
        setTokenMap((m) => ({
          ...m,
          [payload.doctorId!]: {
            token: payload.currentToken ?? m[payload.doctorId!]?.token ?? 0,
            emergency: m[payload.doctorId!]?.emergency ?? false,
          },
        }))
      }
    })
    const unsubEmergency = subscribe('emergency:active', (p: unknown) => {
      const payload = p as { doctorId?: string; isActive?: boolean }
      if (payload.doctorId != null) {
        setTokenMap((m) => ({
          ...m,
          [payload.doctorId!]: {
            token: m[payload.doctorId!]?.token ?? 0,
            emergency: payload.isActive ?? false,
          },
        }))
      }
    })
    return () => {
      unsubUpdate()
      unsubEmergency()
    }
  }, [subscribe])

  const displays: DoctorDisplay[] = doctors.map((d) => ({
    doctor: d,
    currentToken: tokenMap[d.id]?.token ?? null,
    isEmergency: tokenMap[d.id]?.emergency ?? false,
  }))

  return { doctors: displays, connected, currentTime, isLoading }
}
