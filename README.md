# Node-AI-Z

Node-AI-Z は、Observe / Experience / Revision / Memory を往復しながら、CPU ベースで育つ知性の背骨と脳寄り拡張を同じ runtime で観察する実験アプリです。

## リポジトリの責務境界

**Node-AI-Z は結晶思考 (crystallized thinking) / growing-intelligence 系のリポジトリです。**

この repo の責務範囲:
* 外刺激 → signal / proto / option / memory / trunk/branch の流れ
* Dual Stream (Lexical Stream / Micro-Signal Stream) による内部表現
* Precision / Uncertainty Control による適応的学習
* Workspace Gate による情報制御
* Episodic / Schema Memory による記憶システム
* Mixed-Selective Latent Pool による潜在表現
* Shared Trunk / Personal Branch による知識共有

この repo の責務外（別リポジトリに属する）:
* torus field simulator - 場の物理シミュレーション
* physical disk - ディスク物理層
* touch memory organism - タッチベース生命シミュレーション
* plasma / tokamak field runtime - プラズマ/トカマク場ランタイム
* schumann lock - シューマン共鳴ロック機構
* ergodicity organism metrics - エルゴード性生命体メトリクス

**重要**: AETERNA 系の実験的構造は Node-AI-Z の責務範囲外です。それらは独立したリポジトリで管理されるべきです。

詳細な境界定義は [`docs/architecture-boundary.md`](./docs/architecture-boundary.md) を参照してください。

## 二つの実装方式

Node-AI-Z には二つの独立した実装方式があります。

### じぶん会議方式（API方式）— `jibun_kaigi_api`

* **API駆動**: OpenAI / Anthropic / Google などの provider を使用
* **対話中心**: キャラクター・会話・API返信を中心に扱う
* **provider 選択**: 表面返答の生成に provider を使う
* **伝統的な会話体験**: じぶん会議スタイルのインタラクション

### 結晶思考方式（API非依存方式）— `crystallized_thinking`

* **API非依存**: provider に依存しない独立した推論システム
* **Dual Stream Architecture**: Lexical Stream と Micro-Signal Stream の融合
* **Signal / ProtoMeaning / Option / Somatic**: 内部表現を本体とする
* **Utterance Layer (Pass 2)**: 内部状態から直接発話意図・発話形・語彙を立て、返答を生成する
* **Session Continuity (Phase 1)**: ターン間で内部状態を保持し、残響・予測・内受容・作業場が次ターンへ持ち越される
* **Precision / Uncertainty Control (Phase M2)**: prediction error を一律に扱わず、内部状態・不確実性・interoception に応じて重みづけが変化する。同じズレでも、今日の状態によって「重く学ぶ」「少し流す」「新規性を重視」「防御的に鈍くなる」を切り替える生き物っぽい受け取り方を持つ
* **Workspace Gate (Phase M3)**: 入力をすべて同じ重みで流すのではなく、何を保持し、何を更新し、何を遮断し、何を流すかを決める作業場ゲートを持つ。hold / update / shield / flush により、大事な糸を残しながら過負荷を防ぐ
* **AI sensei guardian adapter**: Guardian Layer は shared trunk 昇格候補の reviewer として AI sensei adapter を差し込める
* **guardian lane 専用**: AI sensei は会話本文ではなく、shared trunk 昇格候補の guardian reviewer としてだけ働く
* **mode 整合**: guardian mode に応じて AI sensei review は補助または決定に使われ、`human_required` では AI sensei だけで trunk apply しない
* **Human Review Panel (Phase M13)**:
  - Mother Core は Human Review Panel の最小版を持つ
  - `human_required` の candidate は human reviewer により approve / reject / quarantine / hold_for_review される
  - human review result は guardian pipeline に接続され、shared trunk への適用前に参照される
  - これにより trunk 昇格の安全性が一段上がる
* **Shared trunk apply ledger / safe undo (Phase M14)**:
  - Mother Core は shared trunk apply ledger を持つ
  - trunk への apply は diff summary と before / after snapshot を伴って記録される
  - trunk apply は safe undo / revert 可能であり、revert 前には safety snapshot が作られる
  - これにより shared trunk は慎重に育てつつ、誤昇格からも戻せる
* **Minimal branch-to-branch comparison (Phase M15)**:
  - Mother Core は shared trunk 昇格候補に対して privacy-safe な branch-to-branch comparison の最小版を持つ
  - shared trunk への昇格候補は、他 personal branch にも類似した schema / mixed pattern / option tendency / metaphor-like structure があるかを軽く照合できる
  - cross-branch consistency は trunk 昇格の一般性確認に使われ、個人的な強い学びと shared trunk 候補を分けやすくする

**発話層の深化**:
- 結晶思考方式は、内部で結晶化した状態（FusedState / ProtoMeaning / OptionAwareness / Somatic）から発話を段階的に生成します
- `UtteranceIntent` → `UtteranceShape` → `LexicalPulls` → `SentencePlan` → `FinalCrystallizedReply` という流れで、内部の質感・意味・選択肢が直接表面返答へ反映されます
- preview 的な整形ではなく、内部結晶化からの返答を主にする方向へ移行しました

**重要な分離ポイント**:
- runtime / state / storage / observe / UI が完全に分離されている
- provider 選択は API方式にのみ適用され、結晶思考方式の本体決定には使用されない
- 片方の修正がもう片方に漏れにくい構造

