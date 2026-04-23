import type { PersonalLearningState } from '../learning/types'
import type { PlasticityState } from '../types/nodeStudio'
import type { LayeredThinkingResult } from './runtimeTypes'
import type {
  CharKind,
  CharNode,
  ChunkNode,
  ChunkRole,
  Decision,
  L0Summary,
  L1Summary,
  L2Summary,
  L3Output,
  LayeredBrainMood,
  LayeredBrainState,
  LayeredThinkingTrace,
  NeedType,
  Prediction,
  PredictionError,
  ReactionState,
  SemanticFrame,
  SentenceNode,
  SentenceType,
  TokenCategory,
  TokenNode,
} from './layeredThinkingTypes'

export type LayeredThinkingRuntimeInput = {
  text: string
  plasticity?: PlasticityState
  personalLearning: PersonalLearningState
  brainState?: LayeredBrainState
}

const EMPTY_KIND_DISTRIBUTION: Record<CharKind, number> = {
  hiragana: 0,
  katakana: 0,
  kanji: 0,
  ascii_letter: 0,
  digit: 0,
  punctuation: 0,
  symbol: 0,
  whitespace: 0,
  newline: 0,
  unknown: 0,
}

const EMPTY_CATEGORY_DISTRIBUTION: Record<TokenCategory, number> = {
  noun: 0,
  verb: 0,
  adjective: 0,
  particle: 0,
  copula: 0,
  auxiliary: 0,
  greeting: 0,
  filler: 0,
  interjection: 0,
  connector: 0,
  unknown: 0,
}

const EMPTY_PREDICTION: Prediction = {
  expectedNeed: null,
  expectedTopic: null,
  expectedSentenceType: null,
}

const PARTICLES = new Set(['は', 'が', 'を', 'に', 'で', 'か', 'も', 'の', 'って', 'と'])
const COPULAS = new Set(['です', 'だ', 'である'])
const AUXILIARIES = new Set(['ます', 'ない', 'ません', 'たい', 'れる', 'られる'])
const GREETINGS = new Set(['おはよう', 'こんにちは', 'こんばんは', '元気', 'やあ'])
const FILLERS = new Set(['えーと', 'うーん', 'まあ', 'なんか'])
const INTERJECTIONS = new Set(['へえ', 'おお', 'ああ', 'そうなんだ'])
const CONNECTORS = new Set(['でも', 'だから', 'けど', 'んだけど', 'でさ'])
const QUESTION_WORDS = new Set(['何', 'なに', 'どこ', 'いつ', '誰', 'なぜ', 'どう'])
const FEELING_WORDS = ['モヤモヤ', 'つら', '辛', 'しんど', '不安', '悲しい', 'さみしい']

const DICTIONARY = [
  ...Array.from(new Set([
    ...CONNECTORS,
    ...FILLERS,
    ...INTERJECTIONS,
    ...GREETINGS,
    ...COPULAS,
    ...AUXILIARIES,
    ...PARTICLES,
  ])),
].sort((left, right) => right.length - left.length)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const createInitialLayeredBrainState = (): LayeredBrainState => ({
  turnCount: 0,
  lastSemantic: null,
  lastDecision: null,
  lastUtterance: null,
  prediction: EMPTY_PREDICTION,
  mood: 'neutral',
  recentTopics: [],
})

const classifyChar = (char: string): CharKind => {
  if (char === '\n') return 'newline'
  if (char === ' ' || char === '\t' || char === '　') return 'whitespace'
  if (/[A-Za-z]/u.test(char)) return 'ascii_letter'
  if (/[0-9０-９]/u.test(char)) return 'digit'
  if (/[ぁ-ゖゝゞ]/u.test(char)) return 'hiragana'
  if (/[ァ-ヿ]/u.test(char)) return 'katakana'
  if (/[一-龯々]/u.test(char)) return 'kanji'
  if (/[。、！？!?….,]/u.test(char)) return 'punctuation'
  if (/\p{Extended_Pictographic}/u.test(char)) return 'symbol'
  if (/\S/u.test(char)) return 'symbol'
  return 'unknown'
}

