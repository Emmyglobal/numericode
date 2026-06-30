import { SectionHeading } from '../ui/SectionHeading'

const faqs = [
  {
    question: 'Is NumeriCode free for the MVP?',
    answer: 'Yes. The MVP experience is free while the platform is being validated and polished.',
  },
  {
    question: 'How do live classes work?',
    answer: 'Students see upcoming sessions in the dashboard and join through Zoom or Google Meet links.',
  },
  {
    question: 'Can beginners start with no coding experience?',
    answer: 'Yes. The beginner tracks start from foundations and build up through guided practice.',
  },
  {
    question: 'Are assignments and resources included?',
    answer: 'Yes. Each course preview includes resources, and the dashboard includes assignment states.',
  },
]

export function FAQSection() {
  return (
    <section className="section faq-section" id="faq">
      <SectionHeading
        title="Frequently asked questions"
        description="Quick answers for students and parents reviewing the platform."
      />
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <details open={index === 0} key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
