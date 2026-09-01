/**
 * Sitemap XML builder — pure, testable helpers used by the Vercel serverless
 * sitemap endpoint (`api/sitemap.ts`). Kept dependency-free so it runs in
 * both the Node serverless runtime and the Vitest test environment.
 *
 * Only publicly indexable canonical URLs belong in the sitemap:
 *   - static discovery routes (/, /courses, /trainers, /faq)
 *   - published course detail URLs (/courses/:id)
 *   - active Registered Trainer profile URLs (/trainers/:id)
 * Filtered catalogue states (?q=, ?subject=…) are never canonical URLs.
 * Draft/archived courses and inactive trainers never reach this builder —
 * they are filtered out by the public backend endpoints before we even see them.
 */

export const SITEMAP_SITE_URL = 'https://numerycode.com'

/**
 * Single-sitemap size threshold (protocol limit is 50,000 URLs).
 * If the catalogue approaches this, switch to a sitemap index with
 * split files (e.g. /sitemap-courses.xml + /sitemap-trainers.xml).
 */
export const SITEMAP_MAX_URLS = 50_000

export const STATIC_SITEMAP_PATHS: string[] = ['/', '/courses', '/trainers', '/faq']

/** Escape a string for safe inclusion in XML text/attribute content. */
export function escapeXml(value: string): string {
  return value.replace(/[<>&'"']/g, char => {
    switch (char) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '"': return '&quot;'
      case "'":
      default: return '&apos;'
    }
  })
}

export interface SitemapEntry {
  loc: string
  /** ISO date (yyyy-MM-dd). Optional. */
  lastmod?: string
}

/**
 * Build a canonical, deduplicated sitemap document.
 *
 * `courseIds` / `trainerIds` must already be public-only (published courses,
 * active trainers). Only opaque ids are embedded — no private data is serialized.
 */
export function buildSitemapXml(params: {
  staticPaths?: string[]
  courseIds?: string[]
  trainerIds?: string[]
  siteUrl?: string
}): string {
  const siteUrl = (params.siteUrl ?? SITEMAP_SITE_URL).replace(/\/+$/, '')
  const seen = new Set<string>()
  const entries: SitemapEntry[] = []

  const add = (path: string) => {
    const loc = `${siteUrl}/${path.replace(/^\/+/, '')}`
    if (!seen.has(loc)) {
      seen.add(loc)
      entries.push({ loc })
    }
  }

  const staticPaths = params.staticPaths ?? STATIC_SITEMAP_PATHS
  staticPaths.forEach(add)

  ;(params.courseIds ?? []).forEach(id => add(`/courses/${escapeXml(id)}`))
  ;(params.trainerIds ?? []).forEach(id => add(`/trainers/${escapeXml(id)}`))

  const urlTags = entries
    .sort((a, b) => a.loc.localeCompare(b.loc))
    .map(entry => `  <url>\n    <loc>${entry.loc}</loc>\n  </url>`)
    .join('\n')

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${urlTags}\n` +
    '</urlset>\n'
  )
}

/** Convenience — static-only sitemap used when the live API is unreachable. */
export function buildStaticOnlySitemap(siteUrl?: string): string {
  return buildSitemapXml({ staticPaths: STATIC_SITEMAP_PATHS, siteUrl })
}