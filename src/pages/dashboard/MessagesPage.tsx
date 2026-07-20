import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagingService } from '@/services/messaging.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Send, Mail, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const queryClient = useQueryClient()

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => messagingService.getMessages(),
  })

  const sendMutation = useMutation({
    mutationFn: (data: { receiverId: string; subject?: string; body: string }) =>
      messagingService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      setNewMessage('')
    },
  })

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return
    sendMutation.mutate({
      receiverId: selectedConversation,
      body: newMessage,
    })
  }

  return (
    <div>
      <PageHeader title="Messages" subtitle="Communicate with instructors and peers" />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !messages?.messages.length ? (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No messages yet</h3>
          <p className="text-gray-500">Start a conversation with your instructors or classmates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1 space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Conversations</h3>
            {messages.messages.map(message => (
              <button
                key={message.id}
                onClick={() => setSelectedConversation(
                  message.senderId === message.receiverId ? message.receiverId : message.senderId
                )}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedConversation === (message.senderId === message.receiverId ? message.receiverId : message.senderId)
                    ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-surface-dark'
                }`}
              >
                <p className="font-medium text-sm text-gray-900 dark:text-white">
                  {message.senderId === message.receiverId ? message.receiverName : message.senderName}
                </p>
                <p className="text-xs text-gray-500 truncate">{message.body}</p>
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2">
            {selectedConversation ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Conversation</h3>
                <div className="space-y-3 mb-4">
                  {messages.messages
                    .filter(m => m.senderId === selectedConversation || m.receiverId === selectedConversation)
                    .map(message => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.senderId === message.receiverId
                            ? 'bg-gray-100 dark:bg-gray-800 ml-auto'
                            : 'bg-brand-light dark:bg-blue-900/20'
                        }`}
                      >
                        <p className="text-sm text-gray-900 dark:text-white">{message.body}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-surface-dark">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Select a conversation to view messages</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}