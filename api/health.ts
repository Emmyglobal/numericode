type HealthRequest = {
  method?: string
}

type HealthResponse = {
  status: (code: number) => HealthResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

function isPresent(value: string | undefined) {
  return Boolean(value && value.trim().length > 0)
}

function envStatus() {
  return {
    postgresUrl: isPresent(process.env.POSTGRES_URL),
    setupSecret: isPresent(process.env.SETUP_SECRET),
    firstAdminEmail: isPresent(process.env.FIRST_ADMIN_EMAIL),
    firstAdminPassword: isPresent(process.env.FIRST_ADMIN_PASSWORD),
    firstTrainerEmail: isPresent(process.env.FIRST_TRAINER_EMAIL),
    firstTrainerPassword: isPresent(process.env.FIRST_TRAINER_PASSWORD),
    appUrl: isPresent(process.env.APP_URL),
    resendApiKey: isPresent(process.env.RESEND_API_KEY),
    authEmailFrom: isPresent(process.env.AUTH_EMAIL_FROM),
    nodeEnv: process.env.NODE_ENV ?? null,
  }
}

export default async function handler(req: HealthRequest, res: HealthResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: `Method ${req.method} is not allowed.` })
    return
  }

  const env = envStatus()

  if (!env.postgresUrl) {
    res.status(200).json({
      ok: false,
      database: 'not_configured',
      env,
      nextStep: 'Add POSTGRES_URL in Vercel Project Settings, then redeploy.',
    })
    return
  }

  try {
    const postgres = await import('@vercel/postgres')
    await postgres.sql`SELECT 1`
    res.status(200).json({
      ok: true,
      database: 'connected',
      env,
    })
  } catch (error) {
    res.status(200).json({
      ok: false,
      database: 'unavailable',
      env,
      error: error instanceof Error ? error.message : 'Unknown database error.',
    })
  }
}
