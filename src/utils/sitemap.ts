/**
 * Sitemap XML builder — pure, testable helpers shared by:
 *   - `api/sitemap.ts` (Vercel serverless function, runtime generation)
 *   - `scripts/generate-sitemap.ts` (build-time static generation)
 *   - Vitest unit tests
 *
 * Kept dependency-free so it runs in the Node serverless runtime, the Node
 * build script, and the Vitest test environment alike.
 *
 * Only publicly indexable canonical URLs belong in the sitemap:
 *   - static discovery routes (/, /courses, /trainers, /faq)
 *   - published course detail URLs (/courses/:id)
 *   - active Registered Trainer profile URLs (/trainers/:id)
 * Filtered catalogue states (?q=, ?subject=…) are never canonical URLs.
 * Draft/archived courses and inactive trainers never reach this builder —
 * they are filtered out by the public backend endpoints before we even see them.
 */

/** Production canonical domain — single source of truth. */
export const SITEMAP_SITE_URL = 'https://numerycode.com'

/**
 * Single-sitemap size threshold (protocol limit is 50,000 URLs).
 * If the catalogue approaches this, switch to a sitemap index with
 * split files (e.g. /sitemap-courses.xml + /sitemap-trainers.xml).
 */
export const SITEMAP_MAX_URLS = 50_000

/** Canonical, indexable static routes only. */
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

/**
 * A single dynamic URL entry. `updatedAt` is the only field that may become a
 * `<lastmod>` tag — and it is only emitted for courses (Part 8 of Phase 8).
 */
export interface SitemapUrlEntry {
  type: 'course' | 'trainer'
  id: string
  /**
   * Trustworthy last-modified timestamp in ISO 8601 or yyyy-MM-dd form.
   * Optional — if absent or untrustworthy the <lastmod> tag is omitted
   * (per Part 8: "Do NOT fabricate lastmod timestamps").
   */
  updatedAt?: string
}

/** Options accepted by {@link buildSitemapXml}. */
export interface BuildSitemapOptions {
  /** Override the canonical domain (for staging / testing). */
  siteUrl?: string
  /**
   * When true, cap the number of dynamic URLs at {@link SITEMAP_MAX_URLS}
   * to guard against runaway generation. Enabled by the build script and
   * the serverless function.
   */
  enforceUrlLimit?: boolean
}

export interface SitemapEntry {
  loc: string
  /** ISO date (yyyy-MM-dd). Optional. */
  lastmod?: string
}

/**
 * Coerce an ISO-8601 or yyyy-MM-dd timestamp into the sitemap <lastmod>
 * format (yyyy-MM-dd). Returns `undefined` if the input is not a valid date.
 */
export function toLastmod(isoOrDate: string | undefined): string | undefined {
  if (!isoOrDate) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) return isoOrDate
  const parsed = new Date(isoOrDate)
  if (Number.isNaN(parsed.getTime())) return undefined
  const yyyy = parsed.getUTCFullYear()
  const mm = String(parsed.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(parsed.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Build a canonical, deduplicated sitemap document.
 *
 * Only static discovery routes + the supplied dynamic entries are emitted.
 * Callers (the API handler / build script) must ensure that `entries` contains
 * only published courses and active trainers — filtering happens upstream
 * against the public API endpoints that already enforce visibility rules.
 */
export function buildSitemapXml(
  entries: SitemapUrlEntry[],
  options?: BuildSitemapOptions,
): string {
  const siteUrl = (options?.siteUrl ?? SITEMAP_SITE_URL).replace(/\/+$/, '')
  const seen = new Set<string>()
  const sitemapEntries: SitemapEntry[] = []

  const add = (path: string, lastmod?: string) => {
    const loc = `${siteUrl}/${path.replace(/^\/+/, '')}`
    if (seen.has(loc)) return
    seen.add(loc)
    sitemapEntries.push(lastmod ? { loc, lastmod } : { loc })
  }

          // Static discovery routes — always present.
  STATIC_SITEMAP_PATHS.forEach(path => add(path))

  // Strip any query-string portion — opaque IDs must never carry filters
  // or tracking parameters into the sitemap.
  const sanitizeId = (id: string): string => escapeXml(id.split('?')[0].split('#')[0])

  // Dynamic entries. Cap at the protocol limit when requested.
  const dynamic = options?.enforceUrlLimit
    ? entries.slice(0, Math.min(entries.length, SITEMAP_MAX_URLS))
    : entries

  dynamic.forEach(entry => {
    if (!entry.id || !entry.id.trim()) return
    const safeId = sanitizeId(entry.id)
    if (!safeId) return
    if (entry.type === 'course') {
      // lastmod only for courses, and only if a trustworthy timestamp exists.
      add(`/courses/${safeId}`, toLastmod(entry.updatedAt))
    } else {
      // Trainers: no lastmod (Part 8 — no trustworthy timestamp in the API).
      add(`/trainers/${safeId}`)
    }
  })

  const urlTags = sitemapEntries
    .sort((a, b) => a.loc.localeCompare(b.loc))
    .map(entry => {
      const locTag = `    <loc>${entry.loc}</loc>`
      const lastmodTag = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''
      return `  <url>\n${locTag}${lastmodTag}\n  </url>`
    })
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
  return buildSitemapXml([], { siteUrl })
}