const analyzeCharacters = (text: string) => {
  const characterNodes: CharNode[] = Array.from(text).map((char, index, chars) => ({
    char,
    index,
    kind: classifyChar(char),
    isRepeat: index > 0 && chars[index - 1] === char,
    isLineEnd: index === chars.length - 1 || chars[index + 1] === '\n',
  }))

  const l0Summary: L0Summary = {
    totalChars: characterNodes.length,
    kindDistribution: { ...EMPTY_KIND_DISTRIBUTION },
    repeatCount: 0,
    endsWithPunctuation: false,
    endChar: characterNodes.at(-1)?.char ?? null,
    hasExclamation: false,
    hasQuestion: false,
    hasEllipsis: text.includes('…') || text.includes('...'),
    hasEmoji: false,
  }

  for (const node of characterNodes) {
    l0Summary.kindDistribution[node.kind] += 1
    if (node.isRepeat) l0Summary.repeatCount += 1
    if (node.char === '！' || node.char === '!') l0Summary.hasExclamation = true
    if (node.char === '？' || node.char === '?' || node.char === 'か') l0Summary.hasQuestion = true
    if (node.kind === 'symbol') l0Summary.hasEmoji = true
  }

  l0Summary.endsWithPunctuation = characterNodes.at(-1)?.kind === 'punctuation'

  return { characterNodes, l0Summary }
}

const categorizeToken = (surface: string): TokenCategory => {
  if (GREETINGS.has(surface)) return 'greeting'
  if (PARTICLES.has(surface)) return 'particle'
  if (COPULAS.has(surface)) return 'copula'
  if (AUXILIARIES.has(surface)) return 'auxiliary'
  if (FILLERS.has(surface)) return 'filler'
  if (INTERJECTIONS.has(surface)) return 'interjection'
  if (CONNECTORS.has(surface)) return 'connector'
  if (surface.endsWith('する') || surface.endsWith('した') || surface.endsWith('して')) return 'verb'
  if (surface.endsWith('い') && surface.length > 1) return 'adjective'
  if (/^[一-龯々]+$/u.test(surface) || /^[ァ-ヿー]+$/u.test(surface)) return 'noun'
  if (surface === '？' || surface === '?' || surface === '！' || surface === '!') return 'unknown'
  return 'unknown'
}

const tokenizeText = (text: string) => {
  const filtered = Array.from(text).filter(char => !/[\s]/u.test(char))
  const rawTokens: string[] = []
  let index = 0

  while (index < filtered.length) {
    const remaining = filtered.slice(index).join('')
    const dictionaryMatch = DICTIONARY.find(entry => remaining.startsWith(entry))
    if (dictionaryMatch) {
      rawTokens.push(dictionaryMatch)
      index += Array.from(dictionaryMatch).length
      continue
    }

    const currentChar = filtered[index]
    if (!currentChar) break

    if (currentChar === '？' || currentChar === '?' || currentChar === '！' || currentChar === '!') {
      rawTokens.push(currentChar)
      index += 1
      continue
    }

    const currentKind = classifyChar(currentChar)
    let end = index + 1
    while (end < filtered.length) {
      const nextChar = filtered[end]
      if (!nextChar) break
      if (DICTIONARY.some(entry => filtered.slice(end).join('').startsWith(entry))) break
      const nextKind = classifyChar(nextChar)
      if (nextKind !== currentKind) break
      if ((currentKind === 'hiragana' || currentKind === 'katakana') && PARTICLES.has(nextChar)) break
      end += 1
    }

    rawTokens.push(filtered.slice(index, end).join(''))
    index = end
  }

  const tokenNodes: TokenNode[] = rawTokens
    .filter(surface => surface.length > 0)
    .map((surface, tokenIndex, tokens) => ({
      surface,
      index: tokenIndex,
      category: categorizeToken(surface),
      length: Array.from(surface).length,
      isFirstToken: tokenIndex === 0,
      isLastToken: tokenIndex === tokens.length - 1,
    }))

  const greetingTokens = tokenNodes.filter(token => token.category === 'greeting').map(token => token.surface)
  const l1Summary: L1Summary = {
    tokenCount: tokenNodes.length,
    categoryDistribution: { ...EMPTY_CATEGORY_DISTRIBUTION },
    hasGreeting: greetingTokens.length > 0,
    hasQuestion: tokenNodes.some(token => token.surface === 'か' || token.surface === '？' || token.surface === '?'),
    hasNegation: tokenNodes.some(token => token.surface === 'ない' || token.surface === 'ません'),
    hasFiller: tokenNodes.some(token => token.category === 'filler'),
    dominantCategory: 'unknown',
    greetingTokens,
  }

  for (const token of tokenNodes) {
    l1Summary.categoryDistribution[token.category] += 1
  }

  l1Summary.dominantCategory = (Object.entries(l1Summary.categoryDistribution)
    .sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'unknown') as TokenCategory

  return { tokenNodes, l1Summary }
}

