import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Bell, PlusCircle } from 'lucide-react'
import { api } from '@/lib/axios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { formatDate } from '@/utils/formatDate'
import type { AdminAnnouncement } from '@/features/admin/types'

const audienceBadge: Record<string, string> = { all: 'bg-brand-light text-brand-blue dark:bg-blue-900/30 dark:text-blue-300', students: 'bg-teal-light text-teal dark:bg-teal-900/30 dark:text-teal-300', trainers: 'bg-purple-light text-purple dark:bg-purple-900/30 dark:text-purple-300' }

export default function AdminAnnouncementsPage() {
  usePageTitle('Announcements — Admin')
  const [showForm, setShowForm] = useState(false)
  const [sent, setSent] = useState(false)
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin','announcements'],
    queryFn: async () => { const r = await api.get<{data:AdminAnnouncement[]}>('/admin/announcements'); return r.data.data }
  })
  const handleSend = (e: React.FormEvent) => { e.preventDefault(); setSent(true); setShowForm(false); setTimeout(()=>setSent(false), 3000) }

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Send platform-wide or targeted announcements"
        actions={<Button size="sm" onClick={()=>setShowForm(!showForm)}><PlusCircle className="w-4 h-4" aria-hidden="true"/> New Announcement</Button>}/>

      {sent && <div className="mb-4"><Alert type="success" message="Announcement sent successfully!" onClose={()=>setSent(false)}/></div>}

      {showForm && (
        <div className="rounded-xl border border-brand-light dark:border-blue-800 bg-brand-light/30 dark:bg-blue-900/10 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Create Announcement</h3>
          <form onSubmit={handleSend} aria-label="Create announcement" className="space-y-4">
            <Input label="Title" placeholder="Announcement title" required/>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Message</label>
              <textarea rows={3} required placeholder="Write your announcement…" aria-label="Announcement message"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:shadow-focus resize-none"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Send to</label>
              <select aria-label="Target audience" className="h-10 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-blue">
                <option value="all">Everyone</option>
                <option value="students">Students only</option>
                <option value="trainers">Trainers only</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Send Announcement</Button>
              <Button variant="ghost" type="button" onClick={()=>setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-20"/>)}</div>
      : !announcements?.length ? <EmptyState icon={<Bell className="w-16 h-16"/>} title="No announcements yet"/>
      : <div className="space-y-3">
          {announcements.map(a=>(
            <div key={a.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div><h3 className="font-semibold text-gray-900 dark:text-white">{a.title}</h3><p className="text-xs text-gray-500 dark:text-gray-400">By {a.createdBy} · {formatDate(a.createdAt)}</p></div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${audienceBadge[a.audience]}`}>→ {a.audience}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{a.body}</p>
            </div>
          ))}
        </div>}
    </div>
  )
}
