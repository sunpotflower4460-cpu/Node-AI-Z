# Developmental Node v2 — Twin Life / Ablation 実験計画

- 研究仕様: 2026-10-28 / 未実行
- 上位: developmental-node-v2-current-spec.md
- Kernel: developmental-node-v2-kernel-contract.md
- 目的: 人生依存の**機能的に因果的な構造発達**があるかの反証可能な検証

## 1. Pilot・Confirmatoryの境界

**先に小さく壊し、後で固定して検証する。**

- Physical/Kernel Microtests: 1〜2 Unitや極小回路で因果Lag/更新式/数値安定性。性能のための調整ではない。
- Pilot: 例として8個のpaired birth seeds。候補の明白な失敗を除外。課題・統計・必要資源を記録。
- Confirmatory: 例として32個の**未使用**paired seeds、設定と合格Gateを凍結。Confirmatory結果でHyperparameterを再調整しない。失敗も結果として保存する。
- 数値8/32やN64/256は研究開始値。実装前に採否・資源予算・エラー確率を固定する。
- PRNG streamsはBirth/Anchor/Potential Candidate/Trial/World Schedule等に分割して記録。same birth + same life + same configで完全一致するHashを保証。
- 同じ出生状態のTwinを**一つのSnapshotからClone**。別々に再生成しない。

## 2. Pilotの推奨順序（直交性確保）

1. Birth Physics Audit: 冷出生と通常入力で活動・学習可能か。予測・構造を全て混ぜずに検証。
2. **Prediction Target / Kernel Pilot**: No prediction / Hebbian、K0、K1、K2、self activation、anchored sensory等を、固定Topologyで比較。K1が第一候補。
3. **Sensory Anchor Pilot**: Balanced fixed fan-in 1/2/4/8。Targetと学習方式を固定し、Projection seedの影響を測定。
4. **Potential Contact Degree Pilot**: 8/16/32など。Degree、connectedness、Born structural priorsを固定・記録。
5. **Capacity Fraction Pilot**: Incoming committed ratio 25%/50%/100%、および構造変化なし。Outgoingを独立に制限しない。
6. **Structural Policy Pilot**: No structure / basal blind / prediction-gated / homeostatic-gated / basal+homeostatic。Trial生存はまず|weight|。必要ならusageTrace比較。
7. **Homeostasis / Nursery Pilot**: none / fixed band / lifetime-derived local band / nursery band。Cold BirthをBaselineに残す。
8. 各Pilotの候補を絞った後、0A/0B/0CのConfirmatoryを実施。0B/0Cを使ったチューニングがあるなら、別の完全Hold-outセットを確保し直す。

Ablationは全組合せ総当たりではなく**機構ごとに切り分け**。P、C、λ、ηを同時変更して原因帰属を壊さない。負けた方式も削除せず比較の記録に残す。

## 3. World / Symbol Encoding

- Worldの記号P/Q/R/SはBrain外部の表現。
- 初期例: 16 anonymous Sensory Portsを4群に割り当てる。ただし「Port 0はP」「Unit iはQ」などの意味はBrainへ持ち込まない。
- PortのパターンはObserver側で記録し、受信するs_i(t)だけが固定Anchorへ流れる。
- 全World条件でP/Q/R/Sの頻度・振幅・総Sensory mass・保持時間分布を可能な限り対応させる。
- Novel/held-out sequenceはTraining前に決める。評価時に正解系列をBrainへ供給しない。
- タイムフレームと内部計算回数を別々に記録。時間JitterとWorldの転移則を混同しない。

## 4. Twin Life 0A — 1step Transitions

~~~text
Life A cyclic: P -> Q -> R -> S -> P ...
Life B cyclic: P -> S -> R -> Q -> P ...
~~~

4 symbolの出現頻度は同一。現在記号に応じた次記号の規則は異なる。両WorldでTraining exposure、総step、象徴Encoding、開始条件をペア化。