const determineChunkRole = (tokens: TokenNode[], l1Summary: L1Summary): ChunkRole => {
  const lastToken = tokens.at(-1)
  const surfaces = tokens.map(token => token.surface)

  if (l1Summary.hasGreeting) return 'greeting'
  if (lastToken?.category === 'connector') return 'connector'
  if (lastToken?.surface === 'か' || lastToken?.surface === '？' || lastToken?.surface === '?') return 'question'
  if (tokens.some(token => token.category === 'verb' || token.category === 'adjective' || token.category === 'copula')) {
    return 'predicate'
  }
  if (tokens.some(token => token.category === 'filler' || token.category === 'interjection')) return 'standalone'
  if (surfaces.length === 1 && tokens[0]?.category === 'noun') return 'modifier'
  return 'unknown'
}

const chunkTokens = (tokenNodes: TokenNode[], l1Summary: L1Summary) => {
  const chunkNodes: ChunkNode[] = tokenNodes.length === 0
    ? []
    : [{
        tokens: tokenNodes,
        surface: tokenNodes.map(token => token.surface).join(''),
        index: 0,
        role: determineChunkRole(tokenNodes, l1Summary),
      }]

  const dominantRole = chunkNodes[0]?.role ?? 'unknown'
  const l2Summary: L2Summary = {
    chunkCount: chunkNodes.length,
    roles: chunkNodes.map(chunk => chunk.role),
    isOneChunk: chunkNodes.length === 1,
    hasSubject: chunkNodes.some(chunk => chunk.role === 'subject'),
    hasPredicate: chunkNodes.some(chunk => chunk.role === 'predicate' || chunk.role === 'greeting'),
    hasQuestion: chunkNodes.some(chunk => chunk.role === 'question' || chunk.role === 'greeting'),
    hasConnector: chunkNodes.some(chunk => chunk.role === 'connector'),
    isComplete: dominantRole !== 'connector',
    dominantRole,
  }

  return { chunkNodes, l2Summary }
}

const detectSentenceType = (
  surface: string,
  chunkNodes: ChunkNode[],
  l1Summary: L1Summary,
  l2Summary: L2Summary,
): SentenceType => {
  const hasQuestionMark = surface.includes('？') || surface.includes('?')
  const hasQuestionWord = Array.from(QUESTION_WORDS).some(word => surface.includes(word))
  const hasFeelingWord = FEELING_WORDS.some(word => surface.includes(word))
  const hasRequest = surface.includes('教えて') || surface.includes('して') || surface.includes('やって')
  const hasOpinionMarker = surface.includes('だろう') || surface.includes('かな')

  if (l1Summary.hasGreeting && (l1Summary.hasQuestion || hasQuestionMark)) return 'greeting_question'
  if (l1Summary.hasGreeting) return 'greeting'
  if (l2Summary.hasConnector) return 'continuation'
  if (hasRequest) return 'request'
  if (hasFeelingWord) return 'feeling_expression'
  if (hasQuestionWord && hasOpinionMarker) return 'opinion_question'
  if (hasQuestionWord || hasQuestionMark || l2Summary.hasQuestion) return 'information_question'
  if (chunkNodes.some(chunk => chunk.role === 'standalone')) return 'reaction'
  if (chunkNodes.some(chunk => chunk.role === 'predicate')) return 'statement'
  return 'unknown'
}

const buildSentenceLayer = (
  text: string,
  chunkNodes: ChunkNode[],
  l1Summary: L1Summary,
  l2Summary: L2Summary,
  turnCount: number,
) => {
  const sentenceType = detectSentenceType(text, chunkNodes, l1Summary, l2Summary)
  const completeness = l2Summary.hasConnector ? 'trailing' : chunkNodes.length === 0 ? 'fragment' : 'complete'
  const addressee: SentenceNode['addressee'] =
    sentenceType === 'greeting_question' ? 'me'
      : sentenceType === 'feeling_expression' ? 'self'
        : sentenceType === 'information_question' || sentenceType === 'opinion_question' ? 'general'
          : 'unknown'

  const sentence: SentenceNode = {
    chunks: chunkNodes,
    surface: text,
    sentenceType,
    completeness,
    addressee,
  }

  const l3Output: L3Output = {
    sentences: [sentence],
    overallType: sentenceType,
    overallCompleteness: completeness,
    isMultiSentence: false,
    turnCount,
  }

  return { sentence, l3Output }
}

