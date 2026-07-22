import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, PlusCircle } from 'lucide-react'
import { api } from '@/lib/axios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { CourseFormModal, type CourseFormValues } from '@/components/shared/CourseFormModal'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { TrainerCourse } from '@/features/trainer/types'

export default function TrainerCoursesPage() {
  usePageTitle('My Courses — Trainer')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<TrainerCourse | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: courses, isLoading } = useQuery({
    queryKey: ['trainer', 'courses'],
    queryFn: async () => { const r = await api.get<{ data: TrainerCourse[] }>('/trainer/courses'); return r.data.data },
  })

  const createMutation = useMutation({
    mutationFn: (values: CourseFormValues) => api.post('/trainer/courses', values),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'courses'] })
      setModalOpen(false)
      setSuccessMessage('')
      const { data } = await api.get<{ data: TrainerCourse[] }>('/trainer/courses')
      const created = data.data[0]
      if (created) navigate(`/trainer/courses/${created.id}/builder`)
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: CourseFormValues }) => api.put(`/trainer/courses/${id}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'courses'] })
      setModalOpen(false)
      setEditingCourse(null)
      setSuccessMessage('Course updated.')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'published' | 'draft' | 'archived' }) =>
      api.patch(`/trainer/courses/${id}/status`, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'courses'] })
      setSuccessMessage(
        variables.status === 'published' ? 'Course published — students can now see and enrol.' :
        variables.status === 'archived'  ? 'Course archived.' :
        'Course moved back to draft.'
      )
    },
  })

  const handleCreate = (values: CourseFormValues) => createMutation.mutate(values)
  const handleEdit = (values: CourseFormValues) => {
    if (editingCourse) editMutation.mutate({ id: editingCourse.id, values })
  }
  const openEdit = (course: TrainerCourse) => { setEditingCourse(course); setModalOpen(true) }
  const openCreate = () => { setEditingCourse(null); setModalOpen(true) }
  const openCourse = (course: TrainerCourse) => navigate(`/trainer/courses/${course.id}/builder`)

  return (
    <div>
      <PageHeader title="My Courses" subtitle="Manage and monitor your published and draft courses"
        actions={<Button size="sm" onClick={openCreate}><PlusCircle className="w-4 h-4" aria-hidden="true" /> New Course</Button>} />

      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : !courses?.length ? (
        <EmptyState icon={<BookOpen className="w-16 h-16" />} title="No courses yet" description="Create your first course to get started."
          action={{ label: 'Create Course', onClick: openCreate }} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map(c => (
            <div key={c.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{c.title}</h3>
                  <div className="flex gap-2 mt-1.5">
                    <Badge variant={c.subject}>{c.subject}</Badge>
                    <Badge variant={c.level}>{c.level}</Badge>
                    <Badge variant={c.status === 'published' ? 'submitted' : c.status === 'draft' ? 'pending' : 'past'}>
                      {c.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Students</p><p className="font-semibold text-gray-900 dark:text-white">{c.enrolledCount}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Lessons</p><p className="font-semibold text-gray-900 dark:text-white">{c.lessonCount}</p></div>
              </div>
              <ProgressBar value={c.completionRate} label="Avg. Completion" className="mb-4" />
                <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => openCourse(c)}>Open Course</Button>
                {c.status === 'draft' && (
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
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CourseFormModal
          isEdit={!!editingCourse}
          initialValues={editingCourse ? { title: editingCourse.title, subject: editingCourse.subject, level: editingCourse.level } : undefined}
          isSubmitting={createMutation.isPending || editMutation.isPending}
          error={(createMutation.error as Error)?.message || (editMutation.error as Error)?.message}
          onClose={() => { setModalOpen(false); setEditingCourse(null) }}
          onSubmit={editingCourse ? handleEdit : handleCreate}
        />
      )}
    </div>
  )
}
