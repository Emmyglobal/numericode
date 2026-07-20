# NumeriCode

> **Where Mathematics Meets Code**
>
> A production-quality  EdTech SaaS platform with three role-based portals — Student Dashboard, Trainer Portal, and Admin Panel — built across a full 9-phase software development lifecycle done.
---

## Quick Start

```bash
unzip files.zip          # or: tar -xzf numericode-phase8-optimised.tar.gz
cd numericode
npm install
npm run dev              # → http://localhost:5173
```

The app runs entirely on mocked API data via MSW (Mock Service Worker). No backend required.

---

## Demo Accounts

Click any account on the login page to fill the credentials automatically.

| Role    | Email                       | Password    | Portal after login |
|---------|-----------------------------|-------------|-------------------|
| Student | `kolade@gmail.com`          | password123 | `/dashboard`      |
| Trainer | `trainer@numericode.com`    | password123 | `/trainer`        |
| Admin   | `emmanuel@numericode.com`   | password123 | `/admin`          |

Or **register a new account** — it works immediately and creates a student account.

---

## What This Project Is

NumeriCode was built from scratch following a complete Software Development Life Cycle across 9 phases:

| Phase | Name | Deliverable |
|---|---|---|
| 0 | Discovery & Planning | Vision, mission, competitors, UVP |
| 1 | Project Initiation | Charter, stakeholders, risk register |
| 2 | Requirements Analysis | Full SRS (FR-01–FR-31, NFR-01–12, user stories) |
| 3 | Product Design | Site map, navigation, user flows, routing architecture |
| 4 | UI/UX Design | Design system, component library, page specs, dark mode |
| 5 | Frontend Architecture | Folder structure, tech choices, state strategy, TypeScript types |
| 6 | Development | 30 screens across 3 role-based portals |
| 7 | Testing | 227 tests, 26 files, 86%+ coverage, WCAG 2.1 AA |
| 8 | Performance | −181.8 kB gzip (MSW removed from prod), lazy layouts, React.memo |

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| UI Framework | React | 18.x | Component-based UI, concurrent rendering |
| Type System | TypeScript | 5.x | Strict typing, self-documenting code |
| Build Tool | Vite | 4.x | Sub-second HMR, route-level code splitting |
| Styling | TailwindCSS | 3.x | Utility-first, dark mode, custom design tokens |
| Routing | React Router | v6 | Nested routes, role guards, lazy loading |
| Server State | TanStack Query | v5 | Caching, background refetch, loading states |
| Global State | Zustand | 4.x | Auth store + UI store, localStorage persistence |
| Forms | React Hook Form | 7.x | Minimal re-renders, Zod integration |
| Validation | Zod | 3.x | Runtime type safety for forms and API |
| API Mocking | MSW | 2.x | Service Worker interception (dev only) |
| HTTP Client | Axios | 1.x | Auth interceptors, consistent error handling |
| Animations | Framer Motion | 11.x | Landing page hero animations |
| Icons | lucide-react | latest | Consistent stroke icons, tree-shakeable |
| Testing | Vitest + RTL | latest | 227 tests, 86% statement coverage |

---

## Portals & Screens (30 total)

### Public Zone — 6 screens
`/` · `/about` · `/courses` · `/courses/:id` · `/contact` · `/faq`

### Auth Zone — 3 screens
`/login` · `/register` · `/forgot-password`

### Student Portal — 8 screens (role: `student`)
`/dashboard` · `/dashboard/courses` · `/dashboard/courses/:id` · `/dashboard/live-classes` · `/dashboard/assignments` · `/dashboard/resources` · `/dashboard/announcements` · `/dashboard/profile`

### Trainer Portal — 6 screens (role: `trainer`)
`/trainer` · `/trainer/courses` · `/trainer/students` · `/trainer/sessions` · `/trainer/assignments` · `/trainer/profile`

### Admin Panel — 6 screens (role: `admin`)
`/admin` · `/admin/users` · `/admin/courses` · `/admin/announcements` · `/admin/analytics` · `/admin/settings`

### System — 1 screen
`/*` (404 Not Found)

---

## Role-Based Access Control

Three guard components enforce access in the router:

| Guard | Protects | Behaviour |
|---|---|---|
| `AuthGuard` | `/login`, `/register` | Redirects authenticated users to their portal |
| `ProtectedGuard` | All authenticated routes | Redirects unauthenticated users to `/login` |
| `RoleGuard` | `/dashboard`, `/trainer`, `/admin` | Redirects wrong-role users to their correct portal |

Login auto-routes by role: Student → `/dashboard` · Trainer → `/trainer` · Admin → `/admin`

---

## Project Structure

