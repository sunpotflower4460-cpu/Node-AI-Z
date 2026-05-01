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
        title={isResearch ? 'Mother Export Candidates' : 'Mother'}
        description={
          isResearch
            ? 'Signal Mode で育った結びつきや意味の種を Node Mother に渡す前に確認します。Export candidates and Guardian precheck.'
            : 'Signal Mode で育った結びつきや意味の種を、Node Mother に渡す前に確認します。ここではまだ自動保存は行いません。'
        }
      />

      <TabEmptyState
        title={isResearch ? 'No export candidates yet' : 'まだ保存候補はありません'}
        description={
          isResearch
            ? 'Matured bridges and Proto Seeds will appear here as export candidates before being sent to Node Mother.'
            : '安定した結びつきや意味の種が育つと、Node Mother に渡す前の候補として表示されます。保存候補の確認・保留・除外を行います。'
        }
        nextAction={isResearch ? 'Keep observing to grow candidates' : '観察を続けると候補が育ちます'}
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
