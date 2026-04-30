type ExperienceInputAreaProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isSending: boolean
  disabled?: boolean
}

export const ExperienceInputArea = ({
  value,
  onChange,
  onSend,
  isSending,
  disabled = false,
}: ExperienceInputAreaProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow focus-within:border-rose-300 focus-within:shadow-md focus-within:ring-2 focus-within:ring-rose-100">
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="今考えていることを入力..."
      aria-label="メッセージ入力"
      rows={3}
      disabled={disabled || isSending}
      className="min-h-[88px] w-full resize-none border-0 bg-transparent text-base font-medium leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed md:text-[15px]"
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          onSend()
        }
      }}
    />
    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="hidden text-xs font-medium text-slate-400 sm:block">
        Enter で送信 / Shift + Enter で改行
      </p>
      <p className="text-[11px] font-medium text-slate-400 sm:hidden">
        送信ボタンをタップ / Shift + Enter で改行
      </p>
      <button
        type="button"
        onClick={onSend}
        disabled={isSending || !value.trim() || disabled}
        aria-label={isSending ? '返答中' : '話す'}
        className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:from-rose-600 hover:to-rose-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
      >
        {isSending ? '返答中...' : '話す'}
      </button>
    </div>
  </div>
)
