# NumeriCode — Developer Onboarding Guide

> Read this before touching any code. It takes 15 minutes and will save you hours.

---

## 1. First-Time Setup

```bash
# Prerequisites: Node.js 18+, npm 9+
node --version   # must be >= 18
npm --version    # must be >= 9

# Clone / extract and install
cd numericode
npm install

# Start the dev server
npm run dev      # → http://localhost:5173
```

MSW (Mock Service Worker) starts automatically in development. Open the browser console — you will see `[MSW] Mocking enabled.` confirming all API calls are intercepted.

---

## 2. Project Rules (read before writing code)

### TypeScript
- Strict mode is always on. **Never use `any`.** Use `unknown` and narrow with type guards.
- Never add `// @ts-ignore`. Fix the type instead.
- All props interfaces are named `[ComponentName]Props`.

### Components
- **One component per file.** File name = component name (PascalCase).
- **Named exports only** for components (except pages — they use `export default` for lazy loading).
- No direct API calls inside components. All data comes through hooks.
- Components must not exceed 200 lines. Extract sub-components if longer.
- All imports use the `@/` alias, never relative paths more than one level deep.

### Naming
| Item | Convention | Example |
|---|---|---|
| Component files | `PascalCase.tsx` | `CourseCard.tsx` |
| Hook files | `camelCase.ts` | `useCourses.ts` |
| Service files | `camelCase.service.ts` | `courses.service.ts` |
| Handler files | `camelCase.handlers.ts` | `courses.handlers.ts` |
| Event handlers | `handle` + event | `handleSubmit`, `handleClose` |
| Boolean variables | `is` / `has` / `can` | `isLoading`, `hasError` |

---

## 3. How to Add a New Page

Follow these steps **in order** every time you add a page. Never skip a step.

### Step 1 — Create the page file

Pages live in `src/pages/[zone]/`. Choose the right zone:

| Zone | Path | When to use |
|---|---|---|
| Public | `src/pages/public/` | No login required |
| Auth | `src/pages/auth/` | Login / register flows |
| Dashboard | `src/pages/dashboard/` | Student portal |
| Trainer | `src/pages/trainer/` | Trainer portal |
| Admin | `src/pages/admin/` | Admin panel |
| System | `src/pages/system/` | Error pages |

```tsx
// src/pages/dashboard/NewPage.tsx — minimal template
import { usePageTitle } from '@/hooks/usePageTitle'
import { PageHeader } from '@/components/shared/PageHeader'

export default function NewPage() {
  usePageTitle('New Page')          // updates document.title
  return (
    <div>
      <PageHeader title="New Page" subtitle="What this page does" />
      {/* page content */}
    </div>
  )
}
```

### Step 2 — Add the route in Router.tsx

Open `src/app/Router.tsx`. Add a lazy import at the top:

```tsx
const NewPage = lazy(() => import('@/pages/dashboard/NewPage'))
```

Then add the `<Route>` inside the correct layout block:

```tsx
// Inside the RoleGuard role="student" + DashboardLayout block:
<Route path="/dashboard/new-page" element={<NewPage />} />
```

### Step 3 — Add to sidebar navigation (if needed)

If the page needs a sidebar link, open the appropriate sidebar:

- Student → `src/components/navigation/DashboardSidebar.tsx`
- Trainer → `src/components/navigation/TrainerSidebar.tsx`
- Admin → `src/components/navigation/AdminSidebar.tsx`

Add an entry to the `navItems` array:

```tsx
import { Star } from 'lucide-react'   // pick the right icon

const navItems = [
  // ... existing items
  { to: '/dashboard/new-page', icon: Star, label: 'New Page', end: false },
]
```

### Step 4 — Add a mock API handler (if the page fetches data)

See **Section 4** below.

### Step 5 — Write tests

Every new page needs at minimum:
- A test that the heading renders
- A test that data loads (or skeleton shows)
- A test for any interactive behaviour (filters, tabs, form submission)

Add the test file to `src/test/integration/pages/newPage.test.tsx`.

```bash
npm test -- src/test/integration/pages/newPage.test.tsx
```

### Step 6 — Update the dashboard topbar title map (if needed)

If the new page has a URL that the topbar should display as a custom title, add it to the `titles` map in the appropriate layout file:

```tsx
// src/app/layouts/DashboardLayout.tsx
const titles: Record<string, string> = {
  '/dashboard/new-page': 'New Page Title',
  // ...
}
```

---

## 4. How to Add a New Mock API Endpoint

All mock API logic lives in `src/mocks/`. The pattern is always:
**Data file → Handler file → Register in browser.ts**

### Step 1 — Add mock data (if new data shape)

```ts
// src/mocks/data/newFeature.data.ts
import type { NewFeatureItem } from '@/features/newFeature/types'

export const newFeatureData: NewFeatureItem[] = [
  { id: 'nf1', title: 'Item One', createdAt: '2026-01-01' },
  { id: 'nf2', title: 'Item Two', createdAt: '2026-01-02' },
]
```

### Step 2 — Add the handler

```ts
// src/mocks/handlers/newFeature.handlers.ts
import { http, HttpResponse } from 'msw'
import { newFeatureData } from '@/mocks/data/newFeature.data'

export const newFeatureHandlers = [
  // GET list
  http.get('/api/new-feature', () =>
    HttpResponse.json({ success: true, data: newFeatureData })
  ),

  // GET single item
  http.get('/api/new-feature/:id', ({ params }) => {
    const item = newFeatureData.find(i => i.id === params.id)
    if (!item) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ success: true, data: item })
  }),

  // POST create
  http.post('/api/new-feature', async ({ request }) => {
    const body = await request.json() as { title: string }
    const newItem = { id: `nf-${Date.now()}`, ...body, createdAt: new Date().toISOString() }
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 })
  }),
]
```

