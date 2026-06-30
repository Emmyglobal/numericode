import { ensureSchema, seedAccount } from './_lib/db'
import { assertSameOrigin, json, parseBody, requireMethod, type ApiRequest, type ApiResponse } from './_lib/http'
import type { UserRole } from './_lib/security'

type SeedAccountInput = {
  name: string
  email: string
  password: string
  role: UserRole
}

function getSetupAccounts(bodyAccounts?: SeedAccountInput[]) {
  if (bodyAccounts?.length) {
    return bodyAccounts
  }

  const accounts: SeedAccountInput[] = []

  if (process.env.FIRST_ADMIN_EMAIL && process.env.FIRST_ADMIN_PASSWORD) {
    accounts.push({
      name: process.env.FIRST_ADMIN_NAME || 'NumeriCode Admin',
      email: process.env.FIRST_ADMIN_EMAIL,
      password: process.env.FIRST_ADMIN_PASSWORD,
      role: 'admin',
    })
  }

  if (process.env.FIRST_TRAINER_EMAIL && process.env.FIRST_TRAINER_PASSWORD) {
    accounts.push({
      name: process.env.FIRST_TRAINER_NAME || 'NumeriCode Trainer',
      email: process.env.FIRST_TRAINER_EMAIL,
      password: process.env.FIRST_TRAINER_PASSWORD,
      role: 'trainer',
    })
  }

  return accounts
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (!requireMethod(req, res, 'POST') || !assertSameOrigin(req, res)) return

    const setupSecret = process.env.SETUP_SECRET
    const providedSecret = Array.isArray(req.headers['x-setup-secret'])
      ? req.headers['x-setup-secret'][0]
      : req.headers['x-setup-secret']

    if (!setupSecret || providedSecret !== setupSecret) {
      json(res, 403, { error: 'Setup is locked.' })
      return
    }

    const body = parseBody<{ accounts?: SeedAccountInput[] }>(req)
    const accounts = getSetupAccounts(body.accounts)

    if (accounts.length === 0) {
      json(res, 400, {
        error:
          'No setup accounts found. Add FIRST_ADMIN_EMAIL/FIRST_ADMIN_PASSWORD and FIRST_TRAINER_EMAIL/FIRST_TRAINER_PASSWORD in Vercel.',
      })
      return
    }

    await ensureSchema()

    for (const account of accounts) {
      if (account.password.length < 10) {
        json(res, 400, { error: `${account.email} password must be at least 10 characters.` })
        return
      }

      await seedAccount(account)
    }

    json(res, 200, {
      ok: true,
      seededAccounts: accounts.map((account) => ({ email: account.email, role: account.role })),
    })
  } catch (error) {
    json(res, 500, {
      error: 'Setup failed.',
      detail: error instanceof Error ? error.message : 'Unknown server error.',
    })
  }
}
