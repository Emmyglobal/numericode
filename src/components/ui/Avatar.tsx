import { memo } from 'react'
import { cn } from '@/utils/classNames'
const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl', xl: 'w-24 h-24 text-3xl' }
function Avatar_Base({ name, src, size='md', className }: { name: string; src?: string; size?: 'sm'|'md'|'lg'|'xl'; className?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={cn('overflow-hidden rounded-full bg-brand-blue text-white flex items-center justify-center font-semibold shrink-0', sizes[size], className)}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials}
    </div>
  )
}

export const Avatar = memo(Avatar_Base)
