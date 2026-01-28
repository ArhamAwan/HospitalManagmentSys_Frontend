import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { PatientForm } from '@/components/forms/PatientForm'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SurfaceCard } from '@/components/ui/surface-card'
import { usePatientCreate } from '@/hooks/usePatients'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import type { CreatePatientDto } from '@/types/patient'

export function RegisterPatient() {
  const create = usePatientCreate()
  const [successId, setSuccessId] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)

  const handleSubmit = async (data: CreatePatientDto) => {
    const p = await create.mutateAsync(data)
    setSuccessId(p.id)
  }

  const registerAnother = () => {
    setSuccessId(null)
    setFormKey((k) => k + 1)
  }

  return (
    <Layout>
      <PageContainer
        title="Register Patient"
        breadcrumbs={[{ label: 'Reception', to: '/reception' }, { label: 'Register Patient' }]}
      >
        <div className="mx-auto max-w-5xl space-y-4">
          {create.isError && (
            <ErrorMessage
              message={
                (create.error as { response?: { data?: { message?: string } } })?.response?.data
                  ?.message ?? 'Failed to register patient.'
              }
              onRetry={() => create.reset()}
              onDismiss={() => create.reset()}
            />
          )}
          {successId && (
            <SurfaceCard className="border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-background to-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-emerald-800">
                  Patient registered
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <p className="text-emerald-700">
                  You can now search for this patient and create a visit from the reception
                  dashboard.
                </p>
                <button
                  type="button"
                  onClick={registerAnother}
                  className="self-start text-sm font-medium text-emerald-800 underline hover:no-underline"
                >
                  Register another patient
                </button>
              </CardContent>
            </SurfaceCard>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(260px,1fr)]">
            <SurfaceCard>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">New patient</CardTitle>
              </CardHeader>
              <CardContent>
                <PatientForm
                  key={formKey}
                  onSubmit={handleSubmit}
                  isLoading={create.isPending}
                />
              </CardContent>
            </SurfaceCard>

            <SurfaceCard className="hidden lg:block">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Quick guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Use this form at both **Reception** and **Admin** desks to create a new patient
                  profile. Required fields are marked and validated automatically.
                </p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Phone numbers must follow the 03XXXXXXXXX format.</li>
                  <li>Address is optional and can be updated later from the patient record.</li>
                  <li>After saving, you can immediately create a visit from the search screen.</li>
                </ul>
              </CardContent>
            </SurfaceCard>
          </div>
        </div>
      </PageContainer>
    </Layout>
  )
}
