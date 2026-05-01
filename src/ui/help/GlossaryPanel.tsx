import { buildGlossaryViewModel } from './buildGlossaryViewModel'

type GlossaryPanelProps = {
  showResearchNotes?: boolean
}

export const GlossaryPanel = ({ showResearchNotes = false }: GlossaryPanelProps) => {
  const { entries } = buildGlossaryViewModel()

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">用語集</p>
      <dl className="flex flex-col gap-4">
        {entries.map((entry) => (
          <div key={entry.term} className="flex flex-col gap-0.5">
            <dt className="text-sm font-semibold text-slate-200">
              {entry.term}
              {showResearchNotes && entry.researchNote ? (
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {entry.researchNote}
                </span>
              ) : null}
            </dt>
            <dd className="text-xs leading-relaxed text-slate-400">{entry.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
