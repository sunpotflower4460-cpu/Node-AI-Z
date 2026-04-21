# Node-AI-Z アーキテクチャ境界定義書

## 目的

このドキュメントは、Node-AI-Z リポジトリの責務範囲を明確に定義し、誤って他プロジェクトの概念が混入することを防ぐためのガイドラインです。

## Node-AI-Z の責務範囲

### 中核概念

Node-AI-Z は **結晶思考 (crystallized thinking) / growing-intelligence** 系のリポジトリです。

以下の流れに限定されます:

```
外刺激 → signal → proto meaning → option → decision → utterance
         ↓
      memory (episodic / schema)
         ↓
      trunk / branch (shared knowledge)
```

### 含まれるもの

#### 1. Dual Stream Architecture
- **Lexical Stream**: 言葉・構文・明示的意味の処理
- **Micro-Signal Stream**: 微細な状態量・質感・フィールドトーンの処理
- **Fused State**: 両ストリームの融合による統合理解

#### 2. Signal Intelligence
- temporal features (時間的特徴)
- signal dynamics (信号動態)
- prediction error (予測誤差)
- afterglow (残響)

#### 3. Internal Representation
- **Proto Meaning**: sensory / narrative の意味候補
- **Option Awareness**: 検出された選択肢の意識
- **Option Decision**: 選択肢の決定プロセス
- **Somatic Influence**: 過去パターンによる補正

#### 4. Session Continuity
- **Session Brain State**: ターン間の内部状態保持
- temporal states の持ち越し
- prediction state の継続
- workspace / interoception の維持

#### 5. Precision / Uncertainty Control
- **Uncertainty State**: 感覚的・モデル的不確実性
- **Precision Control**: 適応的重みづけ
- prediction error への精度適用
- signal dynamics への精度適用

#### 6. Workspace Management
- **Workspace Gate**: admit / hold / shield / flush
- workspace phases (探索・統合・決定など)
- held items の管理
- distractor pressure の制御

#### 7. Memory System
- **Episodic Memory**: 短期エピソード記憶
- **Schema Memory**: 長期パターン記憶
- replay consolidation
- schema influence

#### 8. Mixed-Selective Latent Pool
- mixed latent nodes の生成
- salience scoring
- dominant / suppressed selection
- proto / option / decision への影響

#### 9. Core Knowledge (Trunk / Branch)
- **Shared Trunk**: 共有知識ベース
- **Personal Branch**: 個人分岐
- promotion pipeline
- guardian layer (AI sensei / human review)
- trunk safety (apply / revert ledger)
- cross-branch consistency

#### 10. Utterance Generation
- Utterance Intent
- Utterance Shape
- Lexical Pulls
- Sentence Plan
- Final Crystallized Reply

## Node-AI-Z の責務外

以下の概念は **Node-AI-Z の責務範囲外** であり、別リポジトリ（例: AETERNA 系）に属します。

### ❌ 含まれないもの

#### 1. Torus Field Simulator
- 場の物理シミュレーション
- トーラス形状の場の力学
- 磁力線トポロジー
- 場の渦・回転・共鳴

**理由**: Node-AI-Z は記号的・認知的処理を扱い、物理場のシミュレーションは扱いません。

#### 2. Physical Disk / Storage Layer
- ディスク物理層
- セクタ・トラック管理
- 物理的読み書き最適化
- ディスクスケジューリング

**理由**: Node-AI-Z は抽象的な記憶システムを扱い、物理ストレージ層は扱いません。

#### 3. Touch Memory Organism
- タッチベース生命シミュレーション
- 接触による記憶形成
- organism 間の接触通信
- 生命体としての代謝・成長

**理由**: Node-AI-Z は情報処理システムであり、生命体シミュレーションは扱いません。

#### 4. Plasma / Tokamak Field Runtime
- プラズマ物理
- トカマク型磁場閉じ込め
- プラズマ不安定性
- 核融合関連シミュレーション

**理由**: Node-AI-Z は認知アーキテクチャであり、プラズマ物理は扱いません。

#### 5. Schumann Lock / Resonance
- シューマン共鳴ロック機構
- 地球電離層共鳴
- 7.83Hz 同期
- 惑星規模フィールド同期

**理由**: Node-AI-Z は個別エージェントの認知を扱い、惑星規模の同期機構は扱いません。

#### 6. Ergodicity Organism Metrics
- エルゴード性生命体メトリクス
- 位相空間探索の完全性
- エルゴード的時間平均と集団平均の一致
- organism 全体の統計力学的性質

**理由**: Node-AI-Z は個別の学習・記憶を扱い、集団統計力学は扱いません。

## 境界判定ガイドライン

新しい機能・概念を追加する際、以下の質問で判定してください:

### ✅ Node-AI-Z に含める条件

1. 外刺激から発話までの認知的流れの一部か？
2. 内部表現（signal / proto / option）の処理に関係するか？
3. 記憶・学習・知識共有の範囲内か？
4. ターン間の状態保持・継続性に関係するか？
5. 適応的学習・精度制御の範囲内か？

### ❌ Node-AI-Z に含めない条件

1. 物理シミュレーション（場・プラズマ・トーラスなど）を必要とするか？
2. 生命体としての代謝・成長・接触通信を扱うか？
3. 惑星規模の同期・共鳴機構を扱うか？
4. 物理ストレージ層の最適化を扱うか？
5. 集団統計力学・エルゴード性を扱うか？

## 誤混入の検出

以下のキーワードが PR やコミットメッセージに現れた場合、境界違反の可能性があります:

- `torus`
- `plasma`
- `tokamak`
- `schumann`
- `ergodic` / `ergodicity`
- `organism` (memory organism / touch organism の文脈で)
- `physical disk` / `disk sector`
- `magnetic field` / `field topology`

**注意**: これらのキーワードが禁止されているわけではありませんが、Node-AI-Z の責務範囲内で使われているか慎重に確認してください。

## まとめ

**Node-AI-Z は結晶思考系リポジトリであり、外刺激 → signal / proto / option / memory / trunk/branch の流れに限定されます。**

物理シミュレーション・生命体シミュレーション・惑星規模同期などの実験的構造は、別リポジトリで管理されるべきです。

---

このドキュメントは、開発者と AI エージェントが迷わないよう、Node-AI-Z の責務境界を明文化したものです。
