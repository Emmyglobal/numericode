# NumeryCode — API Contract

All endpoints are served under the base URL `/api` (configured via `VITE_API_BASE_URL`).

In development, MSW intercepts every request at the Service Worker level.
In production, replace the base URL with your real backend URL.

---

## Response Envelope

Every response — success or error — uses this envelope:

```ts
// Success
{ "success": true,  "data": T,       "message"?: string }

// Error
{ "success": false, "data": null,     "message": string  }
```

HTTP status codes are used correctly:
- `200` OK — successful GET / PUT / PATCH
- `201` Created — successful POST
- `400` Bad Request — missing or malformed fields
- `401` Unauthorized — invalid credentials or missing token
- `403` Forbidden — authenticated but wrong role
- `404` Not Found — resource does not exist
- `409` Conflict — duplicate (e.g. email already registered)

---

## Authentication

All endpoints except `POST /auth/login` and `POST /auth/register` require a `Bearer` token in the `Authorization` header.

```
Authorization: Bearer <jwt_token>
```

---

## Domain 1 — Auth

### POST /auth/login

Authenticate a user and return a JWT token.

**Request body:**
```json
{
  "email":    "kolade@gmail.com",
  "password": "password123"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id":        "u2",
      "name":      "Kolade Adebayo",
      "email":     "kolade@gmail.com",
      "role":      "student",
      "createdAt": "2024-02-10"
    },
    "token": "mock-jwt-token-u2"
  }
}
```

**`role`** is one of: `"student"` · `"trainer"` · `"admin"`

**Error `400`** — missing fields:
```json
{ "success": false, "message": "Email and password required" }
```

**Error `401`** — wrong credentials:
```json
{ "success": false, "message": "Invalid email or password" }
```

---

### POST /auth/register

Create a new student account.

**Request body:**
```json
{
  "name":     "New Student",
  "email":    "new@example.com",
  "password": "password123"
}
```

**Success `200`:** Same envelope as `/auth/login` — user + token returned immediately (no email verification step in MVP).

**Error `409`** — email already exists:
```json
{ "success": false, "message": "An account with this email already exists" }
```

---

### POST /auth/forgot-password

Request a password reset link. Always returns success regardless of whether the email exists (security best practice).

**Request body:**
```json
{ "email": "kolade@gmail.com" }
```

**Success `200`:**
```json
{ "success": true, "message": "If that email exists, a reset link has been sent." }
```

---

## Domain 2 — Courses (Public)

### GET /courses

List all courses. Supports optional filtering via query parameters.

Public endpoint — authentication is NOT required.

The list endpoint returns a **slim catalogue payload** (no `modules`, `lessons`, `resources` or `liveClasses` hierarchy); the full nested hierarchy is returned only by `GET /courses/:id`.

**Query parameters (all optional):**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `subject` | `"mathematics" \| "programming"` | — | Filter by subject |
| `q` | `string` | — | Search by title or description (case-insensitive `ILIKE`) |
| `accessLevel` | `"free" \| "premium"` | — | Filter by access level |
| `level` | `"beginner" \| "intermediate" \| "advanced"` | — | Filter by difficulty level |
| `instructorId` | `string` (UUID) | — | Filter by registered trainer id |
| `sort` | `"newest" \| "title" \| "level"` | `newest` | Sort order |
| `limit` | `integer` | `12` | Page size (clamped to 1–50) |
| `offset` | `integer` | `0` | Pagination offset (must not be negative) |

