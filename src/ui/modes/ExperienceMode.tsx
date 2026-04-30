import { useState } from 'react'
import type { ExperienceMessage, ImplementationMode, RuntimeMode } from '../../types/experience'
import type { UserTuningAction, UserTuningState } from '../../types/nodeStudio'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { getDefaultOverviewMode } from '../mode/modeUiTypes'
import { ExperienceModePage } from '../experience/ExperienceModePage'

type ExperienceModeProps = {
  messages: ExperienceMessage[]
  surfaceProviderLabel: string
  tuning?: UserTuningState
  runtimeMode: RuntimeMode
  implementationMode?: ImplementationMode
  detailMode?: UiDetailMode
  onRuntimeModeChange: (mode: RuntimeMode) => void
  onSend: (text: string) => void | Promise<void>
  onOpenObservation: (observationId: string) => void
  onSwitchToObserve?: () => void
  onTuningAction?: (entryId: string, changeId: string, action: UserTuningAction) => void
}

export const ExperienceMode = ({
  messages,
  surfaceProviderLabel,
  tuning,
  runtimeMode,
  implementationMode,
  detailMode = 'simple',
  onSend,
  onOpenObservation,
  onSwitchToObserve,
  onTuningAction,
}: ExperienceModeProps) => {
  const [isSending, setIsSending] = useState(false)

  const engine = getDefaultOverviewMode(implementationMode)

  const handleSend = (text: string) => {
    setIsSending(true)
    void Promise.resolve(onSend(text)).finally(() => {
      setIsSending(false)
    })
  }

  const handleNavigateToObserve = () => {
    if (onSwitchToObserve) {
      onSwitchToObserve()
      return
    }
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
    if (lastAssistant?.observationId) {
      onOpenObservation(lastAssistant.observationId)
    }
  }

  return (
    <ExperienceModePage
      messages={messages}
      engine={engine}
      surfaceProviderLabel={surfaceProviderLabel}
      runtimeModeLabel={runtimeMode === 'signal' ? 'Signal' : 'Node'}
      tuning={tuning}
      detailMode={detailMode}
      isSending={isSending}
      onSend={handleSend}
      onNavigateToObserve={handleNavigateToObserve}
      onTuningAction={onTuningAction}
    />
  )
}
