export type CourseSubject = 'Mathematics' | 'Programming'

export type CourseLevel = 'Beginner' | 'Intermediate'

export type CourseTone = 'math' | 'code' | 'calculus'

export type Course = {
  id: string
  title: string
  subject: CourseSubject
  level: CourseLevel
  author: string
  lessons: number
  duration: string
  icon: string
  tone: CourseTone
  description: string
  outcomes: string[]
  modules: {
    title: string
    lessons: string[]
  }[]
  schedule: {
    date: string
    time: string
    topic: string
    status: 'Live now' | 'Upcoming'
  }[]
  resources: {
    title: string
    type: 'PDF' | 'Link' | 'Video'
  }[]
  instructor: {
    name: string
    role: string
    bio: string
  }
}
