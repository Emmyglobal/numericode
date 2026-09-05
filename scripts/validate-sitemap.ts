import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { toLastmod } from '../src/utils/sitemap.ts'

const __dirname = resolve(fileURLToPath(import.meta.url), '..')
const PROJECT_ROOT = resolve(__dirname, '..')
const SITEMAP_PATH = resolve(PROJECT_ROOT, 'public', 'sitemap.xml')

const resolveApiBase = (): string => {
  const configured = process.env.VITE_API_BASE_URL
  if (configured && !configured.startsWith('/')) return configured.replace(/\/+$|\/$/g, '')
  return 'https://numericode-api.onrender.com/api'
}

function parseSitemap(xml: string) {
  const locRe = /<loc>([^<]+)<\/loc>/g
  const lastmodRe = /<url>\s*<loc>[^<]+<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?\s*<\/url>/g

  const urls: { loc: string; lastmod?: string }[] = []

  // naive but reliable for our generated sitemap structure
  const urlBlocks = xml.split(/<url>|<\/url>/).filter(Boolean)
  for (const block of urlBlocks) {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/)
    if (!locMatch) continue
    const lastmodMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/)
    urls.push({ loc: locMatch[1].trim(), lastmod: lastmodMatch ? lastmodMatch[1].trim() : undefined })
  }
  return urls
}

async function fetchAllPublishedCourses(apiBase: string) {
  const pageSize = 50
  const ids: string[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const url = `${apiBase}/courses?limit=${pageSize}&offset=${offset}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`GET /courses returned ${res.status} for ${url}`)
    const payload = await res.json()
    const data = payload.data ?? []
    for (const c of data) {
      if (c && c.id) ids.push(c.id)
    }
    hasMore = Boolean(payload.pagination?.hasMore)
    offset += pageSize
  }
  return ids
}

async function main() {
  const apiBase = resolveApiBase()

  let xml: string
  try {
    xml = readFileSync(SITEMAP_PATH, 'utf-8')
  } catch (err) {
    console.error('[sitemap:validate] Could not read sitemap at', SITEMAP_PATH)
    process.exit(1)
    return
  }

  const urls = parseSitemap(xml)

  // Filters
  const courseUrls = urls.filter(u => u.loc.includes('/courses/'))
  const trainerUrls = urls.filter(u => u.loc.includes('/trainers/'))

  // No query strings allowed
  const queryUrls = urls.filter(u => u.loc.includes('?') || u.loc.includes('#'))
  if (queryUrls.length > 0) {
    console.error('[sitemap:validate] ❌ Found query/hash URLs in sitemap:')
    console.error(queryUrls.map(u => u.loc).join('\n'))
    process.exit(1)
  }

  // No duplicates
  const locs = urls.map(u => u.loc)
  const dups = locs.filter((v, i, a) => a.indexOf(v) !== i)
  if (dups.length > 0) {
    console.error('[sitemap:validate] ❌ Duplicate URLs found:')
    console.error([...new Set(dups)].join('\n'))
    process.exit(1)
  }

  // Build course id set from sitemap
  const sitemapCourseIds = courseUrls.map(u => {
    const parts = new URL(u.loc).pathname.split('/')
    return parts[parts.length - 1]
  })

  // Fetch published courses from API
  const publishedCourseIds = await fetchAllPublishedCourses(apiBase)

  // Check every published course appears in sitemap
  const missing = publishedCourseIds.filter(id => !sitemapCourseIds.includes(id))
  if (missing.length > 0) {
    console.error('[sitemap:validate] ❌ Published courses missing from sitemap:')
    console.error(missing.join('\n'))
    process.exit(1)
  }

  // Check every sitemap course corresponds to a published course
  const extra = sitemapCourseIds.filter(id => !publishedCourseIds.includes(id))
  if (extra.length > 0) {
    console.error('[sitemap:validate] ❌ Sitemap contains course URLs not present in published courses:')
    console.error(extra.join('\n'))
    process.exit(1)
  }

  // Verify lastmod presence/format: for each course in sitemap, fetch course from API and compare
  for (const cu of courseUrls) {
    const url = new URL(cu.loc)
    const id = url.pathname.split('/').pop() || ''
    const res = await fetch(`${apiBase}/courses/${id}`)
    if (!res.ok) {
      console.error(`[sitemap:validate] ❌ GET /courses/${id} returned ${res.status}`)
      process.exit(1)
    }
    const payload = await res.json()
    const course = payload.data
    const apiUpdatedAt = course?.updatedAt ?? course?.updated_at
    const sitemapLastmod = cu.lastmod
    if (apiUpdatedAt) {
      if (!sitemapLastmod) {
        console.error(`[sitemap:validate] ❌ Course ${id} has updatedAt in API but missing <lastmod> in sitemap`)
        process.exit(1)
      }
      const coerced = toLastmod(apiUpdatedAt)
      if (!coerced) {
        console.error(`[sitemap:validate] ❌ Course ${id} returned invalid updatedAt from API: ${apiUpdatedAt}`)
        process.exit(1)
      }
      if (coerced !== sitemapLastmod) {
        console.error(`[sitemap:validate] ❌ Course ${id} sitemap <lastmod> (${sitemapLastmod}) does not match API updatedAt (${coerced})`)
        process.exit(1)
      }
    } else {
      if (sitemapLastmod) {
        console.error(`[sitemap:validate] ❌ Course ${id} has no updatedAt in API but sitemap contains <lastmod>`)
        process.exit(1)
      }
    }
  }

  // Trainers must not have lastmod (the sitemap builder already omits them)
  const trainerWithLastmod = trainerUrls.filter(t => {
    const block = urls.find(u => u.loc === t.loc)
    return Boolean(block && block.lastmod)
  })
  if (trainerWithLastmod.length > 0) {
    console.error('[sitemap:validate] ❌ Trainer URLs must not include <lastmod>:')
    console.error(trainerWithLastmod.map(t => t.loc).join('\n'))
    process.exit(1)
  }

  console.log('[sitemap:validate] ✅ Sitemap validation passed')
}

main().catch(err => {
  console.error('[sitemap:validate] Unhandled error:', err)
  process.exit(1)
})
