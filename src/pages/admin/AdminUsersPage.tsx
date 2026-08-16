import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { Search, Users, ShieldCheck, ArrowLeftRight, Trash2, AlertTriangle } from 'lucide-react'
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

type ActionMode = 'suspend' | 'delete' | null

export default function AdminUsersPage() {
  usePageTitle('User Management — Admin')
  const queryClient = useQueryClient()
  const [search,  setSearch]  = useState('')
  const [roleFilter, setRole] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [reassignStudentId, setReassignStudentId] = useState<string | null>(null)
  const [selectedTrainerId, setSelectedTrainerId] = useState('')
  const [actionMode, setActionMode] = useState<ActionMode>(null)
  const [actionUserId, setActionUserId] = useState<string | null>(null)
  const [actionReason, setActionReason] = useState('')
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

  const suspendUserMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.patch(`/admin/users/${id}/suspend`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setSuccessMessage('User account has been suspended and notified via email.')
      setActionMode(null)
      setActionUserId(null)
      setActionReason('')
    },
    onError: () => {
      setSuccessMessage('Failed to suspend user. Please try again.')
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.delete(`/admin/users/${id}`, { data: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setSuccessMessage('User account has been deleted and notified via email.')
      setActionMode(null)
      setActionUserId(null)
      setActionReason('')
    },
    onError: () => {
      setSuccessMessage('Failed to delete user. Please try again.')
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
                              variant="danger" size="sm" loading={suspendUserMutation.isPending}
                              aria-label={`Suspend ${u.name}`}
                              onClick={() => { setActionMode('suspend'); setActionUserId(u.id) }}
                            >
                              Suspend
                            </Button>
                            <Button
                              variant="danger" size="sm" loading={deleteUserMutation.isPending}
                              aria-label={`Delete ${u.name}`}
                              onClick={() => { setActionMode('delete'); setActionUserId(u.id) }}
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </Button>
                          </>
                        ) : u.role !== 'admin' && (
                          <>
                            <Button
                              variant="danger" size="sm" loading={suspendUserMutation.isPending}
                              aria-label={`Suspend ${u.name}`}
                              onClick={() => { setActionMode('suspend'); setActionUserId(u.id) }}
                            >
                              Suspend
                            </Button>
                            <Button
                              variant="danger" size="sm" loading={deleteUserMutation.isPending}
                              aria-label={`Delete ${u.name}`}
                              onClick={() => { setActionMode('delete'); setActionUserId(u.id) }}
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </Button>
                          </>
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

      {/* Confirmation Modal */}
      {actionMode && actionUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-lg max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-semibold">
                {actionMode === 'delete' ? 'Delete Account?' : 'Suspend Account?'}
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {actionMode === 'delete' 
                ? 'This will permanently delete the user account and all associated data. The user will be notified via email.'
                : 'This will suspend the user account and prevent them from logging in. They will be notified via email.'}
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason (optional)
              </label>
              <textarea
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                placeholder={actionMode === 'delete' ? 'Why are you deleting this account?' : 'Why are you suspending this account?'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-brand-blue dark:bg-gray-800 dark:text-white resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setActionMode(null)
                  setActionUserId(null)
                  setActionReason('')
                }}
                disabled={actionMode === 'delete' ? deleteUserMutation.isPending : suspendUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={actionMode === 'delete' ? deleteUserMutation.isPending : suspendUserMutation.isPending}
                onClick={() => {
                  if (actionMode === 'delete') {
                    deleteUserMutation.mutate({ id: actionUserId, reason: actionReason || undefined })
                  } else {
                    suspendUserMutation.mutate({ id: actionUserId, reason: actionReason || undefined })
                  }
                }}
              >
                {actionMode === 'delete' ? 'Delete Account' : 'Suspend Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
