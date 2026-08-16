import type { TrainerCourse, TrainerStudent, TrainerLiveSession, TrainerAssignment, TrainerStats } from '@/features/trainer/types'

export const trainerStats: TrainerStats = {
  totalStudents: 47,
  activeCourses: 4,
  totalSessions: 28,
  avgCompletionRate: 68,
  pendingReviews: 9,
  upcomingSessions: 3,
}

export const trainerCourses: TrainerCourse[] = [
  { id: 'c1', title: 'Foundation Mathematics', subject: 'mathematics', level: 'beginner', status: 'published', enrolledCount: 18, lessonCount: 24, completionRate: 72, createdAt: '2024-01-10' },
  { id: 'c2', title: 'JavaScript for Beginners', subject: 'programming', level: 'beginner', status: 'published', enrolledCount: 21, lessonCount: 30, completionRate: 65, createdAt: '2024-02-01' },
  { id: 'c3', title: 'Algebra & Equations', subject: 'mathematics', level: 'intermediate', status: 'published', enrolledCount: 12, lessonCount: 28, completionRate: 58, createdAt: '2024-03-05' },
  { id: 'c4', title: 'Python Programming', subject: 'programming', level: 'intermediate', status: 'draft', enrolledCount: 0, lessonCount: 10, completionRate: 0, createdAt: '2024-04-01' },
]

export const trainerStudents: TrainerStudent[] = [
  { id: 'u2', name: 'Kolade Adebayo', email: 'kolade@gmail.com', enrolledCourses: ['c1', 'c2'], progress: { c1: 42, c2: 25 }, lastActive: '2026-06-30', joinedAt: '2024-02-10' },
  { id: 'u3', name: 'Amaka Okonkwo', email: 'amaka@gmail.com', enrolledCourses: ['c1'], progress: { c1: 88 }, lastActive: '2026-06-29', joinedAt: '2024-03-01' },
  { id: 'u4', name: 'Chidi Obi', email: 'chidi@gmail.com', enrolledCourses: ['c2', 'c3'], progress: { c2: 60, c3: 30 }, lastActive: '2026-06-28', joinedAt: '2024-03-15' },
  { id: 'u5', name: 'Ngozi Eze', email: 'ngozi@gmail.com', enrolledCourses: ['c1', 'c3'], progress: { c1: 100, c3: 75 }, lastActive: '2026-07-01', joinedAt: '2024-01-20' },
  { id: 'u6', name: 'Emeka Nwosu', email: 'emeka@gmail.com', enrolledCourses: ['c2'], progress: { c2: 15 }, lastActive: '2026-06-25', joinedAt: '2024-04-05' },
]

