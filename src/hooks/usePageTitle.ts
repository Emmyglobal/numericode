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
}

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
 */
export function usePageTitle(title: string, options?: PageTitleOptions) {
  useEffect(() => {
    document.title = options?.brand ? DEFAULT_TITLE : `${title} | NumeryCode`
    setMetaDescription(options?.description ?? DEFAULT_DESCRIPTION)
    setCanonical(options?.canonical ?? '/')
    return () => {
      document.title = DEFAULT_TITLE
      setMetaDescription(DEFAULT_DESCRIPTION)
      setCanonical('/')
    }
  }, [title, options?.brand, options?.description, options?.canonical])
}
