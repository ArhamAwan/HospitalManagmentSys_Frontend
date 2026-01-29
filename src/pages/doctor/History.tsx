import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useQuery } from '@tanstack/react-query'
import { doctorsApi } from '@/api/doctors'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import {
  History,
  Calendar,
  User,
  DollarSign,
  FileText,
  ClipboardList,
  Search,
  Stethoscope,
} from 'lucide-react'
import type { VisitStatus } from '@/types/visit'
import { useDebounce } from '@/hooks/useDebounce'

const STATUS_LABELS: Record<VisitStatus, string> = {
  WAITING: 'Waiting',
  IN_CONSULTATION: 'In consultation',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export function DoctorHistory() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  const doctorId = user?.doctorId

  const historyQuery = useQuery({
    queryKey: ['doctor', doctorId, 'history'],
    queryFn: () => doctorsApi.getHistory(doctorId!),
    enabled: !!doctorId,
  })

  const filteredVisits = useMemo(() => {
    if (!historyQuery.data) return []
    if (!debouncedSearch.trim()) return historyQuery.data

    const query = debouncedSearch.toLowerCase()
    return historyQuery.data.filter((v) => {
      const patientName = v.patient?.name?.toLowerCase() ?? ''
      const patientId = v.patient?.patientId?.toLowerCase() ?? ''
      const diagnosis = v.prescription?.diagnosis?.toLowerCase() ?? ''
      const tokenStr = v.tokenNumber.toString()

      return (
        patientName.includes(query) ||
        patientId.includes(query) ||
        diagnosis.includes(query) ||
        tokenStr.includes(query)
      )
    })
  }, [historyQuery.data, debouncedSearch])

  if (!doctorId) {
    return (
      <Layout>
        <PageContainer title="History">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-sm text-muted-foreground">
                Your account is not linked to a doctor. Contact an administrator.
              </p>
            </CardContent>
          </Card>
        </PageContainer>
      </Layout>
    )
  }

  return (
    <Layout>
      <PageContainer title="Consultation History">
        <div className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                All Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, ID, diagnosis, or token number…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {historyQuery.data && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Showing {filteredVisits.length} of {historyQuery.data.length} consultations
                </p>
              )}
            </CardContent>
          </Card>

          {/* History List */}
          {historyQuery.isLoading ? (
            <Card>
              <CardContent className="py-12">
                <LoadingSpinner size="lg" text="Loading consultation history…" />
              </CardContent>
            </Card>
          ) : historyQuery.isError ? (
            <Card>
              <CardContent className="py-8">
                <ErrorMessage
                  message="Failed to load consultation history."
                  onRetry={() => historyQuery.refetch()}
                />
              </CardContent>
            </Card>
          ) : !filteredVisits.length ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-sm text-muted-foreground">
                  {debouncedSearch
                    ? 'No consultations found matching your search.'
                    : 'No consultation history available.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {filteredVisits.map((v) => (
                    <AccordionItem key={v.id} value={v.id} className="border-b px-6">
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
                            <Badge
                              variant={
                                v.status === 'COMPLETED'
                                  ? 'secondary'
                                  : v.status === 'IN_CONSULTATION'
                                    ? 'default'
                                    : 'outline'
                              }
                              className="rounded-full"
                            >
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
                              <span>{v.patient?.name ?? 'N/A'}</span>
                              <span className="text-xs">({v.patient?.patientId ?? 'N/A'})</span>
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
                              <span className="font-medium text-muted-foreground">Patient:</span>{' '}
                              <Link
                                to={`/doctor/patient/${v.patientId}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {v.patient?.name ?? 'N/A'}
                              </Link>
                              <span className="text-muted-foreground">
                                {' '}
                                ({v.patient?.patientId ?? 'N/A'})
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Age/Gender:</span>{' '}
                              <span>
                                {v.patient?.age ?? 'N/A'} / {v.patient?.gender ?? 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Visit Date:</span>{' '}
                              <span>{format(new Date(v.visitDate), 'PPpp')}</span>
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
                              <Badge
                                variant={v.status === 'COMPLETED' ? 'secondary' : 'outline'}
                                className="rounded-full"
                              >
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
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Diagnosis:
                                  </span>{' '}
                                  <span className="text-sm">{v.prescription.diagnosis}</span>
                                </div>
                              )}
                              {v.prescription.clinicalNotes && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Clinical Notes:
                                  </span>
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
                                  <div
                                    key={o.id}
                                    className="flex items-start justify-between rounded-md border bg-background p-2 text-sm"
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {o.procedure.name}{' '}
                                        <span className="text-xs text-muted-foreground">
                                          ({o.procedure.code})
                                        </span>
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

                          {/* View Patient Details Link */}
                          <div className="pt-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/doctor/patient/${v.patientId}`}>
                                <Stethoscope className="mr-2 h-4 w-4" />
                                View Patient Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </Layout>
  )
}
