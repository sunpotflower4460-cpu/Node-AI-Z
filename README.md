# Node-AI-Z

結晶思考モデルを観察・体験・自己修正していくための実験アプリです。Node / Home / Revision / Memory を通じて、育つ知性の構造を見ていきます。現在は **Core Crystallization Runtime v1 + SRM-3（Memory 昇格ロジック）の最小実装済み** 段階です。

## コンセプト

Node-AI-Z は、固定人格の AI を完成品として置くためのアプリではありません。
入力を解析して返すよりも、**起動 → 打ち消し → Home → 自己基盤 → 潜在同時発火 → 場形成 → 結びつき → 意思決定 → 発話** の流れへ寄せながら、応答がその都度「結晶化」することを観察するための環境です。

目指しているのは、ただ正しく返す AI ではなく、反応し、戻り、少しずつ育つ AI です。
そのためにアプリは二層構造になっています。

- **観察研究モード**: 内部プロセスを見て、構造・修正候補・変化を研究する
- **体験モード**: 表面では自然に話しつつ、裏側では同じ pipeline / home / revision / memory を動かして記録する

「分析 UI」そのものが目的ではなく、**育つ知性を観察する実験場**であることが、このリポジトリの中心です。

## 現在の構成

### Node Pipeline
入力テキストから Node を活性化し、Binding / Pattern / State Vector を立ち上げる基礎層です。反応の材料を決めます。

### Home Layer
過剰反応や断定をそのまま返さないための帰還層です。homeCheck と return adjustment によって、返答前に一度「戻る」処理をかけます。

### Studio ViewModel
Pipeline の結果を観察 UI 向けに整形する層です。Reply / Home / Pattern / Internal Process / Guide Observe など、研究表示に必要な情報をまとめます。

### Self-Revision / Memory Layer
返答ごとに revision entry と変更候補を生成し、memory に蓄積します。ユーザーが keep / soften / revert / lock を選べる形で、可視な自己修正を支えます。

### Observe Mode
既存の Node Studio UI をベースにした研究ビューです。Node / Relation / Pattern / Home / Revision を横断的に観察できます。

### Experience Mode
自然に話すための入口です。表面はチャット風でも、返答生成には既存の pipeline / home / revision を使い、結果は研究モードへ戻せます。

### Core Crystallization Runtime v1
`internal_mock` / `openai` / `anthropic` / `google` は source の違いとして起動されますが、どれも **Source Boot → Deconditioning → Home Return → Self Substrate → Co-Activation → Field Formation → Binding / Meaning Rise → Self Decision → Utterance → Revision / Thickening** の共通 runtime を通ります。

### Base API Selection v0
Node-AI-Z では基準APIを選べますが、違うのは source だけで、runtime の順序は共通です。次の中心テーマは **外部指示ではなく自分の意思で話すに近づける runtime** です。現時点では internal_mock を既定とし、外部 provider は同じ結晶化 runtime を通す比較先として扱います。

## モード説明

### 観察研究モード
内部構造を見るためのモードです。Node Studio として、反応・構造・修正・帰還を観察し、実験や比較に使います。

### 体験モード
AI と自然に話すためのモードです。ただし裏では各発話ごとに pipeline が走り、homeCheck / revision candidate / memory が記録されます。必要になったら「観察で見る」から研究ビューに戻れます。

## 現在実装済み

- Core Crystallization Runtime v1 による source boot / deconditioning / home return / self substrate / co-activation / relational field / self decision / utterance
- Node Pipeline による node retrieval / relation binding / pattern lifting / state analysis（runtime 内の素材層）
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

### Revision / Memory / Promotion（SRM-3）の主要ファイル

| ファイル | 役割 |
|---|---|
| `src/revision/promotionRules.ts` | change ごとの昇格判定（ephemeral → provisional → promoted）|
| `src/revision/promoteRevisionState.ts` | state 全体の status 再計算と plasticity 再構築 |
| `src/revision/revisionLog.ts` | entry 追加後に `promoteRevisionState` を通す update 導線 |
| `src/revision/revisionTypes.ts` | `ChangeStatus`（ephemeral / provisional / promoted / reverted）型定義 |

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

`test:run` では promotion rules / promoteRevisionState を含む 75 テストが通ることを確認済みです（詳細: `docs/reports/`）。
