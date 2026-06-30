import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  tone?: string
}

export function Badge({ children, tone = '' }: BadgeProps) {
  return <span className={`tag ${tone}`.trim()}>{children}</span>
}
