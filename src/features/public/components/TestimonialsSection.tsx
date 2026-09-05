import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquareQuote, CheckCircle2, Clock3 } from 'lucide-react'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { testimonialsService, type SubmitTestimonialInput } from '@/services/testimonials.service'

const inputCls = 'w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue'

export function TestimonialsSection() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', course: '', location: '', message: '' })
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['public-testimonials'],
    queryFn: () => testimonialsService.list(),
  })

  const submitMutation = useMutation({
    mutationFn: (input: SubmitTestimonialInput) => testimonialsService.submit(input),
    onSuccess: () => {
      setForm({ name: '', email: '', course: '', location: '', message: '' })
      setConsent(false)
      setOpen(false)
      // Refresh testimonials list to show the newly submitted testimonial
      queryClient.invalidateQueries({ queryKey: ['public-testimonials'] })
    },
    onError: (e: Error) => setError(e.message || 'Something went wrong. Please try again.'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, a valid email and your message (at least 20 characters).')
      return
    }
    if (!consent) { setError('Please tick the consent box so we may publish your testimonial.'); return }
    submitMutation.mutate({ ...form, message: form.message.trim(), consent })
  }

  return (
    <SectionWrapper>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Our Learners Say</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Real experiences from the NumeryCode community. Every story is verified, consented and reviewed before it appears here.</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}</div>
      ) : testimonials.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <figure key={t.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 shadow-card">
              <MessageSquareQuote className="w-7 h-7 text-brand-blue/30 mb-3" aria-hidden="true" />
              <blockquote className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">“{t.message}”</blockquote>
              <figcaption className="text-sm font-semibold text-gray-900 dark:text-white">
                {t.name}
                {t.course && <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">{t.course}</span>}
                {t.location && <span className="block text-xs font-normal text-gray-400 dark:text-gray-500">{t.location}</span>}
              </figcaption>
            </figure>
          ))}
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-6 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Your journey could be the next story shared here.</p>
            <Button variant="secondary" onClick={() => setOpen(!open)}>Share your experience</Button>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark p-8 text-center">
          <MessageSquareQuote className="w-10 h-10 mx-auto mb-4 text-brand-blue/40" aria-hidden="true" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Be the first to share your story</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Every testimonial is reviewed by our team before it’s published.</p>
          <Button variant="secondary" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Share your experience'}</Button>
        </div>
      )}
      {open && (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Share your experience</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input aria-label="Your name" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
            <input aria-label="Your email" type="email" placeholder="Your email (never published)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} />
            <input aria-label="Course" placeholder="Course taken (optional)" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} className={inputCls} />
            <input aria-label="Location" placeholder="Country / city (optional)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls} />
          </div>
          <textarea aria-label="Your message" placeholder="What did you learn, and how did NumeryCode help you? (at least 20 characters)" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} className={`${inputCls} resize-y`} />
          <label className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5" />
            <span>I consent to NumeryCode publishing this testimonial (name + optional course/location) after review. My email is only used to verify this submission and will never be shown publicly.</span>
          </label>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" loading={submitMutation.isPending}>Submit for review</Button>
            {submitMutation.isSuccess && (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400"><CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Submitted — we’ll review it soon</span>
            )}
            {submitMutation.isPending && <span className="inline-flex items-center gap-1.5 text-sm text-gray-400"><Clock3 className="w-4 h-4" aria-hidden="true" /> Sending…</span>}
          </div>
        </form>
      )}
    </SectionWrapper>
  )
}