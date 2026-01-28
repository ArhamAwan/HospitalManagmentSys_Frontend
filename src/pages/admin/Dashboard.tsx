import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { SurfaceCard } from '@/components/ui/surface-card'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { reportsApi } from '@/api/reports'

export function AdminDashboard() {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const dailyVisitsQuery = useQuery({
    queryKey: ['admin', 'reports', 'daily-visits', todayStr],
    queryFn: () => reportsApi.getDailyVisits(todayStr),
  })

  const billingSummaryQuery = useQuery({
    queryKey: ['admin', 'reports', 'billing-summary', todayStr],
    queryFn: () => reportsApi.getBillingSummary(todayStr, todayStr),
  })

  const queueStatsQuery = useQuery({
    queryKey: ['admin', 'reports', 'queue-stats', todayStr],
    queryFn: () => reportsApi.getQueueStats(todayStr),
  })

  const isLoading = dailyVisitsQuery.isLoading || billingSummaryQuery.isLoading || queueStatsQuery.isLoading
  const hasError = dailyVisitsQuery.isError || billingSummaryQuery.isError || queueStatsQuery.isError

  const totalPatients = dailyVisitsQuery.data?.total ?? 0
  const totalRevenue = billingSummaryQuery.data?.totalAmount ?? 0
  const avgWait = queueStatsQuery.data?.avgWaitingMinutes ?? 0
  const maxQueue = queueStatsQuery.data?.maxQueue ?? 0

  return (
    <Layout>
      <PageContainer title="Admin Dashboard">
        <div className="space-y-6">
          <SurfaceCard>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Overview</CardTitle>
              <CardDescription>Hospital-wide KPIs for today ({todayStr}).</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading && (
                <p className="text-sm text-muted-foreground">Loading metrics…</p>
              )}
              {hasError && !isLoading && (
                <p className="text-sm text-destructive">
                  Failed to load some metrics. Try refreshing the page.
                </p>
              )}
              {!isLoading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total visits</p>
                    <p className="text-3xl font-semibold">{totalPatients}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Across all doctors today.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Revenue</p>
                    <p className="text-3xl font-semibold">
                      Rs. {totalRevenue.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Confirmed payments today.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Avg waiting time</p>
                    <p className="text-3xl font-semibold">{avgWait} min</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Based on completed visits.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Max queue length</p>
                    <p className="text-3xl font-semibold">{maxQueue}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Highest active queue across doctors.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </SurfaceCard>

          <SurfaceCard>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Visits by doctor</CardTitle>
              <CardDescription>Breakdown of today&apos;s visits.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium">Doctor</th>
                      <th className="px-3 py-2 font-medium">Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dailyVisitsQuery.data?.byDoctor ?? []).map((d) => (
                      <tr key={d.id} className="border-t">
                        <td className="px-3 py-2">{d.name}</td>
                        <td className="px-3 py-2">{d.count}</td>
                      </tr>
                    ))}
                    {(!dailyVisitsQuery.data?.byDoctor ||
                      dailyVisitsQuery.data.byDoctor.length === 0) && (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-3 py-4 text-center text-xs text-muted-foreground"
                        >
                          No visits recorded for today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </SurfaceCard>
        </div>
      </PageContainer>
    </Layout>
  )
}
