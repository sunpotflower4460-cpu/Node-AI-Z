import type { NodePipelineResult, StudioViewModel } from '../types/nodeStudio'
import type { RevisionEntry } from './revisionTypes'
import { buildProposedChanges } from './buildProposedChanges'

const generateId = () => `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

const describeLeadingIssue = (issues: string[]) => {
  if (issues.some((issue) => issue.includes('説明'))) {
    return '今回は「説明が少し先に出やすい」傾向が見つかりました。'
  }
  if (issues.some((issue) => issue.includes('断定'))) {
    return '今回は「曖昧さに対して少し断定が早い」傾向が見つかりました。'
  }
  if (issues.some((issue) => issue.includes('近さ'))) {
    return '今回は「fragility に対して近さが少し足りない」傾向が見つかりました。'
  }
  if (issues.some((issue) => issue.includes('Home return'))) {
    return '今回は Home return が自然さの補正に効いた場面がありました。'
  }

  return '今回は大きなズレは見つかりませんでした。'
}

const describeLeadingChange = (entry: RevisionEntry['proposedChanges']) => {
  const firstChange = entry[0]
  if (!firstChange) {
    return '次回の微調整はまだ発生していません。'
  }

  return `次回は ${firstChange.key} を少し${firstChange.delta >= 0 ? '強め' : '弱め'}ます。`
}

/**
 * Build a RevisionEntry from a completed interaction
 * This captures what happened and what could be improved
 */
export const buildRevisionEntry = (
  result: NodePipelineResult,
  studioView: StudioViewModel,
): RevisionEntry => {
  const { changes, issues } = buildProposedChanges(result, studioView)
  const provisionalEntry: RevisionEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    inputText: result.inputText,
    rawReply: studioView.rawReplyPreview,
    adjustedReply: studioView.adjustedReplyPreview,
    issueTags: issues,
    note: '',
    proposedChanges: changes,
    status: 'ephemeral',
  }

  provisionalEntry.note = [
    describeLeadingIssue(issues),
    describeLeadingChange(provisionalEntry.proposedChanges),
    'この変更はまだ仮です。',
  ].join(' ')

  return provisionalEntry
}
