/**
 * SoftDivider — a subtle horizontal separator between sections.
 */
type SoftDividerProps = {
  className?: string
}

export const SoftDivider = ({ className = '' }: SoftDividerProps) => (
  <hr className={`border-slate-100 ${className}`} />
)