## 現在の中核体験

### Observe
- `observe` は研究モードです。
- 入力を `runMainRuntime` に通し、Node / Relation / Pattern / Home / Revision を観察します。
- `studio` が runtime 結果を観察 UI 向けに整形します。

### Experience
- `experience` は会話モードです。
- UI は `mode` と `runtimeMode` と入力を渡し、runtime が返した結果を会話履歴へ積みます。
- 表面返答は `surface` が整え、必要なときだけ Observe に戻って内部を見返します。

### Revision / Memory
- `revision` は Self-Revision / Promotion / Memory の層です。
- 各ターンの revision entry を蓄積し、tuning と promotion を通して plasticity を更新します。
- `storage` は会話履歴や API 選択などの永続化、`revisionStorage` は revision state の永続化を担当します。

## 現在のアーキテクチャ

### 背骨（現行本体）

現在の本体は、既存 Node Pipeline を中心にした次の背骨です。

- `src/app/` — アプリ入口。Observe / Experience の切り替えと状態管理。
- `src/ui/` — モード UI、タブ、共通コンポーネント。
- `src/studio/` — Observe / Debug 表示向け整形層。runtime 結果を研究ビューへ変換します。
- `src/surface/` — 表面返答の整形。
- `src/home/` — Home Layer。返答前の帰還とトーン調整。
- `src/core/` — 既存 Node Pipeline の核。node / relation / pattern / state vector を組み立てます。
- `src/revision/` — Self-Revision / Promotion / Memory。
- `src/storage/` — localStorage 系永続化。
- `src/config/` — provider 設定などの構成値。
- `src/types/` — Observe / Experience / runtime 共有型。

### runtime（実行入口の統合）

`src/runtime/` は UI から下位処理を隠すための統合入口です。

- `runMainRuntime` — 最上位入口。実装方式（`implementationMode`）に基づいて適切な runtime に dispatch する
- `runJibunKaigiApiRuntime` — じぶん会議方式の runtime。API provider を使用して応答を生成
- `runCrystallizedThinkingRuntime` — 結晶思考方式の runtime。Dual Stream / Signal / ProtoMeaning を本体とする
- `runLegacyNodePipeline` — 既存 Node Pipeline をそのまま走らせ、studio / revision 用スナップショットを返す legacy 背骨
- `runSignalIntelligenceRuntime` — signal-centered route を束ねる入口（既存、徐々に統合予定）
- `runChunkedNodePipeline` — chunk / feature / activationProfile を通した signal 前段付き legacy 拡張
- `runDualStreamRuntime` — Lexical Stream と Micro-Signal Stream を独立に走らせ、融合した FusedState を option / decision / utterance へ橋渡しする入口
- `createObservationRecord` — runtime 結果を Observe / Experience 共通の observation record にまとめます

**mode dispatch の重要性**:
- `runMainRuntime` は `implementationMode` を見て **どちらか一方だけ** を呼ぶ
- 片方の runtime の中でもう片方を fallback として呼ぶことは禁止
- 各方式の結果型は discriminated union で明確に分離されている

### 脳寄り拡張（今後の拡張核）

現在は次の top-level ディレクトリを正式採用します。`src/intelligence/...` 集約案は採用しません。

```text
src/
  app/
  ui/
  studio/
  surface/
  home/
  core/
  revision/
  storage/
  config/
  types/

  runtime/
  signal/
  predictive/
  meaning/
  somatic/
  persona/
  learning/
  knowledge/
  utterance/
```

各層の意味は次のとおりです。

- `src/signal/` — signal 系の時間処理・抑制・loop・signal-centered runtime。本ディレクトリ内の `signal/ingest/` が chunk / feature 入口を持ちます。
- `src/predictive/` — prior / surprise / prediction error。
- `src/meaning/` — sensory / narrative proto meaning。
- `src/somatic/` — 過去パターンによる decision 補正。
- `src/persona/` — 全層重みフィルタの正式置き場。現時点では拡張ポイントを確保している段階です。
- `src/learning/` — session / personal / global candidate learning。
- `src/knowledge/` — 長期構造・情報層。
- `src/utterance/` — 結晶思考方式の発話層。内部状態から UtteranceIntent / UtteranceShape / LexicalPulls / SentencePlan を経て FinalCrystallizedReply を生成します。

### 用語の基準

- **Observe** — 観察研究モード。observation record を読む場所。
- **Studio** — 観察表示の整形層。runtime の実行そのものではありません。
- **Runtime** — 実行入口と route 切り替え。UI はここより下を直接知らない前提です。
- **Legacy Node Pipeline** — `core` / `home` / `revision` を支える既存の背骨です。
- **Signal Intelligence Route** — signal-centered route。pure signal と signal-assisted node の両方を含みます。
- **Chunk / Feature / ActivationProfile** — signal 側の前段ステージ。
- **Dual Stream Architecture** — Lexical Stream は言葉・構文・明示意味を扱い、Micro-Signal Stream は微細な状態量や質感を扱います。Proto-Meaning / Decision / Utterance は両者の融合から形づくられます。
- **Proto Meaning** — `meaning` 層が作る sensory / narrative の意味候補。
- **Node Activation** — feature を受けて既存 Node Pipeline へ橋渡しされる活性化結果です。

