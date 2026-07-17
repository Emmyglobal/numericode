import { usePageTitle } from '@/hooks/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ExternalLink, Video } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatDateTime } from '@/utils/formatDate'
import { formatDuration } from '@/utils/formatDuration'
import { cn } from '@/utils/classNames'
import type { LiveClassItem } from '@/features/live-classes/types'

const tabs = ['all', 'upcoming', 'live', 'past'] as const
type Tab = typeof tabs[number]

export default function LiveClassesPage() {
  usePageTitle('Live Classes')
  const [tab, setTab] = useState<Tab>('all')

  const { data: classes, isLoading } = useQuery({
    queryKey: ['live-classes'],
    queryFn:  () => dashboardService.getLiveClasses() as Promise<LiveClassItem[]>,
    staleTime: 60 * 1000,  // live classes need to be fresh
  })

  const filtered = classes?.filter(c => tab === 'all' || c.status === tab) ?? []

  return (
    <div>
      <PageHeader title="Live Classes" subtitle="Your schedule of upcoming and past live sessions" />

      {/* Filter tabs */}
      <div role="tablist" aria-label="Filter live classes" className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            aria-controls={`tab-panel-${t}`}
            id={`tab-${t}`}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium capitalize transition-all',
              tab === t
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {t === 'live' ? 'Live Now' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab panel */}
      <div
        id={`tab-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
      >
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : !filtered.length ? (
          <EmptyState
            icon={<Video className="w-16 h-16" />}
            title="No classes found"
            description="There are no live classes in this category right now."
          />
        ) : (
          <ul className="space-y-3" aria-label={`${tab} live classes`}>
            {filtered.map(c => (
              <li
                key={c.id}
                className={cn(
                  'flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 bg-white dark:bg-surface-dark',
                  c.status === 'live'
                    ? 'border-red-300 dark:border-red-700 ring-2 ring-red-100 dark:ring-red-900/30'
                    : 'border-gray-200 dark:border-gray-700'
                )}
                aria-label={`${c.title} — ${c.status === 'live' ? 'Live Now' : formatDateTime(c.date)}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="text-center bg-brand-light dark:bg-blue-900/30 rounded-lg px-3 py-2 shrink-0"
                    aria-hidden="true"
                  >
                    <p className="text-xs font-bold text-brand-blue">
                      {new Date(c.date).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                    </p>
                    <p className="text-lg font-bold text-brand-navy dark:text-blue-200">
                      {new Date(c.date).getDate()}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={c.subject as 'mathematics' | 'programming'}>{c.subject}</Badge>
                      <Badge variant={c.status as 'upcoming' | 'live' | 'past'}>
                        {c.status === 'live' ? 'Live Now' : c.status}
                      </Badge>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white truncate">{c.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {c.courseTitle} · {formatDateTime(c.date)} · {formatDuration(c.duration)}
                    </p>
                  </div>
                </div>
                <a
                  href={c.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0"
                  aria-label={`Join ${c.title} live class (opens in new tab)`}
                  aria-disabled={c.status === 'past'}
                  tabIndex={c.status === 'past' ? -1 : 0}
                >
                  <Button
                    variant={c.status === 'live' ? 'primary' : 'secondary'}
                    disabled={c.status === 'past'}
                    size="sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    {c.status === 'past' ? 'Ended' : 'Join'}
                  </Button>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