const buildSemanticFrame = (sentence: SentenceNode, previousBrainState: LayeredBrainState): SemanticFrame => {
  const previousSemantic = previousBrainState.lastSemantic
  let need: NeedType = 'unclear'
  let gist = '何を求められているかまだ曖昧'
  let relation: SemanticFrame['relation'] = previousSemantic ? 'response' : 'new_topic'
  const topic = sentence.chunks[0]?.surface || sentence.surface || '入力'
  let contextModifier: string | null = null

  switch (sentence.sentenceType) {
    case 'greeting_question':
      need = 'connection'
      gist = previousBrainState.mood === 'heavy'
        ? '前の重さを踏まえて、こちらの状態を気にかけている'
        : '挨拶として元気か聞いている'
      relation = previousSemantic ? 'shift' : 'new_topic'
      contextModifier = previousBrainState.mood === 'heavy'
        ? '前のターンが重かったので気遣いの可能性'
        : null
      break
    case 'greeting':
      need = 'connection'
      gist = '挨拶を交わしてつながろうとしている'
      relation = previousSemantic ? 'response' : 'new_topic'
      break
    case 'information_question':
      need = 'information'
      gist = `${topic}について知りたい`
      relation = previousSemantic?.topic === topic ? 'deepening' : previousSemantic ? 'shift' : 'new_topic'
      break
    case 'opinion_question':
      need = 'reflection'
      gist = `${topic}について一緒に考えたい`
      relation = previousSemantic?.topic === topic ? 'deepening' : 'new_topic'
      break
    case 'feeling_expression':
      need = 'expression'
      gist = sentence.completeness === 'trailing'
        ? '気持ちを出しかけていて、まだ続きがある'
        : '気持ちをそのまま出している'
      relation = previousSemantic?.topic === topic ? 'deepening' : 'continuation'
      break
    case 'request':
      need = 'action'
      gist = `${topic}について何かしてほしい`
      break
    case 'reaction':
      need = 'acknowledgment'
      gist = '相手の話を受け取った反応を返している'
      break
    case 'continuation':
      need = 'expression'
      gist = '話の続きを前提にしながら開いている'
      relation = 'continuation'
      break
    case 'statement':
      need = 'acknowledgment'
      gist = `${topic}を共有している`
      break
    default:
      break
  }

  return {
    gist,
    need,
    contextModifier,
    relation,
    topic,
  }
}

const computePredictionError = (
  previousBrainState: LayeredBrainState,
  semanticFrame: SemanticFrame,
  sentenceType: SentenceType,
): PredictionError | null => {
  if (previousBrainState.turnCount === 0 || previousBrainState.prediction.expectedNeed === null) {
    return null
  }

  const needMismatch = previousBrainState.prediction.expectedNeed !== semanticFrame.need
  const topicShift =
    previousBrainState.prediction.expectedTopic !== null &&
    previousBrainState.prediction.expectedTopic !== semanticFrame.topic
  const sentenceShift =
    previousBrainState.prediction.expectedSentenceType !== null &&
    previousBrainState.prediction.expectedSentenceType !== sentenceType

  return {
    needMismatch,
    topicShift,
    surprise: clamp((needMismatch ? 0.5 : 0) + (topicShift ? 0.3 : 0) + (sentenceShift ? 0.2 : 0), 0, 1),
  }
}