**Examples:**
```
GET /api/courses
GET /api/courses?subject=mathematics&limit=12&offset=0
GET /api/courses?q=algebra
GET /api/courses?subject=programming&q=javascript&sort=title&limit=24
GET /api/courses?level=beginner&instructorId=48a6e3d4-…
```

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":          "c1",
      "title":       "Foundation Mathematics",
      "description": "Build a rock-solid foundation",
      "subject":     "mathematics",
      "level":       "beginner",
      "lessonCount": 24,
      "outcomes":    ["Master arithmetic operations"],
      "thumbnailUrl": "https://example.com/thumb.jpg",
      "createdAt":   "2024-01-10",
      "updatedAt":   "2026-09-03T12:34:56.789Z",
      "accessLevel": "free",
      "priceCents": 0,
      "currency":    "NGN",
      "premiumEnabled": true,
      "instructor": {
        "id":          "i1",
        "name":        "Nwafor Emmanuel",
        "bio":         "Registered Trainer",
        "avatarUrl":   "https://example.com/avatar.png"
      }
    }
  ],
  "pagination": {
    "total": 48,
    "limit": 12,
    "offset": 0,
    "count": 12,
    "hasMore": true
  }
}
```

> **Privacy note:** `instructor` exposes only `id`, `name`, `bio` and `avatarUrl`. Email, password and other private account fields are NEVER returned on public endpoints.
> **SEO note:** `updatedAt` is the course's last modification timestamp (ISO 8601, UTC). It is used by the sitemap generator for `<lastmod>` and is never fabricated — it reflects the database `updated_at` column, auto-maintained by a trigger on every course UPDATE.

`level` is one of: `"beginner"` · `"intermediate"` · `"advanced"`
`accessLevel` is one of: `"free"` · `"premium"`
`subject` is one of: `"mathematics"` · `"programming"`
---

### GET /courses/:id

Get a single course by ID. Public endpoint — authentication is NOT required.

Returns the **full course detail** including the `modules` → `lessons` curriculum hierarchy and `liveClasses` (unlike the slim catalogue endpoint).

> **Curriculum visibility (Phase 11):** the public endpoint returns **curriculum metadata only**:
> - `modules`: `id` + `title`, ordered by the module `position`
> - `lessons` (inside each module): `id` + `title` + `duration`, ordered by the lesson `position`
>
> **Lesson body `content` and resource URLs are gated.** They are returned ONLY to enrolled students via the protected `GET /dashboard/courses/:id` endpoint. The public course page must never receive lesson content.

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "id":          "c1",
    "title":       "Foundation Mathematics",
    "description": "Build a rock-solid foundation",
    "subject":     "mathematics",
    "level":       "beginner",
    "lessonCount": 24,
    "outcomes":    ["Master arithmetic operations"],
    "thumbnailUrl": "https://example.com/thumb.jpg",
    "createdAt":   "2024-01-10",
    "updatedAt":   "2026-09-03T12:34:56.789Z",
    "accessLevel": "free",
    "priceCents": 0,
    "currency":    "NGN",
    "premiumEnabled": true,
    "instructor": {
      "id":          "i1",
      "name":        "Nwafor Emmanuel",
      "bio":         "Registered Trainer",
      "avatarUrl":   "https://example.com/avatar.png"
    },
    "modules": [
      {
        "id":    "m1",
        "title": "Numbers & Arithmetic",
        "lessons": [
          { "id": "l1", "title": "Introduction to Numbers", "duration": 20 }
        ]
      }
    ],
    "liveClasses": []
  }
}
```

> **SEO note:** `updatedAt` is the course's last modification timestamp (ISO 8601, UTC). It is used by:
> - The sitemap generator for `<lastmod>` (Phase 10)
> - The Course JSON-LD `dateModified` property (Phase 11)
> Both are never fabricated — they reflect the database `updated_at` column, auto-maintained by a trigger on every course UPDATE.

**Error `404`:**
```json
{ "success": false, "message": "Course not found" }
```

---

### GET /courses/teachers

List Registered Trainers with at least one course. Public endpoint — authentication is NOT required.

Only **active** trainers (`users.status = 'active'`) are returned. Each trainer includes their subjects and only their **published** courses.

**Success `200`:** `{ "success": true, "data": [ { "id", "name", "bio", "avatarUrl", "subjects": [], "courses": [ { "id", "title", "subject", "level" } ] } ] }`

