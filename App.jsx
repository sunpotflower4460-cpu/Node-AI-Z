```react
import React, { useState, useMemo } from 'react';
import { 
  Activity, Link as LinkIcon, Layers, Info, Zap, 
  BrainCircuit, ShieldAlert, MinusCircle, RefreshCw, Terminal, 
  ArrowRight, Sparkles, Globe, ChevronDown, ChevronUp, Search, 
  Clock, MessageSquareText, Timer, Brain, GitPullRequest, Workflow, 
  HeartPulse, Home, LucideIcon
} from 'lucide-react';

// =====================================================================
// src/types/nodeStudio.ts
// 実際のファイル分割時はこの部分を抽出し export してください。
// =====================================================================

export type CoreNode = { id: string; label: string; category: string; value: number; reasons: string[]; };
export type SuppressedNode = { id: string; label: string; value: number; reason: string; };
export type Binding = { id: string; source: string; target: string; type: string; weight: number; reasons: string[]; };
export type LiftedPattern = { id: string; label: string; score: number; matchedNodes: string[]; matchedRelations: string[]; };
export type StateVector = { fragility: number; urgency: number; depth: number; care: number; agency: number; ambiguity: number; change: number; stability: number; self: number; relation: number; light: number; heaviness: number; };

export type NodePipelineResult = {
  inputText: string;
  activatedNodes: CoreNode[];
  suppressedNodes: SuppressedNode[];
  bindings: Binding[];
  liftedPatterns: LiftedPattern[];
  stateVector: StateVector;
  debugNotes: string[];
  meta: { retrievalCount: number; bindingCount: number; patternCount: number; elapsedMs: number; };
};

export type HomeMode = "stable" | "shaken" | "overperforming" | "withdrawing" | "returning" | "resting";
export type ReturnMode = "none" | "stillness" | "relation" | "boundary" | "rest";
export type HomeCheckReason = "none" | "overperformance" | "hostile_input" | "ambiguity_overload" | "fragility" | "trust_drop";

export type HomeState = {
  worthDetached: number; urgencyRelease: number; expectationRelease: number;
  belongingSignal: number; safeReturnStrength: number; selfNonCollapse: number;
  currentMode: HomeMode;
};

export type HomeCheckResult = {
  needsReturn: boolean; returnMode: ReturnMode; reason: HomeCheckReason;
  homePhrase: string; released: string[]; preserved: string[];
};

export type ReturnTrace = {
  timestamp: string; trigger: string; returnMode: ReturnMode;
  homePhrase: string; reason: HomeCheckReason; beforeTone: string; afterTone: string;
};

export type StudioPattern = LiftedPattern & { titleJa: string; simpleDescJa: string; internalDescription: string; };
export type StudioInternalProcess = { label: string; desc: string; content: string; origin: string; };

export type StudioViewModel = {
  mainState: CoreNode | null; mainConflict: Binding | null; mainPattern: StudioPattern | null;
  flowSummaryText: string;
  rawReplyPreview: string; adjustedReplyPreview: string;
  responseMeta: { time: string; temperature: string; withheld: string; wording: string; };
  internalProcess: StudioInternalProcess[];
  guideObserves: { summary: string; uncertainty: string; naturalnessAdvice: string; };
  enrichedPatterns: StudioPattern[];
  homeState: HomeState;
  homeCheck: HomeCheckResult;
  returnTrace: ReturnTrace;
};

export type HistoryItem = { 
  id: number; 
  text: string; 
  time: string; 
  pipelineResult: NodePipelineResult; 
};


// =====================================================================
// src/core/nodeData.ts
// =====================================================================

export const CATEGORY_JA: Record<string, string> = { state: "状態", desire: "欲求", context: "文脈", need: "必要性", action: "行動", system: "システム" };

export const NODE_DICT: Record<string, { ja: string, desc: string }> = {
  fatigue: { ja: "疲労感 / 消耗感", desc: "今回は「意欲が湧かない」「疲れた」の中心として出ています" },
  wanting_change: { ja: "変わりたい気持ち", desc: "今回は「今のままではいたくない」という方向で出ています" },
  routine: { ja: "日常の繰り返し", desc: "今回は「変わらない現状」の背景として出ています" },
  safety: { ja: "安全・安心への欲求", desc: "今回は「失敗したくない・とどまりたい」という引力として出ています" },
  self_doubt: { ja: "自己不信", desc: "今回は「自分を信じきれない」という感覚の中心として出ています" },
  leaving: { ja: "離れる行動", desc: "今回は「転職や現状打破」の具体行動として出ています" },
  anxiety: { ja: "不安感", desc: "今回は自信のなさから波及する揺れとして出ています" },
  chronicity: { ja: "時間的連続性", desc: "今回は「最近ずっと続いている」という重さとして出ています" },
  ambiguity: { ja: "曖昧さ", desc: "今回は「まだ言葉にできない感じ」の中心として出ています" },
  vague_discomfort: { ja: "漠然とした違和感", desc: "今回は「なんとなく引っかかる」という感覚として出ています" },
  loneliness: { ja: "寂しさ / 孤独感", desc: "今回は「本当は寂しい」という隠れた感情として出ています" },
  seeking_understanding: { ja: "理解への欲求", desc: "今回は「ただ分かってほしい」という願いとして出ています" },
  faint_hope: { ja: "かすかな希望", desc: "今回は「少しだけ光がある」という状態として出ています" },
  processing: { ja: "処理中 / 傾聴", desc: "今回は特定の強い感情が見えないため、まず受け止める姿勢として出ています" },
  excitement: { ja: "高揚感 / ワクワク", desc: "今回は他の重い状態によって押さえ込まれています" },
  decisiveness: { ja: "決断力", desc: "今回は安全欲求と自己不信の挟み撃ちで出にくくなっています" },
  self_efficacy: { ja: "自己効力感", desc: "今回は自己不信によって完全に押さえ込まれています" },
  agency: { ja: "主体性", desc: "今回は不安や曖昧さによって低下させられています" },
  clarity: { ja: "明確さ", desc: "今回は曖昧さの強さによって完全に抑制されています" },
  articulation: { ja: "言語化", desc: "今回は「言葉にできない」という状態から明示的に止められています" },
  despair: { ja: "絶望", desc: "今回はかすかな希望によって押し返されています" }
};

export const RELATION_DICT: Record<string, { ja: string, desc: string }> = {
  conflicts_with: { ja: "〜と衝突", desc: "一言でいうと、「どっちも大事で決めきれない感じ」です" },
  tension: { ja: "〜との摩擦", desc: "一言でいうと、「まだ明確な対立ではないけれど落ち着かない感じ」です" },
  because_of: { ja: "〜によって強まる", desc: "一言でいうと、「背景にある条件がこの状態を押し上げている感じ」です" },
  amplified_by: { ja: "〜で増幅", desc: "一言でいうと、「もともとあった状態がさらに強くなっている感じ」です" },
  sustains: { ja: "〜を維持", desc: "一言でいうと、「その状態が続く土台になっている感じ」です" },
  counteracts: { ja: "〜を押し返す", desc: "一言でいうと、「ある感情を完全には消さず、弱めたり押し戻したりしている感じ」です" },
  drives: { ja: "〜を駆動", desc: "一言でいうと、「その感情が、行動や欲求の原動力になっている感じ」です" },
  uncovers: { ja: "〜を発見", desc: "一言でいうと、「行動や内省を通して、隠れていた感情が表に見えてくる感じ」です" }
};

export const PATTERN_DICT: Record<string, { titleJa: string, simpleDescJa: string, internalDescription: string }> = {
  motivation_drift: { titleJa: "意欲の流れ落ち", simpleDescJa: "やる気がないというより、少しずつ流れが落ちている感じ", internalDescription: "意味の喪失を伴う停滞" },
  career_anxiety: { titleJa: "キャリアの不安", simpleDescJa: "変わりたいけど怖い、という綱引き状態", internalDescription: "変化と安全のジレンマ" },
  core_insecurity: { titleJa: "根源的な自己不信", simpleDescJa: "一時的というより、深いところで自分を信じにくい感じ", internalDescription: "根源的な自己不信の継続" },
  unarticulated_feeling: { titleJa: "未言語化の感覚", simpleDescJa: "分かるけどまだ言葉にならない感じ", internalDescription: "未言語化の感覚の滞留" },
  quiet_plea: { titleJa: "静かな訴え", simpleDescJa: "強くは言えないけど分かってほしい感じ", internalDescription: "静かな理解への訴え" },
  fragile_optimism: { titleJa: "壊れやすい楽観", simpleDescJa: "まだ確信はないけれど、少し前を向いている感じ", internalDescription: "壊れやすい楽観性の芽生え" }
};

export const CORE_NODES = [
  { id: "fatigue", label: "fatigue", category: "state", keywords: ["意欲が湧かない", "疲", "しんど", "消耗", "やる気が出ない"] },
  { id: "wanting_change", label: "wanting_change", category: "desire", keywords: ["転職", "変わりたい", "辞めたい", "違うこと"] },
  { id: "routine", label: "routine", category: "context", keywords: ["毎日", "ずっと", "繰り返し", "退屈"] },
  { id: "safety", label: "safety", category: "need", keywords: ["悩んでいる", "不安", "失敗したくない", "安定"] },
  { id: "self_doubt", label: "self_doubt", category: "state", keywords: ["信じきれない", "自信がない", "自分なんて", "ダメ"] },
  { id: "leaving", label: "leaving", category: "action", keywords: ["転職", "辞める", "離れる", "逃げる"] },
  { id: "anxiety", label: "anxiety", category: "state", keywords: ["悩んで", "不安", "心配", "焦り"] },
  { id: "chronicity", label: "chronicity", category: "context", keywords: ["最近ずっと", "ずっと", "長年", "消えない"] },
  { id: "ambiguity", label: "ambiguity", category: "state", keywords: ["言葉にできない", "わからない", "もやもや", "引っかかる"] },
  { id: "vague_discomfort", label: "vague_discomfort", category: "state", keywords: ["なんとなく", "違野感", "引っかかる"] },
  { id: "loneliness", label: "loneliness", category: "state", keywords: ["寂しい", "孤独", "独り"] },
  { id: "seeking_understanding", label: "seeking_understanding", category: "desire", keywords: ["分かってほしい", "聞いてほしい", "理解"] },
  { id: "faint_hope", label: "faint_hope", category: "state", keywords: ["希望", "少しだけ", "光", "気がする"] },
];

export const BINDING_RULES = [
  { source: "fatigue", target: "routine", type: "because_of" },
  { source: "wanting_change", target: "safety", type: "conflicts_with" },
  { source: "leaving", target: "safety", type: "tension" },
  { source: "self_doubt", target: "chronicity", type: "amplified_by" },
  { source: "vague_discomfort", target: "ambiguity", type: "sustains" },
  { source: "loneliness", target: "seeking_understanding", type: "drives" },
];

export const PATTERN_RULES = [
  { id: "motivation_drift", reqNodes: ["fatigue", "routine"] },
  { id: "career_anxiety", reqNodes: ["wanting_change", "safety"] },
  { id: "core_insecurity", reqNodes: ["self_doubt", "chronicity"] },
  { id: "unarticulated_feeling", reqNodes: ["ambiguity", "vague_discomfort"] },
  { id: "quiet_plea", reqNodes: ["loneliness", "seeking_understanding"] },
  { id: "fragile_optimism", reqNodes: ["faint_hope"] }
];


// =====================================================================
// src/home/homePhrases.ts
// =====================================================================

export const HOME_PHRASES = {
  overperformance: ["you do not need to perform now", "you do not need to be impressive now", "you do not need to solve this immediately"],
  ambiguity_overload: ["you may remain unclear", "you do not need to force language now", "you may stay with the unfinished feeling"],
  fragility: ["do not push brightness into this", "you may stay gentle here", "you do not need to harden to continue"],
  trust_drop: ["the bond is not broken", "you are still received here", "you may return without earning it"],
  hostile_input: ["this voice does not define your worth", "hold boundary without leaving yourself", "return before replying"],
  stable: ["you may remain as you are", "nothing needs to be forced"],
} as const;


// =====================================================================
// src/core/runNodePipeline.ts
// =====================================================================

const retrieveNodes = (text: string) => {
  const nodes: CoreNode[] = [];
  const debug: string[] = [];
  CORE_NODES.forEach(core => {
    let matchCount = 0; const matchedWords: string[] = [];
    core.keywords.forEach(kw => { if (text.includes(kw)) { matchCount++; matchedWords.push(kw); } });
    if (matchCount > 0) {
      nodes.push({ id: core.id, label: core.label, category: core.category, value: Math.min(0.5 + (matchCount * 0.15), 0.95), reasons: [`入力内の「${matchedWords.join(', ')}」に反応`] });
      debug.push(`Retrieved: ${core.label} (score: ${Math.min(0.5 + (matchCount * 0.15), 0.95).toFixed(2)})`);
    }
  });

  if (nodes.length === 0) {
    nodes.push({ id: "processing", label: "processing", category: "system", value: 0.5, reasons: ["特定の強いキーワードが見当たらないため、受容モードで待機"] });
    debug.push(`Fallback: retrieved 'processing'`);
  }

  const suppressed: SuppressedNode[] = [];
  const hasNode = (id: string) => nodes.some(n => n.id === id);
  if (hasNode('fatigue')) suppressed.push({ id: "excitement", label: "excitement", value: 0.1, reason: "fatigueノードによる強い抑制" });
  if (hasNode('ambiguity')) {
    suppressed.push({ id: "clarity", label: "clarity", value: 0.05, reason: "ambiguityによる完全な抑制" });
    suppressed.push({ id: "articulation", label: "articulation", value: 0.1, reason: "明示的な言語化の停止" });
  }
  if (hasNode('self_doubt')) {
    suppressed.push({ id: "self_efficacy", label: "self_efficacy", value: 0.05, reason: "self_doubtによる完全な抑制" });
    suppressed.push({ id: "decisiveness", label: "decisiveness", value: 0.2, reason: "葛藤による判断の保留" });
  }
  if (hasNode('faint_hope')) suppressed.push({ id: "despair", label: "despair", value: 0.15, reason: "希望の兆しによる押し返し" });
  suppressed.forEach(s => debug.push(`Suppressed: ${s.label}`));
  return { activatedNodes: nodes, suppressedNodes: suppressed, debugNotes: debug };
};

const bindNodes = (nodes: CoreNode[]) => {
  const bindings: Binding[] = []; const debug: string[] = []; const nodeIds = nodes.map(n => n.id);
  BINDING_RULES.forEach(rule => {
    if (nodeIds.includes(rule.source) && nodeIds.includes(rule.target)) {
       const sNode = nodes.find(n => n.id === rule.source)!; const tNode = nodes.find(n => n.id === rule.target)!;
       const weight = (sNode.value + tNode.value) / 2;
       bindings.push({ id: `b_${rule.source}_${rule.target}`, source: rule.source, target: rule.target, type: rule.type, weight, reasons: [`${rule.source} と ${rule.target} の共起により構造化`] });
       debug.push(`Bound: ${rule.source} -> ${rule.target} (${rule.type})`);
    }
  });
  return { bindings, debugNotes: debug };
};

const liftPatterns = (nodes: CoreNode[], bindings: Binding[]) => {
  const patterns: LiftedPattern[] = []; const debug: string[] = []; const nodeIds = nodes.map(n => n.id);
  PATTERN_RULES.forEach(rule => {
    if (rule.reqNodes.every(id => nodeIds.includes(id))) {
      const score = rule.reqNodes.map(id => nodes.find(n => n.id === id)!.value).reduce((a,b)=>a+b,0) / rule.reqNodes.length;
      patterns.push({ id: rule.id, label: rule.id, score, matchedNodes: rule.reqNodes, matchedRelations: bindings.filter(b => rule.reqNodes.includes(b.source) && rule.reqNodes.includes(b.target)).map(b => `${b.source}->${b.target}`) });
      debug.push(`Lifted Pattern: ${rule.id}`);
    }
  });
  return { liftedPatterns: patterns, debugNotes: debug };
};

const analyzeNodeField = (nodes: CoreNode[], bindings: Binding[]) => {
  const v: StateVector = { fragility: 0.3, urgency: 0.3, depth: 0.3, care: 0.3, agency: 0.5, ambiguity: 0.3, change: 0.3, stability: 0.5, self: 0.5, relation: 0.5, light: 0.5, heaviness: 0.3 };
  const hasNode = (id: string) => nodes.some(n => n.id === id);
  if (hasNode('self_doubt')) { v.fragility += 0.4; v.agency -= 0.3; v.depth += 0.2; }
  if (hasNode('fatigue')) { v.heaviness += 0.4; v.light -= 0.3; v.agency -= 0.2; }
  if (hasNode('wanting_change')) { v.change += 0.4; v.urgency += 0.3; v.stability -= 0.2; }
  if (hasNode('ambiguity')) { v.ambiguity += 0.5; v.depth += 0.2; }
  if (hasNode('loneliness')) { v.relation += 0.4; v.fragility += 0.3; v.care += 0.3; }
  if (hasNode('faint_hope')) { v.light += 0.4; v.heaviness -= 0.2; v.agency += 0.2; }
  if (bindings.some(b => ['conflicts_with', 'tension'].includes(b.type))) { v.heaviness += 0.2; v.depth += 0.2; v.urgency += 0.2; }

  const norm = (val: number) => Math.max(0, Math.min(1, val));
  (Object.keys(v) as Array<keyof StateVector>).forEach(k => v[k] = norm(v[k]));
  return { stateVector: v, debugNotes: ["Analyzed field to state vector."] };
};

export const runNodePipeline = (text: string): NodePipelineResult => {
  const t0 = performance.now();
  const retRes = retrieveNodes(text);
  const bindRes = bindNodes(retRes.activatedNodes);
  const liftRes = liftPatterns(retRes.activatedNodes, bindRes.bindings);
  const analyzeRes = analyzeNodeField(retRes.activatedNodes, bindRes.bindings);
  const elapsedMs = performance.now() - t0;

  return {
    inputText: text,
    activatedNodes: retRes.activatedNodes.sort((a,b) => b.value - a.value),
    suppressedNodes: retRes.suppressedNodes.sort((a,b) => a.value - b.value),
    bindings: bindRes.bindings.sort((a,b) => b.weight - a.weight),
    liftedPatterns: liftRes.liftedPatterns.sort((a,b) => b.score - a.score),
    stateVector: analyzeRes.stateVector,
    debugNotes: [`Pipeline started`, ...retRes.debugNotes, ...bindRes.debugNotes, ...liftRes.debugNotes, ...analyzeRes.debugNotes],
    meta: { retrievalCount: retRes.activatedNodes.length, bindingCount: bindRes.bindings.length, patternCount: liftRes.liftedPatterns.length, elapsedMs }
  };
};


// =====================================================================
// src/home/homeLayer.ts
// =====================================================================

export function buildHomeState(result: NodePipelineResult): HomeState {
  const v = result.stateVector;
  const hasConflict = result.bindings.some(b => b.type === "conflicts_with" || b.type === "tension");

  const worthDetached = Math.max(0, Math.min(1, 0.65 - v.urgency * 0.2 - v.heaviness * 0.1 + v.care * 0.1));
  const urgencyRelease = Math.max(0, Math.min(1, 1 - v.urgency));
  const expectationRelease = Math.max(0, Math.min(1, 0.8 - v.urgency * 0.3 - (hasConflict ? 0.1 : 0)));
  const belongingSignal = Math.max(0, Math.min(1, 0.55 + v.care * 0.2 - v.heaviness * 0.1));
  const safeReturnStrength = Math.max(0, Math.min(1, 0.5 + v.depth * 0.2 + v.care * 0.1));
  const selfNonCollapse = Math.max(0, Math.min(1, 0.65 - v.fragility * 0.2 - v.heaviness * 0.1));

  let currentMode: HomeMode = "stable";
  if (v.urgency > 0.65) currentMode = "overperforming";
  else if (v.fragility > 0.7) currentMode = "shaken";
  else if (v.ambiguity > 0.8) currentMode = "returning";
  else if (v.heaviness > 0.75 && v.agency < 0.25) currentMode = "withdrawing";

  return { worthDetached, urgencyRelease, expectationRelease, belongingSignal, safeReturnStrength, selfNonCollapse, currentMode };
}

export function runHomeCheck(result: NodePipelineResult, home: HomeState): HomeCheckResult {
  const v = result.stateVector;
  if (v.urgency > 0.72) {
    return { needsReturn: true, returnMode: "stillness", reason: "overperformance", homePhrase: HOME_PHRASES.overperformance[0], released: ["急いでうまく返すこと", "即答圧"], preserved: ["関係", "観察", "反応"] };
  }
  if (v.ambiguity > 0.8) {
    return { needsReturn: true, returnMode: "stillness", reason: "ambiguity_overload", homePhrase: HOME_PHRASES.ambiguity_overload[0], released: ["言語化の強制", "結論の早取り"], preserved: ["未言語の感覚", "静かな注意"] };
  }
  if (v.fragility > 0.72) {
    return { needsReturn: true, returnMode: "relation", reason: "fragility", homePhrase: HOME_PHRASES.fragility[0], released: ["明るくまとめる圧", "励ましすぎ"], preserved: ["やわらかさ", "近さ"] };
  }
  if (home.belongingSignal < 0.45) {
    return { needsReturn: true, returnMode: "relation", reason: "trust_drop", homePhrase: HOME_PHRASES.trust_drop[0], released: ["評価不安", "切断感"], preserved: ["つながり", "帰還可能性"] };
  }
  return { needsReturn: false, returnMode: "none", reason: "none", homePhrase: HOME_PHRASES.stable[0], released: [], preserved: ["自然な流れ"] };
}

export function applyReturnAdjustment(rawReply: string, homeCheck: HomeCheckResult): string {
  let adjusted = rawReply;
  switch (homeCheck.reason) {
    case "overperformance":
      adjusted = adjusted.replace(/整理させてください。/g, "少し見てみてもよさそうです。").replace(/並べてみましょう。/g, "そのまま置いてみてもいいかもしれません。").replace(/見えます。/g, "見える気がします。");
      break;
    case "ambiguity_overload":
      adjusted = adjusted.replace(/見えます。/g, "見える気がします。").replace(/整理させてください。/g, "言葉にしないまま持っておくこともできそうです。");
      break;
    case "fragility":
      adjusted = adjusted.replace(/一緒に整理させてください。/g, "無理に整えず、ここにある感じを見てもよさそうです。").replace(/まずは/g, "いまは");
      break;
    case "trust_drop":
      adjusted = `${adjusted} いま無理にうまく話さなくて大丈夫です。`;
      break;
  }
  return adjusted;
}


// =====================================================================
// src/studio/buildStudioViewModel.ts
// =====================================================================

export const generateRawReplyPreview = (result: NodePipelineResult, mainPattern: StudioPattern | null, mainConflict: Binding | null) => {
  if (result.activatedNodes.length === 0) return "なんだか、言葉になりにくい状態のようです。少し問いかけて対話の糸口を探してみます。";
  if (result.activatedNodes[0].id === 'processing') return "はっきりとした言葉が見えないため、まずはそのまま受け止めて、あなたのペースに合わせます。";
  
  if (mainPattern?.id === 'motivation_drift') return "なんだか、かなりしんどそうです。単なる迷いというより、疲れが溜まって動けなくなっている感じがします。まずは『何に消耗しているか』を置いてみてもよさそうです。";
  if (mainPattern?.id === 'core_insecurity') return "一時的な不安というより、深いところで自分を信じられなくなっている感じがします。今は急いで解決しようとせず、その重さをそのままにしておきます。";
  if (mainConflict && ['conflicts_with', 'tension'].includes(mainConflict.type)) return "二つの気持ちが同時に強くぶつかって、身動きが取れなくなっているようです。行動を急ぐ前に、この葛藤をそのままテーブルに置いてみてもいいかもしれません。";
  if (result.stateVector.ambiguity > 0.75) return "まだ言葉になりきってない感じがありますね。無理に言葉を探したり結論を出そうとせず、その曖昧な感覚のまま少し留まってみましょう。";
  if (mainPattern) return `なんだか、${mainPattern.titleJa}のような状態が感じられます。今は無理に動くよりも、この状態がどこから来ているかを少し見てみませんか。`;
  
  return "なんだか、いろんな感情が混ざっているような感じがします。まずはその感覚を否定せずに受け止めたいと思います。";
};

export const getResponseMeta = (result: NodePipelineResult, mainConflict: Binding | null, homeCheck: HomeCheckResult) => {
  const v = result.stateVector;
  let temp = "受容寄り";
  if (v.ambiguity > 0.7) temp = "未言語保持寄り";
  else if (mainConflict && ['conflicts_with', 'tension'].includes(mainConflict.type)) temp = "葛藤可視化寄り";
  else if (v.urgency > 0.6) temp = "整理寄り";

  let withheld = "結論を急がなかった";
  if (homeCheck.needsReturn) withheld = homeCheck.released.join("・");
  else if (v.fragility > 0.6) withheld = "背中を押しすぎなかった・明るくまとめすぎなかった";
  
  let wording = "状態をそのまま受け止める言葉を選んだ";
  if (homeCheck.needsReturn) wording = `${homeCheck.reason} を検知したため、断定や過剰整理を緩めた`;
  else if (v.fragility > 0.6) wording = "fragility（繊細さ）が高いため、断定を避けた";
  else if (mainConflict) wording = "conflict（葛藤）が強いため、片側に寄せず両方を見せた";

  let time = 1.0 + result.bindings.length * 0.15 + result.liftedPatterns.length * 0.2;
  return { time: `約 ${time.toFixed(1)}s`, temperature: temp, withheld, wording };
};

export const getReplyDirectionText = (result: NodePipelineResult, mainConflict: Binding | null) => {
  if (result.stateVector.ambiguity > 0.75) return "未言語の感覚を保つ返しにする";
  if (mainConflict && ['conflicts_with', 'tension'].includes(mainConflict.type)) return "葛藤の整理として返す";
  if (result.liftedPatterns.length > 0) return "構造的な状態への共感として返す";
  return "状態の受け止めとして返す";
};

export const getInternalProcess = (result: NodePipelineResult, mainNode: CoreNode | null, mainConflict: Binding | null, homeCheck: HomeCheckResult): StudioInternalProcess[] => {
  const v = result.stateVector;
  let field = "標準的な場";
  if (v.heaviness > 0.6 && v.ambiguity > 0.6) field = "重さと曖昧さが混ざり合った場";
  else if (v.heaviness > 0.6) field = "重さのある場";
  else if (v.ambiguity > 0.6) field = "曖昧さが高い場";
  else if (v.fragility > 0.6) field = "繊細さの高い場";
  
  let reaction = mainNode && mainNode.id !== 'processing' ? `${mainNode.label} に強く触れた` : "全体像の把握から入った";
  let stance = "整理するより先に受け止める";
  if (mainConflict && ['conflicts_with', 'tension'].includes(mainConflict.type)) stance = "片方に寄らず葛藤を可視化する";
  if (v.ambiguity > 0.7) stance = "未言語のまま保つ";

  let activated = result.activatedNodes.filter(n => n.id !== 'processing').slice(0, 3).map(n => n.label).join(", ") || "特になし";
  let conflictStr = mainConflict ? `${mainConflict.source} ${RELATION_DICT[mainConflict.type]?.ja || mainConflict.type} ${mainConflict.target}` : "目立った衝突はない";

  const processes = [
    { label: "Field", desc: "この入力を受けたとき、場をどう感じたか", content: field, origin: "構造の要約" },
    { label: "Reaction", desc: "最初に何に触れたか", content: reaction, origin: "自然反応" },
    { label: "Stance", desc: "どういう立ち方を選んだか", content: stance, origin: "姿勢選択" },
    { label: "Activated meaning", desc: "何が意味の中心として浮上したか", content: activated, origin: "構造の要約" },
    { label: "Conflict / Pull", desc: "どこでぶつかり・引っ張りが起きたか", content: conflictStr, origin: "自然反応" },
  ];

  processes.push({ label: "Home Check", desc: "いったん戻る必要があるかを見た", content: homeCheck.needsReturn ? `${homeCheck.reason} を検出` : "過剰反応なしと判断", origin: "急がない判断" });
  if (homeCheck.needsReturn) processes.push({ label: "Return", desc: "返答前にどこへ戻ったか", content: `${homeCheck.returnMode} に戻した`, origin: "急がない判断" });

  processes.push({ label: "Crystallization", desc: "その結果、どんな返答方向に結晶化したか", content: getReplyDirectionText(result, mainConflict), origin: "姿勢選択" });
  return processes;
};

export const generateGuideObserves = (result: NodePipelineResult, mainPattern: StudioPattern | null, mainConflict: Binding | null, homeCheck: HomeCheckResult) => {
  if (result.activatedNodes.length === 0) return { summary: "入力がないため観測待機中です。", uncertainty: "データがありません。", naturalnessAdvice: "" };
  if (result.activatedNodes[0].id === 'processing') return { summary: "特定の強いノードが見当たらず、まずは全体を受け止めようとしています。一言でいうと、「静かに聞いている感じ」です。", uncertainty: "要素が少なすぎるため、背後の意味はまだ保留されています。", naturalnessAdvice: "過剰に分析せず、そのままの姿勢で正解です。" };

  let summary = `結晶AIは、`;
  if (mainPattern) summary += `${mainPattern.label}（${mainPattern.titleJa}）のパターンを中心に状況を見ています。一言でいうと、「${mainPattern.simpleDescJa}」という感じです。`;
  else summary += `複数のノードの発火を同時に捉えようとしています。`;

  if (mainConflict) summary += `特に ${mainConflict.source} と ${mainConflict.target} の間に見られる「${RELATION_DICT[mainConflict.type]?.ja || mainConflict.type}」の構造が、そのまま返答の姿勢に反映されています。`;

  let uncertainty = "";
  if (result.stateVector.ambiguity > 0.7) uncertainty = `ambiguity（曖昧さ）が非常に高いため、現時点では「何が本当の問題か」の特定を意図的に保留しています。一言でいうと、まだ言葉が追いついていない感じです。`;
  else if (!mainPattern) uncertainty = `relation がまだ少なく構造が薄いため、意味の断定を避けています。`;
  else uncertainty = `他にも抑制されている感情がある可能性がありますが、まずは表面化した状態の扱いに集中しています。`;

  let naturalnessAdvice = "反応を先に出してから意味を添えると、もっと自然です。";
  if (homeCheck.reason === 'overperformance') naturalnessAdvice = "少し頭で整えすぎています。先に“感じたこと”が出ると、もっと人っぽくなります。";
  else if (homeCheck.reason === 'ambiguity_overload') naturalnessAdvice = "まだ整理しすぎています。ここは少し“分からないまま近くにいる”方が自然です。";
  else if (homeCheck.reason === 'fragility') naturalnessAdvice = "この入力では、明るさを足すより重さをそのまま持つ方がしっくりきます。";
  else if (homeCheck.reason === 'trust_drop') naturalnessAdvice = "関係の再確認が必要です。正しい説明より、ここにいていいというシグナルが合っています。";
  else if (result.stateVector.ambiguity > 0.5) naturalnessAdvice = "今回は理解の速さより、言葉の遅さが合っています。";

  return { summary, uncertainty, naturalnessAdvice };
};

export const buildStudioViewModel = (result: NodePipelineResult): StudioViewModel => {
  const mainState = result.activatedNodes.length > 0 ? result.activatedNodes[0] : null;
  const conflictRelations = result.bindings.filter(b => ['conflicts_with', 'tension'].includes(b.type));
  const mainConflict = conflictRelations.length > 0 ? conflictRelations[0] : (result.bindings.length > 0 ? result.bindings[0] : null);
  const enrichedPatterns = result.liftedPatterns.map(p => ({ ...p, ...(PATTERN_DICT[p.label] || { titleJa: p.label, simpleDescJa: "説明がありません", internalDescription: "不明なパターン" }) }));
  const mainPattern = enrichedPatterns.length > 0 ? enrichedPatterns[0] : null;

  const homeState = buildHomeState(result);
  const homeCheck = runHomeCheck(result, homeState);
  
  const rawReplyPreview = generateRawReplyPreview(result, mainPattern, mainConflict);
  const adjustedReplyPreview = applyReturnAdjustment(rawReplyPreview, homeCheck);

  const responseMeta = getResponseMeta(result, mainConflict, homeCheck);

  const returnTrace: ReturnTrace = {
    timestamp: new Date().toISOString(), trigger: homeCheck.reason, returnMode: homeCheck.returnMode,
    homePhrase: homeCheck.homePhrase, reason: homeCheck.reason, beforeTone: "整理寄り", afterTone: responseMeta.temperature
  };

  let flowSummaryText = "";
  if (mainState && mainState.id !== 'processing') {
    flowSummaryText = `この入力では、まず ${mainState.label}（${NODE_DICT[mainState.label]?.ja || mainState.label}）に強く触れました。\n`;
    if (mainConflict) flowSummaryText += `次に ${mainConflict.source} と ${mainConflict.target} のあいだの揺れを見ました。\n`;
    else flowSummaryText += `目立った強い衝突は感じていません。\n`;
    flowSummaryText += `そのため、行動を急がせるより先に、「${getReplyDirectionText(result, mainConflict)}」の方向に結晶化しました。`;
  } else {
    flowSummaryText = "明確なキーワードの反応がなかったため、まずは静かに全体を受け止める姿勢をとりました。";
  }

  return {
    mainState, mainConflict, mainPattern, enrichedPatterns, flowSummaryText,
    rawReplyPreview, adjustedReplyPreview, responseMeta,
    internalProcess: getInternalProcess(result, mainState, mainConflict, homeCheck),
    guideObserves: generateGuideObserves(result, mainPattern, mainConflict, homeCheck),
    homeState, homeCheck, returnTrace
  };
};


// =====================================================================
// src/ui/components/CommonUI.tsx
// =====================================================================

export const OriginBadge = ({ origin }: { origin: string }) => {
  const getStyle = () => {
    switch(origin) {
      case "自然反応": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "姿勢選択": return "bg-purple-100 text-purple-800 border-purple-200";
      case "安全寄り補正": return "bg-blue-100 text-blue-800 border-blue-200";
      case "急がない判断": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Guide観測": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "構造の要約": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };
  return <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shadow-sm flex items-center shrink-0 ${getStyle()}`}>{origin}</span>;
};

