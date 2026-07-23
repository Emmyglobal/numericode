import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, PlusCircle } from 'lucide-react'
import { api } from '@/lib/axios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { CourseFormModal, type CourseFormValues } from '@/components/shared/CourseFormModal'
import { usePageTitle } from '@/hooks/usePageTitle'
import { formatDate } from '@/utils/formatDate'
import type { AdminCourse } from '@/features/admin/types'

interface TrainerOption { id: string; name: string; email: string }
interface CourseRequest { id: string; status: 'pending' | 'approved' | 'rejected'; requestedAt: string; studentName: string; courseTitle: string }

export default function AdminCoursesPage() {
  usePageTitle('Course Management — Admin')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [accessDrafts, setAccessDrafts] = useState<Record<string, { accessLevel: 'free' | 'premium'; priceCents: number; premiumEnabled: boolean }>>({})

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: async () => { const r = await api.get<{ data: AdminCourse[] }>('/admin/courses'); return r.data.data },
  })

  const { data: trainers } = useQuery({
    queryKey: ['admin', 'trainers'],
    queryFn: async () => { const r = await api.get<{ data: TrainerOption[] }>('/admin/trainers'); return r.data.data },
    enabled: modalOpen, // only fetch when the modal is actually open
  })
  const { data: requests } = useQuery({
    queryKey: ['admin', 'course-requests'],
    queryFn: async () => { const response = await api.get<{ data: CourseRequest[] }>('/admin/course-requests'); return response.data.data },
  })

  const createMutation = useMutation({
    mutationFn: (values: CourseFormValues) => api.post('/admin/courses', values),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      setModalOpen(false)
      setSuccessMessage('')
      const { data } = await api.get<{ data: AdminCourse[] }>('/admin/courses')
      const created = data.data[0]
      if (created) navigate(`/admin/courses/${created.id}/builder`)
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'published' | 'draft' | 'archived' }) =>
      api.patch(`/admin/courses/${id}/status`, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      setSuccessMessage(
        variables.status === 'published' ? 'Course published — students can now see and enrol.' :
        variables.status === 'archived'  ? 'Course archived.' :
        'Course moved back to draft.'
      )
    },
  })
  const accessMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { accessLevel: 'free' | 'premium'; priceCents: number; premiumEnabled: boolean } }) => api.patch(`/admin/courses/${id}/access`, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }); setSuccessMessage('Course access and premium pricing updated.') },
  })
  const reviewRequestMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => api.patch(`/admin/course-requests/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      setSuccessMessage('Course request reviewed.')
    },
  })
  const pendingRequests = requests?.filter(request => request.status === 'pending') ?? []

  return (
    <div>
      <PageHeader title="Course Management" subtitle={`${courses?.length ?? 0} courses on the platform`}
        actions={<Button size="sm" onClick={() => setModalOpen(true)}><PlusCircle className="w-4 h-4" aria-hidden="true" /> New Course</Button>} />

      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      {!!pendingRequests.length && <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-900/10"><div className="mb-3"><h2 className="font-semibold text-gray-900 dark:text-white">Enrolment Requests</h2><p className="text-sm text-gray-600 dark:text-gray-400">Approve a request to enrol the student immediately.</p></div><div className="space-y-3">{pendingRequests.map(request => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 dark:bg-surface-dark"><p className="text-sm text-gray-800 dark:text-gray-100"><strong>{request.studentName}</strong> requested <strong>{request.courseTitle}</strong></p><div className="flex gap-2"><Button size="sm" loading={reviewRequestMutation.isPending} onClick={() => reviewRequestMutation.mutate({ id: request.id, status: 'approved' })}>Approve</Button><Button size="sm" variant="danger" loading={reviewRequestMutation.isPending} onClick={() => reviewRequestMutation.mutate({ id: request.id, status: 'rejected' })}>Reject</Button></div></div>)}</div></section>}

      {isLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      : !courses?.length ? <EmptyState icon={<BookOpen className="w-16 h-16" />} title="No courses yet"
          action={{ label: 'Create Course', onClick: () => setModalOpen(true) }} />
      : <div className="hidden md:block rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full min-w-[900px]" aria-label="Course list">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>{['Course','Instructor','Subject','Level','Access','Status','Students','Created','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide first:rounded-tl-xl last:rounded-tr-xl">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {courses.map(c=>(
                <tr key={c.id} className="bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-sm max-w-xs"><p className="truncate">{c.title}</p></td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.instructor}</td>
                  <td className="px-4 py-3"><Badge variant={c.subject}>{c.subject}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={c.level}>{c.level}</Badge></td>
                  <td className="px-4 py-3"><div className="flex flex-col gap-1"><select aria-label={`Access level for ${c.title}`} value={(accessDrafts[c.id] ?? c).accessLevel} onChange={event => setAccessDrafts(drafts => ({ ...drafts, [c.id]: { ...(drafts[c.id] ?? c), accessLevel: event.target.value as 'free' | 'premium' } }))} className="rounded border border-gray-200 bg-white px-1 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"><option value="free">Free</option><option value="premium">Premium</option></select>{(accessDrafts[c.id] ?? c).accessLevel === 'premium' && <input aria-label={`Price for ${c.title}`} type="number" min="0" value={(accessDrafts[c.id] ?? c).priceCents} onChange={event => setAccessDrafts(drafts => ({ ...drafts, [c.id]: { ...(drafts[c.id] ?? c), priceCents: Number(event.target.value) || 0 } }))} className="w-20 rounded border border-gray-200 bg-white px-1 py-1 text-xs dark:border-gray-700 dark:bg-gray-800" />}</div></td>
                  <td className="px-4 py-3"><Badge variant={c.status==='published'?'submitted':c.status==='draft'?'pending':'past'}>{c.status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{c.enrolledCount}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/courses/${c.id}/builder`)}>Open Course</Button>
                      {c.status !== 'published' && (
                        <Button size="sm" loading={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: c.id, status: 'published' })}>
                          Publish
                        </Button>
                      )}
                      {c.status === 'published' && (
                        <Button variant="ghost" size="sm" loading={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: c.id, status: 'draft' })}>
                          Unpublish
                        </Button>
                      )}
                      {c.status !== 'archived' && (
                        <Button variant="danger" size="sm" loading={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: c.id, status: 'archived' })}>
                          Archive
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" loading={accessMutation.isPending} onClick={() => accessMutation.mutate({ id: c.id, payload: accessDrafts[c.id] ?? { accessLevel: c.accessLevel, priceCents: c.priceCents, premiumEnabled: c.premiumEnabled } })}>Save Access</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}

      {/* Mobile cards */}
      {!isLoading && courses?.length > 0 && (
        <div className="md:hidden space-y-3">
          {courses?.map(c => (
            <div key={c.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.instructor}</p>
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <Badge variant={c.subject}>{c.subject}</Badge>
                  <Badge variant={c.level}>{c.level}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-3">
                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">Status: <Badge variant={c.status==='published'?'submitted':c.status==='draft'?'pending':'past'}>{c.status}</Badge></span>
                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">Students: {c.enrolledCount}</span>
                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">Created: {formatDate(c.createdAt)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Access:</label>
                  <select aria-label={`Access level for ${c.title}`} value={(accessDrafts[c.id] ?? c).accessLevel} onChange={event => setAccessDrafts(drafts => ({ ...drafts, [c.id]: { ...(drafts[c.id] ?? c), accessLevel: event.target.value as 'free' | 'premium' } }))} className="rounded border border-gray-200 bg-white px-1 py-1 text-xs dark:border-gray-700 dark:bg-gray-800">
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                  {(accessDrafts[c.id] ?? c).accessLevel === 'premium' && (
                    <input aria-label={`Price for ${c.title}`} type="number" min="0" value={(accessDrafts[c.id] ?? c).priceCents} onChange={event => setAccessDrafts(drafts => ({ ...drafts, [c.id]: { ...(drafts[c.id] ?? c), priceCents: Number(event.target.value) || 0 } }))} className="w-20 rounded border border-gray-200 bg-white px-1 py-1 text-xs dark:border-gray-700 dark:bg-gray-800" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/courses/${c.id}/builder`)}>Open Course</Button>
                  {c.status !== 'published' && (
                    <Button size="sm" loading={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: c.id, status: 'published' })}>Publish</Button>
                  )}
                  {c.status === 'published' && (
                    <Button variant="ghost" size="sm" loading={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: c.id, status: 'draft' })}>Unpublish</Button>
                  )}
                  {c.status !== 'archived' && (
                    <Button variant="danger" size="sm" loading={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: c.id, status: 'archived' })}>Archive</Button>
                  )}
                  <Button variant="secondary" size="sm" loading={accessMutation.isPending} onClick={() => accessMutation.mutate({ id: c.id, payload: accessDrafts[c.id] ?? { accessLevel: c.accessLevel, priceCents: c.priceCents, premiumEnabled: c.premiumEnabled } })}>Save Access</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CourseFormModal
          trainers={trainers ?? []}
          isSubmitting={createMutation.isPending}
          error={(createMutation.error as Error)?.message}
          onClose={() => setModalOpen(false)}
          onSubmit={values => createMutation.mutate(values)}
        />
      )}
    </div>
  )
}
