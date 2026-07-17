import { http, HttpResponse } from 'msw'

export const contactHandlers = [
  http.post('/api/contact', async ({ request }) => {
    const body = await request.json() as { name?: string; email?: string; subject?: string; message?: string }
    if (!body.name || !body.email || !body.subject || !body.message) {
      return HttpResponse.json({ success: false, message: 'Name, email, subject, and message are all required' }, { status: 400 })
    }
    // In dev mode, MSW intercepts this — no real email is sent. The real backend
    // (src/utils/mailer.ts) sends to nwaforugochukwu21@gmail.com via SMTP.
    return HttpResponse.json({ success: true, data: { sent: true } })
  }),
]
