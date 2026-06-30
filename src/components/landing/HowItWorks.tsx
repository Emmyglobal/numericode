import { SectionHeading } from '../ui/SectionHeading'

const steps = [
  {
    title: 'Browse courses',
    text: 'Explore our full catalogue and find the right course for your level',
  },
  {
    title: 'Register free',
    text: 'Create your account in seconds - no payment required for the MVP',
  },
  {
    title: 'Learn live',
    text: 'Join live classes on Zoom, watch replays, and track your progress',
  },
]

export function HowItWorks() {
  return (
    <section className="section steps-section">
      <SectionHeading
        title="How it works"
        description="Three simple steps to start your learning journey"
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
