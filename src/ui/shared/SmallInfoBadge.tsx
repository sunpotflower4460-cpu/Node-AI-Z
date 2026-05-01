type SmallInfoBadgeProps = {
  label: string
  variant?: 'default' | 'cyan' | 'violet' | 'emerald' | 'amber'
}

const VARIANT_CLASSES: Record<NonNullable<SmallInfoBadgeProps['variant']>, string> = {
  default: 'border-slate-700 bg-slate-800 text-slate-300',
  cyan: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100',
  violet: 'border-violet-400/40 bg-violet-500/15 text-violet-100',
  emerald: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
  amber: 'border-amber-400/40 bg-amber-500/15 text-amber-100',
}

export const SmallInfoBadge = ({ label, variant = 'default' }: SmallInfoBadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${VARIANT_CLASSES[variant]}`}
  >
    {label}
  </span>
)