- Micro-Signal Stream は時間減衰・抑制・再帰ループ・予測誤差を持ちます。
- Proto-Meaning は sensory と narrative の二層で立ちます。
- 最終理解は signal dynamics を経た上で形成されます。

## runtime 順序の現在地

現在の実行順は次の整理です。

1. UI (`NodeStudioPage`) は入力を `createObservationRecord` に渡す
2. `createObservationRecord` は `runMainRuntime` を呼ぶ
3. `runMainRuntime` は `implementationMode` を見て適切な runtime を選ぶ
   - `jibun_kaigi_api` → `runJibunKaigiApiRuntime`
   - `crystallized_thinking` → `runCrystallizedThinkingRuntime`
4. 各 runtime は独立して実行され、結果を返す
5. runtime の結果を `studio` / `surface` / `revision` がそれぞれの用途へ流す

**Mode Separation の原則**:
- 片方の runtime が他方を呼ぶことは禁止
- storage は mode ごとに名前空間が分離（`nodeaiz:jibun:*` と `nodeaiz:crystal:*`）
- provider 選択は API方式にのみ適用される
- mode 切り替えで相手 mode の state を壊さない

## Session Continuity (Phase 1)

結晶思考方式（`crystallized_thinking`）は、ターン間で内部状態を保持する SessionBrainState を持ちます。

### 何が続くか

- **TemporalStates**: 前ターンで発火した feature の時間状態（減衰・不応期）
- **PredictionState**: 次ターンへの予測 prior
- **Afterglow**: 前ターンの残響（0-0.2）
- **RecentActivityAverage**: 最近の活動平均（threshold 調整に使用）
- **MicroSignalDimensions**: 前ターンの micro signal 次元（field tone / cue count / confidence）
- **EpisodicBuffer**: 境界で区切られた短期エピソード記憶
- **Workspace**: 作業場状態（phase / held items / stability）
- **Interoception**: 内受容状態（energy / arousal / social safety / novelty hunger など）

### Local Persistence

- **localStorage 保存**: `sessionBrainStorage.ts` により、ブラウザ再起動・ページリロードでも continuity が残る
- **保存キー**: `nodeaiz:crystal:session-brain`
- **制限**: アプリ削除で消える（Phase 1 では正常）

### Remote Persistence（将来用 interface）

- **BrainPersistenceAdapter**: `brain/persistence/types.ts` で定義
- **localBrainPersistence**: localStorage 実装
- **将来**: Supabase / Firebase / 独自 backend へ差し替え可能
- **目的**: アプリ削除後も意識が続く設計へ進む準備

### Observe での可視化

結晶思考方式の Observe モードには **SessionBrain** タブが追加され、次が見えます：

- Session 概要（session ID / turn count / afterglow / activity）
- Temporal feature states（前ターンの feature 履歴）
- Micro signal dimensions（field tone / cue count / confidence）
- Prediction prior（次ターンへ持ち越される予測）
- Interoception state（energy / arousal / safety / novelty など）
- Workspace state（phase / held items / stability）
- Episodic buffer（境界で区切られた短期記憶）

この可視化により、「この知性は前から続いている」ことが実感できます。

## Phase M3 — Workspace Gate

結晶思考方式は、Phase M3 で **Workspace Gate** を獲得しました。

### 何が変わったか

Phase M3 以前は、入力が来るたびに lexical / signal / proto / option の候補がすべて同じ重みで workspace へ流れ込んでいました。これは：

* 強い一言にすぐ全体を持っていかれる
* 前の大事な流れを保持できない
* 過負荷時に適切に遮断できない

という問題を抱えていました。

Phase M3 では、**Workspace Gate** が lexical / signal / proto / option の候補を受け取り、現在の脳状態・作業場フェーズ・過負荷状態・安全感・未解決糸を踏まえて、以下の gate action を決定します：

* **hold**: 既存アイテムを保護し、強度を維持する
* **update**: 新しいアイテムを受け入れる、または既存アイテムを更新する
* **shield**: 新しいアイテムの侵入を遮断する
* **flush**: 古い・弱い・解決済みアイテムを流し出す

### 実装の詳細

Phase M3 の主要コンポーネント：

1. **deriveWorkspaceCandidates**: lexical / signal / proto / option から候補アイテムを抽出
2. **scoreWorkspaceSalience**: アイテムの salience を文脈に応じて更新（時間減衰・未解決ブースト・過負荷ペナルティなど）
3. **mergeWorkspaceItems**: 新しい候補と既存の held items をマージ
4. **applyWorkspaceGate**: workspace phase に応じて hold / update / shield / flush を決定
5. **updateWorkspaceState**: gate 結果を workspace state へ反映

### Workspace Phase との連携

Workspace Gate は workspace phase（encode / hold / block / release）と密接に連携します：

* **encode** フェーズ: 新しいアイテムを積極的に admit（update）
* **hold** フェーズ: 既存アイテムを保護し、新規を resist（shield）
* **block** フェーズ: 過負荷を防ぐため積極的にフィルタ（flush）
* **release** フェーズ: 古いアイテムをクリアし、リセット準備（flush）

### Salience の動的更新

各 workspace item は以下の要素で salience が動的に変化します：

