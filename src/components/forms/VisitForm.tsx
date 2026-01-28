import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDoctors } from '@/hooks/useDoctors'
import { useVisitCreate } from '@/hooks/useVisits'
import type { Patient } from '@/types/patient'
import { Loader2 } from 'lucide-react'

const visitSchema = z.object({
  doctorId: z.string().min(1, 'Select a doctor'),
  isEmergency: z.boolean(),
})

type VisitFormData = z.infer<typeof visitSchema>

interface VisitFormProps {
  patient: Patient
  onSuccess?: (token: number) => void
  onCancel?: () => void
}

export function VisitForm({ patient, onSuccess, onCancel }: VisitFormProps) {
  const createVisit = useVisitCreate()
  const { data: doctors = [], isLoading: doctorsLoading } = useDoctors()
  const [token, setToken] = useState<number | null>(null)

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: { doctorId: '', isEmergency: false },
  })

  const doctorId = form.watch('doctorId')
  const selectedDoctor = doctors.find((d) => d.id === doctorId)

  const handleSubmit = form.handleSubmit(async (values) => {
    const visit = await createVisit.mutateAsync({
      patientId: patient.id,
      doctorId: values.doctorId,
      isEmergency: values.isEmergency,
    })
    setToken(visit.tokenNumber)
    onSuccess?.(visit.tokenNumber)
  })

  if (token !== null) {
    return (
      <div className="space-y-4 rounded-lg border bg-muted/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">Token generated</p>
        <p className="text-4xl font-bold tabular-nums text-primary">{token}</p>
        <p className="text-sm text-muted-foreground">
          {patient.name} — {selectedDoctor?.name ?? 'Doctor'}
        </p>
        {onCancel && (
          <Button onClick={onCancel}>Done</Button>
        )}
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <span className="font-medium">Patient:</span> {patient.name} ({patient.patientId})
        </div>
        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={doctorsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={doctorsLoading ? 'Loading…' : 'Select doctor'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} — {d.roomNumber} (Rs. {d.consultationFee})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedDoctor && (
          <p className="text-sm text-muted-foreground">
            Consultation fee: Rs. {selectedDoctor.consultationFee}
          </p>
        )}
        <FormField
          control={form.control}
          name="isEmergency"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal">Emergency</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={createVisit.isPending}>
            {createVisit.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              'Create Visit'
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
