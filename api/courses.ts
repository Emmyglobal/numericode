import { getPublishedCourses } from './_lib/courses'
import { json, requireMethod, type ApiRequest, type ApiResponse } from './_lib/http'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!requireMethod(req, res, 'GET')) return

  try {
    const courses = await getPublishedCourses()
    json(res, 200, { courses })
  } catch {
    json(res, 500, { error: 'Unable to load courses.' })
  }
}
