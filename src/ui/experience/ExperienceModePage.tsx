import type { ExperienceMessage } from '../../types/experience'
import type { UserTuningState, UserTuningAction } from '../../types/nodeStudio'
import type { OverviewMode, UiDetailMode } from '../mode/modeUiTypes'
import { ExperienceModeIntro } from './ExperienceModeIntro'
import { ExperienceEngineStatus } from './ExperienceEngineStatus'
import { ExperienceChatPanel } from './ExperienceChatPanel'
import { buildExperienceModeViewModel } from './buildExperienceModeViewModel'
import type { ObserveTab } from './buildExperienceResultViewModel'

type ExperienceModePageProps = {
  messages: ExperienceMessage[]
  engine: OverviewMode
  surfaceProviderLabel: string
  runtimeModeLabel?: string
  tuning?: UserTuningState
  detailMode?: UiDetailMode
  isSending: boolean
  onSend: (text: string) => void | Promise<void>
  onNavigateToObserve?: (tab?: ObserveTab) => void
  onTuningAction?: (entryId: string, changeId: string, action: UserTuningAction) => void
}

export const ExperienceModePage = ({
  messages,
  engine,
  surfaceProviderLabel,
  runtimeModeLabel,
  tuning,
  detailMode = 'simple',
  isSending,
  onSend,
  onNavigateToObserve,
  onTuningAction,
}: ExperienceModePageProps) => {
  const researchMode = detailMode === 'research'
  const viewModel = buildExperienceModeViewModel({
    engine,
    hasConversation: messages.length > 0,
    canSend: !isSending,
    surfaceProviderLabel,
    runtimeModeLabel,
  })

  const handleNavigate = (tab: ObserveTab) => {
    onNavigateToObserve?.(tab)
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ExperienceModeIntro onObserveModeClick={() => onNavigateToObserve?.()} />

      <div className="flex items-center justify-between">
        <ExperienceEngineStatus
          engineLabel={viewModel.engineLabel}
          researchMode={researchMode}
          runtimeModeLabel={runtimeModeLabel}
          surfaceProviderLabel={researchMode ? surfaceProviderLabel : undefined}
        />
      </div>

      <ExperienceChatPanel
        messages={messages}
        engineLabel={viewModel.engineLabel}
        tuning={tuning}
        researchMode={researchMode}
        isSending={isSending}
        onSend={onSend}
        onNavigateToObserve={handleNavigate}
        onTuningAction={onTuningAction}
      />
    </div>
  )
}
