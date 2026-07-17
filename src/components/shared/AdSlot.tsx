import { useEffect } from 'react'

interface AdSlotProps { slot?: string; className?: string }

export function AdSlot({ slot, className = '' }: AdSlotProps) {
  const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined

  useEffect(() => {
    if (!client || !slot) return
    const scriptId = 'google-adsense-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.async = true
      script.crossOrigin = 'anonymous'
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
      document.head.appendChild(script)
    }
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}) } catch { return }
  }, [client, slot])

  if (!client || !slot) return null
  return <aside className={`my-8 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-surface-dark ${className}`} aria-label="Advertisement"><p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">Advertisement</p><ins className="adsbygoogle block" data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" /></aside>
}

declare global { interface Window { adsbygoogle?: unknown[] } }
