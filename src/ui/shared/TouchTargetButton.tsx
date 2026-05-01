import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * TouchTargetButton — a button with guaranteed minimum touch target size.
 * Primary: min-height 44px. Small: min-height 36px.
 *
 * Wraps a <button> so all touch targets meet mobile accessibility guidelines.
 */
type TouchTargetButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type TouchTargetButtonSize = 'md' | 'sm'

type TouchTargetButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: TouchTargetButtonVariant
  size?: TouchTargetButtonSize
}

const VARIANT_CLASS: Record<TouchTargetButtonVariant, string> = {
  primary: 'bg-cyan-500 text-white hover:bg-cyan-400 active:bg-cyan-600',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  danger: 'bg-red-500 text-white hover:bg-red-400 active:bg-red-600',
}

const SIZE_CLASS: Record<TouchTargetButtonSize, string> = {
  md: 'min-h-[44px] px-4 text-sm font-semibold',
  sm: 'min-h-[36px] px-3 text-xs font-semibold',
}

export const TouchTargetButton = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: TouchTargetButtonProps) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-1.5 rounded-xl transition-colors ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
)
