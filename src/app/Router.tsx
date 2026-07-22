import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import PublicLayout from './layouts/PublicLayout'
import AuthLayout  from './layouts/AuthLayout'

// Authenticated layouts — lazy so unauthenticated visitors never download them
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const TrainerLayout   = lazy(() => import('./layouts/TrainerLayout'))
const AdminLayout     = lazy(() => import('./layouts/AdminLayout'))

// Public pages
const LandingPage       = lazy(() => import('@/pages/public/LandingPage'))
const AboutPage         = lazy(() => import('@/pages/public/AboutPage'))
const CoursesPage       = lazy(() => import('@/pages/public/CoursesPage'))
const CourseDetailPage  = lazy(() => import('@/pages/public/CourseDetailPage'))
const ContactPage       = lazy(() => import('@/pages/public/ContactPage'))
const FaqPage           = lazy(() => import('@/pages/public/FaqPage'))
// Auth pages
const LoginPage         = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage      = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPage        = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const PendingApprovalPage  = lazy(() => import('@/pages/auth/PendingApprovalPage'))
const ActivateAccountPage  = lazy(() => import('@/pages/auth/ActivateAccountPage'))
// Student dashboard
const DashboardPage     = lazy(() => import('@/pages/dashboard/DashboardPage'))
const MyCoursesPage     = lazy(() => import('@/pages/dashboard/MyCoursesPage'))
const CourseViewerPage  = lazy(() => import('@/pages/dashboard/CourseViewerPage'))
const LiveClassesPage   = lazy(() => import('@/pages/dashboard/LiveClassesPage'))
const AssignmentsPage   = lazy(() => import('@/pages/dashboard/AssignmentsPage'))
const ResourcesPage     = lazy(() => import('@/pages/dashboard/ResourcesPage'))
const AnnouncementsPage = lazy(() => import('@/pages/dashboard/AnnouncementsPage'))
const ProfilePage       = lazy(() => import('@/pages/dashboard/ProfilePage'))
const CertificatesPage  = lazy(() => import('@/pages/dashboard/CertificatesPage'))
const QuizzesPage       = lazy(() => import('@/pages/dashboard/QuizzesPage'))
const ForumsPage        = lazy(() => import('@/pages/dashboard/ForumsPage'))
const GradesPage        = lazy(() => import('@/pages/dashboard/GradesPage'))
const NotificationsPage = lazy(() => import('@/pages/dashboard/NotificationsPage'))
const AnalyticsPage    = lazy(() => import('@/pages/dashboard/AnalyticsPage'))
const MessagesPage     = lazy(() => import('@/pages/dashboard/MessagesPage'))
const BadgesPage       = lazy(() => import('@/pages/dashboard/BadgesPage'))
// Trainer pages
const TrainerOverview    = lazy(() => import('@/pages/trainer/TrainerOverviewPage'))
const TrainerCourses     = lazy(() => import('@/pages/trainer/TrainerCoursesPage'))
const TrainerStudents    = lazy(() => import('@/pages/trainer/TrainerStudentsPage'))
const TrainerSessions    = lazy(() => import('@/pages/trainer/TrainerSessionsPage'))
const TrainerNotes       = lazy(() => import('@/pages/trainer/TrainerNotesPage'))
const TrainerResources   = lazy(() => import('@/pages/trainer/TrainerResourcesPage'))
const TrainerAssignments = lazy(() => import('@/pages/trainer/TrainerAssignmentsPage'))
const TrainerProfile     = lazy(() => import('@/pages/trainer/TrainerProfilePage'))
const TrainerBoards      = lazy(() => import('@/pages/trainer/TrainerBoardsPage'))
const TrainerQuizzes     = lazy(() => import('@/pages/trainer/TrainerQuizzesPage'))
const TrainerForums      = lazy(() => import('@/pages/trainer/TrainerForumsPage'))
const TrainerGrading     = lazy(() => import('@/pages/trainer/TrainerGradingPage'))
// Admin pages
const AdminOverview      = lazy(() => import('@/pages/admin/AdminOverviewPage'))
const AdminUsers         = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminCourses       = lazy(() => import('@/pages/admin/AdminCoursesPage'))
const AdminAnnouncements = lazy(() => import('@/pages/admin/AdminAnnouncementsPage'))
const AdminAnalytics     = lazy(() => import('@/pages/admin/AdminAnalyticsPage'))
const AdminResources     = lazy(() => import('@/pages/admin/AdminResourcesPage'))
const AdminSettings      = lazy(() => import('@/pages/admin/AdminSettingsPage'))
// System
const NotFoundPage       = lazy(() => import('@/pages/system/NotFoundPage'))

