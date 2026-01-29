import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { SurfaceCard } from '@/components/ui/surface-card'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import {
  adminConfigApi,
  type AdminDoctorConfig,
  type AdminRoom,
  type AdminProcedure,
  type CreateRoomDto,
  type CreateProcedureDto,
  type UpdateDoctorConfigDto,
  type UpdateRoomDto,
  type UpdateProcedureDto,
} from '@/api/adminConfig'

function DoctorsTab() {
  const qc = useQueryClient()
  const doctorsQuery = useQuery({
    queryKey: ['admin', 'config', 'doctors'],
    queryFn: () => adminConfigApi.listDoctors(),
  })
  const roomsQuery = useQuery({
    queryKey: ['admin', 'config', 'rooms'],
    queryFn: () => adminConfigApi.listRooms(),
  })

  const [editing, setEditing] = useState<AdminDoctorConfig | null>(null)
  const [form, setForm] = useState<UpdateDoctorConfigDto>({})

  const updateDoctor = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDoctorConfigDto }) =>
      adminConfigApi.updateDoctor(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'config', 'doctors'] })
      setEditing(null)
      setForm({})
    },
  })

  const openEdit = (d: AdminDoctorConfig) => {
    setEditing(d)
    setForm({
      name: d.name,
      specialization: d.specialization,
      consultationFee: d.consultationFee,
      roomNumber: d.roomNumber,
    })
  }

  return (
    <SurfaceCard>
      <CardHeader className="pb-3">
        <CardTitle>Doctors</CardTitle>
        <CardDescription>
          Manage doctor details, consultation fees, and assigned rooms.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {doctorsQuery.isLoading && (
          <div className="py-8 flex justify-center">
            <LoadingSpinner size="md" text="Loading doctors…" />
          </div>
        )}
        {doctorsQuery.isError && (
          <ErrorMessage
            message="Failed to load doctors."
            onRetry={() => doctorsQuery.refetch()}
          />
        )}
        {!doctorsQuery.isLoading && !doctorsQuery.isError && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Consultation fee</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(doctorsQuery.data ?? []).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.specialization}</TableCell>
                    <TableCell>Rs. {d.consultationFee}</TableCell>
                    <TableCell>{d.roomNumber}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(d)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(doctorsQuery.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-sm text-muted-foreground py-6"
                    >
                      No doctors configured.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialization</label>
              <Input
                value={form.specialization ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, specialization: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Consultation fee</label>
              <Input
                type="number"
                value={form.consultationFee?.toString() ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    consultationFee: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Room</label>
              {roomsQuery.isLoading || roomsQuery.isError ? (
                <Input
                  value={form.roomNumber ?? editing?.roomNumber ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, roomNumber: e.target.value }))
                  }
                  placeholder="Room"
                />
              ) : (
                <Select
                  value={form.roomNumber ?? editing?.roomNumber ?? ''}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, roomNumber: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {(roomsQuery.data ?? []).map((r) => (
                      <SelectItem key={r.id} value={r.name}>
                        {r.name} ({r.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={updateDoctor.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editing) return
                updateDoctor.mutate({ id: editing.id, dto: form })
              }}
              disabled={updateDoctor.isPending || !editing}
            >
              {updateDoctor.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SurfaceCard>
  )
}

function RoomsTab() {
  const qc = useQueryClient()
  const roomsQuery = useQuery({
    queryKey: ['admin', 'config', 'rooms'],
    queryFn: () => adminConfigApi.listRooms(),
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<AdminRoom | null>(null)
  const [createForm, setCreateForm] = useState<CreateRoomDto>({ code: '', name: '', floor: '' })
  const [editForm, setEditForm] = useState<UpdateRoomDto>({})

  const createRoom = useMutation({
    mutationFn: (dto: CreateRoomDto) => adminConfigApi.createRoom(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'config', 'rooms'] })
      setCreateOpen(false)
      setCreateForm({ code: '', name: '', floor: '' })
    },
  })

  const updateRoom = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoomDto }) =>
      adminConfigApi.updateRoom(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'config', 'rooms'] })
      setEditing(null)
      setEditForm({})
    },
  })

  const deleteRoom = useMutation({
    mutationFn: (id: string) => adminConfigApi.deleteRoom(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'config', 'rooms'] })
    },
  })

  const openEdit = (r: AdminRoom) => {
    setEditing(r)
    setEditForm({
      code: r.code,
      name: r.name,
      floor: r.floor ?? '',
      status: r.status,
    })
  }

  return (
    <SurfaceCard>
      <CardHeader className="pb-3">
        <CardTitle>Rooms</CardTitle>
        <CardDescription>
          Configure consultation rooms and their status.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            New room
          </Button>
        </div>
        {roomsQuery.isLoading && (
          <div className="py-8 flex justify-center">
            <LoadingSpinner size="md" text="Loading rooms…" />
          </div>
        )}
        {roomsQuery.isError && (
          <ErrorMessage
            message="Failed to load rooms."
            onRetry={() => roomsQuery.refetch()}
          />
        )}
        {!roomsQuery.isLoading && !roomsQuery.isError && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(roomsQuery.data ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.code}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.floor ?? '-'}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(r)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteRoom.mutate(r.id)}
                          disabled={deleteRoom.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(roomsQuery.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-sm text-muted-foreground py-6"
                    >
                      No rooms configured.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input
                value={createForm.code ?? ''}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, code: e.target.value }))
                }
                placeholder="Leave blank for auto-generated"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Floor</label>
              <Input
                value={createForm.floor ?? ''}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, floor: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createRoom.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createRoom.mutate(createForm)}
              disabled={
                createRoom.isPending || !createForm.name
              }
            >
              {createRoom.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input value={editing?.code ?? ''} disabled className="bg-muted/60" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Floor</label>
              <Input
                value={editForm.floor ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, floor: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editForm.status ?? editing?.status ?? 'ACTIVE'}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, status: v as AdminRoom['status'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={updateRoom.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editing) return
                updateRoom.mutate({ id: editing.id, dto: editForm })
              }}
              disabled={updateRoom.isPending || !editing}
            >
              {updateRoom.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SurfaceCard>
  )
}

