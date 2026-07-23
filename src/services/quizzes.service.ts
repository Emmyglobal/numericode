import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface Quiz {
  id: string; courseId: string; moduleId?: string; lessonId?: string
  title: string; description: string; timeLimit?: number
  passingScore: number; maxAttempts: number; shuffleQuestions: boolean; showResults: boolean
  questionCount: number; attemptCount: number; createdAt: string
}

export interface QuizQuestion {
  id: string; questionText: string; questionType: 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank'
  options?: unknown; correctAnswer?: string; points: number; position: number
}

export interface QuizAttempt {
  id: string; quizId: string; userId: string
  startedAt: string; completedAt?: string; score?: number; passed?: boolean
}

export interface QuizResult {
  attemptId: string; score: number; passed: boolean
  totalPoints: number; earnedPoints: number; showResults: boolean; passingScore: number
}

export const quizzesService = {
  // Quiz CRUD
  listByCourse: (courseId: string) =>
    api.get<ApiResponse<Quiz[]>>(`/courses/${courseId}/quizzes`).then(r => r.data.data),

  get: (quizId: string) =>
    api.get<ApiResponse<Quiz & { questions: QuizQuestion[] }>>(`/quizzes/${quizId}`).then(r => r.data.data),

  create: (data: {
    courseId: string; moduleId?: string; lessonId?: string; title: string; description?: string
    timeLimit?: number; passingScore?: number; maxAttempts?: number; shuffleQuestions?: boolean; showResults?: boolean
    questions?: QuizQuestion[]
  }) => api.post<ApiResponse<Quiz>>('/quizzes', data).then(r => r.data.data),

  update: (quizId: string, data: Partial<Quiz>) =>
    api.put<ApiResponse<Quiz>>(`/quizzes/${quizId}`, data).then(r => r.data.data),

  delete: (quizId: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/quizzes/${quizId}`).then(r => r.data.data),

  // Questions
  addQuestion: (quizId: string, question: QuizQuestion) =>
    api.post<ApiResponse<QuizQuestion>>(`/quizzes/${quizId}/questions`, question).then(r => r.data.data),

  updateQuestion: (quizId: string, questionId: string, question: Partial<QuizQuestion>) =>
    api.put<ApiResponse<QuizQuestion>>(`/quizzes/${quizId}/questions/${questionId}`, question).then(r => r.data.data),

  deleteQuestion: (quizId: string, questionId: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/quizzes/${quizId}/questions/${questionId}`).then(r => r.data.data),

  // Attempts
  startAttempt: (quizId: string) =>
    api.post<ApiResponse<{ attemptId: string; questions: QuizQuestion[]; timeLimit?: number; maxAttempts: number; attemptNumber: number }>>(`/quizzes/${quizId}/start`).then(r => r.data.data),

  submitAttempt: (quizId: string, answers: Record<string, unknown>) =>
    api.post<ApiResponse<QuizResult>>(`/quizzes/${quizId}/submit`, { answers }).then(r => r.data.data),

  getAttempts: (quizId: string) =>
    api.get<ApiResponse<QuizAttempt[]>>(`/quizzes/${quizId}/attempts`).then(r => r.data.data),
}