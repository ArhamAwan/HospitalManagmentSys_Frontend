import { formatDistanceToNow } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { QueueItem } from '@/types/visit'
import type { VisitStatus } from '@/types/visit'

const STATUS_LABELS: Record<VisitStatus, string> = {
  WAITING: 'Waiting',
  IN_CONSULTATION: 'In consultation',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

interface QueueTableProps {
  items: QueueItem[]
  onCallNext?: (visitId: string) => void
  isLoading?: boolean
  isCalling?: boolean
}

export function QueueTable({ items, onCallNext, isLoading, isCalling }: QueueTableProps) {
  const waiting = items.filter((i) => i.visit.status === 'WAITING')
  const firstWaiting = waiting[0]

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time waiting</TableHead>
            <TableHead className="w-[120px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No patients in queue
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow
                key={item.visit.id}
                className={item.visit.isEmergency ? 'bg-destructive/5' : ''}
              >
                <TableCell className="font-mono font-medium">
                  {item.visit.tokenNumber}
                  {item.visit.isEmergency && (
                    <Badge variant="emergency" className="ml-2">
                      Emergency
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {item.patient.name}
                  <span className="ml-1 text-muted-foreground">({item.patient.patientId})</span>
                </TableCell>
                <TableCell>{STATUS_LABELS[item.visit.status]}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.timeWaiting >= 0
                    ? formatDistanceToNow(Date.now() - item.timeWaiting * 1000, {
                        addSuffix: false,
                      })
                    : '—'}
                </TableCell>
                <TableCell>
                  {item.visit.status === 'WAITING' &&
                    firstWaiting?.visit.id === item.visit.id &&
                    onCallNext && (
                      <Button
                        size="sm"
                        onClick={() => onCallNext(item.visit.id)}
                        disabled={isCalling}
                      >
                        {isCalling ? 'Calling…' : 'Call next'}
                      </Button>
                    )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