const buildReactionState = (
  semanticFrame: SemanticFrame,
  previousBrainState: LayeredBrainState,
  predictionError: PredictionError | null,
) => {
  const reaction: ReactionState = {
    wantToRespond: true,
    feelsSafe: semanticFrame.need !== 'action',
    feelsRelevant: semanticFrame.need !== 'unclear',
    feelsUrgent: semanticFrame.need === 'action',
    warmth: 0,
    reactedTo: [],
    snag: null,
  }

  switch (semanticFrame.need) {
    case 'connection':
      reaction.feelsSafe = true
      reaction.warmth = 0.6
      reaction.reactedTo = ['挨拶されている']
      break
    case 'information':
      reaction.warmth = 0
      reaction.feelsRelevant = previousBrainState.recentTopics.includes(semanticFrame.topic) || semanticFrame.topic !== '入力'
      reaction.reactedTo = ['知りたいことがある']
      break
    case 'expression':
      reaction.feelsSafe = true
      reaction.warmth = 0.4
      reaction.reactedTo = ['気持ちを出している']
      break
    case 'reflection':
      reaction.warmth = 0.2
      reaction.reactedTo = ['一緒に考えたい']
      break
    case 'action':
      reaction.feelsUrgent = true
      reaction.warmth = 0.1
      reaction.reactedTo = ['動いてほしい']
      break
    case 'acknowledgment':
      reaction.warmth = 0.1
      reaction.reactedTo = ['共有している']
      break
    default:
      reaction.reactedTo = ['意図が曖昧']
      reaction.snag = '何を求められているか掴みきれない'
      break
  }

  if (previousBrainState.mood === 'heavy') {
    reaction.warmth = clamp(reaction.warmth - 0.2, -1, 1)
  }

  if (predictionError && predictionError.surprise >= 0.7) {
    reaction.snag = '急に流れが変わった'
  }

  return reaction
}

const buildDecision = (
  semanticFrame: SemanticFrame,
  reactionState: ReactionState,
  predictionError: PredictionError | null,
): Decision => {
  if (semanticFrame.need === 'connection' && reactionState.wantToRespond && reactionState.warmth > 0) {
    return {
      action: 'greet_back',
      topic: semanticFrame.topic,
      length: 'short',
      confidence: 0.8,
      showUncertainty: false,
      askBack: true,
      reasoning: '挨拶されたので短く返し、相手にも聞き返す',
    }
  }

  if (semanticFrame.need === 'information') {
    const lowConfidence = predictionError?.surprise ? predictionError.surprise > 0.6 : false
    return {
      action: lowConfidence ? 'ask_back' : 'answer',
      topic: semanticFrame.topic,
      length: lowConfidence ? 'short' : 'medium',
      confidence: lowConfidence ? 0.45 : 0.7,
      showUncertainty: lowConfidence,
      askBack: lowConfidence,
      reasoning: lowConfidence ? '分野の確信が弱いので確認を優先する' : '知りたいことに答える',
    }
  }

  if (semanticFrame.need === 'expression') {
    return {
      action: 'listen',
      topic: semanticFrame.topic,
      length: 'short',
      confidence: 0.7,
      showUncertainty: false,
      askBack: true,
      reasoning: 'まず受け止めて、続きを出しやすくする',
    }
  }

  if (semanticFrame.need === 'reflection') {
    return {
      action: 'explore',
      topic: semanticFrame.topic,
      length: 'medium',
      confidence: 0.6,
      showUncertainty: true,
      askBack: true,
      reasoning: '正解を断定せず一緒に考える',
    }
  }

  if (semanticFrame.need === 'action') {
    return {
      action: 'ask_back',
      topic: semanticFrame.topic,
      length: 'short',
      confidence: 0.55,
      showUncertainty: true,
      askBack: true,
      reasoning: '依頼内容の具体性を確認する',
    }
  }

  return {
    action: 'ask_back',
    topic: semanticFrame.topic,
    length: 'short',
    confidence: 0.4,
    showUncertainty: true,
    askBack: true,
    reasoning: '意図が曖昧なので聞き返す',
  }
}

const hashText = (value: string) => Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0)

const pickVariant = <T,>(variants: T[], seed: number) => variants[seed % variants.length]

