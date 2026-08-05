import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Video, PlusCircle, ExternalLink, Pencil, Trash2, X } from 'lucide-react'
import { api } from '@/lib/axios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { formatDateTime } from '@/utils/formatDate'
import { formatDuration } from '@/utils/formatDuration'
import { cn } from '@/utils/classNames'
import type { TrainerLiveSession } from '@/features/trainer/types'
import type { TrainerCourse, TrainerStudent } from '@/features/trainer/types'

const tabs = ['all','scheduled','completed'] as const

interface SessionFormData {
  courseId: string
  title: string
  date: string
  time: string
  duration: number
  meetUrl: string
  sessionType: 'group' | 'individual'
  studentIds: string[]
  extensionMinutes: number
}

const emptyForm: SessionFormData = {
  courseId: '', title: '', date: '', time: '', duration: 60, meetUrl: '',
  sessionType: 'group', studentIds: [], extensionMinutes: 0,
}

export default function TrainerSessionsPage() {
  usePageTitle('Live Sessions — Trainer')
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<typeof tabs[number]>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<TrainerLiveSession | null>(null)
  const [form, setForm] = useState<SessionFormData>(emptyForm)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['trainer','sessions'],
    queryFn: async () => { const r = await api.get<{data:TrainerLiveSession[]}>('/trainer/sessions'); return r.data.data }
  })

  const { data: courses } = useQuery({
    queryKey: ['trainer', 'courses'],
    queryFn: async () => { const r = await api.get<{ data: TrainerCourse[] }>('/trainer/courses'); return r.data.data },
  })

  const { data: students } = useQuery({
    queryKey: ['trainer', 'students'],
    queryFn: async () => { const r = await api.get<{ data: TrainerStudent[] }>('/trainer/students'); return r.data.data },
    enabled: form.sessionType === 'individual',
  })

  const filtered = sessions?.filter(s => tab==='all' || s.status===tab) ?? []

  const createMutation = useMutation({
    mutationFn: (data: SessionFormData) =>
      api.post('/trainer/sessions', {
        courseId: data.courseId, title: data.title,
        date: `${data.date}T${data.time}:00`,
        duration: data.duration, meetUrl: data.meetUrl,
        sessionType: data.sessionType, studentIds: data.studentIds, extensionMinutes: data.extensionMinutes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'sessions'] })
      setModalOpen(false)
      setEditingSession(null)
      setForm(emptyForm)
      setSuccessMessage('Session scheduled successfully.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SessionFormData }) =>
      api.put(`/trainer/sessions/${id}`, {
        title: data.title,
        date: `${data.date}T${data.time}:00`,
        duration: data.duration, meetUrl: data.meetUrl,
        sessionType: data.sessionType, studentIds: data.studentIds, extensionMinutes: data.extensionMinutes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'sessions'] })
      setModalOpen(false)
      setEditingSession(null)
      setForm(emptyForm)
      setSuccessMessage('Session updated successfully.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trainer/sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'sessions'] })
      setSuccessMessage('Session deleted.')
    },
  })

  const openCreate = () => {
    setEditingSession(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (session: TrainerLiveSession) => {
    setEditingSession(session)
    const dt = new Date(session.date)
    setForm({
      courseId: session.courseId,
      title: session.title,
      date: dt.toISOString().slice(0, 10),
      time: dt.toTimeString().slice(0, 5),
      duration: session.duration,
      meetUrl: session.meetUrl,
      sessionType: session.sessionType ?? 'group',
      studentIds: session.studentIds ?? [],
      extensionMinutes: session.extensionMinutes ?? 0,
    })
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingSession(null)
    setForm(emptyForm)
  }

  const updateField = (field: keyof SessionFormData, value: string | number | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <PageHeader title="Live Sessions" subtitle="Schedule and manage your instructor-led sessions"
        actions={<Button type="button" size="sm" onClick={openCreate}><PlusCircle className="w-4 h-4" aria-hidden="true"/> Schedule Session</Button>}/>

      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      <div role="tablist" aria-label="Session filter" className="flex gap-2 mb-6">
        {tabs.map(t=>(
          <button key={t} role="tab" aria-selected={tab===t} onClick={()=>setTab(t)}
            className={cn('px-4 py-2 rounded-full text-sm font-medium capitalize transition-all', tab===t ? 'bg-teal text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700')}>
            {t}
          </button>
        ))}
      </div>

      {isLoading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-20"/>)}</div>
      : !filtered.length ? <EmptyState icon={<Video className="w-16 h-16"/>} title="No sessions found" description="Schedule your first live session."/>
      : <div className="space-y-3">
          {filtered.map(s=>(
            <div key={s.id} className={cn('flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 bg-white dark:bg-surface-dark', s.status==='completed' ? 'border-gray-200 dark:border-gray-700 opacity-75' : 'border-teal-light dark:border-teal-900/40')}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={s.status==='completed' ? 'past' : 'upcoming'}>{s.status}</Badge>
                  <Badge variant={s.sessionType === 'individual' ? 'upcoming' : 'submitted'}>{s.sessionType ?? 'group'}</Badge>
                  {s.status==='completed' && <span className="text-xs text-gray-400">{s.attendees} attended</span>}
                </div>
                <p className="font-medium text-gray-900 dark:text-white">{s.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.courseTitle} · {formatDateTime(s.date)} · {formatDuration(s.duration)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {s.status!=='completed' && (
                  <>
                    <a href={s.meetUrl} target="_blank" rel="noreferrer" tabIndex={-1}><Button size="sm" type="button"><ExternalLink className="w-3.5 h-3.5" aria-hidden="true"/>Start Class</Button></a>
                    <Button variant="ghost" size="sm" type="button" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" aria-hidden="true"/></Button>
                  </>
                )}
                {s.status==='scheduled' && (
                  <Button variant="ghost" size="sm" type="button" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" aria-hidden="true"/></Button>
                )}
              </div>
            </div>
          ))}
        </div>}

      {/* Schedule / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingSession ? 'Edit Session' : 'Schedule a Session'}
            className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingSession ? 'Edit Session' : 'Schedule a Session'}
              </h2>
              <button type="button" onClick={closeModal} aria-label="Close modal" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form id="session-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!editingSession && (
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Course <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={form.courseId}
                      onChange={e => updateField('courseId', e.target.value)}
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 text-sm text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a course…</option>
                      {courses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                )}
                <div className={editingSession ? 'sm:col-span-2' : ''}>
                  <Input label="Session Title" required value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g. Algebra Q&A Session" />
                </div>
                <Input label="Date" type="date" required value={form.date} onChange={e => updateField('date', e.target.value)} />
                <Input label="Time" type="time" required value={form.time} onChange={e => updateField('time', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Duration (min)" type="number" required min={15} max={180} value={form.duration} onChange={e => updateField('duration', Number(e.target.value))} />
                  <Input label="Extension (min)" type="number" min={0} max={60} value={form.extensionMinutes} onChange={e => updateField('extensionMinutes', Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Session Type</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => updateField('sessionType', 'group')}
                    className={cn('h-11 rounded-xl border-2 text-sm font-medium transition-all', form.sessionType === 'group' ? 'border-teal text-teal bg-teal-light dark:bg-teal-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300')}
                  >
                    Group (all students)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('sessionType', 'individual')}
                    className={cn('h-11 rounded-xl border-2 text-sm font-medium transition-all', form.sessionType === 'individual' ? 'border-teal text-teal bg-teal-light dark:bg-teal-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300')}
                  >
                    Individual (select)
                  </button>
                </div>
              </div>

              {form.sessionType === 'individual' && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select Students</label>
                  <select
                    multiple
                    required={form.sessionType === 'individual'}
                    value={form.studentIds}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions).map(o => o.value)
                      updateField('studentIds', selected)
                    }}
                    className="mt-1 h-36 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-2 text-sm text-gray-900 dark:text-gray-100"
                  >
                    {students?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd (or tap) to select multiple students.</p>
                </div>
              )}

              <Input label="Meeting URL" value={form.meetUrl} onChange={e => updateField('meetUrl', e.target.value)} placeholder="https://meet.google.com/…" hint="Zoom or Google Meet link" />
            </form>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
              <Button variant="ghost" type="button" onClick={closeModal}>Cancel</Button>
              <Button type="submit" form="session-form" loading={createMutation.isPending || updateMutation.isPending}>
                {editingSession ? 'Update Session' : 'Schedule Session'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}