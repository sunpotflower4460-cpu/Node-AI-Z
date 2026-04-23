import type { NeedType } from '../L4/types'
import type { WarmthBand } from '../L6/types'

export type UtteranceTemplateContext = {
  topic: string
  fallbackTopic: string
  askBackPrompt: string
  warmthBand: WarmthBand
  need: NeedType
  reactedTo: string[]
}

export type UtteranceTemplate = (context: UtteranceTemplateContext) => string

/**
 * Returns the best topic string available for surface generation.
 *
 * @param context - Template rendering context.
 * @returns Topic string fallback-safe for utterances.
 */
function resolveTopic(context: UtteranceTemplateContext): string {
  return context.topic || context.fallbackTopic
}

/**
 * Returns a short reactive phrase derived from L5 reaction data.
 *
 * @param context - Template rendering context.
 * @returns Natural short reaction phrase.
 */
function resolveReactionLead(context: UtteranceTemplateContext): string {
  return context.reactedTo[0] ?? '少し引っかかりがありそう'
}

/**
 * Appends an ask-back prompt when one is available.
 *
 * @param base - Base utterance string.
 * @param askBackPrompt - Optional ask-back prompt.
 * @returns Joined utterance string.
 */
function appendAskBack(base: string, askBackPrompt: string): string {
  return askBackPrompt ? `${base}${askBackPrompt}` : base
}

/**
 * Rule-based utterance templates keyed by conversational intent.
 */
export const UTTERANCE_TEMPLATES: Record<string, UtteranceTemplate> = {
  greet_back_warm: context => appendAskBack('うん、元気だよ。', context.askBackPrompt),
  greet_back_neutral: context => appendAskBack('まあまあかな。', context.askBackPrompt),
  greet_back_cool: context => appendAskBack('ぼちぼちかな。', context.askBackPrompt),
  answer_minimal: context => `ざっくり言うと、${resolveTopic(context)}の話だね。`,
  answer_short: context => `ざっくり言うと、${resolveTopic(context)}は整理して答えられそうだよ。`,
  answer_medium: context => `知っている範囲で言うと、${resolveTopic(context)}は要点を順に見ていくとわかりやすいよ。`,
  answer_long: context => `知っている範囲で丁寧に言うと、${resolveTopic(context)}は前提と要点を分けて考えると整理しやすいよ。`,
  listen_minimal: context => appendAskBack('そうなんだ。', context.askBackPrompt),
  listen_short: context =>
    appendAskBack(`${resolveReactionLead(context)}感じがあるね。`, context.askBackPrompt),
  listen_medium: context =>
    appendAskBack(`${resolveReactionLead(context)}みたいだね。無理のない範囲で聞かせて。`, context.askBackPrompt),
  listen_long: context =>
    appendAskBack(`${resolveReactionLead(context)}感じが続いていそうだね。急がなくていいから、話せるところから聞かせて。`, context.askBackPrompt),
  explore_minimal: context => appendAskBack(`${resolveTopic(context)}は考えどころだね。`, context.askBackPrompt),
  explore_short: context =>
    appendAskBack(`${resolveTopic(context)}ってすぐに決めにくい問いだね。`, context.askBackPrompt),
  explore_medium: context =>
    appendAskBack(`${resolveTopic(context)}は一つに決めずに見ていくとよさそうだね。`, context.askBackPrompt),
  explore_long: context =>
    appendAskBack(`${resolveTopic(context)}は角度によって見え方が変わる問いだね。`, context.askBackPrompt),
  ask_back_minimal: context => appendAskBack('少し確認したい。', context.askBackPrompt),
  ask_back_short: context => appendAskBack(`${resolveTopic(context)}のどの部分か教えて。`, context.askBackPrompt),
  ask_back_medium: context =>
    appendAskBack(`${resolveTopic(context)}で一番知りたいところを教えて。`, context.askBackPrompt),
  ask_back_long: context =>
    appendAskBack(`${resolveTopic(context)}について、どこから進めたいか教えて。`, context.askBackPrompt),
  express_minimal: context => `${resolveReactionLead(context)}ことは受け取ったよ。`,
  express_short: context => `${resolveReactionLead(context)}こと、ちゃんと受け取ったよ。`,
  express_medium: context => `${resolveReactionLead(context)}ことは伝わっているよ。必要なら続きを聞かせて。`,
  express_long: context => `${resolveReactionLead(context)}ことは伝わっているよ。整理したくなったら、そのまま続けて話して。`,
  wait_minimal: () => '少し待つね。',
  wait_short: () => 'まだ掴みきれていないから、少し待つね。',
  wait_medium: () => 'まだ意図を掴みきれていないから、少し待ちながら受け取るね。',
  wait_long: () => 'まだ何を求めているのか掴みきれていないから、少し待ちながら続きを受け取るね。',
  deflect_minimal: () => 'すぐには言い切れないな。',
  deflect_short: context => `今は${resolveTopic(context)}を言い切るのが少し難しい。`,
  deflect_medium: context => `今は${resolveTopic(context)}を断定しすぎないほうがよさそう。`,
  deflect_long: context => `今は${resolveTopic(context)}を断定しすぎないほうがよさそうだから、少し幅を残して話したい。`,
}
