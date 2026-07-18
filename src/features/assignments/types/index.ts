export type AssignmentStatus = 'pending' | 'submitted' | 'under_review' | 'graded' | 'passed' | 'failed' | 'overdue'
export interface Assignment { id: string; courseId: string; courseTitle: string; title: string; dueDate: string; status: AssignmentStatus; totalMarks: number; passingScore: number; score: number | null; feedback: string | null; returnedForCorrection: boolean }
