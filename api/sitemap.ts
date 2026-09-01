/**
 * Vercel serverless function — serves a canonical public sitemap at
 * https://numerycode.com/sitemap.xml (wired via the /sitemap.xml rewrite
 * in vercel.json).
 *
 * Data sources (existing public APIs — no dedicated sitemap endpoint):
 *   - GET {API}/courses?limit=50&offset=…  → paginated published courses
 *   - GET {API}/courses/teachers            → active Registered Trainers
 * Both endpoints already enforce the public visibility rules (published courses,
 * active trainers only). If the live API is unreachable, we gracefully serve a
 * static-only sitemap rather than failing the XML document.

 * The frontend is a static Vite build on Vercel — this function is the dynamic
 * layer that keeps course/trainer URLs fresh without coupling the build to the
 * backend's availability.
 */
import { buildSitemapXml, SITEMAP_SITE_URL, SITEMAP_MAX_URLS } from '../src/utils/sitemap'

const COURSES_PAGE_SIZE = 50 // catalogue limit is 50 max

const resolveApiBase = (): string => {
  const configured = process.env.VITE_API_BASE_URL
  if (configured && !configured.startsWith('/')) return configured.replace(/\/+$/, '')
  return 'https://numericode-api.onrender.com/api'
}

/** Fetch every page of the published course catalogue; returns canonical locs. */
async function fetchPublishedCoursePaths(): Promise<string[]> {
  const apiBase = resolveApiBase()
  const paths: string[] = []
  let offset = 0
  let total = Number.MAX_SAFE_INTEGER

  while (offset < total) {
    const res = await fetch(`${apiBase}/courses?limit=${COURSES_PAGE_SIZE}&offset=${offset}`)
    if (!res.ok) throw new Error(`courses catalogue responded ${res.status}`)
    const payload = (await res.json()) as {
      data?: { id: string }[], pagination?: { total?: number; hasMore?: boolean }
    }
    const rows = payload.data ?? []
    rows.forEach(course => {
      if (course.id) paths.push(`/courses/${course.id}`)
    })
    if (payload.pagination?.hasMore === false) break
    total = payload.pagination?.total ?? Math.min(offset + COURSES_PAGE_SIZE, SITEMAP_MAX_URLS)
    offset += COURSES_PAGE_SIZE
    if (paths.length >= SITEMAP_MAX_URLS) break // protocol safety cap
  }

  return paths
}

/** Fetch active Registered Trainers; returns canonical profile locs. */
async function fetchActiveTrainerPaths(): Promise<string[]> {
  const apiBase = resolveApiBase()
  const res = await fetch(`${apiBase}/courses/teachers`)
  if (!res.ok) throw new Error(`trainer directory responded ${res.status}`)
  const payload = (await res.json()) as { data?: { id: string }[] }
  return (payload.data ?? []).filter(t => t.id).map(t => `/trainers/${t.id}`)
}

type VercelLikeResponse = {
  setHeader:(name: string, value: string) => void
  send:(body: string) => void
  statusCode?: number
}

export default async function sitemapHandler(
  _req: unknown,
  res: VercelLikeResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')

  try {
    const [coursePaths, trainerPaths] = await Promise.all([
      fetchPublishedCoursePaths(),
      fetchActiveTrainerPaths(),
    ])

    const xml = buildSitemapXml({
      staticPaths: ['/', '/courses', '/trainers', '/faq'],
      courseIds: coursePaths.map(p => p.split('/').pop() ?? '').filter(Boolean),
      trainerIds: trainerPaths.map(p => p.split('/').pop() ?? '').filter(Boolean),
      siteUrl: SITEMAP_SITE_URL,
    })
    res.send(xml)
  } catch (err) {
    // Never fail the XML document: serve the static discovery routes only.
    const xml = buildSitemapXml({ siteUrl: SITEMAP_SITE_URL })
    res.send(xml)
  }
}