import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FileText, PlusCircle, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react'
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
import type { TrainerCourse } from '@/features/trainer/types'
import type { TrainerNote } from '@/mocks/data/trainer.data'

interface NoteFormData {
  courseId: string
  title: string
  content: string
  isPublished: boolean
}

const emptyForm: NoteFormData = {
  courseId: '', title: '', content: '', isPublished: true,
}

export default function TrainerNotesPage() {
  usePageTitle('Course Notes — Trainer')
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<TrainerNote | null>(null)
  const [form, setForm] = useState<NoteFormData>(emptyForm)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: notes, isLoading } = useQuery({
    queryKey: ['trainer', 'notes'],
    queryFn: async () => { const r = await api.get<{data: TrainerNote[]}>('/trainer/notes'); return r.data.data },
  })

  const { data: courses } = useQuery({
    queryKey: ['trainer', 'courses'],
    queryFn: async () => { const r = await api.get<{ data: TrainerCourse[] }>('/trainer/courses'); return r.data.data },
  })

  const createMutation = useMutation({
    mutationFn: (data: NoteFormData) => api.post('/trainer/notes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'notes'] })
      setModalOpen(false)
      setForm(emptyForm)
      setSuccessMessage('Note created successfully.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NoteFormData> }) => api.put(`/trainer/notes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'notes'] })
      setModalOpen(false)
      setEditingNote(null)
      setForm(emptyForm)
      setSuccessMessage('Note updated successfully.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trainer/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'notes'] })
      setSuccessMessage('Note deleted.')
    },
  })

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) => api.put(`/trainer/notes/${id}`, { isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'notes'] })
      setSuccessMessage('Note visibility updated.')
    },
  })

  const openCreate = () => {
    setEditingNote(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (note: TrainerNote) => {
    setEditingNote(note)
    setForm({
      courseId: note.courseId,
      title: note.title,
      content: note.content,
      isPublished: note.isPublished,
    })
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const updateField = (field: keyof NoteFormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <PageHeader title="Course Notes" subtitle="Create and manage notes and learning content for your courses"
        actions={<Button size="sm" onClick={openCreate}><PlusCircle className="w-4 h-4" aria-hidden="true"/> New Note</Button>}/>

      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : !notes?.length ? (
        <EmptyState icon={<FileText className="w-16 h-16" />} title="No notes yet"
          description="Create your first course note to share learning content with your students."
          action={{ label: 'Create Note', onClick: openCreate }} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {notes.map(n => (
            <div key={n.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{n.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={n.isPublished ? 'submitted' : 'pending'}>{n.isPublished ? 'Published' : 'Draft'}</Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{n.courseTitle}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">{n.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>Updated {formatDateTime(n.updatedAt)}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => togglePublishMutation.mutate({ id: n.id, isPublished: !n.isPublished })}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label={n.isPublished ? 'Unpublish note' : 'Publish note'}
                    title={n.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {n.isPublished ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button onClick={() => openEdit(n)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Edit note">
                    <Pencil className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(n.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Delete note">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingNote ? 'Edit Note' : 'Create a Note'}
              </h2>
              <button onClick={() => { setModalOpen(false); setEditingNote(null); setForm(emptyForm) }} aria-label="Close modal">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingNote && (
                <div>
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
              <Input label="Note Title" required value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g. Algebra Fundamentals Overview" />
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Content</label>
                <textarea
                  required
                  rows={8}
                  value={form.content}
                  onChange={e => updateField('content', e.target.value)}
                  placeholder="Write your note content here… Supports Markdown."
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-sm focus:outline-none focus:border-brand-blue focus:shadow-focus dark:focus:border-brand-sky"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={form.isPublished}
                  onChange={e => updateField('isPublished', e.target.checked)}
                  className="rounded border-gray-300 text-teal focus:ring-teal"
                />
                <label htmlFor="isPublished" className="text-sm text-gray-700 dark:text-gray-200">
                  Publish immediately (students can see this note)
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => { setModalOpen(false); setEditingNote(null); setForm(emptyForm) }}>Cancel</Button>
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                  {editingNote ? 'Update Note' : 'Create Note'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}