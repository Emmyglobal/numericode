export type AssignmentStatus = 'pending' | 'submitted' | 'overdue'
export interface Assignment { id: string; courseId: string; courseTitle: string; title: string; dueDate: string; status: AssignmentStatus }
