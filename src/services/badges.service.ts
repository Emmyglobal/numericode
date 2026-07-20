import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface Badge {
  id: string; name: string; description: string; iconUrl?: string
  criteria: unknown; createdAt: string
}

export interface UserBadge {
  id: string; userId: string; badgeId: string; badgeName: string
  badgeDescription: string; badgeIcon?: string; courseId?: string; courseTitle?: string
  earnedAt: string
}

export interface CertificateTemplate {
  id: string; name: string; htmlTemplate: string; cssStyles: string
  isDefault: boolean; createdAt: string
}

export interface LateSubmissionPenalty {
  id: string; assignmentId: string; penaltyPerHour: number
  maxPenalty: number; gracePeriod: number; createdAt: string
}

export const badgesService = {
  // Badges
  listBadges: () =>
    api.get<ApiResponse<Badge[]>>('/badges').then(r => r.data.data),

  createBadge: (data: { name: string; description: string; iconUrl?: string; criteria: unknown }) =>
    api.post<ApiResponse<Badge>>('/badges', data).then(r => r.data.data),

  updateBadge: (badgeId: string, data: Partial<Badge>) =>
    api.put<ApiResponse<Badge>>(`/badges/${badgeId}`, data).then(r => r.data.data),

  deleteBadge: (badgeId: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/badges/${badgeId}`).then(r => r.data.data),

  // User Badges
  getUserBadges: () =>
    api.get<ApiResponse<UserBadge[]>>('/my/badges').then(r => r.data.data),

  awardBadge: (data: { userId: string; badgeId: string; courseId?: string }) =>
    api.post<ApiResponse<UserBadge>>('/badges/award', data).then(r => r.data.data),

  // Certificate Templates
  listCertificateTemplates: () =>
    api.get<ApiResponse<CertificateTemplate[]>>('/certificate-templates').then(r => r.data.data),

  createCertificateTemplate: (data: { name: string; htmlTemplate: string; cssStyles?: string; isDefault?: boolean }) =>
    api.post<ApiResponse<CertificateTemplate>>('/certificate-templates', data).then(r => r.data.data),

  updateCertificateTemplate: (templateId: string, data: Partial<CertificateTemplate>) =>
    api.put<ApiResponse<CertificateTemplate>>(`/certificate-templates/${templateId}`, data).then(r => r.data.data),

  deleteCertificateTemplate: (templateId: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/certificate-templates/${templateId}`).then(r => r.data.data),

  // Late Submission Penalties
  getLateSubmissionPenalty: (assignmentId: string) =>
    api.get<ApiResponse<LateSubmissionPenalty | null>>(`/assignments/${assignmentId}/late-penalty`).then(r => r.data.data),

  setLateSubmissionPenalty: (assignmentId: string, data: { penaltyPerHour: number; maxPenalty: number; gracePeriod: number }) =>
    api.post<ApiResponse<LateSubmissionPenalty>>(`/assignments/${assignmentId}/late-penalty`, data).then(r => r.data.data),

  deleteLateSubmissionPenalty: (assignmentId: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/assignments/${assignmentId}/late-penalty`).then(r => r.data.data),
}