// ─── Guards ───────────────────────────────────────────────────────────────────
function AuthGuard() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Outlet />
  if (user?.role === 'trainer') return <Navigate to="/trainer"   replace />
  if (user?.role === 'admin')   return <Navigate to="/admin"     replace />
  return <Navigate to="/dashboard" replace />
}

function ProtectedGuard() {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function RoleGuard({ role }: { role: 'student' | 'trainer' | 'admin' }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== role) {
    if (user?.role === 'trainer') return <Navigate to="/trainer"   replace />
    if (user?.role === 'admin')   return <Navigate to="/admin"     replace />
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

// ─── Loading ──────────────────────────────────────────────────────────────────
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark">
    <div
      className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"
      role="status"
      aria-label="Loading…"
    />
  </div>
)

// ─── Router ───────────────────────────────────────────────────────────────────
export function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>

        {/* ── Public ── */}
        <Route element={<PublicLayout />}>
          <Route path="/"            element={<LandingPage />} />
          <Route path="/about"       element={<AboutPage />} />
          <Route path="/courses"     element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/contact"     element={<ContactPage />} />
          <Route path="/faq"         element={<FaqPage />} />
        </Route>

        {/* ── Auth ── */}
        <Route element={<AuthGuard />}>
          <Route element={<AuthLayout />}>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPage />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />
            <Route path="/pending-approval" element={<PendingApprovalPage />} />
            <Route path="/activate" element={<ActivateAccountPage />} />
          </Route>
        </Route>

        {/* ── Student ── */}
        <Route element={<RoleGuard role="student" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard"               element={<DashboardPage />} />
            <Route path="/dashboard/courses"       element={<MyCoursesPage />} />
            <Route path="/dashboard/courses/:id"   element={<CourseViewerPage />} />
            <Route path="/dashboard/live-classes"  element={<LiveClassesPage />} />
            <Route path="/dashboard/assignments"   element={<AssignmentsPage />} />
            <Route path="/dashboard/resources"     element={<ResourcesPage />} />
            <Route path="/dashboard/announcements" element={<AnnouncementsPage />} />
            <Route path="/dashboard/profile"       element={<ProfilePage />} />
            <Route path="/dashboard/certificates"  element={<CertificatesPage />} />
            <Route path="/dashboard/quizzes"       element={<QuizzesPage />} />
            <Route path="/dashboard/forums"        element={<ForumsPage />} />
            <Route path="/dashboard/grades"        element={<GradesPage />} />
            <Route path="/dashboard/notifications" element={<NotificationsPage />} />
            <Route path="/dashboard/analytics"     element={<AnalyticsPage />} />
            <Route path="/dashboard/messages"      element={<MessagesPage />} />
            <Route path="/dashboard/badges"        element={<BadgesPage />} />
          </Route>
        </Route>

        {/* ── Trainer ── */}
        <Route element={<RoleGuard role="trainer" />}>
          <Route element={<TrainerLayout />}>
            <Route path="/trainer"             element={<TrainerOverview />} />
            <Route path="/trainer/courses"     element={<TrainerCourses />} />
            <Route path="/trainer/students"    element={<TrainerStudents />} />
            <Route path="/trainer/sessions"    element={<TrainerSessions />} />
            <Route path="/trainer/notes"       element={<TrainerNotes />} />
            <Route path="/trainer/resources"   element={<TrainerResources />} />
            <Route path="/trainer/assignments" element={<TrainerAssignments />} />
            <Route path="/trainer/boards"      element={<TrainerBoards />} />
            <Route path="/trainer/quizzes"     element={<TrainerQuizzes />} />
            <Route path="/trainer/forums"      element={<TrainerForums />} />
            <Route path="/trainer/grading"     element={<TrainerGrading />} />
            <Route path="/trainer/profile"     element={<TrainerProfile />} />
          </Route>
        </Route>

        {/* ── Admin ── */}
        <Route element={<RoleGuard role="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"               element={<AdminOverview />} />
            <Route path="/admin/users"         element={<AdminUsers />} />
            <Route path="/admin/courses"       element={<AdminCourses />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            <Route path="/admin/analytics"     element={<AdminAnalytics />} />
            <Route path="/admin/resources"     element={<AdminResources />} />
            <Route path="/admin/settings"      element={<AdminSettings />} />
          </Route>
        </Route>

        {/* ── System ── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  )
}
