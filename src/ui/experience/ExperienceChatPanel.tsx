import { useState } from 'react'
import type { ExperienceMessage } from '../../types/experience'
import type { UserTuningState, UserTuningAction } from '../../types/nodeStudio'
import { ExperienceEmptyState } from './ExperienceEmptyState'
import { ExperienceInputArea } from './ExperienceInputArea'
import { ExperienceResponseCard } from './ExperienceResponseCard'
import type { ObserveTab } from './buildExperienceResultViewModel'

type ExperienceChatPanelProps = {
  messages: ExperienceMessage[]
  engineLabel: string
  tuning?: UserTuningState
  researchMode?: boolean
  isSending: boolean
  onSend: (text: string) => void | Promise<void>
  onNavigateToObserve?: (tab: ObserveTab) => void
  onTuningAction?: (entryId: string, changeId: string, action: UserTuningAction) => void
}

export const ExperienceChatPanel = ({
  messages,
  engineLabel,
  tuning,
  researchMode = false,
  isSending,
  onSend,
  onNavigateToObserve,
  onTuningAction,
}: ExperienceChatPanelProps) => {
  const [inputText, setInputText] = useState('')

  const handleSend = () => {
    const trimmed = inputText.trim()
    if (!trimmed || isSending) return
    setInputText('')
    window.setTimeout(() => {
      void Promise.resolve(onSend(trimmed))
    }, 250)
  }

  return (
    <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 md:px-6">
        {messages.length === 0 ? (
          <ExperienceEmptyState />
        ) : (
          messages.map((message) => {
            if (message.role === 'user') {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 px-4 py-3.5 text-white shadow-md">
                    <p className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed">
                      {message.text}
                    </p>
                    <div className="mt-2 text-xs font-semibold text-rose-200">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <ExperienceResponseCard
                key={message.id}
                message={message}
                engineLabel={engineLabel}
                tuning={tuning}
                researchMode={researchMode}
                onNavigateToObserve={onNavigateToObserve}
                onTuningAction={onTuningAction}
              />
            )
          })
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50/80 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:p-5">
        <ExperienceInputArea
          value={inputText}
          onChange={setInputText}
          onSend={handleSend}
          isSending={isSending}
        />
      </div>
    </section>
  )
}
