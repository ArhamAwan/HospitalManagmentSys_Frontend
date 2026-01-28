import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { QueueTable } from '@/components/QueueTable'
import { useQueue } from '@/hooks/useQueue'
import { cn } from '@/lib/utils'
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Clock3,
  Search,
  UserPlus,
  Users,
} from 'lucide-react'

type LoadLevel = 'low' | 'medium' | 'high'

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(
    date
  )
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date)
}

function stableLoadLevel(dayNumber: number): LoadLevel {
  // Deterministic (no Math.random) so the UI doesn't flicker between reloads.
  const n = (dayNumber * 37 + 13) % 10
  if (n <= 4) return 'low'
  if (n <= 7) return 'medium'
  return 'high'
}

function LoadDot({ level }: { level: LoadLevel }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block h-2 w-2 rounded-full', {
        'bg-emerald-500': level === 'low',
        'bg-sky-500': level === 'medium',
        'bg-amber-500': level === 'high',
      })}
    />
  )
}

function KpiCard({
  title,
  value,
  meta,
  icon,
  className,
}: {
  title: string
  value: string
  meta: string
  icon: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-2xl"
      />
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center justify-between">
          <span className="font-medium text-muted-foreground">{title}</span>
          <span className="text-muted-foreground">{icon}</span>
        </CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="text-emerald-600">+6%</span> {meta}
        </span>
      </CardContent>
    </Card>
  )
}

