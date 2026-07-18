export interface Certificate {
  id: string
  courseId: string
  courseTitle: string
  studentName: string
  finalPercentage: number
  letterGrade: string
  issuedAt: string
  certificateCode: string
}

export interface CertificateVerification {
  valid: boolean
  studentName: string
  courseTitle: string
  finalPercentage: number
  letterGrade: string
  issuedAt: string
  certificateCode: string
}