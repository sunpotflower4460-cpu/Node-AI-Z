import { useState } from 'react'
import type { SignalAblationConfig, SignalAblationComparison } from '../../signalAblation/signalAblationTypes'
import { createDefaultAblationConfig } from '../../signalAblation/createDefaultAblationConfig'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { buildAblationComparisonViewModel } from './buildAblationViewModel'
import { AblationConfigPanel } from './AblationConfigPanel'
import { AblationComparisonPanel } from './AblationComparisonPanel'
import { EmptyState } from '../shared/EmptyState'
import { SectionHeader } from '../shared/SectionHeader'

type AblationViewProps = {
  detailMode: UiDetailMode
  comparison?: SignalAblationComparison | null
  onRunAblation?: (ablationConfig: SignalAblationConfig) => Promise<void>
}

export const AblationView = ({
  detailMode,
  comparison = null,
  onRunAblation,
}: AblationViewProps) => {
  const [ablationConfig, setAblationConfig] = useState<SignalAblationConfig>(
    createDefaultAblationConfig(),
  )
  const [isRunning, setIsRunning] = useState(false)

  const handleToggle = (key: keyof SignalAblationConfig, enabled: boolean) => {
    setAblationConfig((prev) => ({ ...prev, [key]: enabled }))
  }

  const handleRun = async () => {
    if (!onRunAblation) return
    setIsRunning(true)
    try {
      await onRunAblation(ablationConfig)
    } finally {
      setIsRunning(false)
    }
  }

  const comparisonVm = comparison ? buildAblationComparisonViewModel(comparison) : null

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Ablation View"
        description="機能 ON/OFF による挙動差を検証します。"
        badge={
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
            New Signal Mode
          </span>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {detailMode === 'research' ? (
          <AblationConfigPanel
            config={createDefaultAblationConfig()}
            isBaseline
            onToggle={() => {}}
          />
        ) : null}
        <AblationConfigPanel
          config={ablationConfig}
          isBaseline={false}
          onToggle={handleToggle}
        />
      </div>

      {onRunAblation ? (
        <div>
          <button
            type="button"
            disabled={isRunning}
            onClick={handleRun}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-700 disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Ablation'}
          </button>
        </div>
      ) : null}

      {comparisonVm ? (
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Comparison Result</p>
          <AblationComparisonPanel comparison={comparisonVm} />
        </div>
      ) : (
        <EmptyState
          title="まだ ablation 結果はありません。"
          description="機能をトグルして Run Ablation を押すと、差分を確認できます。"
        />
      )}
    </div>
  )
}
