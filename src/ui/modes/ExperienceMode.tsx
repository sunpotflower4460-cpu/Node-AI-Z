import { useState } from 'react'
import { Activity, ChevronDown, ChevronUp, MessageCircleHeart, RefreshCcw, Send, Sparkles } from 'lucide-react'
import type { ExperienceMessage } from '../../types/experience'
import type { RuntimeMode } from '../../types/experience'
import type { UserTuningAction, UserTuningState } from '../../types/nodeStudio'
import { describeProposedChange } from '../../revision/statusMeta'
import { HelpIcon } from '../components/CommonUI'

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
      <section className="rounded-3xl border border-rose-100 bg-white px-4 py-5 shadow-sm md:px-6 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
              <MessageCircleHeart className="h-4 w-4" />
              体験モード
              <HelpIcon content="実際にAIと会話するモードです。自然な対話を楽しみながら、裏ではAIが学習・成長しています。" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl md:text-2xl">自然に話しながら、裏では観察が積み上がる入口</h2>
            <p className="mt-3 hidden max-w-xl text-sm font-medium leading-relaxed text-slate-500 sm:block md:text-[15px]">
              表では会話を主役にしつつ、裏では runMainRuntime が legacy backbone または signal-centered route を選び、revision / memory を積み上げます。必要なときだけ観察研究モードに戻って、内部の変化を見返せます。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:min-w-[320px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 inline-flex items-center gap-1">
                Surface Provider
                <HelpIcon content="返答の表面的な表現を生成するAIプロバイダーです。" />
              </div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                {surfaceProviderLabel}
              </div>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">会話は自然に見せつつ、内部では観察記録が残ります。</p>
            </div>
            <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 inline-flex items-center gap-1">
                Runtime
                <HelpIcon content="内部の処理方式を選択できます。Nodeは従来型、Signalは信号ベースの処理です。" />
              </span>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
                <button
                  type="button"
                  onClick={() => onRuntimeModeChange('node')}
                  aria-pressed={runtimeMode === 'node'}
                  title="従来型のノードベース処理。Node / Relation / Pattern を使用します。"
                  className={`tap-target inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all duration-150 ${runtimeMode === 'node' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}
                >
                  Node
                </button>
                <button
                  type="button"
                  onClick={() => onRuntimeModeChange('signal')}
                  aria-pressed={runtimeMode === 'signal'}
                  title="信号ベースの処理。微細な信号やパターンを捉えます。"
                  className={`tap-target inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all duration-150 ${runtimeMode === 'signal' ? 'bg-white text-rose-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}
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
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 md:px-6">
          {messages.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
              <div className="rounded-full bg-rose-100 p-4 text-rose-500 shadow-sm">
                <MessageCircleHeart className="h-8 w-8" />
              </div>
               <h3 className="mt-4 text-lg font-bold text-slate-800">ここから話し始められます</h3>
               <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
                 下の入力欄にメッセージを入力してください。AIが返答を生成し、その過程で内部状態を学習・更新していきます。
               </p>
               <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-left">
                 <p className="text-xs font-semibold text-blue-900 mb-1 inline-flex items-center gap-1">
                   💡 ヒント
                   <HelpIcon content="会話の内容は自由です。AIは対話を通じて、あなたの話し方や好みを徐々に学習していきます。" />
                 </p>
                 <p className="text-xs text-blue-700">
                   気軽な雑談でも、深い相談でもOKです。AIとの対話を楽しんでください。
                 </p>
               </div>
             </div>
          ) : (
            messages.map((message) => {
              const isAssistant = message.role === 'assistant'

              return (
                <div key={message.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-3xl px-4 py-3.5 shadow-sm ${isAssistant ? 'border border-slate-200 bg-white text-slate-800' : 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-md'}`}>
                    <p className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed">{message.text}</p>
                    {isAssistant && message.revisionEntry && message.revisionEntry.proposedChanges.length > 0 ? (
                      <div className="mt-3 rounded-2xl border border-indigo-100 bg-slate-50/80 text-slate-600">
                        <button
                          type="button"
                          onClick={() => toggleRevision(message.id)}
                          className="flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-left hover:bg-indigo-50/60 transition-colors"
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
                            <p className="text-xs font-medium leading-relaxed text-slate-600">{message.revisionEntry.note}</p>
                            <div className="mt-2 flex flex-col gap-1.5">
                              {message.revisionEntry.proposedChanges.slice(0, 2).map((change) => {
                                const isReverted = tuning?.reverted.has(change.id) ?? false
                                const isKept = tuning?.kept.has(change.id) ?? false
                                const isSoftened = tuning?.softened.has(change.id) ?? false
                                return (
                                  <div key={change.id} className="rounded-xl border border-slate-100 bg-white px-2.5 py-2 shadow-sm">
                                    <p className="text-xs font-medium text-slate-700">{describeProposedChange(change)}</p>
                                    {onTuningAction ? (
                                      <div className="mt-1.5 flex flex-wrap gap-1">
                                        <button
                                          type="button"
                                          onClick={() => message.revisionEntry && onTuningAction(message.revisionEntry.id, change.id, 'keep')}
                                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors ${isKept ? 'bg-green-200 text-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                        >
                                          keep
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => message.revisionEntry && onTuningAction(message.revisionEntry.id, change.id, 'soften')}
                                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors ${isSoftened ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                                        >
                                          soften
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => message.revisionEntry && onTuningAction(message.revisionEntry.id, change.id, 'revert')}
                                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors ${isReverted ? 'bg-slate-200 text-slate-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
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
                    <div className={`mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold ${isAssistant ? 'text-slate-400' : 'text-rose-200'}`}>
                      <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isAssistant && message.runtimeMode === 'signal' ? (
                        <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-rose-600">Signal Runtime</span>
                      ) : null}
                      {isAssistant && message.observationId ? (
                        <>
                          <span className="hidden sm:inline">観察研究モードで詳しく見返せます</span>
                          <button
                            type="button"
                            onClick={() => onOpenObservation(message.observationId)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-700 active:scale-[0.98]"
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

        <div className="border-t border-slate-200 bg-slate-50/80 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:p-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow focus-within:shadow-md focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100">
            <textarea
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="いま話したいことを、そのまま入力してください"
              aria-label="メッセージ入力"
              rows={3}
              className="min-h-[88px] w-full resize-none border-0 bg-transparent text-base font-medium leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 md:text-[15px]"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
            />
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden text-xs font-medium text-slate-400 sm:block">Enter で送信 / Shift + Enter で改行</p>
              <p className="text-[11px] font-medium text-slate-400 sm:hidden">送信ボタンをタップ / Shift + Enter で改行</p>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || !inputText.trim()}
                aria-label={isSending ? '返答中' : '送信'}
                className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md hover:from-rose-600 hover:to-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
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
