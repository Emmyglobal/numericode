export type AssignmentStatus = 'pending' | 'submitted' | 'under_review' | 'graded' | 'passed' | 'failed' | 'overdue'
export type AssignmentQuestionType = 'mcq' | 'theory' | 'subjective' | 'file' | 'related'
export type AssignmentType = 'mcq' | 'theory' | 'subjective' | 'file' | 'mixed'

export interface AssignmentQuestion {
  id: string
  type: AssignmentQuestionType
  title: string
  marks: number
  options?: string[]
  correctOptionIndex?: number
  allowedFileTypes?: string[]
  relatedMaterialId?: string
}

export interface AssignmentAnswer {
  questionId: string
  selectedIndex?: number
  answer?: string
  fileName?: string
  fileData?: string
}

export interface Assignment {
  id: string
  courseId: string
  courseTitle: string
  title: string
  description: string
  type: AssignmentType
  dueDate: string
  status: AssignmentStatus
  totalMarks: number
  passingScore: number
  score: number | null
  feedback: string | null
  returnedForCorrection: boolean
  questions: AssignmentQuestion[]
  aiGenerated?: boolean
  createdAt?: string
}

export interface AssignmentSubmission {
  id: string
  status: string
  submittedAt?: string
  answers?: AssignmentAnswer[]
  fileName?: string | null
  fileData?: string | null
  content?: string | null
  score?: number | null
  feedback?: string | null
  totalMarks: number
  passingScore: number
  studentName?: string
  studentEmail?: string
  returnedForCorrection?: boolean
}

export interface AssignmentDraft {
  title: string
  description: string
  questions: AssignmentQuestion[]
  aiGenerated?: boolean
}

export interface AssignmentSubmissionPayload {
  answers: AssignmentAnswer[]
  content?: string
  fileName?: string | null
  fileData?: string | null
}
