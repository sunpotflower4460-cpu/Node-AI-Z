# Node-AI-Z

結晶思考モデルを観察・体験・自己修正していくための実験アプリです。Node / Home / Revision / Memory を通じて、育つ知性の構造を見ていきます。現在は **SRM-3（Memory 昇格ロジック）の最小実装済み** 段階です。

## コンセプト

Node-AI-Z は、固定人格の AI を完成品として置くためのアプリではありません。
入力に対して、場の判断 → 反応 → 姿勢 → Home への帰還 → 発話 → Self-Revision という流れを通し、応答がその都度「結晶化」することを観察するための環境です。

目指しているのは、ただ正しく返す AI ではなく、反応し、戻り、少しずつ育つ AI です。
そのためにアプリは二層構造になっています。

- **観察研究モード**: 内部プロセスを見て、構造・修正候補・変化を研究する
- **体験モード**: 表面では自然に話しつつ、裏側では同じ pipeline / home / revision / memory を動かして記録する

「分析 UI」そのものが目的ではなく、**育つ知性を観察する実験場**であることが、このリポジトリの中心です。

## 現在の背骨

### アプリ骨格

- `src/app/` — 画面ルート。Observe / Experience の切り替えと runtime 呼び出しの入口。
- `src/ui/` — モード UI、各タブ、共通コンポーネント。
- `src/studio/` — 観察用の整形層。runtime 結果を Studio 表示用にまとめる。
- `src/surface/` — 表面返答の生成。
- `src/home/` — Home Layer。返答前の帰還とトーン調整。
- `src/core/` — 既存 Node Pipeline。本体の node / relation / pattern / state vector を組み立てる。
- `src/revision/` — Self-Revision / Memory / Promotion。
- `src/storage/` — localStorage まわりの永続化。
- `src/config/` — provider 設定などの構成値。
- `src/types/` — Observe / Experience / runtime で共有する型。

### Runtime 入口

- `src/runtime/runMainRuntime.ts` — UI からの正規入口。
- `src/runtime/runLegacyNodePipeline.ts` — 既存 Node Pipeline 導線。
- `src/runtime/runSignalIntelligenceRuntime.ts` — signal 系 intelligence runtime 導線。

Observe / Experience のどちらもまず `runMainRuntime` を通り、必要に応じて legacy node pipeline と signal-intelligence runtime を切り替えます。

### 脳寄り拡張の置き場

- `src/intelligence/ingest/` — テキストを意味 chunk / feature に分ける入口。
- `src/intelligence/signal/` — signal-centered runtime 本体。
- `src/intelligence/predictive/` — predictive coding / surprise modulation。
- `src/intelligence/meaning/` — sensory / narrative proto meaning。
- `src/intelligence/somatic/` — somatic marker と somatic influence。
- `src/intelligence/persona/` — persona 系の正式拡張置き場。
- `src/intelligence/learning/` — session / personal / global の学習層。
- `src/intelligence/knowledge/` — info layer と選択ロジック。
- `src/intelligence/_drafts/` — 未接続の実験保管庫。本流 import 先にはしない。

### いまの本体

- Observe は `src/app/` → `src/runtime/` → `src/studio/` / `src/revision/` / `src/ui/` の流れで内部構造を見ます。
- Experience は `src/app/` → `src/runtime/` → `src/surface/` を通って会話しつつ、同じ revision / memory を蓄積します。
- Legacy Node Pipeline と Main Runtime 導線は両方とも現行構造のまま残しています。

## モード説明

### 観察研究モード
内部構造を見るためのモードです。Node Studio として、反応・構造・修正・帰還を観察し、実験や比較に使います。

### 体験モード
AI と自然に話すためのモードです。ただし裏では各発話ごとに pipeline が走り、homeCheck / revision candidate / memory が記録されます。必要になったら「観察で見る」から研究ビューに戻れます。

## 現在実装済み