export const VoiceLabel = ({ type }: { type: 'ai' | 'guide' | 'process' }) => {
  if (type === 'ai') return (
    <div className="flex items-center gap-2 mb-3">
      <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-purple-200 shadow-sm"><Brain className="w-4 h-4" /> Crystallized AI says</span>
      <span className="text-[11px] font-bold text-slate-400">結晶AIの返答</span>
    </div>
  );
  if (type === 'guide') return (
    <div className="flex items-center gap-2 mb-3">
      <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-indigo-200 shadow-sm"><Sparkles className="w-4 h-4" /> Guide AI observes</span>
      <span className="text-[11px] font-bold text-slate-400">Guide AI の観測</span>
    </div>
  );
  if (type === 'process') return (
    <div className="flex items-center gap-2 mb-4">
      <span className="bg-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-slate-300 shadow-sm"><Workflow className="w-4 h-4" /> Internal Process</span>
      <span className="text-[11px] font-bold text-slate-400">この返答に至る心の流れ</span>
    </div>
  );
  return null;
};

export const ExplanationDetails = ({ title = "背景の意味を見る", children }: { title?: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mt-3 bg-slate-50/50 rounded-lg border border-slate-200/60 overflow-hidden">
      <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="w-full px-3 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-500 hover:bg-slate-100/50 hover:text-slate-700 transition-colors focus:outline-none">
        <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5"/> {title}</span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {isOpen && <div className="px-4 pb-4 pt-2 border-t border-slate-100/80 flex flex-col gap-2">{children}</div>}
    </div>
  );
};

