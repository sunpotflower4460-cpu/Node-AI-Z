import { Trash2, AlertTriangle } from 'lucide-react'
import { CollapsibleSection } from '../layout/CollapsibleSection'

type DangerZoneProps = {
  onResetSignalMode: () => void
  onClearSnapshots: () => void
  onClearScenarioResults: () => void
  onClearUiPreferences: () => void
}

type DangerButtonProps = {
  label: string
  confirmMessage: string
  onConfirm: () => void
}

const DangerButton = ({ label, confirmMessage, onConfirm }: DangerButtonProps) => {
  const handleClick = () => {
    if (window.confirm(confirmMessage)) {
      onConfirm()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2.5 text-xs font-bold text-red-300 transition-colors hover:border-red-700/60 hover:bg-red-950/70"
    >
      <Trash2 className="h-3.5 w-3.5 shrink-0 text-red-400" />
      {label}
    </button>
  )
}

export const DangerZone = ({
  onResetSignalMode,
  onClearSnapshots,
  onClearScenarioResults,
  onClearUiPreferences,
}: DangerZoneProps) => (
  <CollapsibleSection
    title="Danger Zone"
    defaultOpen={false}
    titleClass="text-[11px] font-bold uppercase tracking-widest text-red-500"
  >
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-xl border border-red-900/50 bg-red-950/20 px-3 py-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
        <p className="text-[11px] text-red-400">
          以下の操作は元に戻せません。慎重に実行してください。
        </p>
      </div>
      <DangerButton
        label="Reset Signal Mode"
        confirmMessage="Signal Mode の状態をリセットします。この操作は元に戻せません。続けますか？"
        onConfirm={onResetSignalMode}
      />
      <DangerButton
        label="Clear Snapshots"
        confirmMessage="すべてのスナップショットを削除します。この操作は元に戻せません。続けますか？"
        onConfirm={onClearSnapshots}
      />
      <DangerButton
        label="Clear Scenario Results"
        confirmMessage="すべてのシナリオ結果を削除します。この操作は元に戻せません。続けますか？"
        onConfirm={onClearScenarioResults}
      />
      <DangerButton
        label="Clear UI Preferences"
        confirmMessage="UI設定をクリアします。この操作は元に戻せません。続けますか？"
        onConfirm={onClearUiPreferences}
      />
    </div>
  </CollapsibleSection>
)
