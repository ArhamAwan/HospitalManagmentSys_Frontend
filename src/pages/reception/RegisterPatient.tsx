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
        <div className="mx-auto max-w-2xl space-y-4">
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
              <CardHeader>
                <CardTitle className="text-emerald-800">Patient registered</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-emerald-700">
                  You can now search for this patient and create a visit.
                </p>
                <button
                  type="button"
                  onClick={registerAnother}
                  className="text-left text-sm font-medium text-emerald-800 underline hover:no-underline"
                >
                  Register another patient
                </button>
              </CardContent>
            </SurfaceCard>
          )}
          <SurfaceCard>
            <CardHeader>
              <CardTitle>New Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientForm
                key={formKey}
                onSubmit={handleSubmit}
                isLoading={create.isPending}
              />
            </CardContent>
          </SurfaceCard>
        </div>
      </PageContainer>
    </Layout>
  )
}
