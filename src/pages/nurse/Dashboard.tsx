import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import {
  ClipboardList,
  Clock,
  User,
  Stethoscope,
  Search,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
} from 'lucide-react'
import { procedureOrdersApi } from '@/api/procedureOrders'
import { cn } from '@/lib/utils'

function formatDuration(startedAt: string): string {
  const start = new Date(startedAt)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function NurseDashboard() {
  const qc = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  const ongoingQuery = useQuery({
    queryKey: ['procedure-orders', 'ongoing'],
    queryFn: () => procedureOrdersApi.listOngoing(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const requestedQuery = useQuery({
    queryKey: ['procedure-orders', 'requested'],
    queryFn: () => procedureOrdersApi.listRequested(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const startMutation = useMutation({
    mutationFn: (id: string) => procedureOrdersApi.startProcedure(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['procedure-orders', 'ongoing'] })
      qc.invalidateQueries({ queryKey: ['procedure-orders', 'requested'] })
      qc.invalidateQueries({ queryKey: ['procedure-orders'] })
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => procedureOrdersApi.completeProcedure(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['procedure-orders', 'ongoing'] })
      qc.invalidateQueries({ queryKey: ['procedure-orders'] })
    },
  })

  const allProcedures = useMemo(() => {
    const ongoing = ongoingQuery.data ?? []
    const requested = requestedQuery.data ?? []
    return [...ongoing, ...requested]
  }, [ongoingQuery.data, requestedQuery.data])

  const filteredProcedures = useMemo(() => {
    if (!allProcedures.length) return []
    if (!searchQuery.trim()) return allProcedures

    const query = searchQuery.toLowerCase()
    return allProcedures.filter((p) => {
      const patientName = p.visit?.patient?.name?.toLowerCase() ?? ''
      const patientId = p.visit?.patient?.patientId?.toLowerCase() ?? ''
      const procedureName = p.procedure.name.toLowerCase()
      const doctorName = p.visit?.doctor?.name?.toLowerCase() ?? ''

      return (
        patientName.includes(query) ||
        patientId.includes(query) ||
        procedureName.includes(query) ||
        doctorName.includes(query)
      )
    })
  }, [allProcedures, searchQuery])

  // Sort: emergency first, then IN_PROGRESS before REQUESTED, then by time
  const sortedProcedures = useMemo(() => {
    return [...filteredProcedures].sort((a, b) => {
      const aEmergency = a.visit?.isEmergency ?? false
      const bEmergency = b.visit?.isEmergency ?? false

      if (aEmergency && !bEmergency) return -1
      if (!aEmergency && bEmergency) return 1

      // IN_PROGRESS before REQUESTED
      if (a.status === 'IN_PROGRESS' && b.status === 'REQUESTED') return -1
      if (a.status === 'REQUESTED' && b.status === 'IN_PROGRESS') return 1

      const aStart = a.startedAt ? new Date(a.startedAt).getTime() : a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bStart = b.startedAt ? new Date(b.startedAt).getTime() : b.createdAt ? new Date(b.createdAt).getTime() : 0

      return aStart - bStart
    })
  }, [filteredProcedures])

  return (
    <Layout>
      <PageContainer title="Procedure Monitoring">
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                <CardTitle>Ongoing Procedures</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, ID, procedure, or doctor…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {(ongoingQuery.data || requestedQuery.data) && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {sortedProcedures.filter((p) => p.status === 'IN_PROGRESS').length} ongoing,{' '}
                  {sortedProcedures.filter((p) => p.status === 'REQUESTED').length} requested
                </p>
              )}
            </CardContent>
          </Card>

          {/* Procedures List */}
          {(ongoingQuery.isLoading || requestedQuery.isLoading) ? (
            <Card>
              <CardContent className="py-12">
                <LoadingSpinner size="lg" text="Loading procedures…" />
              </CardContent>
            </Card>
          ) : (ongoingQuery.isError || requestedQuery.isError) ? (
            <Card>
              <CardContent className="py-8">
                <ErrorMessage
                  message={
                    ongoingQuery.error || requestedQuery.error
                      ? (ongoingQuery.error as any)?.code === 'ERR_NETWORK' ||
                        (requestedQuery.error as any)?.code === 'ERR_NETWORK'
                        ? 'Cannot connect to server. Please ensure the backend server is running on port 5001.'
                        : 'Failed to load procedures. Please try again.'
                      : 'Failed to load procedures.'
                  }
                  onRetry={() => {
                    ongoingQuery.refetch()
                    requestedQuery.refetch()
                  }}
                />
              </CardContent>
            </Card>
          ) : !sortedProcedures.length ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? 'No procedures found matching your search.'
                    : 'No procedures to monitor at this time.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sortedProcedures.map((order) => {
                const isEmergency = order.visit?.isEmergency ?? false
                const startedAt = order.startedAt
                const duration = startedAt ? formatDuration(startedAt) : '—'

                return (
                  <Card
                    key={order.id}
                    className={cn(
                      'transition-shadow hover:shadow-md',
                      isEmergency &&
                        'border-destructive/50 bg-gradient-to-br from-destructive/5 via-background to-background'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {isEmergency && (
                              <Badge variant="destructive" className="rounded-full gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Emergency
                              </Badge>
                            )}
                            <Badge variant="default" className="rounded-full">
                              {order.status}
                            </Badge>
                            <span className="text-sm font-medium text-muted-foreground">
                              {order.procedure.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({order.procedure.code})
                            </span>
                          </div>

                          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="font-medium">
                                  {order.visit?.patient?.name ?? 'N/A'}
                                </span>
                                <span className="ml-1 text-muted-foreground">
                                  ({order.visit?.patient?.patientId ?? 'N/A'})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="text-muted-foreground">Doctor: </span>
                                <span className="font-medium">
                                  {order.visit?.doctor?.name ?? 'N/A'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="text-muted-foreground">Started: </span>
                                <span className="font-medium">
                                  {startedAt
                                    ? format(new Date(startedAt), 'h:mm a')
                                    : 'Not started'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <div>
                                <span className="text-muted-foreground">Duration: </span>
                                <span className="font-semibold text-primary">{duration}</span>
                              </div>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="rounded-md border bg-muted/30 p-2 text-sm">
                              <span className="font-medium text-muted-foreground">Notes: </span>
                              <span>{order.notes}</span>
                            </div>
                          )}

                          {startedAt && (
                            <p className="text-xs text-muted-foreground">
                              Started {formatDistanceToNow(new Date(startedAt), { addSuffix: true })}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-end">
                          {order.status === 'REQUESTED' ? (
                            <Button
                              onClick={() => startMutation.mutate(order.id)}
                              disabled={startMutation.isPending}
                              className="gap-2"
                              size="sm"
                              variant="default"
                            >
                              <PlayCircle className="h-4 w-4" />
                              {startMutation.isPending ? 'Starting…' : 'Start Procedure'}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => completeMutation.mutate(order.id)}
                              disabled={completeMutation.isPending}
                              className="gap-2"
                              size="sm"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {completeMutation.isPending ? 'Completing…' : 'Complete Procedure'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </PageContainer>
    </Layout>
  )
}
