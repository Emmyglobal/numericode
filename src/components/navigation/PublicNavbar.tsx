import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Moon, Sun, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/classNames'

const navLinks = [
  { to: '/courses', label: 'Courses' },
  { to: '/about',   label: 'About'   },
  { to: '/faq',     label: 'FAQ'     },
  { to: '/contact', label: 'Contact' },
]

export function PublicNavbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  return (
    <header role="banner" className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2 text-brand-navy dark:text-white font-bold text-xl" aria-label="NumeriCode home">
          <GraduationCap className="w-7 h-7 text-brand-blue" aria-hidden="true" />
          NumeriCode
        </Link>

        <nav role="navigation" aria-label="Main navigation" className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => cn('text-sm font-medium transition-colors', isActive ? 'text-brand-blue' : 'text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-sky')}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
          </button>
          {isAuthenticated
            ? <Link to="/dashboard"><Button size="sm">Dashboard</Button></Link>
            : <>
                <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                <Link to="/register"><Button size="sm">Get Started</Button></Link>
              </>
          }
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}>
          {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" role="navigation" aria-label="Mobile navigation" className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-4 space-y-2">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-blue dark:hover:text-brand-sky">
              {l.label}
            </Link>
          ))}
          <div className="pt-2 flex gap-2">
            <Link to="/login"    className="flex-1"><Button variant="secondary" size="sm" className="w-full">Log in</Button></Link>
            <Link to="/register" className="flex-1"><Button size="sm"           className="w-full">Get Started</Button></Link>
          </div>
        </div>
      )}
    </header>
  )
}
