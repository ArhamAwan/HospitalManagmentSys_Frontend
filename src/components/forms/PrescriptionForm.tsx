import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { prescriptionsApi } from '@/api/prescriptions'
import type { Prescription } from '@/types/visit'

const medicineSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional(),
})

const prescriptionSchema = z.object({
  diagnosis: z.string().optional(),
  clinicalNotes: z.string().optional(),
  medicines: z.array(medicineSchema).min(1, 'Add at least one medicine'),
})

export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>

interface PrescriptionFormProps {
  visitId: string
  initial?: Prescription | null
  onSaved?: (p: Prescription) => void
}

export function PrescriptionForm({ visitId, initial, onSaved }: PrescriptionFormProps) {
  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      diagnosis: initial?.diagnosis ?? '',
      clinicalNotes: initial?.clinicalNotes ?? '',
      medicines:
        initial?.medicines?.map((m) => ({
          medicineName: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions ?? '',
        })) ?? [
          {
            medicineName: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
          },
        ],
    },
  })

  useEffect(() => {
    if (initial) {
      form.reset({
        diagnosis: initial.diagnosis ?? '',
        clinicalNotes: initial.clinicalNotes ?? '',
        medicines:
          initial.medicines?.map((m) => ({
            medicineName: m.medicineName,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            instructions: m.instructions ?? '',
          })) ?? [],
      })
    }
  }, [initial, form])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medicines',
  })

  const onSubmit = async (values: PrescriptionFormValues) => {
    const created = await prescriptionsApi.create({
      visitId,
      diagnosis: values.diagnosis,
      clinicalNotes: values.clinicalNotes,
      medicines: values.medicines,
    })
    onSaved?.(created)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Acute bronchitis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clinicalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinical notes</FormLabel>
              <FormControl>
                <Input placeholder="Clinical observations, advice…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base">Medicines</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' })
              }
            >
              Add medicine
            </Button>
          </div>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border p-3 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`medicines.${index}.medicineName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicine</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Amoxicillin 500mg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`medicines.${index}.dosage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 1 tablet" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`medicines.${index}.frequency`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Twice daily" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`medicines.${index}.duration`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 5 days" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`medicines.${index}.instructions`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Take after food" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end md:col-span-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" size="sm">
            Save prescription
          </Button>
        </div>
      </form>
    </Form>
  )
}

