import { ArrowRight, GaugeCircle } from 'lucide-react'
import type { SignalOverviewViewModel } from '../overview/buildSignalOverviewViewModel'
import { DevelopmentProgressBar } from './DevelopmentProgressBar'
import { DevelopmentRequirementList } from './DevelopmentRequirementList'

type DevelopmentStageCardProps = {
  development: SignalOverviewViewModel['development']
  researchMode?: boolean
}

export const DevelopmentStageCard = ({ development, researchMode = false }: DevelopmentStageCardProps) => (
  <section className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-5 shadow-[0_18px_50px_-30px_rgba(34,211,238,0.35)]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Development Dashboard</p>
        <h3 className="mt-2 text-xl font-black tracking-tight text-white">{development.currentStage}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{development.stageSummary}</p>
      </div>
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-100">
        <GaugeCircle className="h-5 w-5" />
      </div>
    </div>

    <div className="mt-5 space-y-4">
      <DevelopmentProgressBar progress={development.progress} />
      {development.nextStage ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200">
          <ArrowRight className="h-3.5 w-3.5 text-cyan-300" />
          Next Stage: {development.nextStage}
        </div>
      ) : null}
      <DevelopmentRequirementList requirements={development.requirements} researchMode={researchMode} />
      {development.bottlenecks.length > 0 ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Bottlenecks</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {development.bottlenecks.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  </section>
)
