import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUsersApi, type AdminUser, type CreateAdminUserDto, type UpdateAdminUserDto, type UserStatus } from '@/api/adminUsers'
import { Layout } from '@/components/layout/Layout'
import { PageContainer } from '@/components/layout/PageContainer'
import { SurfaceCard } from '@/components/ui/surface-card'
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import type { UserRole } from '@/types/user'

const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'RECEPTION', 'DOCTOR', 'NURSE']
const STATUS_OPTIONS: UserStatus[] = ['ACTIVE', 'LOCKED', 'DISABLED']

function formatRole(role: UserRole) {
  if (role === 'ADMIN') return 'Admin'
  if (role === 'RECEPTION') return 'Reception'
  if (role === 'DOCTOR') return 'Doctor'
  if (role === 'NURSE') return 'Nurse'
  return role
}

export function AdminUsers() {
  const qc = useQueryClient()
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL')
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'ALL'>('ALL')

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const [createForm, setCreateForm] = useState<CreateAdminUserDto>({
    username: '',
    password: '',
    role: 'RECEPTION',
  })

  const [editForm, setEditForm] = useState<UpdateAdminUserDto>({})
  const [password, setPassword] = useState('')

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminUsersApi.list(),
  })

  const createUser = useMutation({
    mutationFn: (dto: CreateAdminUserDto) => adminUsersApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setCreateOpen(false)
      setCreateForm({ username: '', password: '', role: 'RECEPTION' })
    },
  })

  const updateUser = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAdminUserDto }) =>
      adminUsersApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setEditOpen(false)
      setSelectedUser(null)
      setEditForm({})
    },
  })

  const resetPassword = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminUsersApi.resetPassword(id, password),
    onSuccess: () => {
      setPassword('')
      setPasswordOpen(false)
      setSelectedUser(null)
    },
  })

  const filtered = (usersQuery.data ?? []).filter((u) => {
    if (filterRole !== 'ALL' && u.role !== filterRole) return false
    if (filterStatus !== 'ALL' && u.status !== filterStatus) return false
    return true
  })

  const openEdit = (u: AdminUser) => {
    setSelectedUser(u)
    setEditForm({ username: u.username, role: u.role, status: u.status })
    setEditOpen(true)
  }

  const openPassword = (u: AdminUser) => {
    setSelectedUser(u)
    setPassword('')
    setPasswordOpen(true)
  }

  return (
    <Layout>
      <PageContainer
        title="Users"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Users' }]}
      >
        <div className="space-y-4">
          <SurfaceCard>
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-xl">User Management</CardTitle>
                <CardDescription>
                  Add, edit, and manage user accounts and roles.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                New user
              </Button>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filterRole}
                  onValueChange={(v) => setFilterRole(v as UserRole | 'ALL')}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All roles</SelectItem>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {formatRole(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filterStatus}
                  onValueChange={(v) => setFilterStatus(v as UserStatus | 'ALL')}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {usersQuery.isLoading && (
                <div className="py-8 flex justify-center">
                  <LoadingSpinner size="md" text="Loading users…" />
                </div>
              )}

              {usersQuery.isError && (
                <ErrorMessage
                  message="Failed to load users."
                  onRetry={() => usersQuery.refetch()}
                />
              )}

              {!usersQuery.isLoading && !usersQuery.isError && (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[180px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>{u.username}</TableCell>
                          <TableCell>{formatRole(u.role)}</TableCell>
                          <TableCell>{u.status}</TableCell>
                          <TableCell>{u.doctorName ?? '-'}</TableCell>
                          <TableCell>
                            {new Date(u.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openPassword(u)}>
                                Reset password
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-sm text-muted-foreground py-6"
                          >
                            No users found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </SurfaceCard>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New user</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, username: e.target.value }))
                  }
                  placeholder="Username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={createForm.role}
                  onValueChange={(v) =>
                    setCreateForm((f) => ({ ...f, role: v as UserRole }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {formatRole(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createUser.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createUser.mutate(createForm)}
                disabled={
                  createUser.isPending ||
                  !createForm.username ||
                  !createForm.password
                }
              >
                {createUser.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit user</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={editForm.username ?? ''}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, username: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={editForm.role ?? selectedUser?.role ?? 'RECEPTION'}
                  onValueChange={(v) =>
                    setEditForm((f) => ({ ...f, role: v as UserRole }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {formatRole(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editForm.status ?? selectedUser?.status ?? 'ACTIVE'}
                  onValueChange={(v) =>
                    setEditForm((f) => ({ ...f, status: v as UserStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={updateUser.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedUser) return
                  updateUser.mutate({ id: selectedUser.id, dto: editForm })
                }}
                disabled={updateUser.isPending || !selectedUser}
              >
                {updateUser.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set a new password for{' '}
                <span className="font-medium">
                  {selectedUser?.username ?? ''}
                </span>
                .
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">New password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setPasswordOpen(false)}
                disabled={resetPassword.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedUser) return
                  resetPassword.mutate({ id: selectedUser.id, password })
                }}
                disabled={resetPassword.isPending || !password}
              >
                {resetPassword.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </Layout>
  )
}

