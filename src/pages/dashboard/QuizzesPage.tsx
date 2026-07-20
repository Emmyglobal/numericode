import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { quizzesService } from '@/services/quizzes.service'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { ClipboardList, Clock, CheckCircle, XCircle, Play } from 'lucide-react'

export default function QuizzesPage() {
  const { user } = useAuth()
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      // In a real app, you'd fetch quizzes for enrolled courses
      return [] as Array<{
        id: string; courseId: string; title: string; description: string
        timeLimit?: number; passingScore: number; maxAttempts: number
        questionCount: number; attemptCount: number; createdAt: string
      }>
    },
  })

  return (
    <div>
      <PageHeader title="Quizzes" subtitle="Test your knowledge with course quizzes" />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !quizzes?.length ? (
        <div className="text-center py-12">
          <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No quizzes yet</h3>
          <p className="text-gray-500">Quizzes will appear here when your instructors add them to your courses.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{quiz.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{quiz.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                    {quiz.timeLimit && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {quiz.timeLimit} min</span>}
                    <span className="flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" /> {quiz.questionCount} questions</span>
                    <span>Passing: {quiz.passingScore}%</span>
                    <span>Attempts: {quiz.attemptCount}/{quiz.maxAttempts}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {quiz.attemptCount >= quiz.maxAttempts ? (
                    <Badge variant="submitted">Completed</Badge>
                  ) : (
                    <Link to={`/dashboard/quizzes/${quiz.id}`}>
                      <Button size="sm" variant="secondary">
                        <Play className="w-3.5 h-3.5 mr-1" /> Start Quiz
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}