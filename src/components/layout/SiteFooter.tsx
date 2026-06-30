import { Button } from '../ui/Button'

const footerColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'Courses', href: '#/courses' },
      { label: 'Live classes', href: '#/dashboard' },
      { label: 'Admin portal', href: '#/admin' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Mathematics track', href: '#/courses' },
      { label: 'Programming track', href: '#/courses' },
      { label: 'Trainer portal', href: '#/trainer' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#/' },
      { label: 'Contact', href: '#/' },
      { label: 'FAQ', href: '#/' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer id="footer">
      <section className="footer-cta">
        <h2>Ready to start learning?</h2>
        <p>Join hundreds of students already learning Mathematics and Programming with NumeriCode</p>
        <Button className="cta-button" href="#/auth/register">
          Create free account
        </Button>
      </section>
      <section className="footer-main">
        <div className="footer-brand">
          <strong>NumeriCode</strong>
          <p>Where Mathematics meets Code. Live online classes for every level.</p>
        </div>
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3>{column.title}</h3>
            {column.links.map((link) => (
              <a href={link.href} key={link.label}>
                {link.label}
              </a>
            ))}
          </nav>
        ))}
        <div className="footer-bottom">
          <span>(c) 2026 NumeriCode. All rights reserved.</span>
          <span>Built with care for learners everywhere</span>
        </div>
      </section>
    </footer>
  )
}
