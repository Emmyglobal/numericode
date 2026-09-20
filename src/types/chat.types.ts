/**
 * Shared types for the NumeryCode AI study-assistant chat.
 *
 * The chat is rendered client-side only. Conversation history lives for the
 * current browser session — the backend AI endpoint (`POST /api/ai/study-guide`)
 * is stateless per request, so the assistant does not have persistent memory
 * across sessions.
 */
export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  /** Stable unique id used as a React list key. */
  id: string
  /** Who sent the message. */
  role: ChatRole
  /** Markdown-formatted message content. */
  content: string
  /** Client-side timestamp used for ordering/aria. */
  createdAt?: Date
}
