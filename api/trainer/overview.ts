import { json, requireMethod, requireRole, type ApiRequest, type ApiResponse } from '../_lib/http'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (!requireMethod(req, res, 'GET')) return

    const user = await requireRole(req, res, 'trainer')
    if (!user) return

    json(res, 200, {
      user,
      permissions: ['manage_classes', 'grade_assignments', 'upload_resources', 'support_students'],
      message: 'Trainer role verified on the server.',
    })
  } catch {
    json(res, 500, { error: 'Unable to load trainer overview.' })
  }
}
