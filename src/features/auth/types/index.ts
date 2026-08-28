export interface AuthUser { id: string; name: string; email: string; avatarUrl?: string; createdAt: string }
export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  name: string; email: string; password: string; confirmPassword: string; role: 'student' | 'trainer'
  guardianName?: string
  guardianPhone?: string
  preferredTeacherId?: string
  subjects?: Array<'mathematics' | 'programming'>
  /** Explicit policy acceptance — required by the backend before an account is created. */
  termsAccepted: boolean
  privacyPolicyAcknowledged: boolean
  acceptableUseAccepted: boolean
}
export interface AuthResponse { user: AuthUser & { role: 'student' | 'trainer' | 'admin' }; token: string }

/** Returned instead of AuthResponse when a trainer registration is created but awaiting admin approval. */
export interface PendingApprovalResponse { pendingApproval: true; message: string }

export function isPendingApproval(res: AuthResponse | PendingApprovalResponse): res is PendingApprovalResponse {
  return 'pendingApproval' in res
}
