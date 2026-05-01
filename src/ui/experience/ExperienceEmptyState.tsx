import { MessageCircleHeart } from 'lucide-react'

export const ExperienceEmptyState = () => (
  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
    <div className="rounded-full bg-rose-100 p-4 text-rose-500 shadow-sm">
      <MessageCircleHeart className="h-8 w-8" />
    </div>
    <h3 className="mt-4 text-base font-bold text-slate-800">
      まだ体験モードの会話はありません
    </h3>
    <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-slate-500">
      一文入力すると、返答と簡単な内部サマリーが表示されます。
    </p>
    <p className="mt-1 text-xs font-medium text-slate-400">
      詳しい内部状態は観察モードで確認できます。
    </p>
  </div>
)
