type StickyTabHeaderProps = {
  tabLabel: string
  engineLabel?: string
  stageLabel?: string
  riskLabel?: string
}

export const StickyTabHeader = ({
  tabLabel,
  engineLabel,
  stageLabel,
  riskLabel,
}: StickyTabHeaderProps) => {
  const parts = [tabLabel, engineLabel, stageLabel, riskLabel]
    .filter((p): p is string => Boolean(p))

  return (
    <div className="sticky top-[84px] z-10 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm md:top-[120px]">
      {parts.map((part, index) => (
        <span key={part} className="flex items-center gap-1">
          {index > 0 ? (
            <span className="text-slate-300" aria-hidden="true">｜</span>
          ) : null}
          <span className="text-xs font-semibold text-slate-600">{part}</span>
        </span>
      ))}
    </div>
  )
}
