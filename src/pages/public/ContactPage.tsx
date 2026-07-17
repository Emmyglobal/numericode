import { usePageTitle } from '@/hooks/usePageTitle'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Clock, MessageSquare, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { contactService } from '@/services/contact.service'

const schema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.string().email('Enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})
type FormData = z.infer<typeof schema>

export default function ContactPage() {
  usePageTitle('Contact')
  const [sent, setSent]   = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setError('')
      await contactService.submit(data)
      setSent(true)
      reset()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong sending your message. Please try again.')
    }
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-brand-navy to-brand-blue text-white py-16">
        <SectionWrapper className="py-0">
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-blue-200">We'd love to hear from you. Drop us a message.</p>
        </SectionWrapper>
      </div>
      <SectionWrapper>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send a Message</h2>
            {sent ? (
              <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-8 flex flex-col items-center text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-4" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                <p className="text-gray-600 dark:text-gray-400">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <Button variant="secondary" className="mt-4" onClick={() => setSent(false)}>Send Another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} aria-label="Contact form" className="space-y-4">
                {error && <Alert type="error" message={error} onClose={() => setError('')} />}
                <Input label="Full Name" placeholder="Your full name" error={errors.name?.message} required {...register('name')} />
                <Input label="Email Address" type="email" placeholder="you@example.com" error={errors.email?.message} required {...register('email')} />
                <Input label="Subject" placeholder="What's this about?" error={errors.subject?.message} required {...register('subject')} />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Message <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="message" rows={5}
                    placeholder="Write your message here…"
                    aria-invalid={errors.message ? 'true' : undefined}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-sm focus:outline-none focus:border-brand-blue focus:shadow-focus resize-none"
                    {...register('message')}
                  />
                  {errors.message && <p id="message-error" role="alert" className="text-xs text-red-600 dark:text-red-400">{errors.message.message}</p>}
                </div>
                <Button type="submit" size="lg" loading={isSubmitting} className="w-full">Send Message</Button>
              </form>
            )}
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>
            {[
              { icon: Mail, title: 'Email', desc: 'nwaforugochukwu21@gmail.com', sub: 'We reply within 24 hours' },
              { icon: Clock, title: 'Response Time', desc: 'Within 24 hours', sub: 'Monday – Saturday, 8am – 6pm WAT' },
              { icon: MessageSquare, title: 'Live Support', desc: 'Available during live classes', sub: 'Ask questions in real time' },
            ].map(c => (
              <div key={c.title} className="flex gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-surface-dark shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-brand-light dark:bg-blue-900/30 text-brand-blue flex items-center justify-center shrink-0"><c.icon className="w-5 h-5" aria-hidden="true" /></div>
                <div><p className="font-semibold text-gray-900 dark:text-white text-sm">{c.title}</p><p className="text-gray-700 dark:text-gray-300 text-sm">{c.desc}</p><p className="text-gray-400 text-xs mt-0.5">{c.sub}</p></div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </div>
  )
}