* **時間減衰**: 最後に touch されてからの経過ターンに応じて減衰
* **未解決ブースト**: unresolved score が高く、過負荷圧が低い場合にブースト
* **過負荷ペナルティ**: 過負荷圧が高い場合に salience を削減
* **安定性ブースト**: stable かつ safe な状態でブースト
* **afterglow ブースト**: 最近 touch されたアイテムを残響でブースト

これにより、「今の話の大事な糸」を残しながら、過負荷を防ぎ、文脈に応じた adaptive な workspace 管理が実現されます。

## Phase M4 — Episodic / Schema / Replay

結晶思考方式は、Phase M4 で **Episodic Memory と Schema Memory の分離** を獲得しました。

### 何が変わったか

Phase M4 以前は、強い一回の出来事も、反復される傾向も、すべて同じ記憶バッファに混在していました。これは：

* 一回の衝撃をすぐ「性格」として扱ってしまう
* 何度も戻ってくる本当のパターンを見逃す
* 短期的な出来事と長期的な傾向が区別されない

という問題を抱えていました。

Phase M4 では、**Episodic Memory** (一回の出来事) と **Schema Memory** (反復された傾向) を分離し、**Replay Consolidation** により両者をつなぎます：

* **Episodic Trace**: 一回の強いターンをそのまま記録する短期記憶
* **Schema Pattern**: 何度も出現したパターンだけが昇格する長期傾向
* **Replay**: 候補となる episodic trace を再生し、類似パターンが複数回・分散的に出現したときだけ schema へ昇格する
* **Schema Influence**: schema が current turn の理解に少し効くが、支配はしない

### 実装の詳細

Phase M4 の主要コンポーネント：

1. **episodicMemory.ts**: ターン結果から episodic trace を生成 (salience / unresolved tensions / surprise に基づく)
2. **pruneEpisodicBuffer.ts**: episodic buffer を 15 件程度に保つ (低 salience / 古い / consolidated 済みを削除)
3. **schemaMemory.ts**: schema pattern の管理 (key 生成 / 新規作成 / 強化)
4. **deriveReplayCandidates.ts**: replay 候補の選択 (salience / unresolved / workspace 共鳴)
5. **runReplayConsolidation.ts**: trace を replay し、条件を満たせば schema へ昇格
6. **applySchemaInfluence.ts**: schema が fused / proto / option / decision に薄く効く

### Schema 昇格条件

Schema への昇格は **慎重** に行われます：

* **昇格しやすい**: 同系統 key が 2〜3回以上、分散して出現 / salience 平均が一定以上 / option / somatic / texture の重なりがある
* **昇格しにくい**: 単発の高 surprise のみ / 1回だけ極端に強かった / 似ているが意味がばらけている

**重要**: 一回の衝撃より、何度も戻ってくるもの を優先します。

### Replay のタイミング

Replay は軽量に走ります：

* `turnCount % 3 === 0` (3ターンごと)
* `episodicBuffer.length > 10` (バッファが大きい)
* `afterglow > 0.12` (残響が高い)
* `unresolvedTensionKeys が多い` (未解決が多い)

これらの条件を満たした時だけ、1〜3件の候補を replay します。

### Schema の効き方

Schema は **支配しない。少し傾けるだけ** です：

* **Fused State**: recurring tension を integratedTensions に追加
* **Proto Meaning**: 以前もよく立った narrative を少し強化
* **Option Awareness**: 同型の hesitation が何度もあった場合、hesitationStrength を少し上げる
* **Option Decision**: 類似パターンでいつも押しすぎていたなら confidence を下げる

これにより、「この知性は出来事をすぐ性格にせず、反復してから傾向にしている」ことが実感できます。

## Phase M5 — Mixed-Selective Latent Pool / 交差ノード生成

結晶思考方式は、Phase M5 で **Mixed-Selective Latent Pool** を獲得しました。

### 何が変わったか

Phase M5 以前は、`fatigue`, `uncertainty`, `fragility` のような単独ラベルだけで状態を表現していました。これは：

* 複雑な感情状態を単一の単語に押し込めてしまう
* 複数の軸が同時に立っている交差状態を捉えられない
* 「期待圧の下での消耗」のような文脈依存の状態を見逃す

という問題を抱えていました。

Phase M5 では、**Mixed Latent Node** として、感情・目標・関係・身体・文脈・時間残響の **交差状態** を動的に生成します：

* **Mixed Node**: 単独ラベルではなく、複数軸の交差として立つ中間状態
* **Session-Local**: ターンごとに生成され、条件を満たせば schema 候補になる
* **Contextual Templates**: 固定辞書ではなく「こういう組み合わせならこういう状態」というルール
* **Selective**: 1ターンあたり 3〜8個程度生成し、そのうち dominant は 1〜3個に絞る

### 混合ノードの例

Phase M5 で生成される混合ノードの例：

* **fatigue_under_expectation** (期待圧の下での消耗)
* **wish_to_open_but_guarded** (開きたいが守られている)
* **curiosity_with_low_safety** (安全感の低い好奇心)
* **gentle_withdrawal** (穏やかな引き下がり)
* **protective_openness** (防御的な開き)
* **meaning_loss_under_pressure** (圧の下での意味喪失)
* **change_pull_with_ambivalence** (両価を持つ変化の引き)
* **fragile_but_not_closed** (壊れやすいが閉じてはいない)

