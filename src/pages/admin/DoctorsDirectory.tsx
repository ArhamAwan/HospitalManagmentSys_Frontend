import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { SurfaceCard } from '@/components/ui/surface-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { doctorsApi } from '@/api/doctors'
import { useQuery } from '@tanstack/react-query'
import type { Doctor } from '@/types/visit'

export function DoctorsDirectory() {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['admin', 'doctors-directory'],
    queryFn: () => doctorsApi.getAll(),
  })

  const [specialization, setSpecialization] = useState<string>('all')

  const specializations = useMemo(() => {
    if (!doctors) return []
    const set = new Set(doctors.map((d) => d.specialization).filter(Boolean))
    return Array.from(set)
  }, [doctors])

  const filtered = useMemo(() => {
    if (!doctors) return []
    return doctors.filter((d) => (specialization === 'all' ? true : d.specialization === specialization))
  }, [doctors, specialization])

  return (
    <Layout>
      <PageContainer
        title="Doctors directory"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Doctors' }]}
      >
        <div className="space-y-6">
          <SurfaceCard className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="space-y-0.5">
                <h2 className="text-lg font-semibold leading-tight tracking-tight text-foreground">
                  Browse doctors
                </h2>
                <p className="max-w-xl text-sm text-muted-foreground">
                  Find doctors by specialization and quickly see their basic details.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 md:pt-0">
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="h-9 w-40 sm:w-48 text-sm">
                    <SelectValue placeholder="All specializations" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">All specializations</SelectItem>
                    {specializations.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SurfaceCard>

          <section aria-label="Doctors grid">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading doctors…</p>
            ) : !filtered.length ? (
              <p className="text-sm text-muted-foreground">No doctors found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filtered.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            )}
          </section>
        </div>
      </PageContainer>
    </Layout>
  )
}

interface DoctorCardProps {
  doctor: Doctor
}

function DoctorCard({ doctor }: DoctorCardProps) {
  const navigate = useNavigate()
  const initials = doctor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)

  const status: 'AVAILABLE' | 'BUSY' = 'AVAILABLE'

  return (
    <Card className="relative overflow-hidden border bg-gradient-to-br from-muted/60 via-background to-background shadow-sm">
      <div className="absolute right-3 top-3">
        <Badge
          className={
            status === 'AVAILABLE'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }
        >
          {status === 'AVAILABLE' ? 'Available' : 'Busy'}
        </Badge>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials}
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-base leading-tight">Dr. {doctor.name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {doctor.specialization || 'General'} • Room {doctor.roomNumber}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3 pt-0">
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>Consultation fee</p>
          <p className="text-sm font-semibold text-foreground">
            Rs. {doctor.consultationFee.toFixed(0)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => navigate(`/doctor?doctorId=${doctor.id}`)}
        >
          View queue
        </Button>
      </CardContent>
    </Card>
  )
}

