import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SurfaceCard } from '@/components/ui/surface-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDebounce } from '@/hooks/useDebounce'
import { usePatientsSearch } from '@/hooks/usePatients'
import { VisitForm } from '@/components/forms/VisitForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Search, UserPlus } from 'lucide-react'
import type { Patient } from '@/types/patient'

export function SearchPatient() {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 300)
  const search = usePatientsSearch(debounced)
  const [selected, setSelected] = useState<Patient | null>(null)
  const [visitOpen, setVisitOpen] = useState(false)

  const openVisit = (p: Patient) => {
    setSelected(p)
    setVisitOpen(true)
  }

  const closeVisit = () => {
    setVisitOpen(false)
    setSelected(null)
  }

  return (
    <Layout>
      <PageContainer
        title="Search Patient"
        breadcrumbs={[{ label: 'Reception', to: '/reception' }, { label: 'Search Patient' }]}
      >
        <div className="space-y-4">
          <SurfaceCard className="p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or patient ID…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                  aria-label="Search patients"
                />
              </div>
            </div>
          </SurfaceCard>

          {search.isError && (
            <ErrorMessage
              message="Failed to search patients."
              onRetry={() => search.refetch()}
            />
          )}

          {debounced.length < 2 && (
            <EmptyState
              icon={Search}
              title="Enter search"
              description="Type at least 2 characters to search patients."
            />
          )}

          {debounced.length >= 2 && search.isLoading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Searching…" />
            </div>
          )}

          {debounced.length >= 2 && search.isSuccess && (
            <>
              {search.data.length === 0 ? (
                <EmptyState
                  icon={UserPlus}
                  title="No patients found"
                  description="Try a different search or register a new patient."
                />
              ) : (
                <div className="overflow-hidden rounded-xl border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {search.data.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-sm">{p.patientId}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.age}</TableCell>
                          <TableCell>{p.gender}</TableCell>
                          <TableCell>{p.phone}</TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => openVisit(p)}>
                              Create visit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>

        <Dialog open={visitOpen} onOpenChange={(o) => !o && closeVisit()}>
          <DialogContent showClose={true}>
            <DialogHeader>
              <DialogTitle>Create Visit</DialogTitle>
            </DialogHeader>
            {selected && (
              <VisitForm
                patient={selected}
                onCancel={closeVisit}
                onSuccess={() => {
                  closeVisit()
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </PageContainer>
    </Layout>
  )
}
