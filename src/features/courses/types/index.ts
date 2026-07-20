export type Subject = 'mathematics' | 'programming'
export type Level   = 'beginner' | 'intermediate' | 'advanced'
export type CourseAccessLevel = 'free' | 'premium'
export interface Instructor { id: string; name: string; bio: string; avatarUrl?: string; credentials: string[] }
export interface Resource   { id: string; title: string; type: 'pdf' | 'video' | 'link'; url: string }
export interface Lesson     { id: string; title: string; duration: number; isCompleted: boolean; resources: Resource[] }
export interface Module     { id: string; title: string; lessons: Lesson[] }
export interface LiveClass  { id: string; title: string; date: string; duration: number; meetUrl: string; status: 'upcoming'|'live'|'past' }
export interface Course {
  id: string; title: string; description: string; content: string; subject: Subject; level: Level
  instructor: Instructor; modules: Module[]; lessonCount: number; liveClasses: LiveClass[]
  thumbnailUrl?: string; outcomes: string[]; createdAt: string
  accessLevel?: CourseAccessLevel; priceCents?: number; currency?: string; premiumEnabled?: boolean
}
export interface EnrolledCourse extends Course { progress: number; enrolledAt: string }
