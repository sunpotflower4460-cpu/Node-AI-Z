import type { UiDetailMode } from '../mode/modeUiTypes'
import { SectionSummaryCard } from '../shared/SectionSummaryCard'
import { DetailAccordion } from '../shared/DetailAccordion'
import { TabEmptyState } from '../shared/TabEmptyState'

type MotherTabProps = {
  detailMode: UiDetailMode
}

export const MotherTab = ({ detailMode }: MotherTabProps) => {
  const isResearch = detailMode === 'research'

  return (
    <div className="flex flex-col gap-4">
      <SectionSummaryCard
        title="Mother"
        description={
          isResearch
            ? 'Export candidates for Node Mother, guardian precheck, and cross-app memory preview.'
            : 'Node Mother に渡す前の候補と guardian チェックを確認します。'
        }
      />

      <TabEmptyState
        title={isResearch ? 'Mother connection coming soon' : 'Mother 接続は準備中です'}
        description={
          isResearch
            ? 'Export candidates and Guardian precheck will be available when the Mother bridge is ready.'
            : 'Mother Bridge が準備できると、エクスポート候補と guardian チェックがここに表示されます。'
        }
        nextAction={isResearch ? 'Coming soon' : '準備中 — もうすぐ利用可能になります'}
      />

      {isResearch ? (
        <>
          <DetailAccordion summary="Export Candidate List (coming soon)">
            <p className="text-xs text-slate-400">
              Matured bridges and assemblies ready for Mother packaging will appear here.
            </p>
          </DetailAccordion>

          <DetailAccordion summary="Guardian Precheck (coming soon)">
            <p className="text-xs text-slate-400">
              Guardian safety checks will be run before any export to Node Mother.
            </p>
          </DetailAccordion>

          <DetailAccordion summary="Cross-App Memory Preview (coming soon)">
            <p className="text-xs text-slate-400">
              Preview how memories will be shared across connected apps via Node Mother.
            </p>
          </DetailAccordion>
        </>
      ) : null}

      <div className="flex justify-center">
        <button
          type="button"
          disabled
          title="Node Mother への送信は準備中です"
          className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-6 py-2.5 text-sm font-semibold text-slate-400"
        >
          {isResearch ? 'Send to Node Mother (coming soon)' : 'Node Mother に送る（準備中）'}
        </button>
      </div>
    </div>
  )
}
