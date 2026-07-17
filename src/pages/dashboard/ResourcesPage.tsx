import { usePageTitle } from '@/hooks/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { FileText, Video as VideoIcon, Link as LinkIcon, FolderOpen, Download } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import type { ResourceItem } from '@/features/resources/types'

const typeIcon = { pdf: FileText, video: VideoIcon, link: LinkIcon }

export default function ResourcesPage() {
  usePageTitle('Resources')
  const { data: resources, isLoading } = useQuery({ queryKey: ['resources'], queryFn: () => dashboardService.getResources() as Promise<ResourceItem[]> })
  return (
    <div>
      <PageHeader title="Resources" subtitle="Downloadable materials from all your courses" />
      {isLoading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      : !resources?.length ? <EmptyState icon={<FolderOpen className="w-16 h-16" />} title="No resources yet" description="Resources will appear here as your instructor adds them." />
      : <div className="space-y-3">
          {resources.map(r => { const Icon = typeIcon[r.type]; return (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-4">
              <div className="flex items-center gap-3 min-w-0"><div className="w-10 h-10 rounded-lg bg-brand-light dark:bg-blue-900/30 text-brand-blue flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
                <div className="min-w-0"><p className="font-medium text-gray-900 dark:text-white text-sm truncate">{r.title}</p><p className="text-xs text-gray-500 dark:text-gray-400">{r.courseTitle}</p></div></div>
              <Button variant="ghost" size="sm" className="shrink-0"><Download className="w-3.5 h-3.5" />Download</Button>
            </div>
          )})}
        </div>}
    </div>
  )
}
