import { usePageTitle } from '@/hooks/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { CourseCard } from '@/components/shared/CourseCard'
import { CourseCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import type { EnrolledCourse } from '@/features/courses/types'

export default function MyCoursesPage() {
  usePageTitle('My Courses')
  const { data: courses, isLoading } = useQuery({ queryKey: ['dashboard', 'courses'], queryFn: () => dashboardService.getMyCourses() as Promise<EnrolledCourse[]> })
  return (
    <div>
      <PageHeader title="My Courses" subtitle="Track your progress across all enrolled courses" />
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <CourseCardSkeleton key={i} />)}</div>
      ) : !courses?.length ? (
        <EmptyState icon={<BookOpen className="w-16 h-16" />} title="No courses yet" description="Browse our catalogue and enrol in your first course." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">{courses.map(c => <CourseCard key={c.id} course={c} linkBase="/dashboard/courses" />)}</div>
      )}
    </div>
  )
}
