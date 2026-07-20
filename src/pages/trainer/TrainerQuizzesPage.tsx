import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quizzesService } from '@/services/quizzes.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Plus, Edit, Trash2, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TrainerQuizzesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['trainer-quizzes'],
    queryFn: async () => {
      // In a real app, fetch quizzes for trainer's courses
      return [] as Array<{
        id: string; courseId: string; title: string; description: string
        timeLimit?: number; passingScore: number; maxAttempts: number
        questionCount: number; createdAt: string
      }>
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (quizId: string) => quizzesService.delete(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-quizzes'] })
    },
  })

  return (
    <div>
      <PageHeader
        title="Quiz Management"
        subtitle="Create and manage quizzes for your courses"
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Quiz
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !quizzes?.length ? (
        <div className="text-center py-12">
          <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No quizzes yet</h3>
          <p className="text-gray-500">Create your first quiz to assess student learning.</p>
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
                    {quiz.timeLimit && <span>Time: {quiz.timeLimit} min</span>}
                    <span>Questions: {quiz.questionCount}</span>
                    <span>Passing: {quiz.passingScore}%</span>
                    <span>Max Attempts: {quiz.maxAttempts}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link to={`/trainer/quizzes/${quiz.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this quiz?')) {
                        deleteMutation.mutate(quiz.id)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Quiz Modal - simplified for demo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Quiz</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Quiz creation form would go here with fields for title, description, time limit, passing score, and question builder.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={() => setShowCreateModal(false)}>Create Quiz</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}