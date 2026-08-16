import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type {
  Assignment, AssignmentSubmission, AssignmentSubmissionPayload,
} from '@/features/assignments/types'
import type { TrainerAssignment } from '@/features/trainer/types'

export interface CreateAssignmentInput {
  courseId: string
  title: string
  dueDate: string
  totalMarks: number
  passingScore: number
  description?: string
  type?: Assignment['type']
  questions?: Assignment['questions']
  aiGenerated?: boolean
}

export const assignmentsService = {
  // Student
  getAll:  async () => { const { data } = await api.get<ApiResponse<Assignment[]>>('/assignments'); return data.data },
  getById: async (id: string) => { const { data } = await api.get<ApiResponse<Assignment>>(`/assignments/${id}`); return data.data },
  submit:  async (id: string, payload: AssignmentSubmissionPayload) => { const { data } = await api.post<ApiResponse<{ id: string; status: string; submittedAt: string }>>(`/assignments/${id}/submission`, payload); return data.data },

  // Trainer
  getTrainer: async () => { const { data } = await api.get<ApiResponse<TrainerAssignment[]>>('/trainer/assignments'); return data.data },
  create: async (input: CreateAssignmentInput) => { const { data } = await api.post<ApiResponse<Assignment>>('/trainer/assignments', input); return data.data },
  getSubmissions: async (assignmentId: string) => { const { data } = await api.get<ApiResponse<AssignmentSubmission[]>>(`/trainer/assignments/${assignmentId}/submissions`); return data.data },
  gradeSubmission: async (submissionId: string, payload: { score: number; feedback?: string }) => { const { data } = await api.patch<ApiResponse<AssignmentSubmission>>(`/trainer/submissions/${submissionId}`, payload); return data.data },
}