export function hasPostgresEnv() {
  return Boolean(process.env.POSTGRES_URL?.trim())
}

export async function getSql() {
  if (!hasPostgresEnv()) {
    throw new Error('POSTGRES_URL is not configured for this Vercel deployment.')
  }

  const postgres = await import('@vercel/postgres')
  return postgres.sql
}
