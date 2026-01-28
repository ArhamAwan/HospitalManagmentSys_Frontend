import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DoctorDisplay } from '@/hooks/useWaitingDisplay'
import { cn } from '@/lib/utils'

interface DoctorCardProps {
  data: DoctorDisplay
  className?: string
}

export function DoctorCard({ data, className }: DoctorCardProps) {
  const { doctor, currentToken, isEmergency } = data

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        isEmergency && 'animate-pulse border-red-500 bg-red-50 ring-2 ring-red-500',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground">
            Room {doctor.roomNumber}
          </span>
          {isEmergency && (
            <Badge variant="emergency">EMERGENCY</Badge>
          )}
        </div>
        <p className="text-base text-muted-foreground">{doctor.name}</p>
      </CardHeader>
      <CardContent>
        <p
          className="font-mono text-[96px] font-bold tabular-nums leading-none text-primary"
          aria-label={`Current token: ${currentToken ?? 'none'}`}
        >
          {currentToken != null ? currentToken : '—'}
        </p>
      </CardContent>
    </Card>
  )
}
