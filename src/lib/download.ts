/**
 * Shared helpers for triggering local file downloads — resources, lesson
 * notes, assignments, certificates and other documents.
 *
 * Everything runs in the browser: we build a Blob and programmatically click
 * an <a download href=blob:…> element, or fetch remote bytes so the file is
 * saved locally even for cross-origin URLs (the anchor `download` attribute
 * is ignored across origins, so we always go through a Blob).
 */

/** Turn a user-facing title / URL / code into a safe file name. */
export function sanitizeFilename(name: string, fallback = 'document', ext = ''): string {
  const base =
    name
      .trim()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || fallback
  return ext ? `${base}.${ext.replace(/^\./, '')}` : base
}

function clickAnchor(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Free the object URL on a tick so the download has already started.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Download raw content as a text file (markdown notes, assignments, etc). */
export function downloadText(filename: string, content: string, mime = 'text/plain') {
  clickAnchor(new Blob([content], { type: `${mime};charset=utf-8` }), filename)
}

/** Download a printable HTML document (e.g. a certificate designed for print/PDF). */
export function downloadHtml(filename: string, html: string) {
  downloadText(filename, html, 'text/html')
}

/** Escape HTML special characters — used when embedding data into documents. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Download a file from a URL. Remote bytes are fetched into a Blob first so
 * the file is saved locally regardless of origin.
 *
 * Placeholder URLs (`#`, empty, `javascript:`) — common in mock/demo data —
 * fall back to writing `fallbackContent` as a text file so the button remains
 * functional and clearly explains that nothing is attached.
 */
export async function downloadUrl(
  url: string,
  filename: string,
  fallbackContent?: string,
): Promise<void> {
  const trimmed = (url || '').trim()
  if (!trimmed || trimmed === '#' || trimmed.startsWith('javascript:')) {
    downloadText(
      filename,
      fallbackContent ?? 'No downloadable content is attached to this item yet.',
    )
    return
  }

  try {
    const res = await fetch(trimmed)
    if (!res.ok) {
      downloadText(
        filename,
        fallbackContent ?? `The file could not be downloaded (server responded ${res.status}).`,
      )
      return
    }
    clickAnchor(await res.blob(), filename)
  } catch {
    downloadText(
      filename,
      fallbackContent ?? 'The file could not be downloaded. Please try again later.',
    )
  }
}