export const trainerSessions: TrainerLiveSession[] = [
  { id: 'lc1', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Algebra Q&A Session', date: '2026-07-05T10:00:00', duration: 60, meetUrl: 'https://meet.google.com/abc-defg-hij', status: 'scheduled', attendees: 0 },
  { id: 'lc2', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Fractions Deep Dive', date: '2026-07-12T10:00:00', duration: 60, meetUrl: 'https://meet.google.com/abc-defg-hij', status: 'scheduled', attendees: 0 },
  { id: 'lc3', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'JavaScript Q&A', date: '2026-07-04T14:00:00', duration: 60, meetUrl: 'https://zoom.us/j/123456', status: 'scheduled', attendees: 0 },
  { id: 'lc4', courseId: 'c3', courseTitle: 'Algebra & Equations', title: 'Quadratics Workshop', date: '2026-06-20T11:00:00', duration: 90, meetUrl: '#', status: 'completed', attendees: 11 },
]

export const trainerAssignments: TrainerAssignment[] = [
  { id: 'a1', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Fractions Worksheet', dueDate: '2026-07-08', totalSubmissions: 14, pendingReview: 5, createdAt: '2026-06-28', totalMarks: 40, passingScore: 20, description: 'Fractions practice covering equivalence, addition and word problems.', type: 'mixed', aiGenerated: true, questions: [
    { id: 'q1', type: 'mcq', title: 'Which fraction is equivalent to 1/2?', marks: 4, options: ['2/3', '2/4', '3/5', '1/3'], correctOptionIndex: 1 },
    { id: 'q2', type: 'theory', title: 'Explain how to simplify 8/12.', marks: 6 },
    { id: 'q3', type: 'subjective', title: 'Solve and show working: 3/4 + 2/6.', marks: 10 },
    { id: 'q4', type: 'file', title: 'Upload a photo of 5 worked fraction multiplication examples.', marks: 12, allowedFileTypes: ['pdf', 'jpg', 'png'] },
    { id: 'q5', type: 'related', title: 'Using the attached sheet, convert 0.75 to a fraction.', marks: 8, relatedMaterialId: 'rm1' },
  ] },
  { id: 'a2', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'Build a Calculator', dueDate: '2026-07-10', totalSubmissions: 9, pendingReview: 4, createdAt: '2026-06-29', totalMarks: 50, passingScore: 25, description: 'Build a calculator app in JavaScript and upload your code.', type: 'mixed', questions: [
    { id: 'q1', type: 'mcq', title: 'Which keyword declares a block-scoped variable?', marks: 5, options: ['var', 'let', 'function', 'static'], correctOptionIndex: 1 },
    { id: 'q2', type: 'subjective', title: 'Write add(a, b) and explain it.', marks: 15 },
    { id: 'q3', type: 'file', title: 'Upload your calculator project (.js or .zip).', marks: 30, allowedFileTypes: ['js', 'zip'] },
  ] },
  { id: 'a3', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Number Patterns Quiz', dueDate: '2026-06-28', totalSubmissions: 18, pendingReview: 0, createdAt: '2026-06-15', totalMarks: 20, passingScore: 10, description: 'MCQ quiz on number patterns.', type: 'mcq', questions: [
    { id: 'q1', type: 'mcq', title: 'Next in 2,4,6,8,...?', marks: 5, options: ['9', '10', '11', '12'], correctOptionIndex: 1 },
    { id: 'q2', type: 'mcq', title: 'Which is odd?', marks: 5, options: ['12', '14', '9', '20'], correctOptionIndex: 2 },
    { id: 'q3', type: 'mcq', title: '5,10,15,20 increases by?', marks: 5, options: ['3', '5', '10', '15'], correctOptionIndex: 1 },
    { id: 'q4', type: 'mcq', title: 'After 30 in 10,20,30,...?', marks: 5, options: ['35', '40', '45', '50'], correctOptionIndex: 1 },
  ] },
]

export interface TrainerNote {
  id: string
  courseId: string
  lessonId: string | null
  title: string
  content: string
  isPublished: boolean
  courseTitle: string
  lessonTitle: string | null
  creatorName: string
  createdAt: string
  updatedAt: string
}

export const trainerNotes: TrainerNote[] = [
  {
    id: 'n1', courseId: 'c1', lessonId: null,
    title: 'Algebra Fundamentals Overview',
    content: 'This module covers the basic principles of algebra including variables, expressions, and equations. Students should practice with the provided worksheets.',
    isPublished: true, courseTitle: 'Foundation Mathematics', lessonTitle: null,
    creatorName: 'You', createdAt: '2026-06-25T10:00:00Z', updatedAt: '2026-06-28T14:30:00Z',
  },
  {
    id: 'n2', courseId: 'c1', lessonId: null,
    title: 'Common Mistakes in Fractions',
    content: 'Students often confuse numerator and denominator operations. Emphasize the "multiply by reciprocal" rule for division.',
    isPublished: true, courseTitle: 'Foundation Mathematics', lessonTitle: null,
    creatorName: 'You', createdAt: '2026-06-20T08:00:00Z', updatedAt: '2026-06-22T12:00:00Z',
  },
  {
    id: 'n3', courseId: 'c2', lessonId: null,
    title: 'JavaScript Variables & Data Types',
    content: 'Key concepts: let, const, var differences. Primitive types: string, number, boolean, null, undefined. Reference types: objects, arrays.',
    isPublished: true, courseTitle: 'JavaScript for Beginners', lessonTitle: null,
    creatorName: 'You', createdAt: '2026-06-18T09:00:00Z', updatedAt: '2026-06-19T11:00:00Z',
  },
  {
    id: 'n4', courseId: 'c2', lessonId: null,
    title: 'Draft: Functions Deep Dive',
    content: 'Work in progress - will cover function declarations, expressions, arrow functions, and higher-order functions.',
    isPublished: false, courseTitle: 'JavaScript for Beginners', lessonTitle: null,
    creatorName: 'You', createdAt: '2026-06-30T16:00:00Z', updatedAt: '2026-06-30T16:00:00Z',
  },
]
