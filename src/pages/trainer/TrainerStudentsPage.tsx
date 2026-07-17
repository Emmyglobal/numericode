import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { Search, Users } from 'lucide-react'
import { api } from '@/lib/axios'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/utils/formatDate'
import type { TrainerStudent } from '@/features/trainer/types'

export default function TrainerStudentsPage() {
  usePageTitle('Students — Trainer')
  const [search, setSearch] = useState('')
  const q = useDebounce(search)
  const { data: students, isLoading } = useQuery({
    queryKey: ['trainer','students'],
    queryFn: async () => { const r = await api.get<{data:TrainerStudent[]}>('/trainer/students'); return r.data.data }
  })
  const filtered = useMemo(() => students?.filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase())) ?? [], [students, q])

  return (
    <div>
      <PageHeader title="Students" subtitle={`${students?.length ?? 0} students enrolled across your courses`} />
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students…" aria-label="Search students"
          className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm focus:outline-none focus:border-teal dark:text-white placeholder:text-gray-400"/>
      </div>
      {isLoading ? <div className="space-y-3">{[...Array(4)].map((_,i)=><Skeleton key={i} className="h-20"/>)}</div>
      : !filtered.length ? <EmptyState icon={<Users className="w-16 h-16"/>} title="No students found" description="Try adjusting your search."/>
      : <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full" aria-label="Student list">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>{['Student','Courses','Avg. Progress','Last Active'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(s=>{
                const avgProgress = Object.values(s.progress).reduce((a,b)=>a+b,0) / Math.max(Object.values(s.progress).length,1)
                return (
                  <tr key={s.id} className="bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size="sm" className="bg-teal shrink-0" aria-hidden="true"/>
                        <div className="min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.name}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{s.enrolledCourses.length}</td>
                    <td className="px-4 py-3 w-40"><ProgressBar value={Math.round(avgProgress)}/></td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDate(s.lastActive)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>}
    </div>
  )
}
