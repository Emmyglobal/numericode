import type { ReactNode } from 'react'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { usePageTitle } from '@/hooks/usePageTitle'

interface LegalPageLayoutProps {
  title: string          // e.g. "Terms of Service" — drives <title> via usePageTitle
  version: string        // policy version, e.g. "1.0"
  updated: string        // human-readable "Last updated" label
  children: ReactNode
}

/**
 * Shared layout for public legal documents (Terms, Privacy, Acceptable Use).
 * Keeps consistent typography, an explicit legal-review disclaimer, and a
 * version marker so visitors (and the consent audit trail) know which document
 * they read. Content is product/legal draft text — NOT legal advice.
 */
export function LegalPageLayout({ title, version, updated, children }: LegalPageLayoutProps) {
  usePageTitle(title)

  return (
    <div className="py-12 sm:py-16">
      <SectionWrapper className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue mb-3">NumeryCode · Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Version {version} · {updated}
        </p>

        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4 text-sm text-amber-900 dark:text-amber-200 mb-8">
          <strong className="font-semibold">Important:</strong> This document is provided as a product/legal{" "}
          <em>draft</em> for review. It is not legal advice and does not replace formal legal counsel. Please have it
          reviewed by a qualified lawyer in the jurisdictions where NumeryCode operates before relying on it.
        </div>

        <div className="prose prose-slate max-w-none dark:prose-invert space-y-6">{children}</div>
      </SectionWrapper>
    </div>
  )
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{heading}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{children}</div>
    </section>
  )
}

/** Section heading that renders as an H3 for proper document outline. */
export function LegalSubsection({ id, heading, children }: {
  id?: string
  heading: string
  children: ReactNode
}) {
  return (
    <section id={id}>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{heading}</h3>
      <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 space-y-3">{children}</div>
    </section>
  )
}