同じBirth snapshotから A1/A2/B1/B2 を作成。A1=A2およびB1=B2の全State Hashは各stepで一致を要求。A/B差は直接成功ではなく、**予測改善と因果的構造寄与**を伴う必要がある。

## 5. Twin Life 0B — 真のHigher-order Stress

0Aの成功だけでは1step chainを学んだに過ぎない。0Bでは記号の出現頻度と1step bigram頻度が一致するが、より長い履歴に対する次記号が異なる二つの**長さ16の循環系列**を使う。

~~~text
0B A (cyclic): PPQPRPSQQRQSRRSS
0B B (cyclic): PQRSQPRQQSPPSSRR
~~~

いずれもP/Q/R/Sが各4回。循環境界を含めて16種類のordered bigramがそれぞれ**1回ずつ**現れる。したがって1step transition tableだけではA/Bを区別できない。一方2記号contextに対する次記号は多くの位置で異なる。系列を切る位置、epoch boundaryの入力、RNG、World IDが漏れないようにする。

**必要な比較**: unigram frequency baseline、first-order Markov baseline、2-context oracle（達成可能性の上界として使う）、固定recurrentのweight-only、Hebbian/No Prediction、Time Jitter test。

目標は単なる記憶容量ではなく、**現在の入力が同じでも先行文脈に応じて異なる予測が出ること**。Observerは同じ最後の記号・異なる先行文脈で予測の違いを測る。Unseen contextへの一般化も、反復暗記とは分けて報告する。

## 6. Twin Life 0C — Rule Switch / Return

以下を別条件で用意する。

~~~text
A -> B
B -> A
A -> A
B -> B
A -> B -> A (return / savings)
~~~

Rule boundaryをBrainへ知らせない。Worldの持続期間と前半/後半の入力数を対応させる。Rule switch後に旧接続が弱まるか、新しい接続が育つか、Aへの復帰で再学習が早まるか（savings）を記録。

「旧Ruleを忘れた」か「別のstateへswitchしただけ」かも後で部分入力、試験用Clone、Lesion等により分ける。

## 7. 時間の対照

- Regular: 各symbol 1 abstract step。
- Jitter: 同じ出現頻度・同じ記号順で、保持stepをseededに1〜3などへ変える。
- Stretched: 規則を変えずに全保持stepを伸ばす。
- Time Generalization: TrainingとHold-outで保持時間の分布をずらす。
- Null Interval: Neutral/Blank挿入。ただしblank自体がSensory値0という情報になる可能性を記録。

**Order learning**と**interval learning**は別能力。0Bの成功が固定tick暗記でないか検証。無条件にTime Warpで性能が変わらないことを要求しない。固定eligibility λとtime-scale priorの影響を独立に測る。

## 8. Prehistory / Nursery比較

- Cold Birth: 出生直後に分岐（基準）。
- Quiet Prehistory: 外部入力のない時間経過。
- Spontaneous Prehistory: 自発activityのみ。
- Generic Sensory Prehistory: 意味づけのない多様な入力。
- Structured Prehistory: 0A/0Bの答えを埋め込まず、一般の時間構造を体験。
- Shared Childhood Split: 同一前歴後にCloneしてA/Bへ。
- Different Childhood / Same Later Life: 幼少期の違いが後の学習しやすさを変えるか。

Nursery後Brainが有利でも、総経験量の違い・time-step数・閾値設定・spontaneous driveを分離。通常入力で動かないBirthをNurseryでごまかさず、Birth Physics Auditで特定する。

## 9. Research Arms / Controls

