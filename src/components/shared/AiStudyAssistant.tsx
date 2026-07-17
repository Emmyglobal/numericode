import { type FormEvent, useState } from 'react'
import { Bot, MessageCircle, Send, X } from 'lucide-react'
import { studyGuideService } from '@/services/studyGuide.service'

const prompts = ['Help me choose a subject', 'How do live classes work?', 'What should my child learn first?']

export function AiStudyAssistant() {
  const [open, setOpen] = useState(false)
  const [answer, setAnswer] = useState('Ask about a subject, a learning path, or how to get started.')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const ask = async (question: string) => {
    if (!question.trim() || isLoading) return
    setIsLoading(true); setError(''); setMessage('')
    try { const result = await studyGuideService.ask(question); setAnswer(result?.answer ?? 'I could not prepare an answer. Please try again.') }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'The study assistant is unavailable right now.') }
    finally { setIsLoading(false) }
  }

  const submit = (event: FormEvent) => { event.preventDefault(); void ask(message) }

  return <div className="fixed bottom-5 right-5 z-40"><button onClick={() => setOpen(!open)} className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg transition hover:scale-105" aria-label={open ? 'Close study assistant' : 'Open study assistant'}>{open ? <X /> : <Bot />}</button>{open && <section className="absolute bottom-16 right-0 w-[calc(100vw-2.5rem)] max-w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-surface-dark" aria-label="AI study assistant"><div className="mb-3 flex items-center gap-2"><div className="rounded-lg bg-brand-light p-2 text-brand-blue"><Bot className="h-4 w-4" /></div><div><h2 className="text-sm font-bold text-gray-900 dark:text-white">NumeriCode Study Guide</h2><p className="text-xs text-gray-500">Private, helpful learning support</p></div></div><p className="rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-700 dark:bg-slate-800 dark:text-slate-200" aria-live="polite">{isLoading ? 'Thinking through that for you…' : answer}</p>{error && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}<div className="mt-3 flex flex-wrap gap-2">{prompts.map(prompt => <button key={prompt} onClick={() => void ask(prompt)} className="rounded-full border border-slate-200 px-3 py-1.5 text-left text-xs font-medium text-brand-blue hover:bg-brand-light dark:border-slate-700 dark:hover:bg-slate-800">{prompt}</button>)}</div><form onSubmit={submit} className="mt-3 flex gap-2"><label className="sr-only" htmlFor="study-guide-question">Ask a learning question</label><input id="study-guide-question" value={message} onChange={event => setMessage(event.target.value)} maxLength={800} placeholder="Ask a question…" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-blue dark:border-slate-700 dark:bg-slate-800 dark:text-white" /><button type="submit" disabled={isLoading || !message.trim()} className="rounded-lg bg-brand-blue p-2 text-white disabled:opacity-50" aria-label="Send question"><Send className="h-4 w-4" /></button></form><a href="https://wa.me/2347031992338" target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-green-700 hover:underline"><MessageCircle className="h-4 w-4" />Chat with our team</a></section>}</div>
}
