import { usePageTitle } from '@/hooks/usePageTitle'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { cn } from '@/utils/classNames'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

const faqs = [
  { q: 'Is NumeriCode completely free?',              a: 'Yes! All courses, live classes, and learning resources on NumeriCode are completely free to access. Just register and start learning.' },
  { q: 'Who are the courses designed for?',           a: 'NumeriCode is designed for secondary school students, self-learners, and anyone looking to build strong foundations in Mathematics or Programming, from beginners to intermediate learners.' },
  { q: 'How do live classes work?',                   a: 'Live classes are hosted on Zoom or Google Meet. When a class is scheduled, a Join button appears on your dashboard. Click it to join the session. You can ask questions in real time.' },
  { q: 'What if I miss a live class?',               a: 'We understand life gets busy. While recordings are a planned future feature, you can catch the next scheduled session for that topic. Check the Live Classes page for upcoming dates.' },
  { q: 'Do I get a certificate when I finish?',      a: "Certificates are on our roadmap and will be available soon. We'll notify all enrolled students when this feature launches." },
  { q: 'Can I use NumeriCode on my phone?',          a: 'Yes! NumeriCode is fully responsive and works on any device — phone, tablet, or desktop.' },
  { q: 'How do I reset my password?',                a: "Click Forgot password on the login page, enter your email address, and we will send you a reset link." },
]

export default function FaqPage() {
  usePageTitle('FAQ')
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      <div className="bg-gradient-to-r from-brand-navy to-brand-blue text-white py-16">
        <SectionWrapper className="py-0">
          <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-blue-200">Everything you need to know about NumeriCode.</p>
        </SectionWrapper>
      </div>

      <SectionWrapper className="max-w-3xl">
        <dl className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen    = open === i
            const headingId = `faq-q-${i}`
            const panelId   = `faq-a-${i}`
            return (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <dt>
                  <button
                    id={headingId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white text-sm pr-4">{faq.q}</span>
                    <ChevronDown
                      className={cn('w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0 transition-transform', isOpen && 'rotate-180')}
                      aria-hidden="true"
                    />
                  </button>
                </dt>
                <dd
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  hidden={!isOpen}
                  className="px-5 pb-5 pt-1 bg-white dark:bg-surface-dark"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                </dd>
              </div>
            )
          })}
        </dl>

        <div className="mt-12 rounded-2xl bg-brand-light dark:bg-blue-900/20 p-8 text-center">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Still have questions?</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Our team is happy to help. Send us a message and we will get back to you within 24 hours.</p>
          <Link to="/contact"><Button>Contact Us</Button></Link>
        </div>
      </SectionWrapper>
    </div>
  )
}
