import type { AuthUser } from '../../auth'
import { Button } from '../ui/Button'

const navItems = [
  { label: 'Home', href: '#/', route: 'home' },
  { label: 'About', href: '#/about', route: 'about' },
  { label: 'Courses', href: '#/courses', route: 'courses' },
  { label: 'Contact', href: '#/contact', route: 'contact' },
  { label: 'Student', href: '#/dashboard', route: 'dashboard' },
  { label: 'Trainer', href: '#/trainer', route: 'trainer' },
  { label: 'Admin', href: '#/admin', route: 'admin' },
]

type SiteHeaderProps = {
  activeRoute: string
  currentUser: AuthUser | null
  isDarkMode: boolean
  onLogout: () => void
  onToggleTheme: () => void
}

export function SiteHeader({
  activeRoute,
  currentUser,
  isDarkMode,
  onLogout,
  onToggleTheme,
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="#/" aria-label="NumeriCode home">
        NumeriCode
      </a>
      <nav className="primary-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            aria-current={activeRoute === item.route ? 'page' : undefined}
            href={item.href}
            key={item.label}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <button
          className="icon-button"
          type="button"
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`}
          aria-pressed={isDarkMode}
          onClick={onToggleTheme}
        >
          <span aria-hidden="true">{isDarkMode ? 'sun' : 'moon'}</span>
        </button>
        {currentUser ? (
          <>
            <span className="session-user">
              {currentUser.name} / {currentUser.role}
            </span>
            <button className="button" type="button" onClick={onLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Button href="#/auth">Log in</Button>
            <Button href="#/auth" variant="primary">
              Get started
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
