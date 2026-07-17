import type { Assignment } from '@/features/assignments/types'
export const assignmentsData: Assignment[] = [
  { id: 'a1', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Fractions Worksheet', dueDate: '2026-07-08', status: 'pending' },
  { id: 'a2', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'Build a Calculator', dueDate: '2026-07-10', status: 'pending' },
  { id: 'a3', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Number Patterns Quiz', dueDate: '2026-06-28', status: 'overdue' },
  { id: 'a4', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'Variables Exercise', dueDate: '2026-06-25', status: 'submitted' },
]
