import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { Search, Users, ShieldCheck, ArrowLeftRight } from 'lucide-react'
import { api } from '@/lib/axios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/classNames'
import type { AdminUser } from '@/features/admin/types'

const roleBadge: Record<string, string> = {
  admin:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  trainer: 'bg-teal-light text-teal dark:bg-teal-900/30 dark:text-teal-300',
  student: 'bg-brand-light text-brand-blue dark:bg-blue-900/30 dark:text-blue-300',
}
const statusVariant: Record<AdminUser['status'], 'submitted' | 'pending' | 'overdue'> = {
  active: 'submitted', pending: 'pending', suspended: 'overdue',
}

export default function AdminUsersPage() {
  usePageTitle('User Management — Admin')
  const queryClient = useQueryClient()
  const [search,  setSearch]  = useState('')
  const [roleFilter, setRole] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [reassignStudentId, setReassignStudentId] = useState<string | null>(null)
  const [selectedTrainerId, setSelectedTrainerId] = useState('')
  const q = useDebounce(search)

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => { const r = await api.get<{ data: AdminUser[] }>('/admin/users'); return r.data.data },
  })

  const { data: trainers } = useQuery({
    queryKey: ['admin', 'trainers'],
    queryFn: async () => { const r = await api.get<{ data: { id: string; name: string; email: string }[] }>('/admin/trainers'); return r.data.data },
    enabled: reassignStudentId !== null,
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      api.patch(`/admin/users/${id}`, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setSuccessMessage(
        variables.status === 'active' ? 'User approved/activated. They can now log in.' : 'User suspended.'
      )
    },
  })

  const reassignMutation = useMutation({
    mutationFn: ({ studentId, newTrainerId }: { studentId: string; newTrainerId: string }) =>
      api.post('/admin/reassign-student', { studentId, newTrainerId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setSuccessMessage(data.data.data?.message || 'Student reassigned successfully.')
      setReassignStudentId(null)
      setSelectedTrainerId('')
    },
    onError: () => {
      setSuccessMessage('Failed to reassign student. Please try again.')
    },
  })

  const filtered = useMemo(() => users?.filter(u => {
    const matchQ    = !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchQ && matchRole
  }) ?? [], [users, q, roleFilter])

  const pendingCount = users?.filter(u => u.status === 'pending').length ?? 0

  return (
    <div>
      <PageHeader title="User Management" subtitle={`${users?.length ?? 0} registered users${pendingCount ? ` · ${pendingCount} awaiting approval` : ''}`} />

      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" aria-label="Search users"
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm focus:outline-none focus:border-brand-blue dark:text-white placeholder:text-gray-400" />
        </div>
        <div role="group" aria-label="Filter by role" className="flex gap-2">
          {['', 'student', 'trainer', 'admin'].map(r => (
            <button key={r} aria-pressed={roleFilter === r} onClick={() => setRole(r)}
              className={cn('px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all', roleFilter === r ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700')}>
              {r || 'All'}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 self-center ml-auto" aria-live="polite">{filtered.length} users</span>
      </div>

      {isLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      : !filtered.length ? <EmptyState icon={<Users className="w-16 h-16" />} title="No users found" description="Try adjusting your search or filter." />
      : <div className="hidden md:block rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full min-w-[720px]" aria-label="User list">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>{['User', 'Role', 'Status', 'Joined', 'Last Active', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(u => {
                const isPendingTrainer = u.role === 'trainer' && u.status === 'pending'
                return (
                  <tr key={u.id} className={cn('bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors', isPendingTrainer && 'bg-orange-50/50 dark:bg-orange-900/5')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${u.role === 'admin' ? 'bg-red-600' : u.role === 'trainer' ? 'bg-teal' : 'bg-brand-blue'}`}>{u.name[0]}</div>
                        <div className="min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p><p className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', roleBadge[u.role])}>{u.role}</span></td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[u.status]}>{isPendingTrainer ? 'Awaiting Approval' : u.status}</Badge></td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDate(u.joinedAt)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDate(u.lastActive)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {isPendingTrainer ? (
                          <>
                            <Button size="sm" loading={updateUserMutation.isPending} aria-label={`Approve ${u.name}`}
                              onClick={() => updateUserMutation.mutate({ id: u.id, status: 'active' })}>
                              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Approve
                            </Button>
                            <Button variant="danger" size="sm" loading={updateUserMutation.isPending} aria-label={`Reject ${u.name}`}
                              onClick={() => updateUserMutation.mutate({ id: u.id, status: 'suspended' })}>
                              Reject
                            </Button>
                          </>
                        ) : u.role === 'student' ? (
                          <>
                            <Button size="sm" variant="secondary" onClick={() => setReassignStudentId(reassignStudentId === u.id ? null : u.id)}>
                              <ArrowLeftRight className="w-3.5 h-3.5 mr-1" /> Reassign
                            </Button>
                            <Button
                              variant="danger" size="sm" loading={updateUserMutation.isPending}
                              aria-label={`${u.status === 'active' ? 'Suspend' : 'Activate'} ${u.name}`}
                              onClick={() => updateUserMutation.mutate({ id: u.id, status: u.status === 'active' ? 'suspended' : 'active' })}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
                            </Button>
                          </>
                        ) : u.role !== 'admin' && (
                          <Button
                            variant="danger" size="sm" loading={updateUserMutation.isPending}
                            aria-label={`${u.status === 'active' ? 'Suspend' : 'Activate'} ${u.name}`}
                            onClick={() => updateUserMutation.mutate({ id: u.id, status: u.status === 'active' ? 'suspended' : 'active' })}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </Button>
                        )}
                      </div>
                      {reassignStudentId === u.id && trainers && (
                        <div className="mt-2 flex items-center gap-2">
                          <select
                            value={selectedTrainerId}
                            onChange={e => setSelectedTrainerId(e.target.value)}
                            className="h-8 rounded border border-gray-200 bg-white px-2 text-xs dark:border-gray-700 dark:bg-gray-800"
                          >
                            <option value="">Select a trainer…</option>
                            {trainers.map(t => (
                              <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            loading={reassignMutation.isPending}
                            disabled={!selectedTrainerId}
                            onClick={() => reassignMutation.mutate({ studentId: u.id, newTrainerId: selectedTrainerId })}
                          >
                            Confirm
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>}

      {/* Mobile cards */}
      {!isLoading && filtered.length > 0 && (
        <div className="md:hidden space-y-3">
          {filtered.map(u => {
            const isPendingTrainer = u.role === 'trainer' && u.status === 'pending'
            return (
              <div key={u.id} className={cn('rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-4', isPendingTrainer && 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/5')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${u.role === 'admin' ? 'bg-red-600' : u.role === 'trainer' ? 'bg-teal' : 'bg-brand-blue'}`}>{u.name[0]}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', roleBadge[u.role])}>{u.role}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-3">
                  <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">Status: <Badge variant={statusVariant[u.status]}>{isPendingTrainer ? 'Awaiting Approval' : u.status}</Badge></span>
                  <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">Joined: {formatDate(u.joinedAt)}</span>
                  <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">Last active: {formatDate(u.lastActive)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {isPendingTrainer ? (
                    <div className="flex gap-2">
                      <Button size="sm" loading={updateUserMutation.isPending} onClick={() => updateUserMutation.mutate({ id: u.id, status: 'active' })}>
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button variant="danger" size="sm" loading={updateUserMutation.isPending} onClick={() => updateUserMutation.mutate({ id: u.id, status: 'suspended' })}>
                        Reject
                      </Button>
                    </div>
                  ) : u.role === 'student' ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setReassignStudentId(reassignStudentId === u.id ? null : u.id)}>
                          <ArrowLeftRight className="w-3.5 h-3.5 mr-1" /> Reassign
                        </Button>
                        <Button variant="danger" size="sm" loading={updateUserMutation.isPending} onClick={() => updateUserMutation.mutate({ id: u.id, status: u.status === 'active' ? 'suspended' : 'active' })}>
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      </div>
                      {reassignStudentId === u.id && trainers && (
                        <div className="flex items-center gap-2">
                          <select value={selectedTrainerId} onChange={e => setSelectedTrainerId(e.target.value)} className="h-8 rounded border border-gray-200 bg-white px-2 text-xs dark:border-gray-700 dark:bg-gray-800">
                            <option value="">Select a trainer…</option>
                            {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                          </select>
                          <Button size="sm" loading={reassignMutation.isPending} disabled={!selectedTrainerId} onClick={() => reassignMutation.mutate({ studentId: u.id, newTrainerId: selectedTrainerId })}>
                            Confirm
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : u.role !== 'admin' && (
                    <Button variant="danger" size="sm" loading={updateUserMutation.isPending} onClick={() => updateUserMutation.mutate({ id: u.id, status: u.status === 'active' ? 'suspended' : 'active' })}>
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
