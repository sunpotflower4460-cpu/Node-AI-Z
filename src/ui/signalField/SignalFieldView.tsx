import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { buildSignalFieldViewModel } from './buildSignalFieldViewModel'
import { SignalFieldCanvas } from './SignalFieldCanvas'
import { SignalFieldLegend } from './SignalFieldLegend'
import { SignalFieldStatsPanel } from './SignalFieldStatsPanel'
import { ParticleActivationList } from './ParticleActivationList'
import { AssemblyOverlayPanel } from './AssemblyOverlayPanel'
import { BridgeOverlayPanel } from './BridgeOverlayPanel'
import { EmptyState } from '../shared/EmptyState'

type SignalFieldViewProps = {
  source: SignalOverviewSource | null
  detailMode: UiDetailMode
}

export const SignalFieldView = ({ source, detailMode }: SignalFieldViewProps) => {
  if (!source) {
    return (
      <EmptyState
        title="Signal Field のデータがありません。"
        description="New Signal Mode で Analyze を実行すると Signal Field の観察データが表示されます。"
      />
    )
  }

  const viewModel = buildSignalFieldViewModel(source)
  const isResearch = detailMode === 'research'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Signal Field</h2>
        <p className="mt-1 text-xs text-slate-400">
          点群・発火・assembly・bridge のリアルタイム状態
        </p>
      </div>

      <SignalFieldStatsPanel summary={viewModel.summary} />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-3">
          <SignalFieldCanvas
            particles={viewModel.particles}
            assemblies={viewModel.assemblies}
            bridges={viewModel.bridges}
          />
          <SignalFieldLegend />
        </div>

        <div className="flex flex-col gap-4">
          <section>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Active Particles
            </h3>
            <ParticleActivationList particles={viewModel.particles} researchMode={isResearch} />
          </section>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Assemblies
          </h3>
          <AssemblyOverlayPanel assemblies={viewModel.assemblies} researchMode={isResearch} />
        </section>

        <section>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Bridges
          </h3>
          <BridgeOverlayPanel bridges={viewModel.bridges} researchMode={isResearch} />
        </section>
      </div>
    </div>
  )
}