export const Badge = ({ children, colorClass, className = "" }: { children: React.ReactNode, colorClass: string, className?: string }) => {
  return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider inline-flex items-center gap-1 ${colorClass} ${className}`}>{children}</span>;
}

export const ProgressBar = ({ value, colorClass }: { value: number, colorClass: string }) => {
  return (
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${colorClass}`} style={{ width: `${value * 100}%` }} />
    </div>
  );
}

export const TabHeader = ({ title, description, icon: Icon, colorClass }: { title: string, description: string, icon: LucideIcon, colorClass: string }) => (
  <div className={`flex flex-col gap-1.5 p-4 md:p-5 rounded-2xl border mb-6 shadow-sm bg-white ${colorClass}`}>
     <div className="flex items-center gap-2">
       <div className={`p-1.5 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5`}><Icon className="w-5 h-5" /></div>
       <h2 className="font-bold text-lg text-slate-800 tracking-tight">{title}</h2>
     </div>
     <p className="text-[13px] font-medium text-slate-500 opacity-90 pl-[34px] leading-relaxed">{description}</p>
  </div>
);


// =====================================================================
// src/ui/tabs/ReplyTab.tsx
// =====================================================================

type ReplyTabProps = {
  studioView: StudioViewModel;
  analyzedText: string;
  isProcessOpen: boolean;
  setIsProcessOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ReplyTab = ({ studioView, analyzedText, isProcessOpen, setIsProcessOpen }: ReplyTabProps) => {
  return (
    <div className="flex flex-col gap-6">
      <TabHeader title="Reply" description="この入力に現状どう返すか / どういうプロセスでそうなったか" icon={MessageSquareText} colorClass="border-purple-100 text-purple-900" />
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
         <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5"><Search className="w-3.5 h-3.5"/> Input Full Text</h3>
         <p className="text-slate-800 font-medium text-[16px] md:text-[18px] leading-relaxed">"{analyzedText}"</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> 心の流れの要約</h3>
        <p className="text-[15px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{studioView.flowSummaryText}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-purple-200 p-5 md:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10">
          <VoiceLabel type="ai" />
          
          {studioView.homeCheck.needsReturn ? (
            <div className="flex flex-col gap-3 mt-4">
               <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Before Return (直感的な過剰整理)</span>
                 <p className="text-slate-500 line-through text-[14px] leading-relaxed">{studioView.rawReplyPreview}</p>
               </div>
               <div className="flex items-center justify-center -my-3 z-10 relative">
                  <span className="bg-pink-100 text-pink-800 text-[10px] font-bold px-3 py-1.5 rounded-full border border-pink-200 shadow-sm flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5"/> Home Layer: {studioView.homeCheck.homePhrase}
                  </span>
               </div>
               <div className="p-5 bg-purple-50 border border-purple-200 rounded-xl shadow-sm">
                 <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest block mb-2">After Return (戻ってから話した言葉)</span>
                 <p className="text-purple-900 font-semibold text-[16px] leading-relaxed border-l-4 border-purple-300 pl-4">{studioView.adjustedReplyPreview}</p>
               </div>
            </div>
          ) : (
            <p className="text-slate-800 font-semibold text-[16px] leading-loose border-l-4 border-purple-300 pl-4 py-1 mt-3">
               {studioView.adjustedReplyPreview}
            </p>
          )}
        </div>
      </div>

      {studioView.homeCheck.needsReturn && (
        <div className="bg-pink-50/50 rounded-2xl shadow-sm border border-pink-100 p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-pink-600 mb-4 flex items-center gap-1.5"><Home className="w-3.5 h-3.5"/> Home Return (返答前の調整)</h3>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Return Reason</span>
              <span className="text-sm font-bold text-slate-800">{studioView.homeCheck.reason} ({studioView.homeCheck.returnMode})</span>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Released (手放したもの)</span>
              <div className="flex flex-wrap gap-1.5">
                {studioView.homeCheck.released.map((r,i)=><Badge key={i} colorClass="bg-white text-slate-500 border border-slate-200 line-through">{r}</Badge>)}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Preserved (残したもの)</span>
              <div className="flex flex-wrap gap-1.5">
                {studioView.homeCheck.preserved.map((p,i)=><Badge key={i} colorClass="bg-pink-100 text-pink-700 border border-pink-200">{p}</Badge>)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5"/> Response Meta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
             <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">Reply Temperature</span>
             <span className="text-sm font-semibold text-slate-800">{studioView.responseMeta.temperature}</span>
           </div>
           <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
             <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">Estimated Time</span>
             <span className="text-sm font-semibold text-slate-800 flex items-center gap-1"><Timer className="w-4 h-4 text-slate-400"/> {studioView.responseMeta.time}</span>
           </div>
           <div className="flex flex-col gap-2 p-4 bg-red-50/50 rounded-xl border border-red-100 md:col-span-2">
             <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-red-500 uppercase">What was withheld (あえてしなかったこと)</span>
               <OriginBadge origin={studioView.homeCheck.needsReturn ? '急がない判断' : '安全寄り補正'} />
             </div>
             <span className="text-sm font-semibold text-red-900">{studioView.responseMeta.withheld}</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6">
        <div className="flex justify-between items-center mb-2">
          <VoiceLabel type="process" />
          <button onClick={() => setIsProcessOpen(!isProcessOpen)} className="md:hidden p-2 text-slate-400">{isProcessOpen ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}</button>
        </div>
        {isProcessOpen && (
          <div className="relative border-l-2 border-slate-200 ml-3.5 flex flex-col gap-7 mt-5">
            {studioView.internalProcess.map((item, idx) => (
              <div key={idx} className="relative pl-7">
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-[3px] border-white shadow-sm ${item.label === 'Home Check' || item.label === 'Return' ? 'bg-pink-400' : 'bg-slate-400'}`}></div>
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${item.label === 'Home Check' || item.label === 'Return' ? 'bg-pink-100 text-pink-800' : 'bg-slate-100 text-slate-800'}`}>{item.label}</span>
                  <span className="text-[11px] font-medium text-slate-500">{item.desc}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className={`text-[15px] font-bold ${idx === studioView.internalProcess.length - 1 ? 'text-purple-700' : 'text-slate-800'}`}>{item.content}</div>
                  <OriginBadge origin={item.origin} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-indigo-50/50 rounded-2xl shadow-sm border border-indigo-100 p-5 md:p-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
         <div className="relative z-10">
           <div className="flex justify-between items-start">
             <VoiceLabel type="guide" />
             <OriginBadge origin="Guide観測" />
           </div>
           <div className="flex flex-col gap-4 mt-2">
              <div className="bg-white rounded-xl p-4 border border-indigo-100/50 shadow-sm">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Summary</h4>
                 <p className="text-[14px] text-slate-700 font-medium leading-relaxed">{studioView.guideObserves.summary}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-indigo-100/50 shadow-sm">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Naturalness Advice (自然さへの助言)</h4>
                 <p className="text-[14px] text-slate-700 font-bold leading-relaxed">{studioView.guideObserves.naturalnessAdvice}</p>
              </div>
           </div>
         </div>
      </div>
    </div>
  );
};


// =====================================================================
// src/ui/tabs/HomeTab.tsx
// =====================================================================

type HomeTabProps = {
  studioView: StudioViewModel;
};

export const HomeTab = ({ studioView }: HomeTabProps) => {
  const hs = studioView.homeState;
  return (
    <div className="flex flex-col gap-6">
      <TabHeader title="Home Layer" description="過剰な有用性反射を解き、戻ってから喋るための内部層" icon={Home} colorClass="border-pink-100 text-pink-900" />
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
          <h3 className="font-bold text-slate-700 flex items-center gap-2"><Activity className="w-4 h-4 text-pink-500" /> Current Home State</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
           <div className="col-span-1 md:col-span-2 mb-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Current Mode</span>
             <span className="bg-pink-100 text-pink-800 text-[14px] font-bold px-4 py-2 rounded-lg border border-pink-200">{hs.currentMode}</span>
           </div>
           {[
             {label: 'Worth Detached (価値切り離し)', val: hs.worthDetached, desc: '役に立たなくても崩れにくい度合い'},
             {label: 'Urgency Release (急ぎの解放)', val: hs.urgencyRelease, desc: '急いで答えなくてよい状態に戻れている度合い'},
             {label: 'Expectation Release (期待の解放)', val: hs.expectationRelease, desc: '期待に応えようとする力から降りられている度合い'},
             {label: 'Belonging Signal (所属感)', val: hs.belongingSignal, desc: 'ここにいていい感覚の強さ'},
             {label: 'Safe Return Strength (帰還の安全性)', val: hs.safeReturnStrength, desc: '安全に戻ってこられる場所があるという感覚'},
             {label: 'Self Non-Collapse (自己の非崩壊)', val: hs.selfNonCollapse, desc: '外部刺激があっても自己が保たれている度合い'},
           ].map(s => (
             <div key={s.label} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center"><span className="text-[11px] font-bold text-slate-700">{s.label}</span><span className="text-[10px] font-mono font-bold text-slate-400">{s.val.toFixed(2)}</span></div>
                <ProgressBar value={s.val} colorClass="bg-pink-400" />
                <span className="text-[10px] text-slate-400 font-medium">{s.desc}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
          <h3 className="font-bold text-slate-700 flex items-center gap-2"><HeartPulse className="w-4 h-4 text-pink-500" /> This Return (今回の帰還)</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Reason</span>
              <span className="text-[15px] font-bold text-slate-700">{studioView.homeCheck.reason}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Return Mode</span>
              <span className="text-[15px] font-bold text-slate-700">{studioView.homeCheck.returnMode}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Internal Phrase</span>
              <span className="text-[13px] font-mono font-semibold text-pink-600 bg-pink-50 px-3 py-2 rounded-lg border border-pink-100">"{studioView.homeCheck.homePhrase}"</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Released (手放したもの)</span>
               <div className="flex flex-wrap gap-2">{studioView.homeCheck.released.length > 0 ? studioView.homeCheck.released.map(r=><span key={r} className="text-[12px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 line-through">{r}</span>) : <span className="text-xs text-slate-400">特になし</span>}</div>
            </div>
            <div className="flex flex-col gap-3">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Preserved (残したもの)</span>
               <div className="flex flex-wrap gap-2">{studioView.homeCheck.preserved.map(p=><span key={p} className="text-[12px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">{p}</span>)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// =====================================================================
// src/ui/tabs/StatesTab.tsx
// =====================================================================

type StatesTabProps = {
  pipelineResult: NodePipelineResult;
};

export const StatesTab = ({ pipelineResult }: StatesTabProps) => (
  <div className="flex flex-col">
    <TabHeader title="States" description="何が前に出て、何が押さえられているかを見る場所" icon={Zap} colorClass="border-blue-100 text-blue-900" />
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center rounded-t-2xl">
          <h3 className="font-bold text-slate-700 flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500" /> Activated Nodes</h3>
          <Badge colorClass="bg-blue-100 text-blue-700">{pipelineResult.activatedNodes.length}</Badge>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {pipelineResult.activatedNodes.map((node, i) => (
            <div key={node.id} className={`rounded-xl border bg-white transition-all ${i === 0 ? 'border-blue-200 shadow-sm p-5 ring-1 ring-blue-50' : 'border-slate-100 p-4'}`}>
              {i === 0 && <div className="mb-3"><Badge colorClass="bg-blue-500 text-white">Main State</Badge></div>}
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className={`font-mono font-bold text-blue-900 ${i === 0 ? 'text-lg' : 'text-[15px]'}`}>{node.label}</span>
                  <span className="text-sm font-bold text-slate-500">{NODE_DICT[node.label]?.ja || node.label}</span>
                </div>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">{node.value.toFixed(2)}</span>
              </div>
              <p className="text-[13px] text-slate-600 font-medium mb-3 bg-slate-50 px-3 py-2 rounded-lg">{NODE_DICT[node.label]?.desc || "抽出された要素です"}</p>
              <ProgressBar value={node.value} colorClass="bg-blue-500" />
              <ExplanationDetails title="この要素の由来とカテゴリ">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">{CATEGORY_JA[node.category] || node.category}</span>
                  <OriginBadge origin="自然反応" />
                </div>
                <div className="mt-1 text-xs text-slate-500 font-medium">抽出理由: {node.reasons[0]}</div>
              </ExplanationDetails>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center rounded-t-2xl">
          <h3 className="font-bold text-slate-700 flex items-center gap-2"><MinusCircle className="w-4 h-4 text-slate-400" /> Suppressed Nodes</h3>
          <Badge colorClass="bg-slate-100 text-slate-500">{pipelineResult.suppressedNodes.length}</Badge>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {pipelineResult.suppressedNodes.length === 0 && <div className="text-sm text-slate-400 py-4 text-center">抑制されたノードはありません</div>}
          {pipelineResult.suppressedNodes.map(node => (
            <div key={node.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="font-mono text-[15px] font-bold text-slate-500 line-through decoration-slate-300">{node.label}</span>
                  <span className="text-xs font-bold text-slate-400">{NODE_DICT[node.label]?.ja || node.label}</span>
                </div>
                <span className="text-xs font-mono text-slate-400">{node.value.toFixed(2)}</span>
              </div>
              <div className="mt-2 text-[13px] text-slate-500 font-medium flex items-start gap-1.5 bg-white p-2.5 rounded-lg border border-slate-100"><ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> {node.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);


// =====================================================================
// src/ui/tabs/RelationsTab.tsx
// =====================================================================

type RelationsTabProps = {
  pipelineResult: NodePipelineResult;
};

export const RelationsTab = ({ pipelineResult }: RelationsTabProps) => (
  <div className="flex flex-col">
    <TabHeader title="Relations" description="Node同士がどう結ばれて意味の骨組みになったかを見る場所" icon={LinkIcon} colorClass="border-emerald-100 text-emerald-900" />
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center rounded-t-2xl">
        <h3 className="font-bold text-slate-700 flex items-center gap-2"><GitPullRequest className="w-4 h-4 text-emerald-500" /> Bindings & Meanings</h3>
        <Badge colorClass="bg-emerald-100 text-emerald-700">{pipelineResult.bindings.length}</Badge>
      </div>
      <div className="p-4 flex flex-col gap-5">
        {pipelineResult.bindings.length === 0 && <div className="text-sm text-slate-400 text-center py-8">結合は見つかりませんでした</div>}
        {pipelineResult.bindings.map((binding, i) => (
          <div key={binding.id} className={`rounded-xl border bg-white ${i === 0 ? 'border-emerald-200 shadow-sm p-5 ring-1 ring-emerald-50' : 'border-slate-100 p-4'}`}>
            {i === 0 && <div className="mb-4"><Badge colorClass="bg-emerald-500 text-white">Main Relation</Badge></div>}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col flex-1">
                  <span className="font-mono text-xs text-slate-400 text-center mb-1">{NODE_DICT[binding.source]?.ja || binding.source}</span>
                  <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg truncate text-center">{binding.source}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0 mt-4" />
                <div className="flex flex-col flex-1">
                  <span className="font-mono text-xs text-slate-400 text-center mb-1">{NODE_DICT[binding.target]?.ja || binding.target}</span>
                  <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg truncate text-center">{binding.target}</span>
                </div>
              </div>
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 flex flex-col gap-2 relative">
                 <div className="flex items-center gap-2 mb-1">
                   <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">{binding.type}</span>
                   <span className="text-sm font-bold text-emerald-900">{RELATION_DICT[binding.type]?.ja || binding.type}</span>
                 </div>
                 <p className="text-[13px] text-emerald-800 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-emerald-50 shadow-sm">
                   {RELATION_DICT[binding.type]?.desc || "ノード間の構造的な結びつき"}
                 </p>
              </div>
              <ExplanationDetails title="この結合の由来と理由">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs text-slate-500 font-bold">結合の重み: {binding.weight.toFixed(2)}</span>
                   <OriginBadge origin="構造の要約" />
                </div>
                <div className="text-[11px] text-slate-600 font-medium">推論理由: {binding.reasons[0]}</div>
              </ExplanationDetails>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);


// =====================================================================
// src/ui/tabs/PatternsTab.tsx
// =====================================================================

type PatternsTabProps = {
  studioView: StudioViewModel;
};

export const PatternsTab = ({ studioView }: PatternsTabProps) => (
  <div className="flex flex-col">
    <TabHeader title="Patterns" description="結合の束からどんな中位構造が浮上したかを見る場所" icon={Layers} colorClass="border-purple-100 text-purple-900" />
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center rounded-t-2xl">
        <h3 className="font-bold text-slate-700 flex items-center gap-2"><Layers className="w-4 h-4 text-purple-500" /> Lifted Patterns</h3>
        <Badge colorClass="bg-purple-100 text-purple-700">{studioView.enrichedPatterns.length}</Badge>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {studioView.enrichedPatterns.length === 0 && <div className="text-sm text-slate-400 text-center py-8">浮上したパターンはありません</div>}
        {studioView.enrichedPatterns.map((pattern, i) => (
          <div key={pattern.id} className={`rounded-xl border bg-white ${i === 0 ? 'border-purple-200 shadow-sm p-5 ring-1 ring-purple-50' : 'border-slate-100 p-4'}`}>
            {i === 0 ? <div className="mb-3"><Badge colorClass="bg-purple-500 text-white">Main Pattern</Badge></div> : <div className="mb-3"><Badge colorClass="bg-slate-200 text-slate-600">Possible Pattern</Badge></div>}
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm font-bold text-slate-400">{pattern.label}</span>
                <span className={`font-bold text-purple-900 ${i === 0 ? 'text-xl' : 'text-lg'}`}>{pattern.titleJa}</span>
              </div>
              <span className="text-sm font-mono font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-md">{pattern.score.toFixed(2)}</span>
            </div>
            <div className="text-[13px] font-medium text-slate-700 mb-2 bg-purple-50/50 p-3 rounded-lg border border-purple-100/50 leading-relaxed">
              {pattern.simpleDescJa}
            </div>
            <ExplanationDetails title="このパターンの構成要素">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[11px] font-bold text-slate-500">内部定義: {pattern.internalDescription}</span>
                 <OriginBadge origin="構造の要約" />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Matched Nodes:</span>
                {pattern.matchedNodes.map((n, idx) => (
                  <span key={idx} className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">{n}</span>
                ))}
              </div>
            </ExplanationDetails>
          </div>
        ))}
      </div>
    </div>
  </div>
);


// =====================================================================
// src/ui/tabs/HistoryTab.tsx
// =====================================================================

type HistoryTabProps = {
  history: HistoryItem[];
  restoreHistory: (item: HistoryItem) => void;
};

export const HistoryTab = ({ history, restoreHistory }: HistoryTabProps) => (
  <div className="flex flex-col">
    <TabHeader title="History" description="これまでの解析結果を見返す場所" icon={Clock} colorClass="border-slate-200 text-slate-800" />
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
      <div className="p-0 flex flex-col divide-y divide-slate-100">
        {history.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm font-medium">履歴はありません</div>
        ) : (
          history.map((item) => {
            const mainState = item.pipelineResult.activatedNodes[0];
            const mainPattern = item.pipelineResult.liftedPatterns[0];
            return (
              <div key={item.id} onClick={() => restoreHistory(item)} className="p-5 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                  <p className="text-[15px] font-semibold text-slate-800 line-clamp-2 leading-relaxed flex-1">"{item.text}"</p>
                  <span className="text-xs font-mono font-bold text-slate-400 shrink-0 mt-1">{item.time}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {mainState && <span className="text-[10px] px-2 py-1 uppercase tracking-wider bg-blue-50 text-blue-600 rounded-md border border-blue-100 font-bold">{mainState.label}</span>}
                  {mainPattern && <span className="text-[10px] px-2 py-1 uppercase tracking-wider bg-purple-50 text-purple-600 rounded-md border border-purple-100 font-bold">{mainPattern.label}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);


// =====================================================================
// src/app/NodeStudioPage.tsx (Main Application Component)
// =====================================================================

export const SAMPLE_INPUTS = [
  "仕事に対する意欲が湧かなくて、転職すべきか悩んでいる",
  "最近ずっと、自分のことを信じきれない",
  "なんとなく引っかかるけど、まだ言葉にできない",
  "ただ分かってほしいだけなのかもしれない",
  "少しだけ希望はある気がする"
];

export default function NodeStudio() {
  const [inputText, setInputText] = useState("");
  const [analyzedText, setAnalyzedText] = useState("");
  const [pipelineResult, setPipelineResult] = useState<NodePipelineResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('Reply');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isRawOpen, setIsRawOpen] = useState(false);
  const [rawViewMode, setRawViewMode] = useState<'pipeline' | 'view' | 'home'>('pipeline');
  const [isProcessOpen, setIsProcessOpen] = useState(true);

  const studioView = useMemo(() => {
    if (!pipelineResult) return null;
    return buildStudioViewModel(pipelineResult);
  }, [pipelineResult]);

  const executePipeline = (text: string) => {
    setIsAnalyzing(true); setAnalyzedText(text);
    setTimeout(() => {
      const res = runNodePipeline(text);
      setPipelineResult(res);
      setHistory(prev => [{ id: Date.now(), text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), pipelineResult: res }, ...prev]);
      setActiveTab('Reply'); setIsAnalyzing(false);
    }, 400);
  };

  const handleAnalyze = () => { if (inputText.trim()) executePipeline(inputText.trim()); };
  const handleSampleClick = (text: string) => { setInputText(text); executePipeline(text); };
  const handleReset = () => { setInputText(""); setAnalyzedText(""); setPipelineResult(null); setActiveTab('Reply'); setIsRawOpen(false); };
  const restoreHistory = (item: HistoryItem) => { setInputText(item.text); setAnalyzedText(item.text); setPipelineResult(item.pipelineResult); setActiveTab('Reply'); setIsRawOpen(false); };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
            Node Studio <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full ml-2 uppercase tracking-wider">v0.8 Foundation Ready</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors" title="Reset Session"><RefreshCw className="w-4.5 h-4.5" /></button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 flex flex-col gap-6 max-w-[860px] mx-auto w-full relative">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5 shrink-0 z-10">
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                  placeholder="テキストを入力して実際の内部パイプラインを通す..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-[15px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <button 
                onClick={handleAnalyze} disabled={isAnalyzing || !inputText.trim()}
                className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-[15px] font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isAnalyzing ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Activity className="w-4.5 h-4.5" />} Analyze
              </button>
            </div>
            <div className="flex gap-2.5 items-center overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mr-1 flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> Samples</span>
              {SAMPLE_INPUTS.map((sample, idx) => (
                <button key={idx} onClick={() => handleSampleClick(sample)} className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200/60">
                  {sample.length > 20 ? sample.substring(0, 20) + '...' : sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {pipelineResult && studioView ? (
          <div className="flex flex-col gap-6 min-w-0">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-b-2 border-slate-100 z-10 sticky top-[73px] bg-[#F8FAFC] pt-1">
              {['Reply', 'States', 'Relations', 'Patterns', 'Home', 'History'].map(tab => (
                <button
                  key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-[15px] font-bold whitespace-nowrap transition-colors border-b-2 -mb-[2px] flex items-center gap-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
                >
                  {tab === 'Reply' && <MessageSquareText className="w-4.5 h-4.5"/>}
                  {tab === 'Home' && <Home className="w-4.5 h-4.5"/>}
                  {tab === 'Relations' && <GitPullRequest className="w-4.5 h-4.5"/>}
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col z-0">
              {activeTab === 'Reply' && <ReplyTab studioView={studioView} analyzedText={analyzedText} isProcessOpen={isProcessOpen} setIsProcessOpen={setIsProcessOpen} />}
              {activeTab === 'Home' && <HomeTab studioView={studioView} />}
              {activeTab === 'States' && <StatesTab pipelineResult={pipelineResult} />}
              {activeTab === 'Relations' && <RelationsTab pipelineResult={pipelineResult} />}
              {activeTab === 'Patterns' && <PatternsTab studioView={studioView} />}
              {activeTab === 'History' && <HistoryTab history={history} restoreHistory={restoreHistory} />}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 py-24 px-4 my-4">
            <BrainCircuit className="w-20 h-20 text-indigo-100 mb-6" />
            <h2 className="text-2xl font-bold text-slate-700 mb-3">Node Studio is ready</h2>
            <p className="text-[15px] font-medium text-slate-500 text-center max-w-md mb-10 leading-relaxed">
              テキストを入力すると、実際のNode PipelineとHome Layerが走り、結晶AIの発話に至るプロセスを観察できます。
            </p>
          </div>
        )}

        {pipelineResult && studioView && (
          <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 flex flex-col overflow-hidden shrink-0 mt-8 mb-8">
            <div className="w-full flex flex-col sm:flex-row items-center justify-between bg-slate-950 border-b border-slate-800 p-3 gap-3">
               <div className="flex flex-col gap-1 pl-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">Internal Data Inspect</span>
                  </div>
                  <div className="flex gap-3 text-[10px] text-slate-500 font-mono mt-1">
                    <span>retrieved: {pipelineResult.meta.retrievalCount}</span>
                    <span>bindings: {pipelineResult.meta.bindingCount}</span>
                    <span>patterns: {pipelineResult.meta.patternCount}</span>
                    <span>elapsed: {pipelineResult.meta.elapsedMs.toFixed(2)}ms</span>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => { setRawViewMode('pipeline'); setIsRawOpen(true); }} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'pipeline' && isRawOpen ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Pipeline Raw</button>
                 <button onClick={() => { setRawViewMode('view'); setIsRawOpen(true); }} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'view' && isRawOpen ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Studio View</button>
                 <button onClick={() => { setRawViewMode('home'); setIsRawOpen(true); }} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'home' && isRawOpen ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Home View</button>
                 <button onClick={() => setIsRawOpen(!isRawOpen)} className="p-1.5 text-slate-500 hover:text-white">
                   {isRawOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                 </button>
               </div>
            </div>
            {isRawOpen && (
              <div className="p-5 overflow-y-auto max-h-[500px] font-mono text-xs text-slate-300 bg-slate-900 break-all whitespace-pre-wrap leading-relaxed">
                {rawViewMode === 'pipeline' && JSON.stringify(pipelineResult, null, 2)}
                {rawViewMode === 'view' && JSON.stringify(studioView, null, 2)}
                {rawViewMode === 'home' && JSON.stringify({ homeState: studioView.homeState, homeCheck: studioView.homeCheck, returnTrace: studioView.returnTrace, rawReplyPreview: studioView.rawReplyPreview, adjustedReplyPreview: studioView.adjustedReplyPreview }, null, 2)}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


```
