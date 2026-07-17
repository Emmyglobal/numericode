import { http, HttpResponse } from 'msw'
import { coursesData } from '@/mocks/data/courses.data'

export const coursesHandlers = [
  http.get('/api/courses', ({ request }) => {
    const url = new URL(request.url)
    const subject = url.searchParams.get('subject')
    const q = url.searchParams.get('q')?.toLowerCase()
    let results = coursesData
    if (subject) results = results.filter(c => c.subject === subject)
    if (q) results = results.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    return HttpResponse.json({ success: true, data: results })
  }),
  http.get('/api/courses/:id', ({ params }) => {
    const course = coursesData.find(c => c.id === params.id)
    if (!course) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ success: true, data: course })
  }),
]
