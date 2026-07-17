import { http, HttpResponse } from 'msw'

interface MockUser { id: string; name: string; email: string; role: 'student'|'trainer'|'admin'; status: 'active'|'pending'|'suspended'; createdAt: string }

const users: MockUser[] = [
  { id: 'u1', name: 'Emmanuel Nwafor', email: 'emmanuel@numericode.com', role: 'admin',   status: 'active', createdAt: '2024-01-01' },
  { id: 'u7', name: 'Trainer One',     email: 'trainer@numericode.com',  role: 'trainer', status: 'active', createdAt: '2024-01-05' },
  { id: 'u2', name: 'Kolade Adebayo',  email: 'kolade@gmail.com',        role: 'student', status: 'active', createdAt: '2024-02-10' },
]

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string }
    if (!email || !password) return HttpResponse.json({ success: false, message: 'Email and password required' }, { status: 400 })
    const user = users.find(u => u.email === email)
    if (!user || password.length < 6) return HttpResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    if (user.status === 'suspended') return HttpResponse.json({ success: false, message: 'This account has been suspended' }, { status: 401 })
    if (user.status === 'pending')   return HttpResponse.json({ success: false, message: 'Your trainer account is awaiting admin approval. You will be able to log in once approved.' }, { status: 401 })
    return HttpResponse.json({ success: true, data: { user, token: 'mock-jwt-token-' + user.id } })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as { name: string; email: string; password: string; role?: string }
    if (users.find(u => u.email === body.email))
      return HttpResponse.json({ success: false, message: 'An account with this email already exists' }, { status: 409 })

    // Defense in depth: even if a client sent role="admin", the mock (like the real
    // backend) refuses to honor it. Only student/trainer are self-service roles.
    const allowedRoles = ['student', 'trainer'] as const
    const role = allowedRoles.includes(body.role as typeof allowedRoles[number]) ? body.role as 'student' | 'trainer' : 'student'
    const status = role === 'trainer' ? 'pending' : 'active'

    const newUser: MockUser = { id: 'u-' + Date.now(), name: body.name, email: body.email, role, status, createdAt: new Date().toISOString() }
    users.push(newUser)

    if (role === 'trainer') {
      return HttpResponse.json({
        success: true,
        data: { pendingApproval: true, message: 'Your trainer account has been created and is awaiting admin approval.' },
      }, { status: 201 })
    }

    return HttpResponse.json({ success: true, data: { user: newUser, token: 'mock-jwt-token-' + newUser.id } }, { status: 201 })
  }),

  http.post('/api/auth/forgot-password', () =>
    HttpResponse.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
  ),
]
