/**
 * Build-time sitemap generator.
 *
 * Runs as `npm run generate:sitemap` (hooked after `vite build`).
 *
 * Fetches published courses and active trainers from the **existing public
 * API** endpoints and writes a canonical `public/sitemap.xml` so that the
 * static build ships with a sitemap even before any serverless function
 * runs. This is the "deterministic script" approach recommended by Phase 8 Part 4.
 *
 * Safety policy (Part 12):
 *   - In production / CI the API **must** be reachable. If it is not, the
 *     script exits non-zero so deployment never ships a misleading sitemap.
 *   - In development (NODE_ENV !== 'production') the script degrades
 *     gracefully: it logs a warning and skips generation, so `npm run dev`
 *     and local builds never become unusable because the remote API is down.
 *
 * Pagination:
 *   - The catalogue endpoint caps results at 50 per page. We walk pages
 *     until `hasMore === false`, deduplicating IDs (Part 6 / Part 11.14).
 *   - A hard cap of 50 000 URLs is enforced (protocol limit).
 *
 * No secrets are used — only the public GET /courses and GET /courses/teachers
 * endpoints that any anonymous browser request can call.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildSitemapXml,
  type SitemapUrlEntry,
  SITEMAP_SITE_URL,
  SITEMAP_MAX_URLS,
} from '../src/utils/sitemap.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

const COURSES_PAGE_SIZE = 50
const OUTPUT_PATH = resolve(PROJECT_ROOT, 'public/sitemap.xml')

const resolveApiBase = (): string => {
  const configured = process.env.VITE_API_BASE_URL
  if (configured && !configured.startsWith('/')) return configured.replace(/\/+$/, '')
  return 'https://numericode-api.onrender.com/api'
}

async function fetchPublishedCourseEntries(): Promise<SitemapUrlEntry[]> {
  const apiBase = resolveApiBase()
  const entries: SitemapUrlEntry[] = []
  const seenIds = new Set<string>()
  let offset = 0
  let total = Number.MAX_SAFE_INTEGER
  let pageCount = 0
  const MAX_PAGES = 100 // safety: 100 × 50 = 5 000 courses

  while (offset < total && entries.length < SITEMAP_MAX_URLS && pageCount < MAX_PAGES) {
    pageCount += 1
    const url = `${apiBase}/courses?limit=${COURSES_PAGE_SIZE}&offset=${offset}`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`GET /courses responded ${res.status} ${res.statusText} (${url})`)
    }
    const payload = await res.json() as {
      data?: { id: string; updated_at?: string }[]
      pagination?: { total?: number; hasMore?: boolean }
    }
    for (const course of payload.data ?? []) {
      if (course.id && !seenIds.has(course.id)) {
        seenIds.add(course.id)
        entries.push({ type: 'course', id: course.id, updatedAt: course.updated_at })
      }
    }
    if (payload.pagination?.hasMore === false) break
    total = payload.pagination?.total ?? Math.min(offset + COURSES_PAGE_SIZE, SITEMAP_MAX_URLS)
    offset += COURSES_PAGE_SIZE
  }

  return entries
}

async function fetchActiveTrainerEntries(): Promise<SitemapUrlEntry[]> {
  const apiBase = resolveApiBase()
  const res = await fetch(`${apiBase}/courses/teachers`)
  if (!res.ok) {
    throw new Error(
      `GET /courses/teachers responded ${res.status} ${res.statusText}`,
    )
  }
  const payload = await res.json() as { data?: { id: string }[] }
  const seenIds = new Set<string>()
  const entries: SitemapUrlEntry[] = []
  for (const trainer of payload.data ?? []) {
    if (trainer.id && !seenIds.has(trainer.id)) {
      seenIds.add(trainer.id)
      entries.push({ type: 'trainer', id: trainer.id })
    }
  }
  return entries
}

async function main(): Promise<void> {
  const isProd = process.env.NODE_ENV === 'production' || process.env.CI === 'true'

  let courseEntries: SitemapUrlEntry[] = []
  let trainerEntries: SitemapUrlEntry[] = []

  try {
    ;[courseEntries, trainerEntries] = await Promise.all([
      fetchPublishedCourseEntries(),
      fetchActiveTrainerEntries(),
    ])
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (isProd) {
      console.error(`\n[generate:sitemap] ❌ ERROR — cannot build production sitemap:\n  ${message}\n`)
      console.error(
        '[generate:sitemap] Sitemap generation requires the public course/trainer API. ' +
          'Fix the upstream issue and retry. Exiting with code 1.\n',
      )
      process.exit(1)
    }
    // Development: warn but do not block the build.
    console.warn(
      `[generate:sitemap] ⚠️  API unavailable — writing static-only sitemap.\n` +
        `  ${message}\n`,
    )
  }

  const xml = buildSitemapXml([...courseEntries, ...trainerEntries], {
    siteUrl: SITEMAP_SITE_URL,
    enforceUrlLimit: true,
  })

  // Ensure the output directory exists (should already be there in a Vite project).
  mkdirSync(resolve(OUTPUT_PATH, '..'), { recursive: true })
  writeFileSync(OUTPUT_PATH, xml, 'utf-8')
  console.log(
    `[generate:sitemap] ✅ Wrote ${OUTPUT_PATH} ` +
      `(${courseEntries.length} courses, ${trainerEntries.length} trainers).`,
  )
}

main().catch(err => {
  console.error('[generate:sitemap] Unrecoverable error:', err)
  process.exit(1)
})
