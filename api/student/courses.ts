import { getStudentCourses } from '../_lib/courses'
import { json, requireMethod, requireRole, type ApiRequest, type ApiResponse } from '../_lib/http'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!requireMethod(req, res, 'GET')) return

  try {
    const user = await requireRole(req, res, 'student')
    if (!user) return

    const courses = await getStudentCourses(user.id)
    json(res, 200, { courses })
  } catch {
    json(res, 500, { error: 'Unable to load your courses.' })
  }
}
