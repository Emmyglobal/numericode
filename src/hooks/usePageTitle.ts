import { useEffect } from 'react'

/**
 * Sets document.title for each page.
 * Appended with " | NumeriCode" for consistent branding.
 * Screen readers announce the title on route change.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | NumeriCode`
    return () => { document.title = 'NumeriCode — Mathematics & Code, Taught Live' }
  }, [title])
}
