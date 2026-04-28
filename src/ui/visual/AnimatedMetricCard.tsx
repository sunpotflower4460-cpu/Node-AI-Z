import type { ReactNode } from 'react'

type AnimatedMetricCardProps = {
  label: string
  value: string
  description?: string
  toneClass?: string
  meta?: ReactNode
  pulse?: boolean
}

export const AnimatedMetricCard = ({
  label,
  value,
  description,
  toneClass = 'border-slate-800 bg-slate-950/90',
  meta,
  pulse = false,
}: AnimatedMetricCardProps) => (
  <article
    className={`rounded-3xl border p-4 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.9)] transition-all duration-300 ${toneClass} ${pulse ? 'ring-1 ring-cyan-500/30' : ''}`}
  >
    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
    <p className={`mt-3 text-3xl font-black tracking-tight text-white ${pulse ? 'animate-pulse' : ''}`}>
      {value}
    </p>
    {description ? <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p> : null}
    {meta ? <div className="mt-3 text-xs font-medium text-slate-400">{meta}</div> : null}
  </article>
)
