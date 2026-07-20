import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FileText, Video, Link as LinkIcon, PlusCircle, Trash2, X, Globe } from 'lucide-react'
import { api } from '@/lib/axios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { TrainerCourse } from '@/features/trainer/types'

interface ResourceItem {
  id: string
  courseId: string
  courseTitle: string
  title: string
  type: 'pdf' | 'video' | 'link'
  url: string
}

const typeIcons = { pdf: FileText, video: Video, link: LinkIcon }
const typeColors = { pdf: 'text-red-600 bg-red-50 dark:bg-red-900/20', video: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', link: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' }

interface ResourceFormData {
  courseId: string
  title: string
  type: 'pdf' | 'video' | 'link'
  url: string
}

const emptyForm: ResourceFormData = { courseId: '', title: '', type: 'pdf', url: '' }

export default function TrainerResourcesPage() {
  usePageTitle('Resources — Trainer')
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ResourceFormData>(emptyForm)
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch all resources via dashboard endpoint (shared with students)
  const { data: resources, isLoading } = useQuery({
    queryKey: ['trainer', 'resources'],
    queryFn: async () => {
      // Get all trainer courses, then fetch resources for each
      const coursesRes = await api.get<{ data: TrainerCourse[] }>('/trainer/courses')
      const allResources: ResourceItem[] = []
      for (const course of coursesRes.data.data) {
        // Mock: we return all resources with course info
        const resRes = await api.get<{ data: ResourceItem[] }>('/resources')
        allResources.push(...resRes.data.data.filter(r => r.courseId === course.id))
      }
      return allResources
    },
  })

  const { data: courses } = useQuery({
    queryKey: ['trainer', 'courses'],
    queryFn: async () => { const r = await api.get<{ data: TrainerCourse[] }>('/trainer/courses'); return r.data.data },
  })

  // In a real app, this would POST to a resources endpoint.
  // For now we simulate adding via a custom endpoint or using the mock.
  const createMutation = useMutation({
    mutationFn: (data: ResourceFormData) => api.post('/resources', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'resources'] })
      setModalOpen(false)
      setForm(emptyForm)
      setSuccessMessage('Resource added successfully.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'resources'] })
      setSuccessMessage('Resource deleted.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(form)
  }

  const updateField = (field: keyof ResourceFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <PageHeader title="Course Resources" subtitle="Upload PDFs, videos, and links as learning materials for your courses"
        actions={<Button size="sm" onClick={() => { setForm(emptyForm); setModalOpen(true) }}><PlusCircle className="w-4 h-4" aria-hidden="true"/> Add Resource</Button>}/>

      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : !resources?.length ? (
        <EmptyState icon={<FileText className="w-16 h-16" />} title="No resources yet"
          description="Add PDFs, videos, and links to help your students learn."
          action={{ label: 'Add Resource', onClick: () => { setForm(emptyForm); setModalOpen(true) }}} />
      ) : (
        <div className="space-y-3">
          {resources.map(r => {
            const Icon = typeIcons[r.type]
            const colorCls = typeColors[r.type]
            return (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorCls}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{r.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.type === 'pdf' ? 'past' : r.type === 'video' ? 'upcoming' : 'default'}>{r.type}</Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{r.courseTitle}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a href={r.url} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="sm"><Globe className="w-3.5 h-3.5" aria-hidden="true"/> Open</Button>
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(r.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" aria-hidden="true"/>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add a Resource</h2>
              <button onClick={() => setModalOpen(false)} aria-label="Close modal">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Input label="Resource Title" required value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g. Number Systems PDF" />
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Type <span className="text-red-500">*</span></label>
                <div className="flex gap-3 mt-1">
                  {(['pdf', 'video', 'link'] as const).map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="resourceType"
                        value={type}
                        checked={form.type === type}
                        onChange={e => updateField('type', e.target.value)}
                        className="text-teal focus:ring-teal"
                      />
                      <span className="text-sm capitalize text-gray-700 dark:text-gray-200">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Input label="Resource URL" required value={form.url} onChange={e => updateField('url', e.target.value)}
                placeholder={form.type === 'pdf' ? 'https://…/document.pdf' : form.type === 'video' ? 'https://…/video.mp4 or YouTube link' : 'https://…'} />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" loading={createMutation.isPending}>Add Resource</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}