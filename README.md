# NumeriCode

NumeriCode is a frontend MVP for an online school where students learn Mathematics and Programming through structured courses, live classes, assignments, and learning resources.

Tagline: Where Mathematics Meets Code.

## Features

- Responsive landing page with hero, learning tracks, how-it-works flow, and featured courses.
- Course catalogue with search, subject filtering, empty state, course cards, and course detail preview.
- Course detail sections for outcomes, curriculum, instructor profile, resources, and live class schedule.
- Functional browser authentication for Student, Trainer, and Admin roles.
- Database-backed registration, login, logout, forgot-password, and password reset.
- HTTP-only secure cookie sessions.
- Protected role routes with server-side role-check endpoints.
- Student dashboard preview with progress, live classes, assignments, resources, announcements, and profile.
- Trainer workspace for live classes, grading queue, learning resources, and trainer profile.
- Admin workspace for students, trainers, courses, platform tasks, and deployment readiness.
- Persistent dark mode controlled from the header and dashboard profile.
- Lightweight hash-based SPA navigation with a not-found state.
- Production build through Vite.

## Tech Stack

- React 19
- TypeScript
- Vite
- Vercel Serverless Functions
- Vercel Postgres / Neon-compatible Postgres
- CSS modules through the app stylesheet
- Local mock learning data

The original product plan mentions React Router, TanStack Query, React Hook Form, Zod, Axios, Framer Motion, and MSW. Those are intentionally not installed yet because this MVP currently runs fully from local mock data.

Authentication now runs through Vercel API routes. Passwords are hashed with Node `scrypt`, session tokens are stored hashed in Postgres, and the browser receives an HTTP-only cookie.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Run quality checks:

```bash
npm run lint
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

For local full-stack API testing, use Vercel CLI:

```bash
vercel dev
```

## App Routes

The MVP uses hash routes so it deploys cleanly on static hosting without rewrite configuration:

- `#/` - Landing, About, FAQ, and Contact
- `#/about` - About, FAQ, and Contact information
- `#/contact` - Contact, About, and FAQ information
- `#/courses` - Course catalogue and details
- `#/auth` - Role-based authentication
- `#/dashboard` - Student dashboard preview
- `#/trainer` - Trainer workspace
- `#/admin` - Admin workspace

## Backend Auth

API routes:

- `POST /api/auth/register` - creates Student accounts only
- `POST /api/auth/login` - logs in Student, Trainer, or Admin
- `GET /api/auth/me` - returns the current cookie session user
- `POST /api/auth/logout` - deletes the server session
- `POST /api/auth/forgot-password` - creates a short-lived reset token
- `POST /api/auth/reset-password` - verifies reset token and changes password
- `GET /api/admin/overview` - server-side Admin role check
- `GET /api/trainer/overview` - server-side Trainer role check

Public registration is limited to Students. Trainer and Admin accounts are provisioned through the protected setup endpoint.

## Initial Setup

Create a Vercel Postgres/Neon database from the Vercel dashboard and add these environment variables from `.env.example`:

- `POSTGRES_URL`
- `SETUP_SECRET`
- `FIRST_ADMIN_EMAIL`
- `FIRST_ADMIN_PASSWORD`
- `FIRST_TRAINER_EMAIL`
- `FIRST_TRAINER_PASSWORD`
- `APP_URL`

After deployment, initialize the database and first privileged accounts:

```bash
curl -X POST https://YOUR-VERCEL-URL.vercel.app/api/setup \
  -H "Content-Type: application/json" \
  -H "x-setup-secret: YOUR_SETUP_SECRET"
```

Use long unique passwords for `FIRST_ADMIN_PASSWORD`, `FIRST_TRAINER_PASSWORD`, and `SETUP_SECRET`.

## Password Reset Email

For launch, configure a transactional email provider. The app supports Resend through:

- `RESEND_API_KEY`
- `AUTH_EMAIL_FROM`

Without these variables, reset tokens are still generated, but production users will not receive reset emails.

## Google Ads

Set these Vercel environment variables after creating your Google Ads conversion action:

- `VITE_GOOGLE_ADS_ID`, for example `AW-XXXXXXXXXX`
- `VITE_GOOGLE_ADS_SIGNUP_LABEL`

The Google tag loads automatically when `VITE_GOOGLE_ADS_ID` is present. Student signup fires the configured conversion event.

## Test Accounts

There are no hardcoded launch credentials. Use `/api/setup` with your environment variables to create the first Admin and Trainer. Students can register from the app.

## Project Structure

```text
src/
  components/
    auth/
    courses/
    dashboard/
    landing/
    layout/
    public/
    ui/
  data/
  pages/
  types/
```

## Deployment

The project is ready for Vercel as a static Vite app.

Recommended Vercel settings:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Required before launch:

- Connect the Vercel Postgres/Neon database.
- Add all auth setup environment variables.
- Run `/api/setup`.
- Configure `APP_URL`.
- Configure Resend for password reset email.
- Add Google Ads variables when your Ads account is ready.

## Portfolio Notes

This project demonstrates:

- Component composition and typed props.
- Responsive UI implementation from a product plan.
- Mocked frontend workflows without pretending a backend exists.
- Role-based product thinking for Student, Trainer, and Admin users.
- Search/filter state management.
- Accessible forms, semantic landmarks, and keyboard-friendly native controls.
- Deployment-ready build and documentation.
