import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { SurfaceCard } from '@/components/ui/surface-card'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { adminSettingsApi, type AdminSettings } from '@/api/adminSettings'

export function AdminSettings() {
  const qc = useQueryClient()
  const settingsQuery = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminSettingsApi.get(),
  })

  const [form, setForm] = useState<AdminSettings>({
    tokenResetTime: '00:00',
    emergencyProtocolEnabled: false,
  })

  const updateSettings = useMutation({
    mutationFn: (s: Partial<AdminSettings>) => adminSettingsApi.update(s),
    onSuccess: (data) => {
      setForm(data)
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
  })

  const settings = settingsQuery.data
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (settings && !initialized) {
      setForm(settings)
      setInitialized(true)
    }
  }, [settings, initialized])

  return (
    <Layout>
      <PageContainer
        title="Settings"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Settings' }]}
      >
        <SurfaceCard>
          <CardHeader className="pb-3">
            <CardTitle>Global settings</CardTitle>
            <CardDescription>
              Configure system-wide behavior for tokens and emergency handling.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            {settingsQuery.isLoading && (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" text="Loading settings…" />
              </div>
            )}

            {settingsQuery.isError && (
              <ErrorMessage
                message="Failed to load settings."
                onRetry={() => settingsQuery.refetch()}
              />
            )}

            {settings && !settingsQuery.isLoading && !settingsQuery.isError && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token reset time</label>
                  <p className="text-xs text-muted-foreground">
                    Time of day when visit tokens reset, in 24-hour HH:MM format.
                  </p>
                  <Input
                    value={form.tokenResetTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tokenResetTime: e.target.value }))
                    }
                    placeholder="06:00"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Emergency protocol</p>
                    <p className="text-xs text-muted-foreground">
                      When enabled, highlight emergency visits and broadcast emergency state.
                    </p>
                  </div>
                  <Switch
                    checked={form.emergencyProtocolEnabled}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, emergencyProtocolEnabled: v }))
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => settings && setForm(settings)}
                    disabled={updateSettings.isPending}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateSettings.mutate(form)}
                    disabled={updateSettings.isPending}
                  >
                    {updateSettings.isPending ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </SurfaceCard>
      </PageContainer>
    </Layout>
  )
}

