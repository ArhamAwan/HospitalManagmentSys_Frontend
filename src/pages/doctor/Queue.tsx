import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { QueueTable } from '@/components/QueueTable'
import { useQueue } from '@/hooks/useQueue'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Button } from '@/components/ui/button'
import { ListOrdered, Wifi, WifiOff } from 'lucide-react'

export function DoctorQueue() {
  const navigate = useNavigate()
  const { queue, isLoading, isError, refetch, connected, callNext, doctorId } = useQueue()

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
            <QueueTable
              items={queue}
              onCallNext={handleCallNext}
              isLoading={isLoading}
              isCalling={callNext.isPending}
            />
          )}
        </div>
      </PageContainer>
    </Layout>
  )
}
