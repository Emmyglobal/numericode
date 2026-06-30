import { SectionHeading } from '../ui/SectionHeading'

const faqs = [
  {
    question: 'Is NumeriCode free for the MVP?',
    answer:
      'Yes. Student access is free during the MVP launch while courses, live support, and dashboard workflows are being refined.',
  },
  {
    question: 'What happens after I register?',
    answer:
      'Your student dashboard opens immediately with enrolled courses, upcoming class information, assignments, resources, and announcements.',
  },
  {
    question: 'Can beginners start with no coding experience?',
    answer:
      'Yes. Algebra Foundations, Python from Zero, and Web Development Starter are designed for learners who need a careful first step.',
  },
  {
    question: 'Are trainer and admin accounts public?',
    answer:
      'No. Public signup creates student accounts only. Trainer and admin accounts are provisioned through the protected setup process.',
  },
  {
    question: 'What subjects are available at launch?',
    answer:
      'The launch catalogue focuses on Mathematics and Programming, including algebra, calculus, statistics, Python, web development, and JavaScript logic.',
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
