import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gradingService } from '@/services/grading.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Plus, Edit, Trash2, Trophy, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TrainerGradingPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: rubrics, isLoading } = useQuery({
    queryKey: ['trainer-rubrics'],
    queryFn: async () => {
      return [] as Array<{
        id: string; assignmentId: string; criteriaName: string
        maxScore: number; position: number; createdAt: string
      }>
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (rubricId: string) => gradingService.deleteRubric(rubricId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-rubrics'] })
    },
  })

  return (
    <div>
      <PageHeader
        title="Grading & Rubrics"
        subtitle="Create rubrics and manage grading criteria"
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Rubric
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !rubrics?.length ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No rubrics yet</h3>
          <p className="text-gray-500">Create grading rubrics to provide detailed feedback on assignments.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rubrics.map(rubric => (
            <div key={rubric.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-brand-blue" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{rubric.criteriaName}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>Max Score: {rubric.maxScore}</span>
                    <span>Position: {rubric.position}</span>
                    <span>Assignment ID: {rubric.assignmentId}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this rubric?')) {
                        deleteMutation.mutate(rubric.id)
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

      {/* Create Rubric Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Rubric</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Rubric creation form would go here with criteria name, description, max score, and assignment selection.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={() => setShowCreateModal(false)}>Create Rubric</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}