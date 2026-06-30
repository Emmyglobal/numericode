import { getAuthenticatedUser, json, requireMethod, type ApiRequest, type ApiResponse } from '../_lib/http'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!requireMethod(req, res, 'GET')) return

  const user = await getAuthenticatedUser(req)
  json(res, 200, { user })
}
