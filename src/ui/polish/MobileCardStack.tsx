import type { ReactNode } from 'react'

/**
 * MobileCardStack — wraps a vertical list of cards with consistent mobile spacing.
 *
 * Rules:
 * - Unified card gap
 * - No unnecessary overflow
 * - Semantic section wrapper for accessibility
 */
type MobileCardStackProps = {
  children: ReactNode
  /** aria-label for the stack section */
  label?: string
  /** Additional Tailwind classes */
  className?: string
}

export const MobileCardStack = ({ children, label, className = '' }: MobileCardStackProps) => (
  <section
    aria-label={label}
    className={`flex flex-col gap-4 ${className}`}
  >
    {children}
  </section>
)
