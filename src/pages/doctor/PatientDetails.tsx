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
import type { VisitStatus } from '@/types/visit'

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
                <Accordion type="single" collapsible className="w-full">
                  {history.data.map((v) => (
                    <AccordionItem key={v.id} value={v.id}>
                      <AccordionTrigger>
                        {format(new Date(v.visitDate), 'PPp')} — {v.doctor?.name ?? 'Doctor'} —
                        Token {v.tokenNumber} — {STATUS_LABELS[v.status]}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Fee: Rs. {v.consultationFee}</p>
                          {v.isEmergency && <p>Emergency</p>}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </Layout>
  )
}
