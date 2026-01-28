import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { QueueTable } from '@/components/QueueTable'
import { useQueue } from '@/hooks/useQueue'
import { useSocket } from '@/hooks/useSocket'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SurfaceCard } from '@/components/ui/surface-card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ListOrdered, Siren, Wifi, WifiOff } from 'lucide-react'

type EmergencyPayload = {
  doctorId?: string
  isActive?: boolean
  tokenNumber?: number
  patientName?: string
  roomNumber?: string
}

export function DoctorQueue() {
  const navigate = useNavigate()
  const { queue, isLoading, isError, refetch, connected, callNext, doctorId } = useQueue()
  const { subscribe } = useSocket()

  const [emergency, setEmergency] = useState<EmergencyPayload | null>(null)

  useEffect(() => {
    if (!doctorId) return
    return subscribe('emergency:active', (p: unknown) => {
      const payload = p as EmergencyPayload
      if (payload.doctorId !== doctorId) return
      if (payload.isActive) setEmergency(payload)
      else setEmergency(null)
    })
  }, [doctorId, subscribe])

  const emergencyText = useMemo(() => {
    if (!emergency?.isActive) return null
    const parts: string[] = []
    if (emergency.roomNumber) parts.push(`Room ${emergency.roomNumber}`)
    if (typeof emergency.tokenNumber === 'number') parts.push(`Token ${emergency.tokenNumber}`)
    if (emergency.patientName) parts.push(emergency.patientName)
    return parts.join(' — ')
  }, [emergency])

  const handleCallNext = async (visitId: string) => {
    try {
      await callNext.mutateAsync(visitId)
      const item = queue.find((i) => i.visit.id === visitId)
      if (item) navigate(`/doctor/patient/${item.patient.id}`)
    } catch {
      // Error handled by mutation / inline toast
    }
  }

  if (!doctorId) {
    return (
      <Layout>
        <PageContainer title="Queue">
          <EmptyState
            icon={ListOrdered}
            title="No doctor profile"
            description="Your account is not linked to a doctor. Contact an administrator."
          />
        </PageContainer>
      </Layout>
    )
  }

  return (
    <Layout>
      <PageContainer title="Queue">
        <div className="space-y-4">
          {emergency?.isActive && (
            <SurfaceCard className="border-destructive/30 bg-gradient-to-br from-destructive/10 via-background to-background">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Siren className="h-5 w-5 text-destructive" aria-hidden />
                    <CardTitle className="text-base">Emergency patient</CardTitle>
                    <Badge variant="destructive" className="rounded-full">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={cn('text-sm text-muted-foreground')}>
                  {emergencyText ?? 'An emergency case is active for your queue.'}
                </div>
              </CardContent>
            </SurfaceCard>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {connected ? (
                <>
                  <Wifi className="h-4 w-4" aria-hidden />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" aria-hidden />
                  <span>Disconnected</span>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>

          {isError && (
            <ErrorMessage
              message="Failed to load queue."
              onRetry={() => refetch()}
            />
          )}

          {!isError && queue.length === 0 && !isLoading && (
            <EmptyState
              icon={ListOrdered}
              title="No patients in queue"
              description="The queue is empty. New visits will appear here."
            />
          )}

          {!isError && (queue.length > 0 || isLoading) && (
            <div className="overflow-hidden rounded-xl border bg-card">
              <QueueTable
                items={queue}
                onCallNext={handleCallNext}
                isLoading={isLoading}
                isCalling={callNext.isPending}
              />
            </div>
          )}
        </div>
      </PageContainer>
    </Layout>
  )
}
