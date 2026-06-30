import type { FormEvent } from 'react'
import { useState } from 'react'
import { SectionHeading } from '../ui/SectionHeading'

export function ContactSection() {
  const [status, setStatus] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    form.reset()
    setStatus('Message captured in mock mode. A real backend can be connected later.')
  }

  return (
    <section className="section contact-section" id="contact">
      <SectionHeading
        title="Contact NumeriCode"
        description="Send a question about courses, live classes, or getting started."
      />
      <div className="contact-grid">
        <form className="form-card" aria-label="Contact form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input name="name" placeholder="Your name" required />
          </label>
          <label>
            Email address
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Subject
            <input name="subject" placeholder="Course question" required />
          </label>
          <label>
            Message
            <textarea name="message" placeholder="How can we help?" rows={5} required />
          </label>
          <button className="button button-primary" type="submit">
            Send message
          </button>
          {status && (
            <div className="form-status" role="status">
              {status}
            </div>
          )}
        </form>
        <aside className="contact-info">
          <article>
            <h3>Email</h3>
            <p>hello@numericode.dev</p>
          </article>
          <article>
            <h3>Response time</h3>
            <p>Usually within 24 hours during weekdays.</p>
          </article>
          <article>
            <h3>Live class tools</h3>
            <p>Students join through Zoom or Google Meet links.</p>
          </article>
        </aside>
      </div>
    </section>
  )
}