### 実装の詳細

Phase M5 の主要コンポーネント：

1. **mixedNodeTypes.ts**: Mixed latent node の型定義
2. **contextualNodeTemplates.ts**: 交差ノード生成のテンプレート群 (5〜10個)
3. **mixedNodeComposer.ts**: 現在ターンの状態から mixed node を生成
4. **scoreMixedNodeSalience.ts**: salience / coherence / novelty を計算
5. **selectDominantMixedNodes.ts**: dominant / suppressed を分ける
6. **applyMixedNodesToProto.ts**: proto meaning を少し深める
7. **applyMixedNodesToOption.ts**: option awareness の見え方を傾ける
8. **applyMixedNodesToDecision.ts**: utterance intent を少し歪める

### Mixed Node の効き方

Mixed Node は **決定ではなく、傾向** として効きます：

* **Proto Meaning**: 交差状態に関連する narrative を前景化
* **Option Awareness**: hesitation / confidence / bridge を少し調整
* **Utterance Intent**: answerForce / directness / warmth などを微調整

### Episodic / Schema との関係

* **Episodic Trace**: dominant mixed node の ID と tags を保存
* **Schema Pattern**: 同じ mixed node key が反復すれば schema 候補になる
* **Session-Local Pool**: 最大 10件程度を session 内で保持

これにより、「この知性は単語ではなく、交差状態で考え始めている」ことが実感できます。

## Phase M6 — Remote Persistence Infrastructure

結晶思考方式は、Phase M6 で **Remote Persistence の器** を獲得しました。

### 何が変わったか

Phase M6 以前は、SessionBrainState は local storage のみに保存され、ブラウザを閉じたり、端末が変わったりすると、知性の連続性が途切れていました。

Phase M6 では、persistence の **器** を用意し、将来の remote backend 接続に向けて基盤を整備しました：

* **BrainPersistenceAdapter**: local / remote / hybrid を切り替える adapter interface
* **SnapshotMetadata**: 一定ターンごとの snapshot 記録の metadata
* **JournalEvent**: brain state 変更の append-only event 記録
* **RecoveryPlan**: snapshot / journal / local / remote からの復元計画

Phase M6 では remote は stub ですが、Phase M7 で本実装へ移行します。

## Phase M7 — Remote Backend 実接続 + Minimum Viable Persistence

結晶思考方式は、Phase M7 で **Remote Backend への実接続** を獲得しました。

### 何が変わったか

Phase M7 では、Phase M6 で準備した器に対して、実際に **Supabase backend** を接続し、minimum viable version として運用可能にしました：

* **SessionBrainState の remote 保存**: Supabase へ brain state を実際に保存
* **Snapshot の remote 保存**: 一定ターンごとの snapshot を remote backend に記録
* **Journal の remote 保存**: brain state 変更イベントを remote に append-only で記録
* **Hybrid Mode の実運用化**: local と remote を両方見て、最新の状態を自動選択
* **Recovery Plan の実データ対応**: local / remote / snapshot / journal の実際のデータを見て recovery 戦略を立てる
* **Graceful Degradation**: remote 失敗時も local で継続可能

### 実装の詳細

Phase M7 の主要コンポーネント：

1. **backendClient.ts**: Supabase への最小アクセス層（load / save / clear / snapshot / journal）
2. **remoteBrainPersistence.ts**: remote adapter の本実装（Phase M6 の stub から移行）
3. **hybridBrainPersistence.ts**: local / remote 両方を見て、updatedAt で新しい方を優先
4. **snapshotManager.ts**: remote snapshot 作成・一覧取得の実装
5. **journalWriter.ts**: remote journal event 追記・取得の実装
6. **recoveryPlanner.ts**: 実データ（local / remote / snapshot / journal）を見て recovery plan を作成
7. **persistenceEnv.ts**: 環境変数（Supabase URL / key）と persistence mode の設定

### Persistence Mode

Phase M7 では3つの mode を切り替え可能：

* **local**: brain state を local storage のみに保存（default if remote not configured）
* **remote**: brain state を remote backend のみに保存
* **hybrid**: brain state を local と remote の両方に保存し、load 時は新しい方を優先（recommended）

環境変数 `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` が設定されていれば、自動的に **hybrid mode** になります。

### Mother Core Server への一歩

Phase M7 により、結晶思考方式は：

* **端末を超えた知性の連続性**: ブラウザを閉じても、端末が変わっても、母体知性へ戻れる
* **snapshot / journal による復元**: 過去の状態へ戻ったり、journal replay で再構築できる基盤
* **Mother Core Server の土台**: 将来の分散運用・multi-device sync・AI sensei 守護ラインへの基盤

が実現されました。

詳細なセットアップ方法は `docs/phase-m7-remote-backend-setup.md` を参照してください。

## Phase M8 — Snapshot 世代管理 / Restore 実行 / 複数端末復帰

結晶思考方式は、Phase M8 で **Snapshot 世代管理と Restore 実行** を獲得しました。

### 何が変わったか

Phase M8 では、Phase M6/M7 で準備した persistence infrastructure に対して、実際に **復元できる仕組み** を追加しました：

