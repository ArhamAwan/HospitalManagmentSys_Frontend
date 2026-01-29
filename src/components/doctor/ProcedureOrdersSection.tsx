import { useEffect, useState } from 'react'
import { adminConfigApi } from '@/api/adminConfig'
import { procedureOrdersApi } from '@/api/procedureOrders'
import type { ProcedureOrder } from '@/types/visit'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface ProcedureOrdersSectionProps {
  visitId: string
  orders: ProcedureOrder[]
  onOrdersChange: (orders: ProcedureOrder[]) => void
}

export function ProcedureOrdersSection({ visitId, orders, onOrdersChange }: ProcedureOrdersSectionProps) {
  const [availableProcedures, setAvailableProcedures] = useState<
    { id: string; code: string; name: string; department?: string | null }[]
  >([])
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    adminConfigApi
      .listProcedures()
      .then((ps) => {
        setAvailableProcedures(ps)
      })
      .catch(() => {
        setAvailableProcedures([])
      })
  }, [])

  const handleCreate = async () => {
    if (!selectedProcedureId) return
    setIsSubmitting(true)
    try {
      const created = await procedureOrdersApi.create({
        visitId,
        procedureId: selectedProcedureId,
        notes: notes || undefined,
      })
      onOrdersChange([...orders, created])
      setNotes('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
        <p className="text-sm font-medium text-foreground">New procedure order</p>
        <div className="grid gap-2 md:grid-cols-[minmax(0,2fr),minmax(0,2fr),auto]">
          <Select value={selectedProcedureId} onValueChange={setSelectedProcedureId}>
            <SelectTrigger>
              <SelectValue placeholder="Select procedure" />
            </SelectTrigger>
            <SelectContent>
              {availableProcedures.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button type="button" size="sm" onClick={handleCreate} disabled={isSubmitting || !selectedProcedureId}>
            Add
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No procedure orders for this visit yet.</p>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex items-start justify-between rounded-md border bg-background px-3 py-2 text-sm"
            >
              <div className="space-y-0.5">
                <div className="font-medium">
                  {o.procedure.name} <span className="text-xs text-muted-foreground">({o.procedure.code})</span>
                </div>
                {o.notes && <div className="text-xs text-muted-foreground">{o.notes}</div>}
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                  o.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : o.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                }`}
              >
                {o.status === 'COMPLETED'
                  ? 'Completed'
                  : o.status === 'IN_PROGRESS'
                    ? 'In Progress'
                    : 'Requested'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

