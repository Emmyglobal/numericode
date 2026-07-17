import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Video, PlusCircle, ExternalLink } from 'lucide-react'
import { api } from '@/lib/axios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { formatDateTime } from '@/utils/formatDate'
import { formatDuration } from '@/utils/formatDuration'
import { cn } from '@/utils/classNames'
import type { TrainerLiveSession } from '@/features/trainer/types'

const tabs = ['all','scheduled','completed'] as const

export default function TrainerSessionsPage() {
  usePageTitle('Live Sessions — Trainer')
  const [tab, setTab] = useState<typeof tabs[number]>('all')
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['trainer','sessions'],
    queryFn: async () => { const r = await api.get<{data:TrainerLiveSession[]}>('/trainer/sessions'); return r.data.data }
  })
  const filtered = sessions?.filter(s => tab==='all' || s.status===tab) ?? []

  return (
    <div>
      <PageHeader title="Live Sessions" subtitle="Schedule and manage your instructor-led sessions"
        actions={<Button size="sm"><PlusCircle className="w-4 h-4" aria-hidden="true"/> Schedule Session</Button>}/>
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
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={s.status==='completed' ? 'past' : 'upcoming'}>{s.status}</Badge>
                  {s.status==='completed' && <span className="text-xs text-gray-400">{s.attendees} attended</span>}
                </div>
                <p className="font-medium text-gray-900 dark:text-white">{s.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.courseTitle} · {formatDateTime(s.date)} · {formatDuration(s.duration)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {s.status!=='completed' && <a href={s.meetUrl} target="_blank" rel="noreferrer"><Button size="sm"><ExternalLink className="w-3.5 h-3.5" aria-hidden="true"/>Start Class</Button></a>}
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          ))}
        </div>}
    </div>
  )
}
