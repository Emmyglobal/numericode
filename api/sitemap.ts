/**
 * Vercel serverless function — serves a canonical public sitemap at
 * https://numerycode.com/sitemap.xml (wired via the /sitemap.xml rewrite
 * in vercel.json).
 *
 * Data sources (existing public APIs — no dedicated sitemap endpoint):
 *   - GET {API}/courses?limit=50&offset=…  → paginated published courses
 *   - GET {API}/courses/teachers            → active Registered Trainers
 * Both endpoints already enforce the public visibility rules (published
 * courses, active trainers only). If the live API is unreachable, we
 * gracefully serve a static-only sitemap rather than failing the XML
 * document.
 *
 * The frontend is a static Vite build on Vercel — this function is the
 * dynamic layer that keeps course/trainer URLs fresh without coupling the
 * build to the backend's availability.
 */
import {
  buildSitemapXml,
  type SitemapUrlEntry,
  SITEMAP_SITE_URL,
  SITEMAP_MAX_URLS,
} from '../src/utils/sitemap.ts'

const COURSES_PAGE_SIZE = 50 // catalogue limit is 50 max

const resolveApiBase = (): string => {
  const configured = process.env.VITE_API_BASE_URL
  if (configured && !configured.startsWith('/')) return configured.replace(/\/+$/, '')
  return 'https://numericode-api.onrender.com/api'
}

/**
 * Fetch every page of the published course catalogue as sitemap entries.
 * The catalogue endpoint already filters to `status = 'published'` on the
 * backend, so draft/archived courses never reach this builder.
 */
async function fetchPublishedCourseEntries(): Promise<SitemapUrlEntry[]> {
  const apiBase = resolveApiBase()
  const entries: SitemapUrlEntry[] = []
  let offset = 0
  let total = Number.MAX_SAFE_INTEGER

  while (offset < total && entries.length < SITEMAP_MAX_URLS) {
    const res = await fetch(`${apiBase}/courses?limit=${COURSES_PAGE_SIZE}&offset=${offset}`)
    if (!res.ok) throw new Error(`courses catalogue responded ${res.status}`)
    const payload = await res.json() as {
      data?: { id: string; updated_at?: string }[]
      pagination?: { total?: number; hasMore?: boolean }
    }
    for (const course of payload.data ?? []) {
      if (course.id) entries.push({ type: 'course', id: course.id, updatedAt: course.updated_at })
    }
    if (payload.pagination?.hasMore === false) break
    total = payload.pagination?.total ?? Math.min(offset + COURSES_PAGE_SIZE, SITEMAP_MAX_URLS)
    offset += COURSES_PAGE_SIZE
  }

  return entries
}

/**
 * Fetch active Registered Trainers as sitemap entries.
 * The /teachers endpoint already enforces `status = 'active'` and only
 * returns trainers with at least one published course.
 */
async function fetchActiveTrainerEntries(): Promise<SitemapUrlEntry[]> {
  const apiBase = resolveApiBase()
  const res = await fetch(`${apiBase}/courses/teachers`)
  if (!res.ok) throw new Error(`trainer directory responded ${res.status}`)
  const payload = await res.json() as { data?: { id: string }[] }
  return (payload.data ?? [])
    .filter(t => t.id)
    .map(t => ({ type: 'trainer' as const, id: t.id }))
}

type VercelLikeResponse = {
  setHeader: (name: string, value: string) => void
  send: (body: string) => void
  statusCode?: number
}

export default async function sitemapHandler(
  _req: unknown,
  res: VercelLikeResponse,
): Promise<void> {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')

  try {
    const [courseEntries, trainerEntries] = await Promise.all([
      fetchPublishedCourseEntries(),
      fetchActiveTrainerEntries(),
    ])

    const xml = buildSitemapXml([...courseEntries, ...trainerEntries], {
      siteUrl: SITEMAP_SITE_URL,
      enforceUrlLimit: true,
    })
    res.send(xml)
  } catch {
    // Never fail the XML document: serve the static discovery routes only.
    // (Build-time generation via scripts/generate-sitemap.ts will hard-fail
    //  instead so deployment never ships a misleading zero-content sitemap.)
    const xml = buildSitemapXml([], { siteUrl: SITEMAP_SITE_URL })
    res.send(xml)
  }
}