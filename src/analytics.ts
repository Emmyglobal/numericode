declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const adsId = import.meta.env.VITE_GOOGLE_ADS_ID
const signupConversionLabel = import.meta.env.VITE_GOOGLE_ADS_SIGNUP_LABEL

export function initializeGoogleAds() {
  if (!adsId || document.querySelector(`[data-google-ads-id="${adsId}"]`)) {
    return
  }

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', adsId)

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(adsId)}`
  script.dataset.googleAdsId = adsId
  document.head.appendChild(script)
}

export function trackSignupConversion() {
  if (!adsId || !signupConversionLabel || !window.gtag) {
    return
  }

  window.gtag('event', 'conversion', {
    send_to: `${adsId}/${signupConversionLabel}`,
  })
}
