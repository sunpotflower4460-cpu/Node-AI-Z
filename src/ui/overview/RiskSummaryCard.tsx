import type { SignalOverviewViewModel } from './buildSignalOverviewViewModel'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { RiskBadge } from '../shared/RiskBadge'

const metricLevel = (value: number): 'low' | 'medium' | 'high' => (
  value >= 0.7 ? 'high' : value >= 0.4 ? 'medium' : 'low'
)

type RiskSummaryCardProps = {
  risk: SignalOverviewViewModel['risk']
  detailMode: UiDetailMode
}

export const RiskSummaryCard = ({ risk, detailMode }: RiskSummaryCardProps) => {
  const metrics = [
    { label: 'Overbinding Risk', value: risk.overbindingRisk },
    { label: 'False Binding Risk', value: risk.falseBindingRisk },
    { label: 'Teacher Overtrust Risk', value: risk.teacherOvertrustRisk },
    { label: 'Dream Noise Risk', value: risk.dreamNoiseRisk },
  ]

  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-5 shadow-[0_18px_50px_-30px_rgba(244,63,94,0.28)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Risk Summary</p>
          <p className="mt-1 text-sm text-slate-300">危険な過結合や teacher 過信をまとめて確認</p>
        </div>
        <RiskBadge level={risk.level} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs font-semibold text-slate-300">{metric.label}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <RiskBadge level={metricLevel(metric.value)} />
              {detailMode === 'research' ? <span className="text-xs font-bold text-slate-400">{metric.value.toFixed(2)}</span> : null}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-200">{risk.summary}</p>
      {risk.warnings.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm text-slate-300">
          {risk.warnings.map((warning) => <li key={warning}>• {warning}</li>)}
        </ul>
      ) : null}
    </section>
  )
}