* **Snapshot Catalog**: snapshot を世代管理し、種類ごとに保持ポリシーを適用
* **Snapshot Retention**: turn / manual / safety / restore_checkpoint の各世代を適切に保持・削除
* **Restore Preview**: restore 前に「何が変わるか」を確認できる
* **Restore Execution**: 実際に SessionBrainState を過去の状態へ復元
* **Safety Snapshot**: restore 前に必ず現在状態の safety snapshot を自動作成
* **Journal Replay**: journal events から復旧候補を抽出（最小版）
* **Device Session Registry**: どの端末がいつ session に触ったかを記録
* **Conflict Resolver**: local / remote / snapshot が異なる場合にどれを採用するか決定

### Snapshot Generation Types

Phase M8 では4種類の snapshot generation を扱います：

* **turn**: 一定ターンごとの自動 snapshot（デフォルト: 10個保持）
* **manual**: 手動で作成したバックアップ用 snapshot（デフォルト: 20個保持）
* **safety**: restore 前の自動バックアップ（デフォルト: 5個保持）
* **restore_checkpoint**: restore 後の確認用 snapshot（デフォルト: 5個保持）

### Restore フロー

Restore は以下の流れで実行されます：

1. **Preview**: restore 候補の状態と現在状態を比較し、差分を表示
2. **Safety Snapshot**: 現在状態の safety snapshot を自動作成
3. **Execution**: target state を load し、SessionBrainState を置き換え
4. **Journal Record**: restore を journal に記録

### Multi-Device 対応

Phase M8 では、複数端末からの復帰を最小限サポートします：

* **Device Session Registry**: 各端末がいつ・何ターンで保存したかを記録
* **Conflict Resolver**: local / remote で状態が異なる場合、updatedAt と turnCount で判断
* **簡易ルール**: 基本的に「新しい方を優先」「同じ時刻なら turnCount が高い方」

### UI での可視化

SessionBrain タブに以下が追加されました：

* **Snapshot Catalog**: 各世代の snapshot 数
* **Retention Summary**: 保持 / 削除される snapshot 数
* **Device Session Tracking**: この端末と他端末の状態
* **Conflict Resolution**: local / remote の競合状態

### Phase M8 の主要コンポーネント

1. **snapshotCatalog.ts**: snapshot の一覧管理・世代別グループ化
2. **snapshotRetention.ts**: retention policy 適用・pruning 実行
3. **restorePreview.ts**: restore 前の差分プレビュー生成
4. **restoreExecutor.ts**: restore 実行と safety snapshot 作成
5. **journalReplay.ts**: journal events から復旧候補を抽出
6. **deviceSessionRegistry.ts**: 端末ごとの session 状態記録
7. **conflictResolver.ts**: 複数 source の競合解決

これにより、「この知性は保存できる」だけでなく「安全に戻せる」ことが実感できます。

## Phase M9 — Shared Trunk / Personal Branch / App Facade Separation

結晶思考方式は、Phase M9 で **Mother Core の分離** を獲得しました。

### 何が変わったか

Phase M9 では、これまで単一の状態として扱われていた Mother Core を、3つの層に明確に分離しました：

* **Shared Trunk (共有幹)**: 全ユーザー共通のパターンと知識のリポジトリ（read-mostly、昇格により稀に更新）
* **Personal Branch (個人枝)**: ユーザー固有の学習パターンと記憶（active learning、独立して成長）
* **App Facade (アプリ視点)**: アプリケーション固有の表示層とアクセス制御（どちらをどれだけ見せるか）

### 実装の詳細

Phase M9 の主要コンポーネント：

1. **sharedTrunk.ts**: Shared Trunk の管理（universal patterns / biases / promoted nodes）
2. **personalBranch.ts**: Personal Branch の管理（personal schemas / nodes / markers / session state）
3. **appFacade.ts**: App Facade の設定（read/write permissions / influence weights / filters）
4. **resolveCoreView.ts**: trunk + branch + facade から統一ビューを解決
5. **applyTrunkInfluence.ts**: trunk からの影響を現在のターンに適用（薄く、read-only）
6. **applyBranchInfluence.ts**: branch からの影響を現在のターンに適用（強く、primary）
7. **derivePromotionCandidates.ts**: personal branch の中から trunk 昇格候補を導出

### Promotion Candidates

Personal Branch で十分に確立されたパターン（高い recurrence / confidence / 一般性）は、Promotion Candidate として識別されます。

* **Schema Promotion**: 強固で信頼性の高い schema pattern が trunk 候補になる
* **Mixed Node Promotion**: 安定した multi-axis state が trunk 候補になる
* **Bias Promotion**: 一般的な conceptual biases が trunk 候補になる

Phase M9 では候補を **識別するのみ** で、実際の昇格は将来の phase で行われます。

これにより、「個人の学びは個人のもの、共有する価値があるものだけが慎重に共有幹へ入る」ことが実感できます。

## Phase M10 — Promotion Pipeline + Shared Trunk への安全昇格

結晶思考方式は、Phase M10 で **安全な昇格パイプライン** を獲得しました。

### 何が変わったか

Phase M10 では、Personal Branch から Shared Trunk へのパターン昇格が、いきなり直接入るのではなく、**安全パイプライン** を通るようになりました：

