import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { ArrowLeft, Stethoscope, FileText, ClipboardList, History, Calendar, User, DollarSign } from 'lucide-react'
import type { Visit, VisitStatus } from '@/types/visit'
import { ProcedureOrdersSection } from '@/components/doctor/ProcedureOrdersSection'
import type { ProcedureOrder } from '@/types/visit'
import { PrescriptionForm } from '@/components/forms/PrescriptionForm'
import { procedureOrdersApi } from '@/api/procedureOrders'

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
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  // Auto-detect and select active consultation visit
  const activeVisit = useMemo(() => {
    if (!history.data) return null
    return history.data.find((v) => v.status === 'IN_CONSULTATION') ?? null
  }, [history.data])

  // Auto-select active visit on mount or when history loads
  useEffect(() => {
    if (activeVisit && !selectedVisit) {
      setSelectedVisit(activeVisit)
    }
  }, [activeVisit, selectedVisit])

  // Load procedure orders when visit is selected
  useEffect(() => {
    if (selectedVisit?.id) {
      setIsLoadingOrders(true)
      procedureOrdersApi
        .listForVisit(selectedVisit.id)
        .then((orders) => {
          setProcedureOrders(orders)
        })
        .catch(() => {
          setProcedureOrders([])
        })
        .finally(() => {
          setIsLoadingOrders(false)
        })
    } else {
      setProcedureOrders([])
    }
  }, [selectedVisit?.id])

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

          {/* Active Consultation Card */}
          {activeVisit && (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Active Consultation</CardTitle>
                    <Badge variant="default" className="rounded-full">
                      {STATUS_LABELS[activeVisit.status]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="font-medium text-muted-foreground">Token:</span>{' '}
                    <span className="font-mono font-semibold">{activeVisit.tokenNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Date:</span>{' '}
                    {format(new Date(activeVisit.visitDate), 'PPp')}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Doctor:</span>{' '}
                    {activeVisit.doctor?.name ?? 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Fee:</span> Rs.{' '}
                    {activeVisit.consultationFee}
                  </div>
                </div>
                {activeVisit.isEmergency && (
                  <Badge variant="destructive" className="rounded-full">
                    Emergency Case
                  </Badge>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const element = document.getElementById('prescription-section')
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Go to Prescription
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const element = document.getElementById('procedures-section')
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Go to Procedures
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prescription and Procedures for Active Visit */}
          {activeVisit && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card id="prescription-section">
                <CardHeader>
                  <CardTitle>Prescription</CardTitle>
                </CardHeader>
                <CardContent>
                  <PrescriptionForm
                    visitId={activeVisit.id}
                    initial={activeVisit.prescription ?? null}
                    onSaved={() => {
                      // Update the active visit with new prescription
                      if (history.data) history.refetch()
                    }}
                  />
                  {activeVisit.prescription && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => {
                          window.open(`/api/prescriptions/${activeVisit.prescription?.id}/pdf`, '_blank')
                        }}
                      >
                        Print prescription
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card id="procedures-section">
                <CardHeader>
                  <CardTitle>Procedures</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <LoadingSpinner size="md" text="Loading procedure orders…" />
                  ) : (
                    <ProcedureOrdersSection
                      visitId={activeVisit.id}
                      orders={procedureOrders}
                      onOrdersChange={(orders) => {
                        setProcedureOrders(orders)
                        // Trigger history refetch to sync with backend
                        history.refetch()
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <CardTitle>Visit History</CardTitle>
              </div>
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
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex flex-1 items-center justify-between pr-4">
                          <div className="flex items-center gap-3 text-left">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {format(new Date(v.visitDate), 'MMM dd, yyyy')}
                              </span>
                              <span className="text-muted-foreground">
                                {format(new Date(v.visitDate), 'h:mm a')}
                              </span>
                            </div>
                            <Badge variant={v.status === 'COMPLETED' ? 'secondary' : v.status === 'IN_CONSULTATION' ? 'default' : 'outline'} className="rounded-full">
                              {STATUS_LABELS[v.status]}
                            </Badge>
                            {v.isEmergency && (
                              <Badge variant="destructive" className="rounded-full">
                                Emergency
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{v.doctor?.name ?? 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-mono">Token {v.tokenNumber}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>Rs. {v.consultationFee}</span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {/* Visit Details */}
                          <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-2">
                            <div>
                              <span className="font-medium text-muted-foreground">Visit Date:</span>{' '}
                              <span>{format(new Date(v.visitDate), 'PPpp')}</span>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Doctor:</span>{' '}
                              <span>{v.doctor?.name ?? 'N/A'}</span>
                              {v.doctor?.specialization && (
                                <span className="text-muted-foreground"> ({v.doctor.specialization})</span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Token Number:</span>{' '}
                              <span className="font-mono">{v.tokenNumber}</span>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Consultation Fee:</span>{' '}
                              <span>Rs. {v.consultationFee}</span>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Status:</span>{' '}
                              <Badge variant={v.status === 'COMPLETED' ? 'secondary' : 'outline'} className="rounded-full">
                                {STATUS_LABELS[v.status]}
                              </Badge>
                            </div>
                            {v.isEmergency && (
                              <div>
                                <span className="font-medium text-muted-foreground">Type:</span>{' '}
                                <Badge variant="destructive" className="rounded-full">
                                  Emergency Case
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Prescription Details */}
                          {v.prescription && (
                            <div className="space-y-2 rounded-lg border bg-card p-4">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold">Prescription</h4>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="ml-auto h-7 gap-1"
                                  onClick={() => {
                                    window.open(`/api/prescriptions/${v.prescription?.id}/pdf`, '_blank')
                                  }}
                                >
                                  Print
                                </Button>
                              </div>
                              {v.prescription.diagnosis && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Diagnosis:</span>{' '}
                                  <span className="text-sm">{v.prescription.diagnosis}</span>
                                </div>
                              )}
                              {v.prescription.clinicalNotes && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Clinical Notes:</span>
                                  <p className="mt-1 text-sm">{v.prescription.clinicalNotes}</p>
                                </div>
                              )}
                              {v.prescription.medicines.length > 0 && (
                                <div className="mt-3">
                                  <p className="mb-2 text-sm font-medium">Medicines:</p>
                                  <div className="space-y-2">
                                    {v.prescription.medicines.map((m) => (
                                      <div key={m.id} className="rounded-md border bg-background p-2 text-sm">
                                        <div className="font-medium">{m.medicineName}</div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                          <span>Dosage: {m.dosage}</span>
                                          <span className="mx-2">•</span>
                                          <span>Frequency: {m.frequency}</span>
                                          <span className="mx-2">•</span>
                                          <span>Duration: {m.duration}</span>
                                        </div>
                                        {m.instructions && (
                                          <div className="mt-1 text-xs text-muted-foreground">
                                            Instructions: {m.instructions}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Procedure Orders */}
                          {v.procedureOrders && v.procedureOrders.length > 0 && (
                            <div className="space-y-2 rounded-lg border bg-card p-4">
                              <div className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold">Procedure Orders</h4>
                              </div>
                              <div className="space-y-2">
                                {v.procedureOrders.map((o) => (
                                  <div key={o.id} className="flex items-start justify-between rounded-md border bg-background p-2 text-sm">
                                    <div>
                                      <div className="font-medium">
                                        {o.procedure.name}{' '}
                                        <span className="text-xs text-muted-foreground">({o.procedure.code})</span>
                                      </div>
                                      {o.notes && (
                                        <div className="mt-1 text-xs text-muted-foreground">{o.notes}</div>
                                      )}
                                    </div>
                                    <Badge
                                      variant={o.status === 'COMPLETED' ? 'secondary' : 'outline'}
                                      className="rounded-full"
                                    >
                                      {o.status === 'COMPLETED' ? 'Completed' : 'Requested'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* No prescription or procedures message */}
                          {!v.prescription && (!v.procedureOrders || v.procedureOrders.length === 0) && (
                            <p className="text-sm text-muted-foreground italic">
                              No prescription or procedure orders recorded for this visit.
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Prescription and Procedures for Selected Historical Visit (if not active) */}
          {selectedVisit && selectedVisit.id !== activeVisit?.id && (
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
                  {isLoadingOrders ? (
                    <LoadingSpinner size="md" text="Loading procedure orders…" />
                  ) : (
                    <ProcedureOrdersSection
                      visitId={selectedVisit.id}
                      orders={procedureOrders}
                      onOrdersChange={(orders) => {
                        setProcedureOrders(orders)
                        history.refetch()
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </PageContainer>
    </Layout>
  )
}
