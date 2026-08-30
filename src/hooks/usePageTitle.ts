import { useEffect } from 'react'

const SITE_URL = 'https://numerycode.com'
const DEFAULT_TITLE = 'NumeryCode | Learn Mathematics & Programming Online'
const DEFAULT_DESCRIPTION = 'NumeryCode is an online learning platform for Mathematics, Programming and technology, connecting learners with structured courses and registered trainers.'

interface PageTitleOptions {
  /** Meta description for this page (falls back to the site default). */
  description?: string
  /** Page path used to build the canonical URL (e.g. "/terms"). Defaults to "/". */
  canonical?: string
  /** Use the site's default branded title verbatim (for the homepage). */
  brand?: boolean
  /** Open Graph overrides for dynamic pages (e.g. a specific course). */
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  /** Full absolute URL for og:url (e.g. "https://numerycode.com/courses/123"). */
  ogUrl?: string
}

const OG_PROPERTIES = ['og:title', 'og:description', 'og:image', 'og:url'] as const

function setMetaDescription(content: string) {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (meta) meta.setAttribute('content', content)
}

function setCanonical(path: string) {
  const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (link) link.setAttribute('href', `${SITE_URL}${path}`)
}

/**
 * Sets document.title for each page, appended with " | NumeryCode" for
 * consistent branding, plus optional meta-description and canonical URL.
 * Screen readers announce the title on route change.
 *
 * When og* options are provided, the matching Open Graph meta tags are
 * updated for this page and restored to their site defaults on unmount,
 * so site-level SEO is never permanently altered.
 */
export function usePageTitle(title: string, options?: PageTitleOptions) {
  useEffect(() => {
    document.title = options?.brand ? DEFAULT_TITLE : `${title} | NumeryCode`
    setMetaDescription(options?.description ?? DEFAULT_DESCRIPTION)
    setCanonical(options?.canonical ?? '/')

    // Dynamic Open Graph overrides (restored on cleanup)
    const ogValues: Partial<Record<(typeof OG_PROPERTIES)[number], string | undefined>> = {
      'og:title': options?.ogTitle,
      'og:description': options?.ogDescription,
      'og:image': options?.ogImage,
      'og:url': options?.ogUrl,
    }
    const originals: Array<[string, string | null]> = []
    for (const property of OG_PROPERTIES) {
      const value = ogValues[property]
      if (value === undefined) continue
      const meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
      if (!meta) continue
      originals.push([property, meta.getAttribute('content')])
      meta.setAttribute('content', value)
    }

    return () => {
      document.title = DEFAULT_TITLE
      setMetaDescription(DEFAULT_DESCRIPTION)
      setCanonical('/')
      for (const [property, original] of originals) {
        const meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
        if (meta && original !== null) meta.setAttribute('content', original)
      }
    }
  }, [title, options?.brand, options?.description, options?.canonical, options?.ogTitle, options?.ogDescription, options?.ogImage, options?.ogUrl])
}
