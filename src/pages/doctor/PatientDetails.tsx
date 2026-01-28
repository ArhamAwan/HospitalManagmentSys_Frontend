import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { usePatient } from '@/hooks/usePatients'
import { usePatientHistory } from '@/hooks/usePatients'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ArrowLeft } from 'lucide-react'
import type { Visit, VisitStatus } from '@/types/visit'
import { ProcedureOrdersSection } from '@/components/doctor/ProcedureOrdersSection'
import type { ProcedureOrder } from '@/types/visit'
import { PrescriptionForm } from '@/components/forms/PrescriptionForm'

const STATUS_LABELS: Record<VisitStatus, string> = {
  WAITING: 'Waiting',
  IN_CONSULTATION: 'In consultation',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export function PatientDetails() {
  const { id } = useParams<{ id: string }>()
  const patient = usePatient(id)
  const history = usePatientHistory(id)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [procedureOrders, setProcedureOrders] = useState<ProcedureOrder[]>([])

  if (patient.isError || history.isError) {
    return (
      <Layout>
        <PageContainer
          title="Patient Details"
          breadcrumbs={[{ label: 'Queue', to: '/doctor' }, { label: id ?? 'Patient' }]}
        >
          <ErrorMessage
            message="Failed to load patient."
            onRetry={() => { patient.refetch(); history.refetch(); }}
          />
        </PageContainer>
      </Layout>
    )
  }

  if (patient.isLoading || !patient.data) {
    return (
      <Layout>
        <PageContainer
          title="Patient Details"
          breadcrumbs={[{ label: 'Queue', to: '/doctor' }, { label: id ?? 'Patient' }]}
        >
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading…" />
          </div>
        </PageContainer>
      </Layout>
    )
  }

  const p = patient.data

  return (
    <Layout>
      <PageContainer
        title="Patient Details"
        breadcrumbs={[
          { label: 'Queue', to: '/doctor' },
          { label: p.name },
        ]}
      >
        <div className="space-y-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/doctor">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Queue
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p><span className="font-medium">Patient ID:</span> {p.patientId}</p>
              <p><span className="font-medium">Name:</span> {p.name}</p>
              <p><span className="font-medium">Age:</span> {p.age}</p>
              <p><span className="font-medium">Gender:</span> {p.gender}</p>
              <p><span className="font-medium">Phone:</span> {p.phone}</p>
              {p.address && (
                <p><span className="font-medium">Address:</span> {p.address}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Previous visits</CardTitle>
            </CardHeader>
            <CardContent>
              {history.isLoading ? (
                <LoadingSpinner size="md" text="Loading history…" />
              ) : !history.data?.length ? (
                <p className="text-sm text-muted-foreground">No previous visits.</p>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  value={selectedVisit?.id}
                  onValueChange={(value) => {
                    const v = history.data?.find((hv) => hv.id === value) ?? null
                    setSelectedVisit(v ?? null)
                  }}
                >
                  {history.data.map((v) => (
                    <AccordionItem key={v.id} value={v.id}>
                      <AccordionTrigger>
                        {format(new Date(v.visitDate), 'PPp')} — {v.doctor?.name ?? 'Doctor'} — Token{' '}
                        {v.tokenNumber} — {STATUS_LABELS[v.status]}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 text-sm text-muted-foreground">
                          <p>Fee: Rs. {v.consultationFee}</p>
                          {v.isEmergency && <p className="font-medium text-red-600">Emergency case</p>}
                          {v.prescription && (
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">Diagnosis</p>
                              <p>{v.prescription.diagnosis || '—'}</p>
                              {v.prescription.medicines.length > 0 && (
                                <ul className="mt-1 list-disc space-y-1 pl-5">
                                  {v.prescription.medicines.slice(0, 3).map((m) => (
                                    <li key={m.id}>
                                      {m.medicineName} — {m.dosage}, {m.frequency} × {m.duration}
                                    </li>
                                  ))}
                                  {v.prescription.medicines.length > 3 && (
                                    <li className="text-xs italic">+ more medicines…</li>
                                  )}
                                </ul>
                              )}
                            </div>
                          )}
                          {v.procedureOrders && v.procedureOrders.length > 0 && (
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">Procedures</p>
                              <ul className="list-disc space-y-1 pl-5">
                                {v.procedureOrders.map((o) => (
                                  <li key={o.id}>
                                    {o.procedure.name} ({o.procedure.code}) — {o.status.toLowerCase()}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {selectedVisit && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Prescription</CardTitle>
                </CardHeader>
                <CardContent>
                  <PrescriptionForm visitId={selectedVisit.id} initial={selectedVisit.prescription ?? null} />
                  {selectedVisit.prescription && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => {
                          window.open(`/api/prescriptions/${selectedVisit.prescription?.id}/pdf`, '_blank')
                        }}
                      >
                        Print prescription
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Procedures</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProcedureOrdersSection
                    visitId={selectedVisit.id}
                    orders={procedureOrders}
                    onOrdersChange={setProcedureOrders}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </PageContainer>
    </Layout>
  )
}
