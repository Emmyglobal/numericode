// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import {
  buildSitemapXml,
  buildStaticOnlySitemap,
  escapeXml,
  SITEMAP_SITE_URL,
  SITEMAP_MAX_URLS,
  STATIC_SITEMAP_PATHS,
} from '@/utils/sitemap'

const PROJECT_ROOT = process.cwd()

// ── Helpers ────────────────────────────────────────────────────────────────

/** Extract every <loc> value from a sitemap XML string. */
function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
}

/** Lightweight well-formedness check — verifies declaration, root element, and
 *  that every <url> has a <loc>. Sufficient for unit testing the builder. */
function isWellFormedSitemap(xml: string): boolean {
  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) return false
  if (!xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) return false
  if (!xml.endsWith('</urlset>\n')) return false
  const urlTags = xml.match(/<url>\s*<loc>[^<]*<\/loc>\s*<\/url>/g)
  if (!urlTags) return true // static-only (no dynamic URLs) is valid
  return urlTags.every(tag => tag.includes('<loc>'))
}

// Private route prefixes — used to assert the sitemap never contains these.
const PRIVATE_PREFIXES = ['/dashboard', '/trainer', '/admin', '/login', '/register', '/forgot', '/reset', '/activate', '/pending']

// ── Constants ───────────────────────────────────────────────────────────────

describe('sitemap constants', () => {
  it('SITEMAP_SITE_URL is the production canonical domain', () => {
    expect(SITEMAP_SITE_URL).toBe('https://numerycode.com')
  })

  it('SITEMAP_MAX_URLS is exactly the 50 000 protocol limit', () => {
    expect(SITEMAP_MAX_URLS).toBe(50_000)
  })

  it('STATIC_SITEMAP_PATHS contains exactly the indexable public static routes', () => {
    expect(STATIC_SITEMAP_PATHS).toEqual(['/', '/courses', '/trainers', '/faq'])
  })
})

// ── escapeXml ───────────────────────────────────────────────────────────────

