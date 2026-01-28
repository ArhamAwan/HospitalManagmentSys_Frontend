import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { DoctorCard } from '@/components/display/DoctorCard'
import { useWaitingDisplay } from '@/hooks/useWaitingDisplay'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const IDLE_CURSOR_MS = 3000

export function WaitingArea() {
  const { doctors, connected, currentTime, isLoading } = useWaitingDisplay()
  const [idle, setIdle] = useState(false)
  const [moved, setMoved] = useState(false)
  const emergencyRooms = doctors.filter((d) => d.isEmergency)

  const onActivity = useCallback(() => {
    setMoved(true)
    setIdle(false)
  }, [])

  useEffect(() => {
    if (!moved || idle) return
    const t = setTimeout(() => setIdle(true), IDLE_CURSOR_MS)
    return () => clearTimeout(t)
  }, [moved, idle])

  useEffect(() => {
    window.addEventListener('mousemove', onActivity)
    window.addEventListener('keydown', onActivity)
    return () => {
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('keydown', onActivity)
    }
  }, [onActivity])

  return (
    <div
      className={cn(
        'fixed inset-0 flex flex-col bg-gradient-to-br from-slate-50 to-cyan-50/40',
        idle && 'cursor-none'
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b bg-white/80 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">
          Atta Khan Memorial Hospital — Waiting Area
        </h1>
        <div className="flex items-center gap-6">
          <p className="text-2xl font-mono font-semibold tabular-nums text-slate-700" aria-live="polite">
            {format(currentTime, 'HH:mm:ss')}
          </p>
          <div
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1 text-sm',
              connected ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            )}
            aria-label={connected ? 'Connected' : 'Disconnected'}
          >
            {connected ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <span>{connected ? 'Live' : 'Reconnecting…'}</span>
          </div>
        </div>
      </div>

      {emergencyRooms.length > 0 && (
        <div className="shrink-0 border-b border-red-200 bg-red-50/90 px-6 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="text-lg font-semibold text-red-800">
              Emergency active
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-red-800">
              {emergencyRooms.slice(0, 4).map((d) => (
                <span key={d.doctor.id} className="rounded-full bg-white/70 px-3 py-1">
                  Room {d.doctor.roomNumber} — Token {d.currentToken ?? '—'}
                </span>
              ))}
              {emergencyRooms.length > 4 && (
                <span className="text-red-700">+{emergencyRooms.length - 4} more</span>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto p-6 md:p-8">
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading…" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center text-xl text-muted-foreground">
            No doctors configured
          </div>
        ) : (
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {doctors.map((d) => (
              <DoctorCard key={d.doctor.id} data={d} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
