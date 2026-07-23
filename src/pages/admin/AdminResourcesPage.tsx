import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import { FileText, Video, Link as LinkIcon, PlusCircle, Trash2, X, Globe, Search, UploadCloud } from 'lucide-react'
import { api } from '@/lib/axios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/classNames'

interface ResourceItem {
  id: string
  lessonId: string
  lessonTitle: string
  courseId: string
  courseTitle: string
  title: string
  type: 'pdf' | 'video' | 'link'
  url: string
}

const typeIcons = { pdf: FileText, video: Video, link: LinkIcon }
const typeColors = { pdf: 'text-red-600 bg-red-50 dark:bg-red-900/20', video: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', link: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' }

interface ResourceFormData {
  lessonId: string
  title: string
  type: 'pdf' | 'video' | 'link'
  url: string
}

const emptyForm: ResourceFormData = { lessonId: '', title: '', type: 'pdf', url: '' }

export default function AdminResourcesPage() {
  usePageTitle('Resources — Admin')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ResourceFormData>(emptyForm)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const q = useDebounce(search)

  const { data: resources, isLoading } = useQuery({
    queryKey: ['admin', 'resources'],
    queryFn: async () => { const r = await api.get<{ data: ResourceItem[] }>('/admin/resources'); return r.data.data },
  })

  const { data: lessons } = useQuery({
    queryKey: ['admin', 'lessons'],
    queryFn: async () => (await api.get<{ data: { id: string; title: string; moduleTitle: string; courseTitle: string }[] }>('/admin/courses')).data.data.flatMap((c: { id: string; title: string; modules?: { id: string; title: string; lessons?: { id: string; title: string }[] }[] }) =>
      c.modules?.flatMap(m => m.lessons?.map(l => ({ id: l.id, title: l.title, moduleTitle: m.title, courseTitle: c.title })) ?? []) ?? []
    ),
  })

  const createMutation = useMutation({
    mutationFn: async (data: ResourceFormData) => {
      const formData = new FormData()
      formData.append('lessonId', data.lessonId)
      formData.append('title', data.title)
      if (data.type) formData.append('type', data.type)
      if (data.url) formData.append('url', data.url)
      if (selectedFile) formData.append('file', selectedFile)
      await api.post('/admin/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] })
      setModalOpen(false)
      setForm(emptyForm)
      setSelectedFile(null)
      setSuccessMessage('Resource added successfully.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] })
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

  const fileInputRef = useRef<HTMLInputElement>(null)

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const filtered = (resources ?? []).filter(r =>
    !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.courseTitle.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div>
      <PageHeader title="Resources" subtitle="Manage all learning resources across courses"
        actions={<Button size="sm" onClick={() => { setForm(emptyForm); setModalOpen(true) }}><PlusCircle className="w-4 h-4" aria-hidden="true"/> Add Resource</Button>}/>

      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…" aria-label="Search resources"
          className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm focus:outline-none focus:border-brand-blue dark:text-white placeholder:text-gray-400" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : !filtered.length ? (
        <EmptyState icon={<FileText className="w-16 h-16" />} title="No resources found"
          description="Add learning resources to help students."
          action={{ label: 'Add Resource', onClick: () => { setForm(emptyForm); setModalOpen(true) }}} />
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
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
                      <span className="text-xs text-gray-500 dark:text-gray-400">{r.courseTitle} · {r.lessonTitle}</span>
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
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Lesson <span className="text-red-500">*</span></label>
                <select
                  required
                  value={form.lessonId}
                  onChange={e => updateField('lessonId', e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 text-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a lesson…</option>
                  {lessons?.map(l => <option key={l.id} value={l.id}>{l.courseTitle} · {l.moduleTitle} · {l.title}</option>)}
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
              {/* URL or File (user picks one) */}
              {!selectedFile && (
                <Input label="Resource URL" value={form.url} onChange={e => updateField('url', e.target.value)}
                  placeholder={form.type === 'pdf' ? 'https://…/document.pdf' : form.type === 'video' ? 'https://…/video.mp4 or YouTube link' : 'https://…'} />
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Upload File
                  {!form.url && <span className="text-red-500"> *</span>}
                </label>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif" />
                <div
                  className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 cursor-pointer hover:border-brand-blue hover:bg-brand-blue/5 transition-colors"
                  onClick={openFilePicker}
                >
                  {selectedFile ? (
                    <>
                      <UploadCloud className="w-8 h-8 text-brand-blue mb-2" aria-hidden="true" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-gray-400 mb-2" aria-hidden="true" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload a file</span>
                      <span className="text-xs text-gray-500 mt-1">PDF, DOC, PPT, XLS, MP4, JPG, PNG — up to 50 MB</span>
                    </>
                  )}
                </div>
                {selectedFile && (
                  <button type="button" className="mt-1 text-xs text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>Remove file</button>
                )}
              </div>
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