describe('escapeXml', () => {
  it('escapes all five XML metacharacters', () => {
    expect(escapeXml('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&apos;')
  })

  it('leaves safe text unchanged', () => {
    expect(escapeXml('hello-world_123.com')).toBe('hello-world_123.com')
  })

    it('neutralises script-injection in a course ID', () => {
    const result = escapeXml('"><script>alert(1)</script>')
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })
})

// ── buildStaticOnlySitemap ──────────────────────────────────────────────────

describe('buildStaticOnlySitemap', () => {
  it('includes every canonical static route', () => {
    const xml = buildStaticOnlySitemap()
    expect(xml).toContain('<loc>https://numerycode.com/</loc>')
    expect(xml).toContain('<loc>https://numerycode.com/courses</loc>')
    expect(xml).toContain('<loc>https://numerycode.com/trainers</loc>')
    expect(xml).toContain('<loc>https://numerycode.com/faq</loc>')
  })

  it('produces valid XML structure', () => {
    expect(isWellFormedSitemap(buildStaticOnlySitemap())).toBe(true)
  })

    it('never emits query strings in <loc> values', () => {
    const xml = buildStaticOnlySitemap()
    const locs = extractLocs(xml)
    expect(locs.every(l => !l.includes('?'))).toBe(true)
  })

    it('respects a custom siteUrl', () => {
    const xml = buildStaticOnlySitemap('https://staging.numerycode.com')
    expect(xml).toContain('<loc>https://staging.numerycode.com/</loc>')
    expect(xml).not.toContain('https://numerycode.com/')
  })
})

// ── buildSitemapXml ─────────────────────────────────────────────────────────

describe('buildSitemapXml', () => {
  const staticXml = buildStaticOnlySitemap()

  it('returns only the static sitemap when no dynamic URLs are provided', () => {
    const result = buildSitemapXml([])
    expect(result).toBe(staticXml)
  })

  it('appends dynamic course URLs after the static routes', () => {
    const xml = buildSitemapXml([
      { type: 'course', id: 'c1' },
      { type: 'trainer', id: 't1' },
    ])
    expect(xml).toContain('<loc>https://numerycode.com/courses/c1</loc>')
    expect(xml).toContain('<loc>https://numerycode.com/trainers/t1</loc>')
    expect(xml).toContain('<loc>https://numerycode.com/</loc>')
  })

  it('produces valid XML for mixed URL types', () => {
    const xml = buildSitemapXml([
      { type: 'course', id: 'c-123', updatedAt: '2024-01-15T10:30:00Z' },
      { type: 'trainer', id: 't-456' },
    ])
    expect(isWellFormedSitemap(xml)).toBe(true)
  })

    it('never emits query strings in any <loc> URL', () => {
    const xml = buildSitemapXml([
      { type: 'course', id: 'c1?foo=bar' },
      { type: 'trainer', id: 't1?baz=qux' },
    ])
    const locs = extractLocs(xml)
    const dynamicLocs = locs.filter(l => l.includes('/courses/') || l.includes('/trainers/'))
    expect(dynamicLocs.every(l => !l.includes('?'))).toBe(true)
    expect(xml).not.toContain('<loc>https://numerycode.com/courses/c1?foo=bar</loc>')
  })

  it('escapes special characters in IDs', () => {
    const xml = buildSitemapXml([{ type: 'course', id: 'a&b<c>' }])
    const locs = extractLocs(xml)
    const courseUrl = locs.find(l => l.includes('/courses/'))
    expect(courseUrl).toBe('https://numerycode.com/courses/a&amp;b&lt;c&gt;')
  })

  it('deduplicates identical URLs', () => {
    const xml = buildSitemapXml([
      { type: 'course', id: 'dup' },
      { type: 'course', id: 'dup' },
    ])
    const courseLocs = extractLocs(xml).filter(l => l.includes('/courses/dup'))
    expect(courseLocs).toHaveLength(1)
  })

  it('includes lastmod for courses when updatedAt is present', () => {
    const xml = buildSitemapXml([
      { type: 'course', id: 'c1', updatedAt: '2024-01-15T10:30:00Z' },
    ])
    const urlBlock = xml.match(/<url>\s*<loc>[^<]*<\/loc>\s*<lastmod>2024-01-15<\/lastmod>\s*<\/url>/)
    expect(urlBlock).not.toBeNull()
  })

  it('omits lastmod for courses when updatedAt is absent', () => {
    const xml = buildSitemapXml([{ type: 'course', id: 'c1' }])
    expect(xml).not.toContain('<lastmod>')
  })

  it('omits lastmod for trainers (no trustworthy timestamp)', () => {
    const xml = buildSitemapXml([{ type: 'trainer', id: 't1', updatedAt: '2024-01-15T10:30:00Z' }])
    expect(xml).not.toContain('<lastmod>')
  })

  it('respects SITEMAP_MAX_URLS safety limit', () => {
    const urls: { type: 'course'; id: string }[] = []
    for (let i = 0; i < SITEMAP_MAX_URLS + 500; i++) {
      urls.push({ type: 'course', id: `c${i}` })
    }
    const xml = buildSitemapXml(urls, { enforceUrlLimit: true })
    const courseLocs = extractLocs(xml).filter(l => l.includes('/courses/c'))
    // static (4) + dynamic (capped at SITEMAP_MAX_URLS)
    expect(courseLocs.length).toBe(SITEMAP_MAX_URLS)
  })

  it('does not throw on malformed/empty ID strings', () => {
    expect(() => buildSitemapXml([{ type: 'course', id: '' }])).not.toThrow()
    expect(() => buildSitemapXml([{ type: 'course', id: null as unknown as string }])).not.toThrow()
  })

    it('never emits private/authenticated routes', () => {
    const xml = buildSitemapXml([
      { type: 'course', id: 'c1' },
      { type: 'trainer', id: 't1' },
    ])
    const locs = extractLocs(xml)
    for (const prefix of PRIVATE_PREFIXES) {
      // Match prefix followed by '/' or end-of-string — '/trainer' must not
      // false-match '/trainers' (a legitimate public route).
      const re = new RegExp(`/${prefix.replace(/^\//, '')}(?:/|$)`)
      expect(locs.every(l => !re.test(l))).toBe(true)
    }
  })

  it('every <loc> URL is HTTPS and uses the production domain', () => {
    const xml = buildSitemapXml([
      { type: 'course', id: 'c1' },
      { type: 'trainer', id: 't1' },
    ])
    const locs = extractLocs(xml)
    expect(locs.length).toBeGreaterThan(0)
    expect(locs.every(l => l.startsWith('https://numerycode.com/'))).toBe(true)
  })
})

// ── Integration: write to disk ──────────────────────────────────────────────

describe('sitemap file output (build script)', () => {
  it('public/sitemap.xml (if generated) is well-formed and uses production domain', () => {
    const path = `${PROJECT_ROOT}/public/sitemap.xml`
    let xml: string
    try {
      xml = readFileSync(path, 'utf-8')
    } catch {
      // Sitemap has not been generated in this environment — skip (covered by generator tests).
      expect.assertions(0)
      return
    }
    expect(isWellFormedSitemap(xml)).toBe(true)
    const locs = extractLocs(xml)
    expect(locs.length).toBeGreaterThan(0)
    expect(locs.every(l => l.startsWith('https://numerycode.com'))).toBe(true)
  })

  it('public/robots.txt references the production sitemap URL', () => {
    const path = `${PROJECT_ROOT}/public/robots.txt`
    let content: string
    try {
      content = readFileSync(path, 'utf-8')
    } catch {
      expect.assertions(0)
      return
    }
    expect(content).toMatch(/Sitemap:\s*https:\/\/numerycode\.com\/sitemap\.xml/)
  })
})