- Node Pipeline による node retrieval / relation binding / pattern lifting / state analysis
- Home Layer による return 判定と返答トーン調整
- Studio ViewModel による研究 UI 向け表示整形
- Reply / States / Relations / Patterns / Home / History / Revision タブ
- Self-Revision entry の生成、memory 蓄積、tuning アクション
- **観察研究モード / 体験モードの切り替え**
- 体験モードの疑似対話（`runNodePipeline` + `buildStudioViewModel` + `adjustedReplyPreview`）
- 体験モード会話のセッション保持と localStorage 保存
- 体験モードから観察研究モードへ戻る導線
- **基準API選択 v0（表面化のみ / 既定は `internal_mock`）**
- **plasticity / revision の詳細可視化は ObserveMode が正規の観察場所**（Applied This Turn 等）
- **体験モードでも最小 tuning が可能**（各応答の下に Self-Revision 折りたたみカード / keep・soften・revert）
- **plasticity 反映**（node / relation / pattern / home trigger / tone bias の小さな補正を可視化し、次回 run に反映）
- **SRM-3 最小実装済み**: change 単位の `ephemeral` / `provisional` / `promoted` / `reverted` 状態管理、昇格判定ロジック（`promotionRules.ts`）、全 state 再計算（`promoteRevisionState.ts`）が入っており、`revisionLog.ts` の update 導線で自動的に通る。Observe の Promotion / Growth セクションで可視化。
- **ISR v2.2（Integrated Signal Runtime v2.2）実装済み**: Meaning Chunk → Feature Activation → Temporal Decay → Refractory Gating → Feature Inhibition → Dynamic Threshold → Recurrent Self Loop → Lateral Inhibition → Node Activation の完全パイプライン。発火は1回で確定せず、数ステップの収束ループを経る。抑制性シグナルと動的閾値により、反応の前景化が少し脳寄りになった。
- **ISR v2.4（Hierarchical Proto Meaning）導入済み**: sensory proto meaning（体感寄り）と narrative proto meaning（物語寄り）を分け、Sensory → Narrative の階層として観察できるようにした。decision は narrative を主入力に、sensory は tone / texture の調整に使う。somatic marker は次段階。

### Revision / Memory / Promotion（SRM-3）の主要ファイル

| ファイル | 役割 |
|---|---|
| `src/revision/promotionRules.ts` | change ごとの昇格判定（ephemeral → provisional → promoted）|
| `src/revision/promoteRevisionState.ts` | state 全体の status 再計算と plasticity 再構築 |
| `src/revision/revisionLog.ts` | entry 追加後に `promoteRevisionState` を通す update 導線 |
| `src/revision/revisionTypes.ts` | `ChangeStatus`（ephemeral / provisional / promoted / reverted）型定義 |

### ISR v2.2 の主要ファイル

| ファイル | 役割 |
|---|---|
| `src/intelligence/signal/temporalTypes.ts` | `TemporalFeatureState` / `RecurrentLoopResult<T>` 型定義 |
| `src/intelligence/signal/applyTemporalDecay.ts` | 指数減衰を feature 強度に適用 |
| `src/intelligence/signal/applyRefractoryGating.ts` | 不応期による再発火抑制 |
| `src/intelligence/signal/runRecurrentSelfLoop.ts` | 収束条件付き再帰 self/belief ループ |
| `src/intelligence/signal/applyLateralInhibition.ts` | winner-take-more 側方抑制 |
| `src/runtime/runChunkedNodePipeline.ts` | ISR v2.2 完全パイプライン（chunk→node まで）|

## 今後の予定

- SRM-3.5 / SRM-4 相当の refinement・summarization（昇格後の要約と重複圧縮）
- plasticity の反映方針の見直しと memory 昇格条件の整備
- tuning UI のさらなる強化
- より自然な体験会話と対話継続性の向上

## 開発メモ / 哲学

このアプリは、分析して終わるためのものではありません。変化を観察しながら、戻したり、比べたり、一緒に育てるためのものです。

AI が勝手に不可視な形で変わるのではなく、**変化が見えること・戻せること・共同で育てられること**を重視しています。

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

`test:run` では現行の Vitest スイートが通ることを確認してください。
