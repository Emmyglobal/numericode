/**
 * Formats a course price given in cents using the course currency.
 * Falls back to a plain "amount CURRENCY" string for unknown currency codes.
 */
export function formatCoursePrice(priceCents: number, currency?: string | null): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(priceCents / 100)
  } catch {
    return `${(priceCents / 100).toFixed(2)} ${currency || 'USD'}`
  }
}