```
src/
├── app/
│   ├── layouts/          # PublicLayout, AuthLayout, DashboardLayout,
│   │                     # TrainerLayout, AdminLayout (lazy-loaded)
│   ├── App.tsx           # Skip link + theme init
│   ├── Router.tsx        # 30 routes + AuthGuard, ProtectedGuard, RoleGuard
│   └── Providers.tsx     # QueryClient + BrowserRouter
├── components/
│   ├── ui/               # Button, Input, Badge, Alert, Avatar,
│   │                     # ProgressBar, Skeleton, EmptyState
│   ├── navigation/       # PublicNavbar, Footer, DashboardSidebar,
│   │                     # TrainerSidebar, AdminSidebar, DashboardTopBar
│   └── shared/           # CourseCard, StatCard, PageHeader, SectionWrapper
├── features/
│   ├── auth/             # types, schemas
│   ├── courses/          # types
│   ├── trainer/          # types
│   └── admin/            # types
├── pages/
│   ├── public/           # 6 public pages
│   ├── auth/             # 3 auth pages
│   ├── dashboard/        # 8 student pages
│   ├── trainer/          # 6 trainer pages
│   ├── admin/            # 6 admin pages
│   └── system/           # NotFoundPage
├── mocks/
│   ├── browser.ts        # MSW worker (DEV only)
│   ├── browser.stub.ts   # No-op stub (PRODUCTION — excludes MSW from bundle)
│   ├── handlers/         # auth, courses, dashboard, trainer, admin
│   └── data/             # courses, users, assignments, announcements, trainer, admin
├── store/
│   ├── authStore.ts      # Role-aware auth (student / trainer / admin)
│   └── uiStore.ts        # Theme + sidebar open state
├── hooks/                # useAuth, useTheme, useDebounce, useScrollTop, usePageTitle
├── services/             # auth.service, courses.service, dashboard.service
├── lib/                  # axios (auth interceptor), queryClient, motion variants
├── types/                # api.types, common.types
└── utils/                # cn(), formatDate, formatDuration, storage
```

---

## Design System

### Portal Colour Identity
| Portal | Accent Colour | Sidebar |
|---|---|---|
| Student | Brand Blue `#2E75B6` | White bg, blue active state |
| Trainer | Teal `#0D7377` | White bg, teal active state |
| Admin | Brand Navy `#1E3A5F` | Navy bg, white text |

### Component Library
`Button` (4 variants, 3 sizes) · `Input` (6 states) · `Badge` (10 variants) · `ProgressBar` · `Avatar` (4 sizes) · `Alert` (4 types) · `Skeleton` · `EmptyState` · `StatCard` · `CourseCard`

### Dark Mode
Tailwind class-based (`darkMode: 'class'`). Toggle in every portal top bar and on the Profile page. Persisted to `localStorage` via Zustand. FOUC-prevented via inline script in `index.html`.

---

## Testing

```bash
npm test                     # Run all 227 tests
npm run test:unit            # Unit tests only (hooks, utils, components)
npm run test:integration     # Integration tests only (pages, routing, auth)
npm run test:coverage        # Tests + coverage report
npm run test:watch           # Watch mode
```

| Metric | Result | Threshold |
|---|---|---|
| Test Files | 26 passed | — |
| Total Tests | 227 passed | — |
| Statement Coverage | 86.13% | 70% |
| Branch Coverage | 81.21% | 60% |
| Function Coverage | 73.61% | 70% |
| Line Coverage | 91.47% | 70% |

---

## Performance

| Optimisation | Saving |
|---|---|
| MSW removed from production bundle | −181.8 kB gzip |
| App shell (index chunk) reduced | −10.3 kB gzip |
| Authenticated layouts lazy-loaded | Public visitors never download sidebar code |
| React.memo on 5 display components | Eliminated wasted re-renders |
| 10 named vendor chunks | Long-term HTTP caching per library |

### Lighthouse Targets (verify on live deployment)
Performance **95+** · Accessibility **98+** · Best Practices **95+** · SEO **90+**

---

## Accessibility

WCAG 2.1 AA compliance implemented in Phase 7:

- Skip-to-main-content link (visible on keyboard focus)
- `usePageTitle` hook — every page updates `document.title`
- All inputs: `aria-required`, `aria-invalid`, `aria-describedby`
- All icon-only buttons: `aria-label`
- Alerts: `role="alert"` + `aria-live="assertive"` for errors
- FAQ: semantic `dl/dt/dd` with `aria-expanded`/`aria-controls`
- Filter tabs: `role="tablist"` / `role="tab"` / `role="tabpanel"`
- Dark mode toggle: `role="switch"` + `aria-checked`
- Focus ring contrast meets WCAG AA in both light and dark mode

---

## Available Scripts

```bash
npm run dev          # Development server with HMR (http://localhost:5173)
npm run build        # Production build (MSW excluded via alias stub)
npm run preview      # Preview production build locally
npm run type-check   # TypeScript check without emitting
npm test             # Run all 227 tests
npm run test:coverage # Tests + coverage report
```

---

## API Mock Coverage

| Domain | Endpoints |
|---|---|
| Auth | POST /auth/login · /auth/register · /auth/forgot-password |
| Courses | GET /courses · /courses/:id |
| Dashboard | GET /dashboard · /dashboard/courses · /dashboard/courses/:id · /assignments · /announcements · /resources · /live-classes · /profile · PUT /profile |
| Trainer | GET /trainer/stats · /trainer/courses · /trainer/students · /trainer/sessions · /trainer/assignments |
| Admin | GET /admin/stats · /admin/users · /admin/courses · /admin/announcements · POST /admin/announcements · PATCH /admin/users/:id |

---

## Prepared by

**Nwafor Ugochukwu Emmanuel**
Full-Stack Developer · NumeriCode Project · July 2026
