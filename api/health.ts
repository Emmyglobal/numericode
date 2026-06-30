import { sql } from '@vercel/postgres'
import { json, requireMethod, type ApiRequest, type ApiResponse } from './_lib/http'

function isPresent(value: string | undefined) {
  return Boolean(value && value.trim().length > 0)
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!requireMethod(req, res, 'GET')) return

  const env = {
    postgresUrl: isPresent(process.env.POSTGRES_URL),
    setupSecret: isPresent(process.env.SETUP_SECRET),
    firstAdminEmail: isPresent(process.env.FIRST_ADMIN_EMAIL),
    firstAdminPassword: isPresent(process.env.FIRST_ADMIN_PASSWORD),
    firstTrainerEmail: isPresent(process.env.FIRST_TRAINER_EMAIL),
    firstTrainerPassword: isPresent(process.env.FIRST_TRAINER_PASSWORD),
    appUrl: isPresent(process.env.APP_URL),
    resendApiKey: isPresent(process.env.RESEND_API_KEY),
    authEmailFrom: isPresent(process.env.AUTH_EMAIL_FROM),
  }

  try {
    await sql`SELECT 1`
    json(res, 200, {
      ok: true,
      database: 'connected',
      env,
    })
  } catch (error) {
    json(res, 500, {
      ok: false,
      database: 'unavailable',
      env,
      error: error instanceof Error ? error.message : 'Unknown database error.',
    })
  }
}