### Step 3 — Register in browser.ts

```ts
// src/mocks/browser.ts
import { newFeatureHandlers } from './handlers/newFeature.handlers'

export const worker = setupWorker(
  ...authHandlers,
  ...coursesHandlers,
  ...dashboardHandlers,
  ...trainerHandlers,
  ...adminHandlers,
  ...newFeatureHandlers,  // ← add here
)
```

### Step 4 — Add a service function

```ts
// src/services/newFeature.service.ts
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { NewFeatureItem } from '@/features/newFeature/types'

export const newFeatureService = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<NewFeatureItem[]>>('/new-feature')
    return data.data
  },
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<NewFeatureItem>>(`/new-feature/${id}`)
    return data.data
  },
}
```

### Step 5 — Use TanStack Query in your page

```tsx
import { useQuery } from '@tanstack/react-query'
import { newFeatureService } from '@/services/newFeature.service'

const { data, isLoading } = useQuery({
  queryKey: ['new-feature'],
  queryFn:  newFeatureService.getAll,
})
```

---

## 5. How to Add a New Shared Component

Shared components live in `src/components/ui/` (atomic) or `src/components/shared/` (composed).

```tsx
// src/components/ui/Tooltip.tsx
import { cn } from '@/utils/classNames'
import type { ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  className?: string
}

function Tooltip_Base({ content, children, className }: TooltipProps) {
  return (
    <div className={cn('relative group inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        {content}
      </span>
    </div>
  )
}

// Always export as a memoised named export
import { memo } from 'react'
export const Tooltip = memo(Tooltip_Base)
```

Then add a test file at `src/test/unit/components/Tooltip.test.tsx`.

---

## 6. State Management Decision Tree

Before adding state, answer these questions in order:

```
Is this data from the API?
  YES → TanStack Query (useQuery / useMutation). Do NOT put it in Zustand.
  NO  → Is it global (auth, theme, sidebar)?
          YES → Zustand store (src/store/)
          NO  → Is it form input?
                  YES → React Hook Form (useForm)
                  NO  → Is it URL-driven (filter, tab)?
                          YES → URL search params via useSearchParams
                          NO  → useState inside the component
```

---

## 7. Running the Test Suite

```bash
npm test                       # All 227 tests
npm run test:unit              # Unit tests only (fast)
npm run test:integration       # Integration tests only
npm run test:coverage          # Tests + HTML coverage report
npm run test:watch             # Watch mode — runs tests on file change
```

### Writing a new test

Every new page test follows this template:

```tsx
// src/test/integration/pages/newPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import NewPage from '@/pages/dashboard/NewPage'

// 1. Mock any services this page calls
vi.mock('@/services/newFeature.service', () => ({
  newFeatureService: {
    getAll: vi.fn().mockResolvedValue([
      { id: 'nf1', title: 'Item One', createdAt: '2026-01-01' },
    ]),
  },
}))

describe('NewPage', () => {
  // 2. Set up auth state before each test
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'u2', name: 'Kolade', email: 'k@gmail.com', role: 'student', createdAt: '2024-01-01' },
      token: 'token', isAuthenticated: true,
    })
  })

  // 3. At minimum: test heading + data load
  it('renders the page heading', () => {
    render(<NewPage />)
    expect(screen.getByRole('heading', { name: /new page/i })).toBeInTheDocument()
  })

  it('shows data after loading', async () => {
    render(<NewPage />)
    await waitFor(() => {
      expect(screen.getByText('Item One')).toBeInTheDocument()
    })
  })
})
```

### Key testing patterns

**Use `fireEvent.submit(form)` for form validation tests** — not `userEvent.click(submitBtn)`. jsdom's click-to-submit path is unreliable with React Hook Form.

**Use `getAllByRole` not `getByRole`** when multiple elements share a role (e.g. multiple `role="status"` skeletons).

**Mock services at the top level** with data inline in the factory function — not in variables declared above `vi.mock()`. Rollup hoists `vi.mock()` calls above variable declarations.

---

## 8. Environment Variables

```bash
# .env.example — commit this
VITE_API_BASE_URL=/api
VITE_APP_NAME=NumeriCode
VITE_APP_ENV=development

# .env — never commit this
VITE_API_BASE_URL=https://api.numericode.com
```

Access in code: `import.meta.env.VITE_API_BASE_URL`

---

## 9. Common Mistakes to Avoid

| Mistake | Correct approach |
|---|---|
| `import X from '@/components/ui/Button'` | `import { Button } from '@/components/ui/Button'` (named exports) |
| Putting API data in `useState` | Use `useQuery` from TanStack Query |
| Calling a service directly in a component | Create a custom hook, call the service there |
| Adding `// @ts-ignore` | Fix the type properly |
| Using `any` | Use `unknown` and narrow, or define the type |
| `vi.mock` referencing a variable above it | Put mock data inline inside the factory function |
| `getByRole('status')` when multiple exist | Use `getAllByRole('status')` |
| `userEvent.click(submitBtn)` for validation | Use `fireEvent.submit(form)` |
| `export default function MyComponent` | `export function MyComponent` (named), except for pages |

---

## 10. Useful Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build (MSW excluded)
npm run type-check       # TypeScript check only
npm test                 # All tests
npm run test:watch       # Tests in watch mode
npm run test:coverage    # Coverage report → open dist/ in browser after
```

