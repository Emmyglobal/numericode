# NumeriCode — API Contract

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

**Query parameters (all optional):**

| Parameter | Type | Description |
|---|---|---|
| `subject` | `"mathematics" \| "programming"` | Filter by subject |
| `q` | `string` | Search by title or description (case-insensitive) |

**Examples:**
```
GET /api/courses
GET /api/courses?subject=mathematics
GET /api/courses?q=algebra
GET /api/courses?subject=programming&q=javascript
```

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":          "c1",
      "title":       "Foundation Mathematics",
      "description": "Build a rock-solid foundation…",
      "subject":     "mathematics",
      "level":       "beginner",
      "lessonCount": 24,
      "outcomes":    ["Master arithmetic operations", "…"],
      "createdAt":   "2024-01-10",
      "instructor": {
        "id":          "i1",
        "name":        "Mr. Emmanuel Nwafor",
        "bio":         "Mathematics educator…",
        "credentials": ["B.Sc Mathematics – UNILAG", "…"]
      },
      "modules": [
        {
          "id":    "m1",
          "title": "Numbers & Arithmetic",
          "lessons": [
            {
              "id":          "l1",
              "title":       "Introduction to Numbers",
              "duration":    20,
              "isCompleted": false,
              "resources": [
                { "id": "r1", "title": "Number Systems PDF", "type": "pdf", "url": "/files/r1.pdf" }
              ]
            }
          ]
        }
      ],
      "liveClasses": [
        {
          "id":       "lc1",
          "title":    "Algebra Q&A Session",
          "date":     "2026-07-05T10:00:00",
          "duration": 60,
          "meetUrl":  "https://meet.google.com/abc-defg-hij",
          "status":   "upcoming"
        }
      ]
    }
  ]
}
```

`level` is one of: `"beginner"` · `"intermediate"` · `"advanced"`
`status` on live classes: `"upcoming"` · `"live"` · `"past"`
`type` on resources: `"pdf"` · `"video"` · `"link"`

---

### GET /courses/:id

Get a single course by ID.

**Success `200`:** Same shape as a single item from `GET /courses`.

**Error `404`:**
```json
{ "success": false, "message": "Course not found" }
```

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

## Domain 5 — Admin Panel

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
  "body":     "NumeriCode will be down from 2am–4am WAT.",
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

1. Set `VITE_API_BASE_URL=https://api.numericode.com` in `.env`
2. The `src/mocks/browser.stub.ts` alias in `vite.config.ts` already ensures MSW does not load in production
3. No frontend code changes are needed — the Axios instance and all service functions are already written
4. Add real JWT verification on the backend — the `Authorization: Bearer <token>` header is already sent by the Axios interceptor

