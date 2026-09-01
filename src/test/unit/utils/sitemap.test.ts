// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildSitemapXml,
  buildStaticOnlySitemap,
  escapeXml,
  SITEMAP_SITE_URL,
  SITEMAP_MAX_URLS,
  STATIC_SITEMAP_PATHS,
} from '@/utils/sitemap'

const PROJECT_ROOT = process.cwd()
describe('sitemap - static discovery routes', () => {
  it('includes every canonical static route', () => {
    const xml = buildStaticOnlySitemap()
    expect(xml).toContain('<loc>https://numerycode.com/</loc>')
    expect(xml).toContain('<loc>https://numerycode.com/courses</loc>')
    expect(xml).toContain('<loc>https://numerycode.com/trainers</loc>')
    expect(xml).toContain('<loc>https://numerycode.com/faq</loc>')
  })

  it('exposes exactly the indexable public static routes', () => {
    expect(STATIC_SITEMAP_PATHS).toEqual(['/', '/courses', '/trainers', '/faq'])
  })

 it('never emits filtered catalogue URLs (no query strings)', () => {
    expect(buildStaticOnlySitemap()).not.toContain('?')
  })
})