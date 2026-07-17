export type ClassStatus = 'upcoming' | 'live' | 'past'
export interface LiveClassItem { id: string; courseId: string; courseTitle: string; subject: string; title: string; date: string; duration: number; meetUrl: string; status: ClassStatus }