const renderUtterance = (
  decision: Decision,
  reactionState: ReactionState,
  semanticFrame: SemanticFrame,
  inputText: string,
) => {
  const seed = hashText(`${inputText}:${decision.action}:${decision.topic}`)
  const askBackVariants = ['そっちは？', 'そっちはどう？', 'あなたは？', '']
  const askBack = decision.askBack ? pickVariant(askBackVariants, seed) : ''
  const uncertaintyPrefix = decision.showUncertainty
    ? pickVariant(['うーん、', '正直まだ読み切れてないけど、', 'はっきりとは言えないけど、'], seed)
    : ''

  if (decision.action === 'greet_back') {
    const tone = reactionState.warmth >= 0.4 ? 'warm' : reactionState.warmth >= 0 ? 'neutral' : 'cool'
    const variants = {
      warm: [
        `うん、まあまあかな。${askBack}`,
        `おー、元気だよ。${askBack}`,
        `ぼちぼちかな。${askBack}`,
      ],
      neutral: [
        `まあ、普通かな。${askBack}`,
        `うーん、どうだろう。普通。${askBack}`,
      ],
      cool: [
        `まあね。${askBack}`,
        `ぼちぼち。${askBack}`,
      ],
    }
    return pickVariant(variants[tone], seed).trim()
  }

  if (decision.action === 'answer') {
    return `${uncertaintyPrefix}${semanticFrame.topic}について知っている範囲で答えると、まだ準備段階だけど整理して返せそうだよ。`.trim()
  }

  if (decision.action === 'listen') {
    return `${uncertaintyPrefix}それ、少し引っかかってる感じがあるね。${askBack || 'もう少し聞かせて。'}`.trim()
  }

  if (decision.action === 'explore') {
    return `${uncertaintyPrefix}${semanticFrame.topic}って、すぐ答えを決めにくい問いだよね。${askBack || 'どこから考えたい？'}`.trim()
  }

  return `${uncertaintyPrefix}${askBack || 'もう少し詳しく教えて。'}`.trim()
}

const deriveNextPrediction = (semanticFrame: SemanticFrame, decision: Decision, sentenceType: SentenceType): Prediction => {
  if (decision.askBack) {
    return {
      expectedNeed: semanticFrame.need === 'connection' ? 'connection' : semanticFrame.need === 'expression' ? 'expression' : 'information',
      expectedTopic: semanticFrame.need === 'connection' ? '相手の状態' : semanticFrame.topic,
      expectedSentenceType: semanticFrame.need === 'expression' ? 'feeling_expression' : sentenceType,
    }
  }

  return {
    expectedNeed: semanticFrame.need,
    expectedTopic: semanticFrame.topic,
    expectedSentenceType: sentenceType,
  }
}

const deriveMood = (reactionState: ReactionState, decision: Decision, predictionError: PredictionError | null): LayeredBrainMood => {
  if (decision.showUncertainty || (predictionError?.surprise ?? 0) > 0.6) return 'uncertain'
  if (reactionState.warmth >= 0.4) return 'light'
  if (!reactionState.feelsSafe) return 'heavy'
  return 'neutral'
}

const buildTrace = (
  text: string,
  previousBrainState: LayeredBrainState,
): LayeredThinkingTrace => {
  const { characterNodes, l0Summary } = analyzeCharacters(text)
  const { tokenNodes, l1Summary } = tokenizeText(text)
  const { chunkNodes, l2Summary } = chunkTokens(tokenNodes, l1Summary)
  const { sentence, l3Output } = buildSentenceLayer(text, chunkNodes, l1Summary, l2Summary, previousBrainState.turnCount)
  const semanticFrame = buildSemanticFrame(sentence, previousBrainState)
  const predictionError = computePredictionError(previousBrainState, semanticFrame, sentence.sentenceType)
  const reactionState = buildReactionState(semanticFrame, previousBrainState, predictionError)
  const decision = buildDecision(semanticFrame, reactionState, predictionError)
  const utterance = renderUtterance(decision, reactionState, semanticFrame, text)
  const nextPrediction = deriveNextPrediction(semanticFrame, decision, sentence.sentenceType)
  const nextBrainState: LayeredBrainState = {
    turnCount: previousBrainState.turnCount + 1,
    lastSemantic: semanticFrame,
    lastDecision: decision,
    lastUtterance: utterance,
    prediction: nextPrediction,
    mood: deriveMood(reactionState, decision, predictionError),
    recentTopics: [semanticFrame.topic, ...previousBrainState.recentTopics].slice(0, 5),
  }

  return {
    characterNodes,
    l0Summary,
    tokenNodes,
    l1Summary,
    chunkNodes,
    l2Summary,
    l3Output,
    semanticFrame,
    reactionState,
    decision,
    utterance,
    predictionError,
    nextPrediction,
    nextBrainState,
  }
}

export const runLayeredThinkingRuntime = async ({
  text,
  personalLearning,
  plasticity,
  brainState,
}: LayeredThinkingRuntimeInput): Promise<LayeredThinkingResult> => {
  void personalLearning
  void plasticity
  const previousBrainState = brainState ?? createInitialLayeredBrainState()
  const trace = buildTrace(text, previousBrainState)

  return {
    implementationMode: 'layered_thinking',
    utterance: trace.utterance,
    trace,
  }
}
