import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doctorsApi } from '@/api/doctors'
import { visitsApi } from '@/api/visits'
import { useAuth } from '@/hooks/useAuth'
import { useSocket } from '@/hooks/useSocket'

export function useQueue(doctorIdOverride?: string) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const doctorId = doctorIdOverride ?? (user?.role === 'DOCTOR' ? user?.doctorId : undefined)

  const { connected, subscribe } = useSocket()

  const queueQuery = useQuery({
    queryKey: ['doctors', doctorId, 'queue'],
    queryFn: () => doctorsApi.getQueue(doctorId!),
    enabled: !!doctorId,
    refetchInterval: 30_000,
  })

  const callNext = useMutation({
    mutationFn: (visitId: string) => visitsApi.callNext(visitId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctors', doctorId, 'queue'] })
    },
  })

  useEffect(() => {
    if (!doctorId) return
    const unsubRefresh = subscribe('doctor:queue-refresh', (p: unknown) => {
      const payload = p as { doctorId?: string }
      if (!payload.doctorId || payload.doctorId === doctorId) {
        qc.invalidateQueries({ queryKey: ['doctors', doctorId, 'queue'] })
      }
    })
    const unsubUpdate = subscribe('queue:update', (p: unknown) => {
      const payload = p as { doctorId?: string }
      if (!payload.doctorId || payload.doctorId === doctorId) {
        qc.invalidateQueries({ queryKey: ['doctors', doctorId, 'queue'] })
      }
    })
    return () => {
      unsubRefresh()
      unsubUpdate()
    }
  }, [doctorId, subscribe, qc])

  return {
    queue: queueQuery.data ?? [],
    isLoading: queueQuery.isLoading,
    isError: queueQuery.isError,
    refetch: queueQuery.refetch,
    connected,
    callNext,
    doctorId,
  }
}
