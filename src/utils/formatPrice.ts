/**
 * Formats a course price in Nigerian Naira (₦).
 *
 * NumeryCode prices are stored in kobo (subunits) and charged in NGN — the
 * platform always displays Naira regardless of any legacy currency value.
 * `currencyDisplay: 'narrowSymbol'` forces the ₦ glyph instead of the
 * ISO code ("NGN 5,000.00") across locales.
 */
export function formatCoursePrice(priceCents: number, _currency?: string | null): string {
  const naira = (priceCents / 100)
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      currencyDisplay: 'narrowSymbol',
    }).format(naira)
  } catch {
    return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}