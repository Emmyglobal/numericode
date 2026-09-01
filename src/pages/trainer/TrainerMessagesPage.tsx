import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagingService } from '@/services/messaging.service'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Send, Plus, X, MessageSquare, Mail } from 'lucide-react'

interface Conversation {
  userId: string
  userName: string
  lastMessage: string
  lastDate: string
  unreadCount: number
}

export default function TrainerMessagesPage() {
  usePageTitle('Messages — Trainer')
  const currentUserId = useAuthStore(s => s.user?.id)
  const queryClient = useQueryClient()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [composeReceiverId, setComposeReceiverId] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // All messages where the trainer is sender or receiver.
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => messagingService.getMessages(1, 100),
  })

  // The trainer's students (for composing to a student with no prior thread).
  const { data: students } = useQuery({
    queryKey: ['trainer', 'students'],
    queryFn: async () => {
      const r = await api.get<{ data: { id: string; name: string; email: string }[] }>('/trainer/students')
      return r.data.data
    },
  })

  // Build conversations grouped by the OTHER participant (student), so both
  // sent and received messages collapse into a single thread per student.
  const conversations = useMemo(() => {
    if (!messagesData?.messages || !currentUserId) return [] as Conversation[]
    const convMap = new Map<string, Conversation>()

    for (const msg of messagesData.messages) {
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
        if (new Date(msg.createdAt) > new Date(conv.lastDate)) {
          conv.lastMessage = msg.body
          conv.lastDate = msg.createdAt
        }
        if (!isMine && !msg.isRead) conv.unreadCount++
      }
    }

    return Array.from(convMap.values())
      .sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime())
  }, [messagesData, currentUserId])

  // Thread for the selected student. getConversation returns the ASC thread and
  // marks inbound messages as read on the server.
  const { data: conversationMessages = [], refetch: refetchConversation } = useQuery({
    queryKey: ['conversation', selectedUserId],
    queryFn: () => messagingService.getConversation(selectedUserId!),
    enabled: Boolean(selectedUserId),
  })

  // When a conversation loads, the server marks inbound messages as read, so
  // refresh the messages list to keep unread counts accurate.
  useEffect(() => {
    if (conversationMessages.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }
  }, [conversationMessages, queryClient])

  const sendMutation = useMutation({
    mutationFn: (data: { receiverId: string; subject?: string; body: string }) =>
      messagingService.sendMessage(data),
    onSuccess: () => {
      refetchConversation()
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      setNewMessage('')
    },
    onError: (err: Error) => setError(err.message),
  })

  const handleReply = () => {
    if (!newMessage.trim() || !selectedUserId) return
    setError('')
    setSuccess('')
    sendMutation.mutate({ receiverId: selectedUserId, body: newMessage.trim() })
  }

  const openConversation = (userId: string) => {
    setSelectedUserId(userId)
    setError('')
    setSuccess('')
    setNewMessage('')
  }

  const handleCompose = (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeReceiverId || !composeBody.trim()) {
      setError('Please select a student and enter a message')
      return
    }
    setError('')
    setSuccess('')
    sendMutation.mutate(
      { receiverId: composeReceiverId, subject: composeSubject.trim() || undefined, body: composeBody.trim() },
      {
        onSuccess: () => {
          setShowCompose(false)
          setComposeReceiverId('')
          setComposeSubject('')
          setComposeBody('')
          setSelectedUserId(composeReceiverId)
          setSuccess('Message sent to your student.')
        },
      }
    )
  }

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Conversations with your students"
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
          <p className="text-gray-500 mb-4">When students message you, their conversations appear here.</p>
          <Button onClick={() => setShowCompose(true)}>
            <Plus className="w-4 h-4 mr-1" /> Message a Student
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
                onClick={() => openConversation(conv.userId)}
                className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3 ${
                  selectedUserId === conv.userId
                    ? 'border-teal bg-teal-light/60 dark:bg-teal-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-surface-dark hover:border-gray-300'
                }`}
              >
                <Avatar name={conv.userName} size="sm" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{conv.userName}</p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-teal text-white text-xs rounded-full px-2 py-0.5 shrink-0">{conv.unreadCount}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(conv.lastDate).toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2">
            {selectedUserId ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Conversation with {conversations.find(c => c.userId === selectedUserId)?.userName || 'Student'}
                </h3>

                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {conversationMessages.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Say hello to start this conversation.</p>
                  ) : (
                    conversationMessages.map(message => {
                      const isMine = message.senderId === currentUserId
                      return (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg max-w-[80%] ${
                            isMine
                              ? 'bg-teal text-white ml-auto'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          {message.subject && (
                            <p className={`text-xs font-semibold mb-1 ${isMine ? 'text-teal-100' : 'text-gray-500'}`}>
                              {message.subject}
                            </p>
                          )}
                          <p className="text-sm">{message.body}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-teal-100' : 'text-gray-500'}`}>
                            {message.senderName} · {new Date(message.createdAt).toLocaleString()}
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
                    onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                    placeholder="Type a reply..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                  <Button onClick={handleReply} loading={sendMutation.isPending}>
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
                  <option value="">Select a student…</option>
                  {(students ?? []).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
                {(!students || students.length === 0) && (
                  <p className="text-xs text-amber-600 mt-1">No students are enrolled in your courses yet.</p>
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

