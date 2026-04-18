# Node-AI-Z

Node-AI-Z は、Observe / Experience / Revision / Memory を往復しながら、CPU ベースで育つ知性の背骨と脳寄り拡張を同じ runtime で観察する実験アプリです。

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
* **将来 AI sensei**: LLM は外側のガイドとして関わる（本PRでは未実装）

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
