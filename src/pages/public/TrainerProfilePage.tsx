import { useQuery } from '@tanstack/react-query'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowRight, GraduationCap, BookOpen } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { coursesService } from '@/services/courses.service'

const SUBJECT_LABELS: Record<string, string> = { mathematics: 'Mathematics', programming: 'Programming' }

export default function TrainerProfilePage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  usePageTitle('Registered Trainer')

  const { data: trainer, isLoading, isError } = useQuery({
    queryKey: ['public-trainer', id],
    queryFn: () => coursesService.getTrainerProfile(id),
    enabled: Boolean(id),
  })

  return (
    <div className="pt-10 pb-16">
      <SectionWrapper>
        {isLoading && (
          <div className="space-y-4 max-w-2xl">
            <Skeleton className="h-24 w-full" />
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        )}

        {!isLoading && isError && (
          <EmptyState
            icon={<GraduationCap className="w-16 h-16" />}
            title="Trainer not found"
            description="This registered trainer profile could not be found, or the trainer is not currently active on NumeryCode."
            action={{ label: 'Browse courses', onClick: () => navigate('/courses') }}
          />
        )}

        {!isLoading && !isError && trainer && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile card */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-8 shadow-card">
                {trainer.avatarUrl ? (
                  <img src={trainer.avatarUrl} alt={`${trainer.name} — Registered Trainer at NumeryCode`} className="w-24 h-24 rounded-full object-cover mb-5" />
                ) : (
                  <span className="w-24 h-24 rounded-full bg-brand-blue text-white flex items-center justify-center text-3xl font-bold mb-5">{trainer.name.charAt(0)}</span>
                )}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{trainer.name}</h1>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue"><GraduationCap className="w-4 h-4" /> Registered Trainer</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">{trainer.bio}</p>
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {trainer.subjects.map(s => (
                    <span key={s} className="inline-flex items-center rounded-full bg-brand-blue/10 text-brand-blue px-2.5 py-0.5 text-xs font-medium capitalize">
                      {SUBJECT_LABELS[s] ?? s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Their courses */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Courses</h2>
              {trainer.courses.length === 0 ? (
                <EmptyState icon={<BookOpen className="w-12 h-12" />} title="No public courses yet" description="This trainer has not published any courses yet — check back soon." />
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {trainer.courses.map(c => (
                    <Link
                      key={c.id}
                      to={`/courses/${c.id}`}
                      className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 shadow-card hover:shadow-xl transition-shadow flex flex-col"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue">{SUBJECT_LABELS[c.subject] ?? c.subject}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white mt-2 mb-1 group-hover:text-brand-blue transition-colors">{c.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{c.lessonCount} lessons · {c.level}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue mt-4"><BookOpen className="w-4 h-4" /> View course <ArrowRight className="w-4 h-4" /></span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/register"><Button variant="secondary">Become a Registered Trainer on NumeryCode <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
        </div>
      </SectionWrapper>
    </div>
  )
}