import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { SurfaceCard } from '@/components/ui/surface-card'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { adminAuditApi } from '@/api/adminAudit'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export function AdminAuditLogs() {
  const [actionFilter, setActionFilter] = useState('')

  const logsQuery = useQuery({
    queryKey: ['admin', 'audit-logs', actionFilter],
    queryFn: () =>
      adminAuditApi.list({
        page: 1,
        pageSize: 50,
        action: actionFilter || undefined,
      }),
  })

  return (
    <Layout>
      <PageContainer
        title="Audit logs"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Audit logs' }]}
      >
        <SurfaceCard>
          <CardHeader className="pb-3">
            <CardTitle>Activity history</CardTitle>
            <CardDescription>
              Security-relevant changes to users, settings, and configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                placeholder="Filter by action (e.g. USER_UPDATED, SETTINGS_UPDATED)…"
                className="max-w-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => logsQuery.refetch()}
                disabled={logsQuery.isLoading}
              >
                Refresh
              </Button>
              <p className="ml-auto text-xs text-muted-foreground">
                Showing up to 50 most recent events.
              </p>
            </div>

            {logsQuery.isLoading && (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" text="Loading audit logs…" />
              </div>
            )}

            {logsQuery.isError && (
              <ErrorMessage
                message="Failed to load audit logs."
                onRetry={() => logsQuery.refetch()}
              />
            )}

            {logsQuery.data && !logsQuery.isLoading && !logsQuery.isError && (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium">Time</th>
                      <th className="px-3 py-2 font-medium">Action</th>
                      <th className="px-3 py-2 font-medium">Target user</th>
                      <th className="px-3 py-2 font-medium">Actor</th>
                      <th className="px-3 py-2 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsQuery.data.items.map((log) => (
                      <tr key={log.id} className="border-t align-top">
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{log.action}</td>
                        <td className="px-3 py-2">
                          {log.userUsername} <span className="text-xs text-muted-foreground">({log.userId})</span>
                        </td>
                        <td className="px-3 py-2">
                          {log.actorUsername ?? '—'}
                          {log.actorId && (
                            <span className="ml-1 text-xs text-muted-foreground">({log.actorId})</span>
                          )}
                        </td>
                        <td className="px-3 py-2 max-w-md text-xs text-muted-foreground">
                          {log.details
                            ? JSON.stringify(log.details).slice(0, 120) +
                              (JSON.stringify(log.details).length > 120 ? '…' : '')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                    {logsQuery.data.items.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-4 text-center text-xs text-muted-foreground"
                        >
                          No audit events recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </SurfaceCard>
      </PageContainer>
    </Layout>
  )
}

