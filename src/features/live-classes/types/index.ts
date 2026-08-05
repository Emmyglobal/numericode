export type ClassStatus = 'upcoming' | 'live' | 'past' | 'expired'
export interface LiveClassItem {
  id: string; courseId: string; courseTitle: string; subject: string
  title: string; date: string; duration: number; meetUrl: string
  status: ClassStatus
  sessionType: 'group' | 'individual'
  studentIds: string[]
  extensionMinutes: number
  startTime: string | null
  endTime: string | null
}