| 軸 | 必要な対照 |
| --- | --- |
| Prediction | Hebb/no prediction、K0/K1/K2、self activation / sensory / total drive / change |
| Structure | frozen topology/weight-only、basal trial、prediction- or homeostasis-gated |
| Birth Edge Occupancy | low / medium / high、growth-only、prune-only、growth+prune |
| Potential Graph | seed、degree、connectivity、balanced no-isolate |
| Capacity | 25/50/100%、resource pressure、Edge-Time |
| Local Learning | 1step direct / simple trace / other causal eligibility |
| Stability | no homeostasis / fixed band / experience-derived band |
| Timing | regular/jitter/stretched/step resolution |
| Counterfactual | targeted lesion / matched random lesion / topology shuffle |
| Life | same life / different life / switch / return / different early life |

特殊な入力Encoding、固定初期Signや教師を使うUpper Boundは、出生情報量の大きい比較系として明示し、本流へ隠して入れない。

## 10. メトリクス

**Prediction**: frozen held-out error、symbol next-step accuracy、frequency/1st-order baselineとの差、0B context-dependent gain、予測Calibration、noise susceptibility。

**Structure**: committed edge set、Jaccard distance、weight/sign distribution、Life-specific topology、Trial exposure/cursor coverage、churn、replacement/release、target in-degree、sign flips、functional motifs、community overlap（Observer-only）。

**Causality**: life-specific Edge targeted lesions、同数・同weight帯のrandom lesion、source/target matching、Topology shuffle、復帰後のPrediction loss、rare-memory test。Targeted Lesionの選択はScientist側のみ。

**Stability**: activity near0/near1 fraction、persistent saturation、NaN/Inf、threshold pegging、global flip/period-2、prediction-only trivial constant baseline、input responsiveness。

**Resources**: MicroUnit update count、Edge transmissions、Trial observation packets、structural sweeps、time-to-acquisition、Edge-Time (sum of active committed edges per step)、memory cost、simulator wall-clock（研究指標のみ）。

**Experience**: total sensory exposure、time interval distribution、seed、begin/split/return checkpoint、reproducible state hash。

単に高次元なRandom Activationや高いJaccard divergenceを「良い知能」と扱わない。

## 11. 合格判定・失敗受容

実装前に、少なくとも次を明示する。

1. **Reproducibility Gate**: same birth + same life + same configでstep-wise hash一致。
2. **Locality Gate**: Kernel契約のL01〜L15の因果監査に合格。
3. **Prediction Gate**: held-outで頻度/1st-order等の妥当なbaselineより有意かつ実用的に優れる（0A/0B別）。
4. **History Gate**: 同一の現在入力でも異なる先行Contextで、後続に役立つ状態差を示す。
5. **Structural Divergence Gate**: A/B差がsame-life対照とSeed Lotteryを上回る。
6. **Causal Gate**: life-specific lesionが、matched random lesionより一貫して関連能力を落とす。
7. **No-collapse Gate**: silent, saturation, NaN, degenerate-persistence等に崩れない。
8. **Resource Gate**: 能力改善とEdge-Time、試行数、通信量を併記。

Paired seedごとの効果量・信頼区間・permutation comparison等を採用し、数字のThresholdは本実験前に登録する。単一Seedの見栄えで「成功」を宣言しない。Gate未達は失敗結果として保存し、新しい機構で後付けに救済しない。

## 12. 開発における実際の順序

1. 現行研究文書との仕様整合をチェック。旧2026-10-07仕様を実装前にそのまま採用しない。
2. src/developmental/ 内に独立Kernel / Snapshot / seeded PRNG / fixtureを作る。既存runtimeを変更しない。
3. **物理・因果Test先行**: 1step source/target例、packet freeze、Contact未作成時の遮断、restart equality。
4. Fixed topologyでK0/K1/K2/Hebbian Pilot、Collapse test。
5. 固定Anchor/Potential Graph/Capacity/Structural policyのPilot。
6. Cold BirthとNursery/Homeostasis比較。
7. ConfirmatoryのseedとWorldをFreezeして0A/0B/0C、Targeted/Random Lesion。
8. 結果が出るまで、身体・言語・自己/感情のModuleをPhase 1へ増設しない。

**現時点ではすべて設計。試験実行・性能値・達成判定は未報告である。**
