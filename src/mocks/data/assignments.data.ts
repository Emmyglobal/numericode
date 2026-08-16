import type { Assignment } from '@/features/assignments/types'

export interface MockRelatedMaterial { id: string; name: string; type: string }

export const relatedMaterials: MockRelatedMaterial[] = [
  { id: 'rm1', name: 'Fractions Reference Sheet.pdf', type: 'pdf' },
  { id: 'rm2', name: 'JavaScript Cheat Sheet.txt', type: 'text' },
]

export const assignmentsData: Assignment[] = [
  {
    id: 'a1', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Fractions Worksheet', dueDate: '2026-07-08', status: 'pending', totalMarks: 40, passingScore: 20, score: null, feedback: null, returnedForCorrection: false,
    description: 'Complete the questions below on fractions. Show your working for every question. Submit before the due date to avoid an overdue status.',
    type: 'mixed',
    questions: [
      { id: 'q1', type: 'mcq', title: 'Which fraction is equivalent to 1/2?', marks: 4, options: ['2/3', '2/4', '3/5', '1/3'], correctOptionIndex: 1 },
      { id: 'q2', type: 'theory', title: 'Explain in your own words how to simplify the fraction 8/12.', marks: 6 },
      { id: 'q3', type: 'subjective', title: 'Solve and show your full working: 3/4 + 2/6. Explain each step.', marks: 10 },
      { id: 'q4', type: 'file', title: 'Upload a photo or scan of your completed worksheet showing 5 worked examples of fraction multiplication.', marks: 12, allowedFileTypes: ['pdf', 'jpg', 'png'] },
      { id: 'q5', type: 'related', title: 'Using the attached Fractions Reference Sheet, convert 0.75 into a fraction in its simplest form.', marks: 8, relatedMaterialId: 'rm1' },
    ],
  },
  {
    id: 'a2', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'Build a Calculator', dueDate: '2026-07-10', status: 'pending', totalMarks: 50, passingScore: 25, score: null, feedback: null, returnedForCorrection: false,
    description: 'Build a basic calculator using JavaScript. Answer the MCQ, explain your approach, and upload your code file.',
    type: 'mixed',
    questions: [
      { id: 'q1', type: 'mcq', title: 'Which keyword is used to declare a block-scoped variable in modern JavaScript?', marks: 5, options: ['var', 'let', 'function', 'static'], correctOptionIndex: 1 },
      { id: 'q2', type: 'subjective', title: 'Write a JavaScript function add(a, b) that returns the sum of two numbers. Explain how it works.', marks: 15 },
      { id: 'q3', type: 'file', title: 'Upload your completed calculator project as a single .js or .zip file.', marks: 30, allowedFileTypes: ['js', 'zip'] },
    ],
  },
  {
    id: 'a3', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Number Patterns Quiz', dueDate: '2026-06-28', status: 'overdue', totalMarks: 20, passingScore: 10, score: 0, feedback: 'You submitted after the due date.', returnedForCorrection: false,
    description: 'Answer the multiple choice questions about number patterns.',
    type: 'mcq',
    questions: [
      { id: 'q1', type: 'mcq', title: 'What is the next number in the pattern 2, 4, 6, 8, ...?', marks: 5, options: ['9', '10', '11', '12'], correctOptionIndex: 1 },
      { id: 'q2', type: 'mcq', title: 'Which of these is an odd number?', marks: 5, options: ['12', '14', '9', '20'], correctOptionIndex: 2 },
      { id: 'q3', type: 'mcq', title: 'The pattern 5, 10, 15, 20 is increasing by?', marks: 5, options: ['3', '5', '10', '15'], correctOptionIndex: 1 },
      { id: 'q4', type: 'mcq', title: 'What comes after 30 in the pattern 10, 20, 30, ...?', marks: 5, options: ['35', '40', '45', '50'], correctOptionIndex: 1 },
    ],
  },
  {
    id: 'a4', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'Variables Exercise', dueDate: '2026-06-25', status: 'submitted', totalMarks: 20, passingScore: 10, score: null, feedback: 'Nice work! Pending review.', returnedForCorrection: false,
    description: 'Show your understanding of JavaScript variables.',
    type: 'theory',
    questions: [
      { id: 'q1', type: 'theory', title: 'What is the difference between let and const in JavaScript?', marks: 10 },
      { id: 'q2', type: 'theory', title: 'List the main JavaScript primitive data types and give one example of each.', marks: 10 },
    ],
  },
]

export const mockAssignmentDraft = {
  title: 'AI-Drafted: Introduction to Fractions',
  description: 'An AI-generated assignment to help students practise fractions, from simplifying to word problems. Answer all questions and submit before the deadline.',
  questions: [
    { id: 'q1', type: 'mcq', title: 'Which of the following is the simplest form of the fraction 6/9?', marks: 5, options: ['2/3', '3/4', '2/5', '1/2'], correctOptionIndex: 0 },
    { id: 'q2', type: 'mcq', title: 'What fraction of the whole is one half written as a percentage?', marks: 5, options: ['25%', '50%', '75%', '10%'], correctOptionIndex: 1 },
    { id: 'q3', type: 'theory', title: 'Explain the difference between a proper fraction, an improper fraction and a mixed number.', marks: 6 },
    { id: 'q4', type: 'subjective', title: 'Solve the following and show each step: 2 1/2 + 1 3/4. Write your final answer as a mixed number.', marks: 8 },
    { id: 'q5', type: 'file', title: 'Upload a photo of your handwritten solutions for two fraction word problems of your choice.', marks: 8, allowedFileTypes: ['pdf', 'jpg', 'png'] },
    { id: 'q6', type: 'related', title: 'Using the attached practice sheet, complete the "Equivalent Fractions" table and submit your answers.', marks: 8, relatedMaterialId: 'rm1' },
  ],
}
