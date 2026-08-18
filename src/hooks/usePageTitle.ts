import { useEffect } from 'react'

/**
 * Sets document.title for each page.
 * Appended with " | NumeryCode" for consistent branding.
 * Screen readers announce the title on route change.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | NumeryCode`
    return () => { document.title = 'NumeryCode — Mathematics & Code, Taught Live' }
  }, [title])
}
