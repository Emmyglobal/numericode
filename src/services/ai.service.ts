import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface AiGeneratedQuestion {
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay'
  options: Array<{ id: string; text: string; isCorrect: boolean }> | null
  correctAnswer: string | null
  points: number
  position: number
}

export interface AiGenerateLessonParams {
  topic: string
  subject?: string
  level?: string
  style?: string
}

export interface AiGenerateQuizParams {
  topic: string
  subject?: string
  level?: string
  questionCount?: number
  questionTypes?: string[]
}

export interface AiGenerateAssignmentParams {
  topic: string
  subject?: string
  level?: string
}

export interface AiGenerateNoteParams {
  topic: string
  subject?: string
  level?: string
  style?: string
}

export interface AiGeneratedNote {
  title: string
  content: string
}

export const aiService = {
  /** Study Guide — available to everyone (no auth required) */
  studyGuide: async (message: string) => {
    const { data } = await api.post<ApiResponse<{ answer: string }>>('/ai/study-guide', { message })
    return data.data
  },

  /** Generate lesson content (trainer/admin only) */
  generateLesson: async (params: AiGenerateLessonParams) => {
    const { data } = await api.post<ApiResponse<{ content: string }>>('/ai/generate-lesson', params)
    return data.data
  },

  /** Generate quiz questions (trainer/admin only) */
  generateQuiz: async (params: AiGenerateQuizParams) => {
    const { data } = await api.post<ApiResponse<{ questions: AiGeneratedQuestion[] }>>('/ai/generate-quiz', params)
    return data.data
  },

  /** Generate assignment (trainer/admin only) */
  generateAssignment: async (params: AiGenerateAssignmentParams) => {
    const { data } = await api.post<ApiResponse<{ description: string }>>('/ai/generate-assignment', params)
    return data.data
  },

  /** Generate course note (trainer/admin only) */
  generateNote: async (params: AiGenerateNoteParams) => {
    const { data } = await api.post<ApiResponse<AiGeneratedNote>>('/ai/generate-note', params)
    return data.data
  },
}