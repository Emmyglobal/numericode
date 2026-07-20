import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface ForumCategory {
  id: string; courseId: string | null; name: string; description?: string
  position: number; createdAt: string
}

export interface ForumThread {
  id: string; categoryId: string; userId: string; userName: string
  title: string; body: string; isPinned: boolean; isLocked: boolean
  viewCount: number; createdAt: string; updatedAt: string
}

export interface ForumPost {
  id: string; threadId: string; userId: string; userName: string
  body: string; isSolution: boolean; createdAt: string; updatedAt: string
}

export const forumsService = {
  // Categories
  listByCourse: (courseId: string) =>
    api.get<ApiResponse<ForumCategory[]>>(`/forums/courses/${courseId}/forum/categories`).then(r => r.data.data),

  createCategory: (data: { courseId?: string; name: string; description?: string; position?: number }) =>
    api.post<ApiResponse<ForumCategory>>('/forums/forum/categories', data).then(r => r.data.data),

  updateCategory: (categoryId: string, data: Partial<ForumCategory>) =>
    api.put<ApiResponse<ForumCategory>>(`/forums/forum/categories/${categoryId}`, data).then(r => r.data.data),

  deleteCategory: (categoryId: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/forums/forum/categories/${categoryId}`).then(r => r.data.data),

  // Threads
  listThreads: (categoryId: string) =>
    api.get<ApiResponse<ForumThread[]>>(`/forums/forum/categories/${categoryId}/threads`).then(r => r.data.data),

  getThread: (threadId: string) =>
    api.get<ApiResponse<ForumThread>>(`/forums/forum/threads/${threadId}`).then(r => r.data.data),

  createThread: (data: { categoryId: string; title: string; body: string }) =>
    api.post<ApiResponse<ForumThread>>('/forums/forum/threads', data).then(r => r.data.data),

  updateThread: (threadId: string, data: Partial<ForumThread>) =>
    api.put<ApiResponse<ForumThread>>(`/forums/forum/threads/${threadId}`, data).then(r => r.data.data),

  deleteThread: (threadId: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/forums/forum/threads/${threadId}`).then(r => r.data.data),

  // Posts
  listPosts: (threadId: string) =>
    api.get<ApiResponse<ForumPost[]>>(`/forums/forum/threads/${threadId}/posts`).then(r => r.data.data),

  createPost: (threadId: string, body: string) =>
    api.post<ApiResponse<ForumPost>>(`/forums/forum/threads/${threadId}/posts`, { body }).then(r => r.data.data),

  updatePost: (threadId: string, postId: string, data: Partial<ForumPost>) =>
    api.put<ApiResponse<ForumPost>>(`/forums/forum/threads/${threadId}/posts/${postId}`, data).then(r => r.data.data),

  deletePost: (threadId: string, postId: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/forums/forum/threads/${threadId}/posts/${postId}`).then(r => r.data.data),

  // Search
  search: (query: string) =>
    api.get<ApiResponse<ForumThread[]>>(`/forums/forum/search?q=${encodeURIComponent(query)}`).then(r => r.data.data),
}