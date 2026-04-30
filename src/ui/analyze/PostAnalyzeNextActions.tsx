import type { PostAnalyzeNextActionsViewModel } from '../viewModels/buildPostAnalyzeNextActionsViewModel'
import type { PrimaryTabId } from '../navigation/tabUiTypes'
import { RecommendedTabButton } from '../shared/RecommendedTabButton'

type PostAnalyzeNextActionsProps = {
  viewModel: PostAnalyzeNextActionsViewModel
  onTabChange: (tabId: PrimaryTabId) => void
}

export const PostAnalyzeNextActions = ({
  viewModel,
  onTabChange,
}: PostAnalyzeNextActionsProps) => {
  if (viewModel.actions.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-slate-700">次に見るとよい場所</p>
      <ol className="flex flex-col gap-2">
        {viewModel.actions.map((action, index) => (
          <li key={action.id} className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
              {index + 1}
            </span>
            <div className="flex-1">
              <RecommendedTabButton
                tabId={action.tabId}
                label={action.label}
                reason={action.description}
                onClick={onTabChange}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
