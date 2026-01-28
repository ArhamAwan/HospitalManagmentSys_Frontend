import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { SurfaceCard } from '@/components/ui/surface-card'
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { doctorsApi } from '@/api/doctors'
import { reportsApi } from '@/api/reports'
import type { QueueDoctorStats } from '@/api/reports'
import { Activity, ListOrdered } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ReceptionQueues() {
  const today = new Date()
  const isoDate = today.toISOString().slice(0, 10)

  const doctorsQuery = useQuery({
    queryKey: ['doctors', 'all'],
    queryFn: () => doctorsApi.getAll(),
  })

  const queueStatsQuery = useQuery({
    queryKey: ['reports', 'queue-stats', isoDate],
    queryFn: () => reportsApi.getQueueStats(isoDate),
    refetchInterval: 15_000,
  })

  const statsByDoctor: Record<string, QueueDoctorStats> = {}
  for (const d of queueStatsQuery.data?.doctors ?? []) {
    statsByDoctor[d.id] = d
  }

  return (
    <Layout>
      <PageContainer
        title="All queues"
        breadcrumbs={[
          { label: 'Reception', to: '/reception' },
          { label: 'Queues' },
        ]}
        loading={doctorsQuery.isLoading || queueStatsQuery.isLoading}
      >
        <div className="space-y-4">
          <SurfaceCard>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ListOrdered className="h-4 w-4" />
                    Doctor queues overview
                  </CardTitle>
                  <CardDescription>
                    Live status of all doctors&apos; queues. Click through to open a specific doctor queue.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full text-xs">
                  {isoDate}
                </Badge>
              </div>
            </CardHeader>
          </SurfaceCard>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {doctorsQuery.data?.map((doc) => {
              const stats = statsByDoctor[doc.id]
              const current = stats?.currentQueue ?? 0
              const avgWait = stats?.avgWaitingMinutes ?? 0
              const maxQueue = stats?.maxQueue ?? 0

              return (
                <SurfaceCard key={doc.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-base leading-tight">
                          {doc.name}
                        </CardTitle>
                        <CardDescription>
                          {doc.specialization} • Room {doc.roomNumber}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={current > 0 ? 'secondary' : 'outline'}
                        className="flex items-center gap-1 rounded-full text-xs"
                      >
                        <Activity className="h-3 w-3" />
                        {current} waiting
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Average waiting</span>
                      <span className="font-medium text-foreground">
                        {avgWait} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Max queue today</span>
                      <span className="font-medium text-foreground">
                        {maxQueue}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Link to={`/doctor?doctorId=${doc.id}`}>
                          View queue
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </SurfaceCard>
              )
            })}
          </div>
        </div>
      </PageContainer>
    </Layout>
  )
}

