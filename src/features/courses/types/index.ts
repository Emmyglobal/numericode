export type Subject = 'mathematics' | 'programming'
export type Level   = 'beginner' | 'intermediate' | 'advanced'
export type CourseAccessLevel = 'free' | 'premium'
export interface Instructor { id: string; name: string; bio: string; avatarUrl?: string; credentials: string[] }
export interface Resource   { id: string; title: string; type: 'pdf' | 'video' | 'link' | 'file'; url: string }
export interface Lesson     { id: string; title: string; content?: string; duration: number; isCompleted: boolean; resources: Resource[] }
export interface Module     { id: string; title: string; lessons: Lesson[] }
export interface LiveClass  { id: string; title: string; date: string; duration: number; meetUrl: string; status: 'upcoming'|'live'|'past' }
/**
 * Course-level prerequisite quiz. When present on a course, an enrolled student
 * must PASS this quiz before the course's lessons unlock (see CourseViewerPage).
 */
export interface PrerequisiteQuiz {
  id: string
  title: string
  description: string
  /** Minimum percentage required to unlock the course. */
  passingScore: number
  /** True when the current student already has a passing attempt. */
  isPrerequisiteQuizPassed: boolean
}
export interface Course {
  id: string; title: string; description: string; content: string; subject: Subject; level: Level
  instructor: Instructor; modules: Module[]; lessonCount: number; liveClasses: LiveClass[]
  thumbnailUrl?: string; outcomes: string[]; createdAt: string
  accessLevel?: CourseAccessLevel; priceCents?: number; currency?: string; premiumEnabled?: boolean
  prerequisiteQuiz?: PrerequisiteQuiz
}
export interface EnrolledCourse extends Course { progress: number; enrolledAt: string }

/**
 * Slim course payload returned by the public catalogue endpoint (Phase 1 API).
 * Contains course-card fields only — no modules, lessons or resources (those
 * belong to the Course Details experience). Instructor data is privacy-safe
 * public trainer information (no email, no credentials list).
 */
export interface CourseSummary {
  id: string; title: string; description: string; subject: Subject; level: Level
  lessonCount: number; outcomes: string[]
  thumbnailUrl?: string | null
  accessLevel?: CourseAccessLevel; priceCents?: number | null; currency?: string | null
  premiumEnabled?: boolean; createdAt: string
  instructor: { id: string; name: string; bio: string; avatarUrl?: string | null }
}