---

### GET /courses/teachers/:id

Get a single public Registered Trainer profile. Public endpoint — authentication is NOT required.

Only **active** trainers with `role = 'trainer'` are reachable; inactive/suspended trainers return `404`. Only **published** courses are returned (draft and archived courses are never exposed). The `courses` array mirrors the slim `CourseSummary` catalogue shape so the frontend can render shared course cards.

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "id":       "i1",
    "name":     "Emmanuel Nwafor",
    "bio":      "Experienced maths trainer.",
    "avatarUrl": "https://example.com/avatar.png",
    "subjects": ["mathematics"],
    "courses": [
      {
        "id":            "c1",
        "title":         "Foundation Mathematics",
        "description":   "Build a rock-solid foundation",
        "subject":       "mathematics",
        "level":         "beginner",
        "lessonCount":   24,
        "outcomes":      ["Master arithmetic operations"],
        "thumbnailUrl":  "https://example.com/thumb.jpg",
        "accessLevel":   "free",
        "priceCents":    0,
        "currency":      "NGN",
        "premiumEnabled": true,
        "createdAt":     "2024-01-10",
        "updatedAt":     "2026-09-03T12:34:56.789Z",
        "instructor": {
          "id":   "i1",
          "name": "Emmanuel Nwafor",
          "bio":  "Experienced maths trainer.",
          "avatarUrl": "https://example.com/avatar.png"
        }
      }
    ]
  }
}
```

**Error `404`:**
```json
{ "success": false, "message": "Registered trainer not found" }
```

> **Privacy note:** trainer profiles expose only `id`, `name`, `bio`, `avatarUrl`, `subjects` and published-course summaries. Email, phone, password, account status history and other private account fields are NEVER returned on public endpoints.

---

## Domain 3 — Student Dashboard

All `/dashboard/*` and `/assignments`, `/announcements`, `/resources`, `/live-classes`, `/profile` endpoints require `role: "student"`.

### GET /dashboard

Returns the student's dashboard overview — all data needed to render the overview page in one request.

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "enrolledCount":        2,
    "completedLessons":     12,
    "upcomingClassesCount": 3,
    "assignmentsDue":       2,
    "continuelearning": {
      "id":       "c1",
      "title":    "Foundation Mathematics",
      "progress": 42,
      "nextLesson": { "id": "l3", "title": "Multiplication & Division", "duration": 30 }
    },
    "upcomingClasses": [
      {
        "id":          "lc1",
        "courseTitle": "Foundation Mathematics",
        "subject":     "mathematics",
        "title":       "Algebra Q&A Session",
        "date":        "2026-07-05T10:00:00",
        "meetUrl":     "https://meet.google.com/abc-defg-hij",
        "status":      "upcoming"
      }
    ],
    "recentAnnouncements": [
      { "id": "an1", "title": "New Course Launched!", "createdAt": "2026-06-28", "isRead": false }
    ]
  }
}
```

---

### GET /dashboard/courses

List all courses the student is enrolled in, including progress.

**Success `200`:** Array of `EnrolledCourse` objects — same as `Course` but with:
```json
{
  "progress":   42,
  "enrolledAt": "2024-02-01"
}
```

---

### GET /dashboard/courses/:id

Get a single enrolled course with full module/lesson detail and progress.

**Success `200`:** Single `EnrolledCourse` object.
**Error `404`:** Course not found or student not enrolled.

---

### GET /assignments

List all assignments for the student's enrolled courses.

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":          "a1",
      "courseId":    "c1",
      "courseTitle": "Foundation Mathematics",
      "title":       "Fractions Worksheet",
      "dueDate":     "2026-07-08",
      "status":      "pending"
    }
  ]
}
```

`status` is one of: `"pending"` · `"submitted"` · `"overdue"`

---

### GET /announcements

List all platform announcements, newest first.

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":        "an1",
      "title":     "New Course: React & TypeScript Now Live!",
      "body":      "We are excited to announce…",
      "createdAt": "2026-06-28",
      "isRead":    false
    }
  ]
}
```

---

### GET /resources

List all downloadable resources from the student's enrolled courses.

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":          "res1",
      "courseId":    "c1",
      "courseTitle": "Foundation Mathematics",
      "title":       "Number Systems PDF",
      "type":        "pdf",
      "url":         "/files/res1.pdf"
    }
  ]
}
```

---

### GET /live-classes

List all live class sessions for the student's enrolled courses.

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":          "lc1",
      "courseId":    "c1",
      "courseTitle": "Foundation Mathematics",
      "subject":     "mathematics",
      "title":       "Algebra Q&A Session",
      "date":        "2026-07-05T10:00:00",
      "duration":    60,
      "meetUrl":     "https://meet.google.com/abc-defg-hij",
      "status":      "upcoming"
    }
  ]
}
```

---

### GET /profile

Get the authenticated student's profile.

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "id":        "u2",
    "name":      "Kolade Adebayo",
    "email":     "kolade@gmail.com",
    "bio":       "Passionate learner…",
    "createdAt": "2024-01-01"
  }
}
```

---

### PUT /profile

Update the authenticated student's profile.

**Request body (all fields optional):**
```json
{
  "name": "Kolade Adebayo",
  "bio":  "Updated bio text"
}
```

**Success `200`:** Updated profile object.

---

## Domain 4 — Trainer Portal

All `/trainer/*` endpoints require `role: "trainer"`.

### GET /trainer/stats

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "totalStudents":    47,
    "activeCourses":     4,
    "totalSessions":    28,
    "avgCompletionRate": 68,
    "pendingReviews":    9,
    "upcomingSessions":  3
  }
}
```

---

### GET /trainer/courses

List all courses owned by the trainer.

**Success `200`:** Array of `TrainerCourse`:
```json
{
  "id":             "c1",
  "title":          "Foundation Mathematics",
  "subject":        "mathematics",
  "level":          "beginner",
  "status":         "published",
  "enrolledCount":  18,
  "lessonCount":    24,
  "completionRate": 72,
  "createdAt":      "2024-01-10"
}
```

`status` is one of: `"published"` · `"draft"` · `"archived"`

---

### GET /trainer/students

List all students enrolled in the trainer's courses.

**Success `200`:**
```json
{
  "id":              "u2",
  "name":            "Kolade Adebayo",
  "email":           "kolade@gmail.com",
  "enrolledCourses": ["c1", "c2"],
  "progress":        { "c1": 42, "c2": 25 },
  "lastActive":      "2026-06-30",
  "joinedAt":        "2024-02-10"
}
```

---

### GET /trainer/sessions

List all live sessions created by the trainer.

**Success `200`:**
```json
{
  "id":          "lc1",
  "courseId":    "c1",
  "courseTitle": "Foundation Mathematics",
  "title":       "Algebra Q&A Session",
  "date":        "2026-07-05T10:00:00",
  "duration":    60,
  "meetUrl":     "https://meet.google.com/abc-defg-hij",
  "status":      "scheduled",
  "attendees":   0
}
```

`status` is one of: `"scheduled"` · `"live"` · `"completed"`

---

### GET /trainer/assignments

List all assignments created by the trainer across their courses.

**Success `200`:**
```json
{
  "id":               "a1",
  "courseId":         "c1",
  "courseTitle":      "Foundation Mathematics",
  "title":            "Fractions Worksheet",
  "dueDate":          "2026-07-08",
  "totalSubmissions": 14,
  "pendingReview":     5,
  "createdAt":        "2026-06-28"
}
```

---

## Domain 5 — Payments (Premium Course Checkout)

All payment endpoints are backend-authoritative. The browser can never set the
price, override the currency, choose the user/course, or decide payment success.

### Payment States

| State | Meaning |
|---|---|
| `pending` | Checkout initialized; awaiting provider confirmation |
| `verified` | Trusted backend logic confirmed the grant — enrollment created |
| `failed` | Provider declined, amount mismatch, or verification failed |
| `abandoned` | Student did not complete checkout |
| `refunded` | Refund processed by provider |
| `disputed` | Chargeback/dispute opened |

**State model:** A payment begins as `pending` and moves exactly once to a terminal
state. Only `verified` grants enrollment. The transition `pending → verified` is
atomic and guarded by a partial unique index — at most ONE verified payment per
(user, course). Duplicate webhook deliveries and provider replays are no-ops.

---

### POST /api/payments/initiate

Initialize a premium-course checkout. Creates a `pending` payment record with a
unique reference, then asks Paystack for a redirect URL.

**Authentication:** `Bearer` token · `role: "student"` only.

**Request body:**
```json
{
  "courseId": "c1"
}
```

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "reference": "NCP-1a2b3c4d-...",
    "authorizationUrl": "https://checkout.paystack.com/...",
    "amountSubunits": 50000,
    "currency": "NGN",
    "courseTitle": "Foundation Mathematics"
  }
}
```

`amountSubunits` is in the provider's subunit currency — kobo for NGN (i.e. `price_cents × 100`).
`reference` is the NumeryCode payment reference; `authorizationUrl` is where the student
completes payment on Paystack.

**Error `400`** — missing/unknown course, not premium, already enrolled, or Paystack not configured:
```json
{ "success": false, "message": "This course is not a premium course" }
```

**Error `401`** — missing/invalid token.

**Error `409`** — a pending payment for this course already exists (returns the existing reference):
```json
{ "success": false, "message": "A pending payment already exists for this course", "data": { "reference": "NCP-..." } }
```

**Error `502`** — Paystack provider error.

---

### GET /api/payments/:reference

Return the verified payment state. The backend is the source of truth — the frontend
displays `verified` only after this endpoint reports it. Safe to poll and refresh.

**Authentication:** `Bearer` token · payment owner OR `role: "admin"`.

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "reference": "NCP-1a2b3c4d-...",
    "status": "verified",
    "amountSubunits": 50000,
    "currency": "NGN",
    "course": { "id": "c1", "title": "Foundation Mathematics" },
    "enrollmentGranted": true,
    "failureReason": null,
    "paidAt": "2026-09-05T10:30:00.000Z",
    "createdAt": "2026-09-05T10:25:00.000Z"
  }
}
```

`enrollmentGranted` is `true` exactly when a verified payment produced an enrollment row.

**Error `400`** — invalid reference format:
```json
{ "success": false, "message": "Invalid reference format" }
```

**Error `403`/`404`** — a non-owner cannot read another user's payment (responds `403`
when the reader is not an admin, `404` when anonymous, to avoid leaking existence).

**Error `404`** — payment not found.

---

### POST /api/payments/webhook/paystack

Provider event endpoint. NOT authenticated by token — authenticated by the
`x-paystack-signature` header (HMAC-SHA512 of the raw request body computed with the
secret key, compared with a timing-safe equality check).

**Authentication:** `x-paystack-signature` (no `Authorization` header).

**Handled events:**

| Event | Action |
|---|---|
| `charge.success` | If amount/currency match the pending payment → `verified` + enroll; otherwise → `failed` |
| `refund.processed` / `refund.processing` | `verified`/`disputed` → `refunded` |
| `charge.dispute.create` | `verified` → `disputed` |
| `charge.dispute.resolve` | `disputed` → `verified` (safe against the partial unique index) |

**Success `200`** (acknowledged so Paystack stops retrying):
```json
{
  "success": true,
  "data": { "received": true, "handled": true }
}
```

`handled: false` means the event was acknowledged but not acted upon (unknown reference,
wrong status, or an unsupported event type) — this is NOT an error.

**Error `401`** — invalid signature (do not leak verification details):
```json
{ "success": false, "message": "Invalid webhook signature" }
```

**Error `400`** — unparseable payload.

---

### Ownership & Security Rules

- Only a `student` can initiate a payment.
- A payment's owner is the student who created it; only the owner or an admin can read it.
- Pricing is authoritative from the database. The amount charged is never taken from the browser.
- A successful payment creates exactly one enrollment via the existing `enrollments`
  table (`ON CONFLICT (user_id, course_id) DO NOTHING`).
- Provider secrets never leave the backend. No response body contains a key, secret,
  or raw provider credential.
- The webhook validates the signature over the raw body BEFORE parsing the JSON.

---

## Domain 6 — Admin Panel

All `/admin/*` endpoints require `role: "admin"`.

### GET /admin/stats

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "totalUsers":       94,
    "totalStudents":    89,
    "totalTrainers":     4,
    "totalCourses":      6,
    "activeCourses":     5,
    "totalLiveSessions":42,
    "totalEnrolments": 187,
    "platformGrowth":   23
  }
}
```

---

### GET /admin/users

List all platform users.

**Success `200`:**
```json
{
  "id":         "u2",
  "name":       "Kolade Adebayo",
  "email":      "kolade@gmail.com",
  "role":       "student",
  "status":     "active",
  "joinedAt":   "2024-02-10",
  "lastActive": "2026-06-30"
}
```

`role` is one of: `"student"` · `"trainer"` · `"admin"`
`status` is one of: `"active"` · `"suspended"` · `"pending"`

---

### PATCH /admin/users/:id

Update a user's status or role.

**Request body:**
```json
{ "status": "suspended" }
```

**Success `200`:** Updated user object.

---

### GET /admin/courses

List all courses on the platform.

**Success `200`:**
```json
{
  "id":            "c1",
  "title":         "Foundation Mathematics",
  "subject":       "mathematics",
  "level":         "beginner",
  "instructor":    "Emmanuel Nwafor",
  "status":        "published",
  "enrolledCount": 18,
  "createdAt":     "2024-01-10"
}
```

---

### GET /admin/announcements

List all platform announcements.

**Success `200`:**
```json
{
  "id":        "an1",
  "title":     "New Course: React & TypeScript Now Live!",
  "body":      "We are excited to announce…",
  "audience":  "all",
  "createdAt": "2026-06-28",
  "createdBy": "Emmanuel Nwafor"
}
```

`audience` is one of: `"all"` · `"students"` · `"trainers"`

---

### POST /admin/announcements

Create and send a new announcement.

**Request body:**
```json
{
  "title":    "Platform Maintenance Tonight",
  "body":     "NumeryCode will be down from 2am–4am WAT.",
  "audience": "all"
}
```

**Success `201`:** Created announcement object with `id` and `createdAt`.

---

## Type Reference

```ts
type Subject  = 'mathematics' | 'programming'
type Level    = 'beginner' | 'intermediate' | 'advanced'
type UserRole = 'student' | 'trainer' | 'admin'
type UserStatus        = 'active' | 'suspended' | 'pending'
type CourseStatus      = 'published' | 'draft' | 'archived'
type AssignmentStatus  = 'pending' | 'submitted' | 'overdue'
type LiveClassStatus   = 'upcoming' | 'live' | 'past'
type SessionStatus     = 'scheduled' | 'live' | 'completed'
type ResourceType      = 'pdf' | 'video' | 'link'
type AnnouncementAudience = 'all' | 'students' | 'trainers'
```

---

## Replacing MSW with a Real Backend

When you add a real backend in Phase 10:

1. Set `VITE_API_BASE_URL=https://api.numerycode.com` in `.env`
2. The `src/mocks/browser.stub.ts` alias in `vite.config.ts` already ensures MSW does not load in production
3. No frontend code changes are needed — the Axios instance and all service functions are already written
4. Add real JWT verification on the backend — the `Authorization: Bearer <token>` header is already sent by the Axios interceptor

