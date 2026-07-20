import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface Message {
  id: string; senderId: string; senderName: string; receiverId: string; receiverName: string
  subject?: string; body: string; isRead: boolean; createdAt: string
}

export interface GroupConversation {
  id: string; courseId?: string; title: string; createdBy: string
  memberCount: number; messageCount: number; createdAt: string
}

export interface GroupMessage {
  id: string; conversationId: string; senderId: string; senderName: string
  body: string; createdAt: string
}

export const messagingService = {
  // Direct Messages
  sendMessage: (data: { receiverId: string; subject?: string; body: string }) =>
    api.post<ApiResponse<Message>>('/messages', data).then(r => r.data.data),

  getMessages: (page = 1, limit = 20) =>
    api.get<ApiResponse<{ messages: Message[]; total: number; page: number; limit: number }>>(`/messages?page=${page}&limit=${limit}`).then(r => r.data.data),

  getConversation: (userId: string) =>
    api.get<ApiResponse<Message[]>>(`/messages/conversations/${userId}`).then(r => r.data.data),

  markAsRead: (messageId: string) =>
    api.patch<ApiResponse<{ success: boolean }>>(`/messages/${messageId}/read`).then(r => r.data.data),

  // Group Conversations
  createGroupConversation: (data: { courseId?: string; title: string; memberIds: string[] }) =>
    api.post<ApiResponse<GroupConversation>>('/group-conversations', data).then(r => r.data.data),

  getGroupConversations: (courseId?: string) =>
    api.get<ApiResponse<GroupConversation[]>>(`/group-conversations${courseId ? `?courseId=${courseId}` : ''}`).then(r => r.data.data),

  getGroupMessages: (conversationId: string) =>
    api.get<ApiResponse<GroupMessage[]>>(`/group-conversations/${conversationId}/messages`).then(r => r.data.data),

  sendGroupMessage: (conversationId: string, body: string) =>
    api.post<ApiResponse<GroupMessage>>(`/group-conversations/${conversationId}/messages`, { body }).then(r => r.data.data),
}