import { WarningPanel } from '../shared/WarningPanel'

type RiskWarningsPanelProps = {
  warnings: string[]
}

export const RiskWarningsPanel = ({ warnings }: RiskWarningsPanelProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Warnings</p>
    <WarningPanel warnings={warnings} emptyMessage="現在、警告はありません。" />
  </div>
)