function ProceduresTab() {
  const qc = useQueryClient()
  const proceduresQuery = useQuery({
    queryKey: ['admin', 'config', 'procedures'],
    queryFn: () => adminConfigApi.listProcedures(),
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProcedure | null>(null)
  const [createForm, setCreateForm] = useState<CreateProcedureDto>({
    code: '',
    name: '',
    department: '',
    defaultFee: 0,
    hourlyRate: undefined,
  })
  const [editForm, setEditForm] = useState<UpdateProcedureDto>({})

  const createProcedure = useMutation({
    mutationFn: (dto: CreateProcedureDto) => adminConfigApi.createProcedure(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'config', 'procedures'] })
      setCreateOpen(false)
      setCreateForm({ code: '', name: '', department: '', defaultFee: 0, hourlyRate: undefined })
    },
  })

  const updateProcedure = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProcedureDto }) =>
      adminConfigApi.updateProcedure(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'config', 'procedures'] })
      setEditing(null)
      setEditForm({})
    },
  })

  const deleteProcedure = useMutation({
    mutationFn: (id: string) => adminConfigApi.deleteProcedure(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'config', 'procedures'] })
    },
  })

  const openEdit = (p: AdminProcedure) => {
    setEditing(p)
    setEditForm({
      code: p.code,
      name: p.name,
      department: p.department ?? '',
      defaultFee: p.defaultFee,
      hourlyRate: p.hourlyRate ?? undefined,
    })
  }

  return (
    <SurfaceCard>
      <CardHeader className="pb-3">
        <CardTitle>Procedures</CardTitle>
        <CardDescription>
          Manage procedure catalog and default fees.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            New procedure
          </Button>
        </div>
        {proceduresQuery.isLoading && (
          <div className="py-8 flex justify-center">
            <LoadingSpinner size="md" text="Loading procedures…" />
          </div>
        )}
        {proceduresQuery.isError && (
          <ErrorMessage
            message="Failed to load procedures."
            onRetry={() => proceduresQuery.refetch()}
          />
        )}
        {!proceduresQuery.isLoading && !proceduresQuery.isError && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Default fee</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(proceduresQuery.data ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.code}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.department ?? '-'}</TableCell>
                    <TableCell>Rs. {p.defaultFee}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProcedure.mutate(p.id)}
                          disabled={deleteProcedure.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(proceduresQuery.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-sm text-muted-foreground py-6"
                    >
                      No procedures configured.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New procedure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input
                value={createForm.code ?? ''}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, code: e.target.value }))
                }
                placeholder="Leave blank for auto-generated"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input
                value={createForm.department ?? ''}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, department: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default fee</label>
              <Input
                type="number"
                value={createForm.defaultFee.toString()}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    defaultFee: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hourly rate (optional, for duration-based billing)</label>
              <Input
                type="number"
                step="0.01"
                value={createForm.hourlyRate?.toString() ?? ''}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    hourlyRate: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                placeholder="Leave blank if not applicable"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createProcedure.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createProcedure.mutate(createForm)}
              disabled={
                createProcedure.isPending ||
                !createForm.name ||
                !createForm.defaultFee
              }
            >
              {createProcedure.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit procedure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input value={editing?.code ?? ''} disabled className="bg-muted/60" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input
                value={editForm.department ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, department: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default fee</label>
              <Input
                type="number"
                value={editForm.defaultFee?.toString() ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    defaultFee: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hourly rate (optional, for duration-based billing)</label>
              <Input
                type="number"
                step="0.01"
                value={editForm.hourlyRate?.toString() ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    hourlyRate: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                placeholder="Leave blank if not applicable"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={updateProcedure.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editing) return
                updateProcedure.mutate({ id: editing.id, dto: editForm })
              }}
              disabled={updateProcedure.isPending || !editing}
            >
              {updateProcedure.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SurfaceCard>
  )
}

export function AdminConfig() {
  const [tab, setTab] = useState<'doctors' | 'rooms' | 'procedures'>('doctors')

  return (
    <Layout>
      <PageContainer
        title="Configuration"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Configuration' }]}
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 p-1">
            <Button
              type="button"
              size="sm"
              variant={tab === 'doctors' ? 'default' : 'ghost'}
              className="rounded-full px-4"
              onClick={() => setTab('doctors')}
            >
              Doctors
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tab === 'rooms' ? 'default' : 'ghost'}
              className="rounded-full px-4"
              onClick={() => setTab('rooms')}
            >
              Rooms
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tab === 'procedures' ? 'default' : 'ghost'}
              className="rounded-full px-4"
              onClick={() => setTab('procedures')}
            >
              Procedures
            </Button>
          </div>

          {tab === 'doctors' && <DoctorsTab />}
          {tab === 'rooms' && <RoomsTab />}
          {tab === 'procedures' && <ProceduresTab />}
        </div>
      </PageContainer>
    </Layout>
  )
}

