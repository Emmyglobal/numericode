import type { AnchorHTMLAttributes, ReactNode } from 'react'

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ children, className = '', variant = 'secondary', ...props }: ButtonProps) {
  return (
    <a className={`button button-${variant} ${className}`.trim()} {...props}>
      {children}
    </a>
  )
}
