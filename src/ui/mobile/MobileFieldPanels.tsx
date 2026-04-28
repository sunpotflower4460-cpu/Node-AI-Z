import type { UiDetailMode } from '../mode/modeUiTypes'
import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import { buildSignalFieldViewModel } from '../signalField/buildSignalFieldViewModel'
import { SignalFieldCanvas } from '../signalField/SignalFieldCanvas'
import { SignalPulseLegend } from '../visual/SignalPulseLegend'
import { EmptyGrowthIllustration } from '../visual/EmptyGrowthIllustration'
import { CollapsibleSection } from '../layout/CollapsibleSection'

type MobileFieldPanelsProps = {
  source: SignalOverviewSource | null
  detailMode: UiDetailMode
}

export const MobileFieldPanels = ({ source }: MobileFieldPanelsProps) => {
  if (!source) {
    return (
      <div className="px-3 py-4">
        <EmptyGrowthIllustration
          message="Signal Field のデータがありません。"
          hint="New Signal Mode で Analyze を実行すると Signal Field の観察データが表示されます。"
        />
      </div>
    )
  }

  const viewModel = buildSignalFieldViewModel(source)

  return (
    <div className="flex flex-col gap-4 px-3 py-4">
      <SignalFieldCanvas
        particles={viewModel.particles}
        assemblies={viewModel.assemblies}
        bridges={viewModel.bridges}
      />
      <CollapsibleSection title="凡例" defaultOpen={false}>
        <SignalPulseLegend />
      </CollapsibleSection>
      <CollapsibleSection title="Stats" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <span>Particles: {viewModel.summary.particleCount}</span>
          <span>Active: {viewModel.summary.activeParticleCount}</span>
          <span>Assemblies: {viewModel.summary.assemblyCount}</span>
          <span>Bridges: {viewModel.summary.bridgeCount}</span>
        </div>
      </CollapsibleSection>
    </div>
  )
}
