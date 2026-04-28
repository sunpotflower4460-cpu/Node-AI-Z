import type { SignalAblationConfig } from '../../signalAblation/signalAblationTypes'
import { buildAblationConfigViewModel } from './buildAblationViewModel'
import { AblationFeatureToggleList } from './AblationFeatureToggleList'
import { SectionHeader } from '../shared/SectionHeader'

type AblationConfigPanelProps = {
  config: SignalAblationConfig
  isBaseline?: boolean
  onToggle: (key: keyof SignalAblationConfig, enabled: boolean) => void
}

export const AblationConfigPanel = ({ config, isBaseline = false, onToggle }: AblationConfigPanelProps) => {
  const vm = buildAblationConfigViewModel(config)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <SectionHeader
        title={isBaseline ? 'Baseline 設定' : 'Ablation 設定'}
        description={isBaseline ? '全機能が有効な基準状態です。' : '無効にしたい機能をここでトグルします。'}
        badge={isBaseline ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">baseline</span>
        ) : (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">ablation</span>
        )}
      />
      <div className="mt-4">
        <AblationFeatureToggleList
          features={vm.features}
          onToggle={(key, enabled) => onToggle(key as keyof SignalAblationConfig, enabled)}
        />
      </div>
    </div>
  )
}
