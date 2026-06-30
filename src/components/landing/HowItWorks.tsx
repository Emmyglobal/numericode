import { SectionHeading } from '../ui/SectionHeading'

const steps = [
  {
    title: 'Browse courses',
    text: 'Choose a Mathematics or Programming course with clear outcomes, modules, and resources.',
  },
  {
    title: 'Register free',
    text: 'Create a student account and get immediate access to your learning dashboard.',
  },
  {
    title: 'Study with structure',
    text: 'Follow lessons, attend scheduled sessions, use resources, and track your progress.',
  },
]

export function HowItWorks() {
  return (
    <section className="section steps-section">
      <SectionHeading
        title="How it works"
        description="A simple path from first visit to active learning"
      />
      <div className="steps">
        {steps.map((step, index) => (
          <article className="step" key={step.title}>
            <div className="step-number">{index + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
