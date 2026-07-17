import { cn } from '@/utils/classNames'
import type { ReactNode } from 'react'
export function SectionWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16', className)}>{children}</section>
}
