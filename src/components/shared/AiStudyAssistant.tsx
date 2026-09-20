import { FormEvent, useEffect, useRef, useState } from 'react'
import { AlertCircle, Bot, Send, User, X } from 'lucide-react'
import { studyGuideService } from '@/services/studyGuide.service'
import { Button } from '@/components/ui/Button'
import { AiMarkdown } from '@/components/ui/AiMarkdown'
import type { ChatMessage } from '@/types/chat.types'

const SUGGESTED_PROMPTS = [
  'Explain this mathematics topic simply',
  'Help me understand React state',
  'Give me a JavaScript practice question',
  'Create a short study plan for this topic',
  'Walk me through solving a quadratic equation',
]

const MAX_LENGTH = 800

export function AiStudyAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastSent, setLastSent] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior })
  }

  // Don't yank the user away from older messages they're reading.
  const handleScroll = () => {
    const el = listRef.current
    if (!el) return
    setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 64)
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    setError('')
    setLastSent(trimmed)
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: 'user', content: trimmed, createdAt: new Date() },
    ])
    setInput('')
    setIsLoading(true)
    void scrollToBottom('auto')
    try {
      const result = await studyGuideService.ask(trimmed)
      const answer = result?.answer ?? 'I could not prepare an answer. Please try again.'
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', content: answer, createdAt: new Date() },
      ])
    } catch {
      // Sanitize: never surface raw provider/HTTP/stack details to the browser.
      setError("Sorry, I couldn't process that request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) scrollToBottom('auto')
  }, [open])
  useEffect(() => {
    if (autoScroll) scrollToBottom(messages.length ? 'smooth' : 'auto')
  }, [messages, isLoading, autoScroll])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    void sendMessage(input)
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      void sendMessage(input)
    }
  }

  const canSend = !!input.trim() && !isLoading
  const rows = Math.min(6, Math.max(1, (input.match(/\n/g) || []).length + 1))

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="ai-study-panel"
        aria-label={open ? 'Close NumeryCode AI' : 'Open NumeryCode AI'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" />}
      </button>

      {open && (
        <section
          id="ai-study-panel"
          role="dialog"
          aria-modal="false"
          aria-label="NumeryCode AI chat"
          className="absolute bottom-16 right-0 box-border h-[520px] w-[calc(100vw-2rem)] max-h-[75vh] max-w-[26rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-surface-dark sm:max-w-sm sm:rounded-3xl md:max-w-md"
        >
          <ChatHeader
            title="NumeryCode AI"
            subtitle="Your mathematics & coding study assistant"
            onClose={() => setOpen(false)}
          />
          <div
            ref={listRef}
            onScroll={handleScroll}
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            className="flex-1 space-y-1 overflow-y-auto p-4"
          >
            {messages.length === 0 && !error && !isLoading && <EmptyState onPrompt={sendMessage} />}
            <MessageList messages={messages} />
            {isLoading && <TypingIndicator />}
            {error && <ErrorBanner message={error} onRetry={() => void sendMessage(lastSent)} />}
          </div>
          <ChatInput
            value={input}
            rows={rows}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onSubmit={submit}
            disabled={isLoading}
            maxLength={MAX_LENGTH}
            canSend={canSend}
          />
        </section>
      )}
    </div>
  )
}

function ChatHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle?: string
  onClose: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-blue">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close chat"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-brand-blue dark:hover:bg-slate-700 dark:text-slate-400"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

function EmptyState({ onPrompt }: { onPrompt: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-1 py-4 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand-blue">
        <Bot className="h-6 w-6" />
      </div>
      <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
        How can I help you learn today?
      </p>
      <p className="max-w-xs text-center text-xs text-slate-500 dark:text-slate-400">
        Ask me to explain a concept, solve a problem step by step, create a study
        plan, or generate a practice question.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => void onPrompt(prompt)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-brand-light hover:text-brand-navy dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageList({ messages }: { messages: ChatMessage[] }) {
  if (!messages.length) return null
  return (
    <>
      {messages.map((message) =>
        message.role === 'user' ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AIMessage key={message.id} message={message} />
        ),
      )}
    </>
  )
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end gap-1.5">
      <div className="max-w-[78%] rounded-2xl bg-brand-blue px-4 py-2.5 text-sm text-white break-words">
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-light text-white">
        <User className="h-4 w-4" />
      </div>
    </div>
  )
}

function AIMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex items-end gap-1.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand-blue">
        <Bot className="h-5 w-5" />
      </div>
      <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200 break-words">
        <AiMarkdown markdown={message.content} />
      </div>
    </div>
  )
}


function TypingIndicator() {
  return (
    <div className="flex items-end gap-1.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand-blue">
        <Bot className="h-5 w-5" />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <span className="sr-only">NumeryCode AI is thinking</span>
        <span className="text-xs font-medium">NumeryCode AI is thinking</span>
        <span className="ml-2 inline-block -translate-y-px space-x-0.5">
          <span className="ai-typing-dot inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500 [animation-delay:-0.32s]" />
          <span className="ai-typing-dot inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500 [animation-delay:-0.16s]" />
          <span className="ai-typing-dot inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500" />
        </span>
      </div>
    </li>
  )
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-1.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
        {message}
        <button
          type="button"
          onClick={onRetry}
          className="ml-2 font-medium underline underline-offset-1 decoration-current"
        >
          Retry
        </button>
      </div>
    </li>
  )
}

function ChatInput({
  value,
  rows,
  onChange,
  onKeyDown,
  onSubmit,
  disabled,
  maxLength,
  canSend,
}: {
  value: string
  rows: number
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: FormEvent) => void
  disabled: boolean
  maxLength: number
  canSend: boolean
}) {
  const showCounter = value.length >= Math.floor(maxLength * 0.75)
  return (
    <form
      onSubmit={onSubmit}
      className="flex items-end gap-2 border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40"
    >
      <label htmlFor="ai-chat-input" className="sr-only">
        Your message
      </label>
      <textarea
        id="ai-chat-input"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        maxLength={maxLength}
        placeholder="Ask NumeryCode AI anything…"
        rows={rows}
        spellCheck
        className="min-w-0 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      {showCounter && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400" aria-hidden="true">
          {value.length}/{maxLength}
        </span>
      )}
      <Button type="submit" size="md" disabled={!canSend} aria-label="Send message" className="shrink-0">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}

