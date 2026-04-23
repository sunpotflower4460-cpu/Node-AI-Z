import { useState } from 'react'
import { Activity, ChevronDown, ChevronUp, MessageCircleHeart, RefreshCcw, Send, Sparkles } from 'lucide-react'
import type { ExperienceMessage } from '../../types/experience'
import type { RuntimeMode } from '../../types/experience'
import type { UserTuningAction, UserTuningState } from '../../types/nodeStudio'
import { describeProposedChange } from '../../revision/statusMeta'

type ExperienceModeProps = {
  messages: ExperienceMessage[]
  surfaceProviderLabel: string
  tuning?: UserTuningState
  runtimeMode: RuntimeMode
  onRuntimeModeChange: (mode: RuntimeMode) => void
  onSend: (text: string) => void | Promise<void>
  onOpenObservation: (observationId: string) => void
  onTuningAction?: (entryId: string, changeId: string, action: UserTuningAction) => void
}

export const ExperienceMode = ({ messages, surfaceProviderLabel, tuning, runtimeMode, onRuntimeModeChange, onSend, onOpenObservation, onTuningAction }: ExperienceModeProps) => {
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [expandedRevisions, setExpandedRevisions] = useState<Set<string>>(new Set())

  const toggleRevision = (messageId: string) => {
    setExpandedRevisions((previous) => {
      const next = new Set(previous)
      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }
      return next
    })
  }

  const handleSend = () => {
    const trimmed = inputText.trim()
    if (!trimmed || isSending) {
      return
    }

    setIsSending(true)
    setInputText('')

    window.setTimeout(() => {
      void Promise.resolve(onSend(trimmed)).finally(() => {
        setIsSending(false)
      })
    }, 250)
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="rounded-3xl border border-rose-100 bg-white px-5 py-6 shadow-sm md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
              <MessageCircleHeart className="h-4 w-4" />
              体験モード
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">自然に話しながら、裏では観察が積み上がる入口</h2>
            <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-slate-500 md:text-[15px]">
              表では会話を主役にしつつ、裏では runMainRuntime が legacy backbone または signal-centered route を選び、revision / memory を積み上げます。必要なときだけ観察研究モードに戻って、内部の変化を見返せます。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:min-w-[320px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Surface Provider</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                {surfaceProviderLabel}
              </div>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">会話は自然に見せつつ、内部では観察記録が残ります。</p>
            </div>
            <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Runtime</span>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
                <button
                  type="button"
                  onClick={() => onRuntimeModeChange('node')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${runtimeMode === 'node' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Node
                </button>
                <button
                  type="button"
                  onClick={() => onRuntimeModeChange('signal')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${runtimeMode === 'signal' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Activity className="h-3 w-3" />
                  Signal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6">
          {messages.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
              <div className="rounded-full bg-rose-100 p-4 text-rose-600">
                <MessageCircleHeart className="h-8 w-8" />
              </div>
               <h3 className="mt-4 text-lg font-bold text-slate-800">ここから話し始められます</h3>
               <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
                 返答は runMainRuntime から legacy backbone または signal-centered route を通って生成されます。詳しい内部観察はあとから研究モードで開けます。
               </p>
             </div>
          ) : (
            messages.map((message) => {
              const isAssistant = message.role === 'assistant'

              return (
                <div key={message.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm ${isAssistant ? 'border border-slate-200 bg-slate-50 text-slate-800' : 'bg-rose-500 text-white'}`}>
                    <p className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed">{message.text}</p>
                    {isAssistant && message.revisionEntry && message.revisionEntry.proposedChanges.length > 0 ? (
                      <div className="mt-3 rounded-2xl border border-indigo-100 bg-white/80 text-slate-600">
                        <button
                          type="button"
                          onClick={() => toggleRevision(message.id)}
                          className="flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-left hover:bg-slate-50/60 transition-colors"
                        >
                          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                            <RefreshCcw className="h-3 w-3" /> Self-Revision
                          </span>
                          {expandedRevisions.has(message.id) ? (
                            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </button>
                        {expandedRevisions.has(message.id) ? (
                          <div className="border-t border-indigo-100 px-3 pb-3 pt-2">
                            <p className="text-[12px] font-medium leading-relaxed text-slate-600">{message.revisionEntry.note}</p>
                            <div className="mt-2 flex flex-col gap-1.5">
                              {message.revisionEntry.proposedChanges.slice(0, 2).map((change) => {
                                const isReverted = tuning?.reverted.has(change.id) ?? false
                                const isKept = tuning?.kept.has(change.id) ?? false
                                const isSoftened = tuning?.softened.has(change.id) ?? false
                                return (
                                  <div key={change.id} className="rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2">
                                    <p className="text-[11px] font-medium text-slate-700">{describeProposedChange(change)}</p>
                                    {onTuningAction ? (
                                      <div className="mt-1.5 flex flex-wrap gap-1">
                                        <button
                                          type="button"
                                          onClick={() => message.revisionEntry && onTuningAction(message.revisionEntry.id, change.id, 'keep')}
                                          className={`rounded px-2 py-0.5 text-[10px] font-bold transition-colors ${isKept ? 'bg-green-200 text-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                        >
                                          keep
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => message.revisionEntry && onTuningAction(message.revisionEntry.id, change.id, 'soften')}
                                          className={`rounded px-2 py-0.5 text-[10px] font-bold transition-colors ${isSoftened ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                                        >
                                          soften
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => message.revisionEntry && onTuningAction(message.revisionEntry.id, change.id, 'revert')}
                                          className={`rounded px-2 py-0.5 text-[10px] font-bold transition-colors ${isReverted ? 'bg-slate-200 text-slate-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                        >
                                          {isReverted ? 'restore' : 'revert'}
                                        </button>
                                      </div>
                                    ) : null}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <div className={`mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold ${isAssistant ? 'text-slate-500' : 'text-rose-100'}`}>
                      <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isAssistant && message.runtimeMode === 'signal' ? (
                        <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-rose-600">Signal Runtime</span>
                      ) : null}
                      {isAssistant && message.observationId ? (
                        <>
                          <span>観察研究モードで詳しく見返せます</span>
                          <button
                            type="button"
                            onClick={() => onOpenObservation(message.observationId)}
                            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                          >
                            観察で見る
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50/80 p-4 md:p-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <textarea
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="いま話したいことを、そのまま入力してください"
              className="min-h-[88px] w-full resize-none border-0 bg-transparent text-[15px] font-medium leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
            />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-slate-400">Enter で送信 / Shift + Enter で改行</p>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || !inputText.trim()}
                aria-label={isSending ? '返答中' : '送信'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                {isSending ? '返答中...' : '送信'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