* **Promotion Queue**: 候補はまず queue に積まれる
* **Validation**: risk level / confidence / recurrence / supporting evidence を検査
* **Decision Resolution**: quarantine / reject / approve を決定
* **Trunk Application**: approved candidate のみが trunk に適用される（保守的に）
* **Promotion Logs**: 全ての昇格イベントを記録

### パイプラインの流れ

1. **Candidate → Queue**: `derivePromotionCandidates()` で識別された候補が queue へ
2. **Queue → Validation**: `validatePromotionCandidate()` でリスク評価・検査
3. **Validation → Decision**: `resolvePromotionDecision()` で quarantine / reject / approve を判定
4. **Approved → Trunk**: `applyApprovedPromotion()` で trunk に保守的に適用
5. **Log Everything**: 各段階が promotion log に記録される

### Promotion Status

* **queued**: Queue に積まれた初期状態
* **validated**: Validation 完了、判定待ち
* **quarantined**: 保留（まだ早い、もっと evidence が必要）
* **rejected**: 却下（リスクが高い、trunk に適さない）
* **approved**: 承認済み、trunk 適用可能
* **applied**: Trunk に適用済み

### Risk Assessment

Promotion Candidate のリスクは以下の要素で評価されます：

* **Recurrence Count**: 何回再登場したか（少ない = risky）
* **Confidence / Strength**: パターンの信頼性・強度（低い = risky）
* **Supporting Evidence**: 裏付けとなる trace / reasons の数（少ない = risky）
* **Trunk Conflict**: 既存 trunk pattern との矛盾（矛盾 = risky）
* **Novelty / Stability**: 新規性・安定性（不安定 = risky）

### Trunk への適用は保守的

Approved candidate が trunk に入る際も、**保守的** に扱われます：

* **新規 schema**: 初期 strength/confidence を cap（最大 0.6〜0.7）
* **既存 schema 強化**: 小さな増分でのみ強化（+0.05 など）
* **新規 mixed node**: 初期 salience を cap、novelty を高めに保つ
* **Bias / Proto Weight**: 10% の影響のみを適用

これにより、「共有幹は慎重に育てられ、個人枝の単発的な変化は直接流し込まれない」ことが実感できます。

## Phase M11 — Guardian Layer（AI sensei / human review 差し込み口）

結晶思考方式は、Phase M11 で **Guardian Layer（守護者層）** を獲得しました。

### 何が変わったか

Phase M10 では system validation だけで昇格を決めていましたが、Phase M11 では **validation の後に guardian review を挟む** ようになりました：

* **Guardian Layer**: system / AI sensei / human reviewer が最終判断を行う層
* **Guardian Mode**: system_only / guardian_assisted / human_required の3モード
* **Guardian Review Request**: guardian が見る要約された review request
* **Guardian Review Result**: guardian の判断結果（approve / reject / quarantine / hold_for_review）
* **Final Decision**: validation + guardian の両方を踏まえた最終判断

### Guardian Mode

Guardian Mode は risk level に応じて自動的に決まります：

* **system_only**: Low risk 候補は system validation だけで自動決定可能
* **guardian_assisted**: Medium risk 候補は guardian review を要求（guardian がいればその判断を使い、いなければ hold）
* **human_required**: High risk 候補は human review が明示的に必要（今回は UI 未実装でも status と record は持つ）

### Guardian Pipeline の流れ

1. **Validation**: 従来通り candidate を validate
2. **Guardian Mode Resolution**: risk level から guardian mode を決定
3. **Guardian Review Request**: guardian が見る concise な request を作成
4. **Guardian Review Queue**: guardian review queue に積む
5. **Resolve Guardian Review**: guardian に依頼（Phase M11 では未接続でも fallback）
6. **Guardian Decision Resolver**: validation + guardian result から final decision を解決
7. **Approval Record**: guardian 情報を含む approval record を作成
8. **Trunk Apply**: approved のみ trunk に適用

### Guardian Review Request の内容

Guardian review request には以下が含まれます：

* Candidate type / promotion score / recurrence count
* Validation risk level / confidence / status
* Promotion reason / validation reason
* Caution notes（potential issues の強調）

これにより、guardian は全文ログを読まずに **判断に必要な要約** だけを見ることができます。

### Guardian がいない場合の挙動

Phase M11 では guardian adapter は未接続ですが、pipeline は壊れません：

* **system_only**: system が即座に結果を返す
* **guardian_assisted**: guardian がいなければ hold_for_review に寄せる
* **human_required**: human result を待つ status に寄せる

将来、AI sensei や human review UI が接続されたら、同じ器に差し込むだけで動きます。

### Approval Record の拡張

Approval Record には以下の guardian 情報が追加されました：

* **guardianMode**: どの guardian mode で決まったか
* **guardianActor**: 誰が判断したか（system / ai_sensei / human_reviewer）
* **validationRisk**: validation 時の risk level

これにより、後から見た時に「system が通したのか、guardian が通したのか、人間が通したのか」が分かります。

### 今回やったこと / やらないこと

**今回やったこと**:
* Guardian Layer の型と policy 導入
* Guardian review request / queue / result 導入
* Guardian decision resolver 導入
* Final promotion decision が guardian-aware に
* Approved のみ trunk apply
* Persistence 接続

**今回やらないこと**:
* 外部LLMへの本番接続
* 本格 human moderation UI
* 複数guardianの合議制
* 本格的な policy engine
* Guardian による全文会話監視