function PatientFlowCard() {
  const bars = [
    { newPatients: 8, returning: 4 },
    { newPatients: 6, returning: 5 },
    { newPatients: 5, returning: 3 },
    { newPatients: 7, returning: 4 },
    { newPatients: 10, returning: 5 },
    { newPatients: 12, returning: 6 },
    { newPatients: 9, returning: 5 },
    { newPatients: 11, returning: 4 },
    { newPatients: 13, returning: 6 },
    { newPatients: 9, returning: 3 },
    { newPatients: 7, returning: 4 },
    { newPatients: 8, returning: 5 },
    { newPatients: 10, returning: 4 },
    { newPatients: 9, returning: 5 },
  ]
  const max = Math.max(...bars.map((b) => b.newPatients + b.returning))

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">Patient Flow</CardTitle>
            <CardDescription>New vs returning patients over the last 2 weeks</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              2 weeks
            </Badge>
            <Button variant="ghost" size="icon" aria-label="View details">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          aria-label="Patient flow chart"
          className="grid gap-3 rounded-xl border bg-gradient-to-br from-muted/40 to-background p-4"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Volume</span>
            <span>Last 14 days</span>
          </div>

          <div className="flex h-40 items-end gap-2">
            {bars.map((b, i) => {
              const total = b.newPatients + b.returning
              const totalH = Math.max(10, Math.round((total / max) * 150))
              const returningH = Math.round((b.returning / total) * totalH)
              const newH = totalH - returningH

              return (
                <div key={i} className="flex w-5 flex-col justify-end gap-0.5">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-primary/60 to-primary/30"
                    style={{ height: newH }}
                    title={`New: ${b.newPatients}`}
                  />
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-emerald-500/70 to-emerald-500/30"
                    style={{ height: Math.max(6, returningH) }}
                    title={`Returning: ${b.returning}`}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary/70" /> New patients
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500/70" /> Returning patients
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadCalendarCard({ today = new Date() }: { today?: Date }) {
  const year = today.getFullYear()
  const month = today.getMonth()
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = first.getDay() // 0..6, Sunday..Saturday

  const dayCells: Array<{ day?: number; level?: LoadLevel }> = []
  for (let i = 0; i < startWeekday; i++) dayCells.push({})
  for (let d = 1; d <= daysInMonth; d++) dayCells.push({ day: d, level: stableLoadLevel(d) })
  while (dayCells.length % 7 !== 0) dayCells.push({})

  const todayDay = today.getDate()

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">Load Calendar</CardTitle>
            <CardDescription>{formatMonthYear(first)}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" aria-label="Open calendar">
            <CalendarDays className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 rounded-xl border bg-gradient-to-br from-muted/40 to-background p-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
              <div key={`${d}-${idx}`} className="py-1 font-medium">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dayCells.map((c, idx) => {
              const isToday = c.day === todayDay
              const base =
                c.level === 'low'
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/15'
                  : c.level === 'medium'
                    ? 'bg-sky-500/10 hover:bg-sky-500/15'
                    : c.level === 'high'
                      ? 'bg-amber-500/10 hover:bg-amber-500/15'
                      : 'bg-transparent'

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!c.day}
                  className={cn(
                    'group relative flex h-10 items-center justify-center rounded-full text-sm transition-colors disabled:cursor-default disabled:opacity-40',
                    base,
                    isToday && 'ring-2 ring-primary'
                  )}
                  aria-label={c.day ? `Day ${c.day}` : 'Empty'}
                >
                  <span className={cn('font-medium', isToday && 'text-primary')}>{c.day ?? ''}</span>
                  {c.day && c.level && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                      <LoadDot level={c.level} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <LoadDot level="low" /> Low
            </span>
            <span className="inline-flex items-center gap-2">
              <LoadDot level="medium" /> Medium
            </span>
            <span className="inline-flex items-center gap-2">
              <LoadDot level="high" /> High
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScheduleCard() {
  const items = [
    { name: 'Sidney Yates', specialty: 'Ophthalmologist', time: '10:00 AM', status: 'Overbooked', variant: 'destructive' as const },
    { name: 'Louie Hodges', specialty: 'Cardiologist', time: '10:10 AM', status: 'Available', variant: 'secondary' as const },
    { name: 'Gerald Rocha', specialty: 'Surgeon', time: '10:20 AM', status: 'No slots', variant: 'outline' as const },
    { name: 'Wiktor Cross', specialty: 'Dermatologist', time: '10:25 AM', status: 'Available', variant: 'secondary' as const },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">Hospital Schedule</CardTitle>
            <CardDescription>Next appointments in queue</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link to="/reception/search">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border bg-gradient-to-br from-muted/40 to-background">
          <div className="divide-y">
            {items.map((it) => (
              <div key={it.name} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {it.name
                        .split(' ')
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{it.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{it.specialty}</div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{it.time}</div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                  <Badge variant={it.variant} className="rounded-full">
                    {it.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReceptionDashboard() {
  const { queue, isLoading, callNext } = useQueue()
  const today = new Date()

  return (
    <Layout>
      <PageContainer title="Reception Dashboard">
        <div className="space-y-8">
          <section aria-label="Reception overview header" className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">{formatShortDate(today)}</div>
                <h2 className="text-2xl font-semibold tracking-tight">Reception Overview</h2>
                <p className="text-sm text-muted-foreground">
                  Quick actions, patient flow, and a glance at today’s schedule.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button asChild className="gap-2">
                  <Link to="/reception/register">
                    <UserPlus className="h-4 w-4" />
                    Register Patient
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/reception/search">
                    <Search className="h-4 w-4" />
                    Search Patient
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/reception/billing">
                    <CalendarDays className="h-4 w-4" />
                    Billing
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Total patients"
                value="98"
                meta="vs last week"
                icon={<Users className="h-4 w-4" />}
              />
              <KpiCard
                title="Avg waiting time"
                value="7 min"
                meta="faster this week"
                icon={<Clock3 className="h-4 w-4" />}
                className="bg-gradient-to-br from-primary/[0.07] via-background to-background"
              />
              <KpiCard
                title="Active queues"
                value={queue.length.toString()}
                meta="patients currently waiting"
                icon={<Activity className="h-4 w-4" />}
              />
              <KpiCard
                title="Consultation slots"
                value="19"
                meta="open today"
                icon={<CalendarDays className="h-4 w-4" />}
                className="bg-gradient-to-br from-sky-500/[0.08] via-background to-background"
              />
            </div>
          </section>

          <section
            aria-label="Reception dashboard content"
            className="grid gap-6 xl:grid-cols-[minmax(0,2fr),minmax(320px,1fr)]"
          >
            <div className="space-y-6">
              <PatientFlowCard />

              <section aria-label="Waiting room queue">
                <Card className="overflow-hidden border bg-gradient-to-br from-muted/60 via-background to-background shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <CardTitle className="text-lg">Waiting room queue</CardTitle>
                        <CardDescription>
                          Live view of all patients currently in queue.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="overflow-hidden rounded-xl border bg-card">
                      <QueueTable
                        items={queue}
                        isLoading={isLoading}
                        onCallNext={(visitId) => callNext.mutate(visitId)}
                        isCalling={callNext.isPending}
                        variant="bare"
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            <div className="space-y-6">
              <LoadCalendarCard today={today} />
              <ScheduleCard />
            </div>
          </section>
        </div>
      </PageContainer>
    </Layout>
  )
}
