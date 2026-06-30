import { getAuthenticatedUser, json, requireMethod, type ApiRequest, type ApiResponse } from '../_lib/http'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (!requireMethod(req, res, 'GET')) return

    const user = await getAuthenticatedUser(req)
    json(res, 200, { user })
  } catch {
    json(res, 500, { error: 'Unable to verify your session.' })
  }
}
