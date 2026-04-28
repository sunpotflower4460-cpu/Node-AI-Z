import type { ReactNode } from 'react'

type StatusBadgeProps = {
  children: ReactNode
  className?: string
}

export const StatusBadge = ({ children, className = '' }: StatusBadgeProps) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${className}`}>{children}</span>
)
