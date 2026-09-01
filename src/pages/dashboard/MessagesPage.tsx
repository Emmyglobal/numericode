import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagingService, type Message } from '@/services/messaging.service'
import { dashboardService } from '@/services/dashboard.service'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { Send, Mail, Plus, X, MessageSquare } from 'lucide-react'
import type { EnrolledCourse } from '@/features/courses/types'

interface Conversation {
  userId: string; userName: string; lastMessage: string; lastDate: string; unreadCount: number
}

export default function MessagesPage() {
  const currentUserId = useAuthStore(s => s.user?.id)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [composeReceiverId, setComposeReceiverId] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const queryClient = useQueryClient()

  const { data: enrolledCourses } = useQuery({
    queryKey: ['dashboard', 'courses'],
    queryFn: () => dashboardService.getMyCourses() as Promise<EnrolledCourse[]>,
  })

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => messagingService.getMessages(1, 100),
  })

  // Build conversations from messages (group by the other participant)
  const conversations = useMemo(() => {
    if (!messagesData?.messages || !currentUserId) return [] as Conversation[]
    const convMap = new Map<string, Conversation>()

    for (const msg of messagesData.messages) {
      // Use the other participant's ID as the key (not the sender) so both
      // sent and received messages collapse into a single thread.
      const isMine = msg.senderId === currentUserId
      const otherId = isMine ? msg.receiverId : msg.senderId
      const otherName = isMine ? msg.receiverName : msg.senderName

      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          userId: otherId,
          userName: otherName,
          lastMessage: msg.body,
          lastDate: msg.createdAt,
          unreadCount: !isMine && !msg.isRead ? 1 : 0,
        })
      } else {
        const conv = convMap.get(otherId)!
        // Update last message if newer
        if (new Date(msg.createdAt) > new Date(conv.lastDate)) {
          conv.lastMessage = msg.body
          conv.lastDate = msg.createdAt
        }
        if (!isMine && !msg.isRead) conv.unreadCount++
      }
    }
    
    return Array.from(convMap.values())
      .sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime())
  }, [messagesData])

  // Get conversation messages
  const conversationMessages = useMemo(() => {
    if (!selectedUserId || !messagesData?.messages) return [] as Message[]
    return messagesData.messages
      .filter(m => (m.senderId === selectedUserId || m.receiverId === selectedUserId))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [selectedUserId, messagesData])

  const sendMutation = useMutation({
    mutationFn: (data: { receiverId: string; subject?: string; body: string }) =>
      messagingService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      setNewMessage('')
      setSuccess('Message sent!')
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUserId) return
    sendMutation.mutate({ receiverId: selectedUserId, body: newMessage.trim() })
  }

  const handleCompose = (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeReceiverId || !composeBody.trim()) {
      setError('Please select a recipient and enter a message')
      return
    }
    sendMutation.mutate(
      { receiverId: composeReceiverId, subject: composeSubject.trim() || undefined, body: composeBody.trim() },
      {
        onSuccess: () => {
          setShowCompose(false)
          setComposeReceiverId('')
          setComposeSubject('')
          setComposeBody('')
          setSelectedUserId(composeReceiverId)
        },
      }
    )
  }

  // Get unique instructors from enrolled courses for compose
  const availableRecipients = useMemo(() => {
    if (!enrolledCourses) return [] as { id: string; name: string }[]
    const instructors = new Map<string, { id: string; name: string }>()
    for (const course of enrolledCourses) {
      if (course.instructor && course.instructor.id && !instructors.has(course.instructor.id)) {
        instructors.set(course.instructor.id, { id: course.instructor.id, name: course.instructor.name })
      }
    }
    return Array.from(instructors.values())
  }, [enrolledCourses])

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Communicate with instructors and peers"
        actions={
          <Button onClick={() => { setShowCompose(true); setError(''); setSuccess('') }}>
            <Plus className="w-4 h-4 mr-1" /> New Message
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !conversations.length && !showCompose ? (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No messages yet</h3>
          <p className="text-gray-500 mb-4">Start a conversation with your instructors or classmates.</p>
          <Button onClick={() => setShowCompose(true)}>
            <Plus className="w-4 h-4 mr-1" /> Compose Message
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1 space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Conversations</h3>
            {conversations.map(conv => (
              <button
                key={conv.userId}
                onClick={() => { setSelectedUserId(conv.userId); setError(''); setSuccess('') }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedUserId === conv.userId
                    ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-surface-dark hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{conv.userName}</p>
                  {conv.unreadCount > 0 && (
                    <span className="bg-brand-blue text-white text-xs rounded-full px-2 py-0.5">{conv.unreadCount}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(conv.lastDate).toLocaleDateString()}</p>
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2">
            {selectedUserId ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Conversation with {conversations.find(c => c.userId === selectedUserId)?.userName || 'User'}
                </h3>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {conversationMessages.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No messages in this conversation yet.</p>
                  ) : (
                    conversationMessages.map(message => {
                      const isMine = message.senderId === currentUserId
                      return (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg max-w-[80%] ${
                            isMine
                              ? 'bg-brand-blue text-white ml-auto'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.body}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-500'}`}>
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <Button onClick={handleSendMessage} loading={sendMutation.isPending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-surface-dark">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Select a conversation to view messages</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCompose(false)}>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Message</h2>
              <button onClick={() => setShowCompose(false)} aria-label="Close">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCompose} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">To <span className="text-red-500">*</span></label>
                <select
                  required
                  value={composeReceiverId}
                  onChange={e => setComposeReceiverId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 text-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a recipient…</option>
                  {availableRecipients.map(r => (
                    <option key={r.id} value={r.id}>{r.name} (Instructor)</option>
                  ))}
                </select>
                {availableRecipients.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No instructors found from your enrolled courses.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Subject <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Message <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  rows={5}
                  placeholder="Write your message…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-2 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setShowCompose(false)}>Cancel</Button>
                <Button type="submit" loading={sendMutation.isPending}>Send Message</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}