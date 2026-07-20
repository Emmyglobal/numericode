import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface GradingRubric {
  id: string; assignmentId: string; criteriaName: string; description?: string
  maxScore: number; position: number; createdAt: string
}

export interface RubricScore {
  id: string; rubricId: string; submissionId: string
  criteriaName: string; score: number; maxScore: number; feedback?: string; createdAt: string
}

export interface GradeCategory {
  id: string; courseId: string; name: string; weight: number; createdAt: string
}

export interface GradeReport {
  courseId: string; categories: Array<{
    categoryId: string; categoryName: string; weight: number; averageScore: number
  }>; overallGrade: number; letterGrade: string
}

export const gradingService = {
  // Rubrics
  listRubrics: (assignmentId: string) =>
    api.get<ApiResponse<GradingRubric[]>>(`/grading/assignments/${assignmentId}/rubrics`).then(r => r.data.data),

  createRubric: (data: { assignmentId: string; criteriaName: string; description?: string; maxScore: number; position?: number }) =>
    api.post<ApiResponse<GradingRubric>>(`/grading/assignments/${data.assignmentId}/rubrics`, data).then(r => r.data.data),

  updateRubric: (rubricId: string, data: Partial<GradingRubric>) =>
    api.put<ApiResponse<GradingRubric>>(`/grading/rubrics/${rubricId}`, data).then(r => r.data.data),

  deleteRubric: (rubricId: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/grading/rubrics/${rubricId}`).then(r => r.data.data),

  // Rubric Scores
  submitScores: (submissionId: string, scores: Array<{ rubricId: string; score: number; feedback?: string }>) =>
    api.post<ApiResponse<{ totalScore: number; message: string }>>(`/grading/submissions/${submissionId}/rubric-scores`, { scores }).then(r => r.data.data),

  getScores: (submissionId: string) =>
    api.get<ApiResponse<RubricScore[]>>(`/grading/submissions/${submissionId}/rubric-scores`).then(r => r.data.data),

  // Grade Categories
  listGradeCategories: (courseId: string) =>
    api.get<ApiResponse<GradeCategory[]>>(`/grading/courses/${courseId}/grade-categories`).then(r => r.data.data),

  createGradeCategory: (courseId: string, data: { name: string; weight: number }) =>
    api.post<ApiResponse<GradeCategory>>(`/grading/courses/${courseId}/grade-categories`, data).then(r => r.data.data),

  updateGradeCategory: (categoryId: string, data: Partial<GradeCategory>) =>
    api.put<ApiResponse<GradeCategory>>(`/grading/grade-categories/${categoryId}`, data).then(r => r.data.data),

  deleteGradeCategory: (categoryId: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/grading/grade-categories/${categoryId}`).then(r => r.data.data),

  // Grade Report
  getStudentGradeReport: (courseId: string) =>
    api.get<ApiResponse<GradeReport>>(`/grading/courses/${courseId}/grade-report`).then(r => r.data.data),

  // Grade Export
  exportGradesCSV: (courseId: string) =>
    api.get(`/grading/courses/${courseId}/export/csv`, { responseType: 'blob' }).then(r => r.data),

  exportGradesPDF: (courseId: string) =>
    api.get(`/grading/courses/${courseId}/export/pdf`, { responseType: 'blob' }).then(r => r.data),

  // Grade Visibility
  updateGradeVisibility: (courseId: string, data: { showGrades?: boolean; showRankings?: boolean }) =>
    api.put<ApiResponse<{ courseId: string; showGrades: boolean; showRankings: boolean }>>(`/grading/courses/${courseId}/grade-visibility`, data).then(r => r.data.data),
}