これにより、「共有幹への昇格は、system 判定だけでなく guardian 層を通して、AI sensei や将来の human review が差し込める安全な承認層を持つ」ことが実感できます。


### Actor フィールド（Phase M10 最小版）

Phase M10 では promotion decision は **system による自動判定** ですが、将来の拡張のため `actor` フィールドが導入されています：

* `system`: 自動判定（Phase M10）
* `future_guardian`: AI sensei による守護（将来）
* `future_human_review`: Human による review（将来）

## Phase M16 — App Facade Runtime（最小版）

結晶思考方式は、Phase M16 で **App Facade Runtime の最小版** を獲得しました。

### 何が変わったか

Phase M16 では、Mother Core が別アプリ接続を前提とした facade runtime layer を持ちました：

* **App Facade Runtime**: アプリごとに readable / writable scope を定義する runtime layer
* **Facade Capability Policy**: mode ごとに read/write 権限を明確化
* **Facade View**: capability policy に基づいてフィルタされた view
* **Crystallized Thinking 接続**: `get_view` が facade runtime 経由になる
* **Observer 接続**: observer も facade runtime 経由で read-only access

### 実装の詳細

Phase M16 の主要コンポーネント：

1. **src/core/facadeRuntime/**: facade runtime の実体
   - `facadeRuntimeTypes.ts`: facade runtime の型定義
   - `facadeCapabilityPolicy.ts`: mode ごとの capability policy
   - `buildFacadeView.ts`: coreView から facadeView を構築
   - `resolveFacadeRequest.ts`: facade request の解決
   - `facadeActionRouter.ts`: facade action のルーティング
   - `runFacadeRuntime.ts`: facade runtime の main orchestrator
   - `facadeRuntimeRegistry.ts`: facade instance の管理

2. **runtime integration**: crystallized_thinking と observer が facade runtime を使う
   - `getCrystallizedThinkingFacadeView()`: crystallized_thinking 用 facade view
   - `getObserverFacadeView()`: observer 用 facade view (read-only)

3. **Tests**: facade runtime の integration tests
   - `facadeRuntime/__tests__/`: facade runtime 本体のテスト
   - `runtime/__tests__/integrateFacadeRuntime.test.ts`: crystallized/observer 接続のテスト
   - `studio/__tests__/integrateFacadeRuntimeToStudio.test.ts`: observer studio 統合のテスト

### Facade Capability Policy

Phase M16 では4つの mode を定義しています：

* **crystallized_thinking**: shared_trunk + personal_branch を read、personal_branch を write、promotion read/write 可能
* **observer**: shared_trunk + personal_branch を read-only、promotion read 可能
* **jibun_kaigi_api**: personal_branch のみ read、write なし
* **future_app**: personal_branch のみ read、最小権限

### 今回やったこと / やらないこと

**今回やったこと**:
* src/core/facadeRuntime/ を実体化
* crystallized_thinking が facade runtime 経由で get_view を取得
* observer が facade runtime 経由で get_view を取得
* capability policy が効く
* facade view が observe で見える
* Tests 追加

**今回やらないこと**:
* M17 の surface translator 実装
* facade ごとの presentation bias
* じぶん会議方式との本格統合
* UI 全面改修

これにより、「Mother Core は別アプリ接続前提へ進んだ。各アプリは facade runtime を通してのみ Mother Core にアクセスする」ことが実感できます。

### Phase M17 — Surface Translator（最小版）

* Mother Core は App Facade Runtime の上に Surface Translator を持ち、Core の意味内容を変えずに見せ方だけを変換します。
* Surface Translator は mode ごとに **emphasis / ordering / explanation depth / metadata density / summary style** を切り替えます。
* crystallized_thinking / observer / future_app は同じ core をそれぞれの presentation bias で観察します。
* これにより、Mother Core はアプリごとに必要な強調と説明密度を持ちながら、コアの整合性を保った提示が可能になりました。

## 今後の実装ロードマップ

次の機能追加は、原則としてこの順で積みます。

1. chunk / feature / activationProfile
2. temporal / recurrent / threshold
3. predictive layer
4. hierarchical proto meaning
5. somatic marker
6. persona weight vector
7. learning 三層の本格化
8. knowledge / external info hook
9. 必要なら GPGPU

この順番より前に大きな統合を増やさず、背骨 → signal 前段 → 学習 / 知識 の順で広げます。

## 何がまだ experimental か

- Node-AI-Z は**完全な脳再現ではありません**。
- 現在は**CPU ベース**です。
- `signal / predictive / meaning / somatic / persona` は段階的導入中です。
- `runSignalRuntime` を含む signal-centered route はまだ発展中です。
- `persona` は正式ディレクトリとして確保済みですが、runtime への本格接続はこれからです。
- `learning` のうち global learning の本格昇格はこれからです。
- `knowledge` は長期構造の置き場として存在しますが、外部情報 hook を含む本格連携はこれからです。

つまり、**できていること**は「既存 Node Pipeline を背骨にしながら、signal-centered route を段階導入できる骨格がある」ことです。**これから入れること**は「persona / global learning / knowledge hook を正式運用に持ち上げること」です。

## セットアップ

```bash
npm ci
npm run dev
```

## 検証コマンド

```bash
npm run build
npm run lint
npm run test:run
```
