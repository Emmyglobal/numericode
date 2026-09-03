import { useEffect } from 'react'

/**
 * Reusable JSON-LD structured-data helper.
 *
 * Injects a single `<script type="application/ld+json">` element into
 * `<head>` with the given id, and removes it on unmount. Escapes `<` so that
 * user-provided text can never break out of the script tag.
 *
 * Usage:
 *   useJsonLd('jsonld-my-schema', { '@context': 'https://schema.org', '@type': 'Course', ... })
 */
export function useJsonLd(id: string, data: Record<string, unknown> | null): void {
  useEffect(() => {
    // Guard for non-DOM environments (Node test env without jsdom, SSR).
    if (typeof document === 'undefined') return

    if (data === null) {
      // Caller signalled "no schema" — ensure any stale instance is removed.
      document.getElementById(id)?.remove()
      return
    }
    let script = document.getElementById(id) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = id
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c')

    // Cleanup on unmount or when id/data changes.
    return () => { document.getElementById(id)?.remove() }
  }, [id, data])
}

/**
 * Marks the current page as non-indexable for search engines.
 *
 * Injects `<meta name="robots" content="noindex, nofollow">` into `<head>`
 * and removes it on unmount. Safe to call from multiple private layouts —
 * subsequent calls reuse the same meta element.
 *
 * Usage:
 *   useNoIndex()  // call at the top of any private/layout component
 */
export function useNoIndex(): void {
  useEffect(() => {
    // Guard for non-DOM environments (Node test env without jsdom, SSR).
    if (typeof document === 'undefined') return

    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex, nofollow')
  })
}
