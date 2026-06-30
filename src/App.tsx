import './App.css'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser, logoutUser, type AuthUser, type UserRole } from './auth'
import { SiteFooter } from './components/layout/SiteFooter'
import { SiteHeader } from './components/layout/SiteHeader'
import { AdminPage } from './pages/AdminPage'
import { AuthPage } from './pages/AuthPage'
import { CoursesPage } from './pages/CoursesPage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { PublicInfoPage } from './pages/PublicInfoPage'
import { TrainerPage } from './pages/TrainerPage'

const routes = ['home', 'about', 'contact', 'courses', 'auth', 'dashboard', 'admin', 'trainer'] as const
type AppRoute = (typeof routes)[number]

function getRouteFromHash(): AppRoute | 'not-found' {
  const hash = window.location.hash.replace(/^#\/?/, '').split('/')[0]

  if (!hash || hash === 'top') {
    return 'home'
  }

  return routes.includes(hash as AppRoute) ? (hash as AppRoute) : 'not-found'
}

function App() {
  const [route, setRoute] = useState<AppRoute | 'not-found'>(getRouteFromHash)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
  }, [])

  useEffect(() => {
    const handleHashChange = () => setRoute(getRouteFromHash())

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const pageTitle = useMemo(() => {
    const titles = {
      home: 'NumeriCode',
      about: 'About NumeriCode',
      contact: 'Contact NumeriCode',
      courses: 'Courses',
      auth: 'Student Access',
      dashboard: 'Dashboard',
      admin: 'Admin Workspace',
      trainer: 'Trainer Workspace',
      'not-found': 'Page not found',
    }

    return titles[route]
  }, [route])

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user)
    const roleRoutes: Record<UserRole, string> = {
      student: '#/dashboard',
      trainer: '#/trainer',
      admin: '#/admin',
    }
    window.location.hash = roleRoutes[user.role]
  }

  const handleLogout = async () => {
    await logoutUser()
    setCurrentUser(null)
    window.location.hash = '#/auth'
  }

  const renderProtectedRoute = (role: UserRole, content: ReactNode) => {
    if (!currentUser) {
      return (
        <AuthPage
          requiredRole={role}
          onAuthSuccess={handleAuthSuccess}
          message={`Please log in with a ${role} account to continue.`}
        />
      )
    }

    if (currentUser.role !== role) {
      return (
        <section className="section error-section">
          <div className="empty-state">
            <strong>Access restricted</strong>
            <p>
              You are signed in as {currentUser.role}. This page requires a {role} account.
            </p>
            <button className="button button-primary" type="button" onClick={handleLogout}>
              Switch account
            </button>
          </div>
        </section>
      )
    }

    return content
  }

  return (
    <div className={`app-shell ${isDarkMode ? 'theme-dark' : ''}`}>
      <SiteHeader
        activeRoute={route}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onLogout={handleLogout}
        onToggleTheme={() => setIsDarkMode((current) => !current)}
      />
      <main>
        <h1 className="sr-only">{pageTitle}</h1>
        {route === 'home' && (
          <>
            <LandingPage />
            <PublicInfoPage />
          </>
        )}
        {route === 'about' && <PublicInfoPage />}
        {route === 'contact' && <PublicInfoPage />}
        {route === 'courses' && <CoursesPage />}
        {route === 'auth' && <AuthPage onAuthSuccess={handleAuthSuccess} />}
        {route === 'dashboard' && (
          renderProtectedRoute(
            'student',
            <DashboardPage isDarkMode={isDarkMode} onToggleTheme={setIsDarkMode} />,
          )
        )}
        {route === 'admin' && renderProtectedRoute('admin', <AdminPage />)}
        {route === 'trainer' && renderProtectedRoute('trainer', <TrainerPage />)}
        {route === 'not-found' && (
          <section className="section error-section">
            <div className="empty-state">
              <strong>Page not found</strong>
              <p>The page you opened is not part of the NumeriCode MVP yet.</p>
              <a className="button button-primary" href="#/">
                Back to home
              </a>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
