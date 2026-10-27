# Developmental Node v2 — Kernel / Local Causality Contract

- 2026-10-28 時点の設計契約（実装・実験は未完了）
- 正式採用が未確定な点は **候補** として記載する。
- 対応する上位仕様: developmental-node-v2-current-spec.md

## 1. Kernelの研究目的

Source MicroUnitが時刻t−1に実際に送った信号だけが、Targetの時刻tの予測に寄与し、同じ予測に対する誤差だけが当該送信EdgeのLearning Signalになることを保証する。配列順序、未接続Unitの活動、未来Sensory、学習後Weightによる過去予測の書き換えを排除。

**局所性は空間だけでなく時間にも必要。** ただし1step局所勾配の一致は、再帰Network全体の厳密勾配と同義ではない。

## 2. K1第一候補の変数・定義

- s_i[t]: 固定Anchorから来た今回の外界Target、まず[0,1]。同一値はBrainの入力にも用いられる。
- a_i[t]: 1個のbounded scalar activity、まず[0,1]。
- θ_i[t]: 現在threshold。出生時均質。Local Homeostasisを無効にするArmが存在する。
- w_ji: 有界signed weight。出生時にExcitatory/Inhibitory unit typeは設定しない。
- x_ji[t]: **t−1のEmission時点でContact j→iから送られた source activity**。Contactが存在しない場合、取得不可（0を読めることとは区別）。
- d_ji[t]: t−1時点で送信された weighted drive、通常 d_ji[t] = w_ji[send] × x_ji[t]。
- p_i[t]: 到着した d_ji[t] の総和。**send時のWeightが凍結された値**。後からWeightを更新しても不変。
- δ_i[t]: s_i[t] − p_i[t]。Predictionはbounded activationではなくraw signed drive。
- η, w_max: Pilotで決める固定学習パラメータ。Scientistが成績を見てオンライン変更しない。
- Potential / Trial / CommittedのContact状態。Potentialは活動を読めない。Trialは0 Weightから開始し実際の局所activityを受信できる。

## 3. 数式

~~~text
At arrival t:
  p_i[t] = sum(d_ji[t] for packets actually sent at t-1)
  delta_i[t] = s_i[t] - p_i[t]

  a_i[t] = clip_0_1(s_i[t] + p_i[t] - theta_i[old])

For each packet from j to i arriving at t:
  proposed_w_ji = clip_-wMax_+wMax(
    w_ji[old] + eta * x_ji[t] * delta_i[t]
  )

At emission from t to t+1:
  d_ji[t+1] = w_ji[committed_for_send] * a_j[t]
  x_ji[t+1] = a_j[t]
  packet is immutable once emitted
~~~

p_iは予測であると同時に活動形成用の再帰Drive。これは**仮説上の単純化**であり、自己増幅、飽和、非負Anchorに対するWeight正偏りを実験で監査する。Prediction Lossは 1/2 (s_i−p_i)^2 とするが、その最小化だけでは知能や有用な履歴表現の証拠にならない。

x_jiの式はこの1step linear readoutの直接偏微分に対応。その他の未来時刻に対する再帰効果を追わず、Backpropagation Through Timeと同じとは主張しない。

## 4. 1 Frameの決定論的実行順

~~~text
Begin Frame t:
  0. Obtain World sensory frame s[t].
     No Life label, future s[t+1], or absolute tick is given to Brain.

  1. ARRIVAL:
     Consume immutable packets emitted by existing Contacts at t-1.
     Freeze p[t] and per-contact x[t]/d[t].
     Do not recalculate from current weights.

  2. EVALUATE:
     Compute delta[t] = s[t] - p[t].
     Observer may archive p, s, delta without feeding evaluation back.

  3. DYNAMICS:
     Every MicroUnit computes next a[t] from identical old state
     plus its s[t] and p[t] (double buffer).
     No Unit reads another Unit's newly computed value.

  4. PLASTICITY:
     For packets actually delivered, calculate weight proposals
     using that packet's x[t] and target's delta[t].
     Apply proposals together; do not mutate p[t].
     No packet => no edge-local learning based on unseen source activity.
     Optional longer eligibility is a separate named Arm.

  5. HOMEOSTASIS:
     If enabled by experiment Arm, compute local slow update from
     old EMA and this frame's activity; apply after dynamics.
     No Scientist-derived performance/target leakage.

  6. STRUCTURAL SWEEP (when scheduled):
     Evaluate Trial opportunities and |weight| retention.
     Retire/release after all delivered packets have been scored.
     Open new Trial only from target's Potential Contact list.
     Newly opened Trial becomes eligible to emit from NEXT frame,
     never retroactively from a[t].

  7. EMISSION:
     For Contacts that were active for this frame and survived sweep,
     send a[t] using the committed post-learning weight.
     Store immutable per-contact x/d for arrival at t+1.
     Newly created Trial is excluded from same-frame emission.

  8. SNAPSHOT/HASH:
     Serialize all causally relevant state incl. in-flight packets.
     Do not expose simulator tick/lineage labels to Brain rules.
End Frame t.
~~~

**境界例**: t−1に存在したEdgeはtにpacketが到着し、tのErrorで更新される。その後Releaseされれば新しいEmissionは行わない。tに新しくTrialになったContactは t−1の送信を持たず、tのSource Activityを「過去の観測」として利用できない。t+1のEmissionから初めて活動を観測し、t+2に最初の予測誤差を経験する。

送信先の全Targetに更新直後のweightを同時に利用することは問題ないが、**send後にWeightが変わっても既存packetを再計算してはならない**。

## 5. In-flight packetの意味とコスト

Packetには (edge identity, sourceActivity, weightedDrive) が概念上必要。実装では参照でも構わないが、送信時の数値が変更されないことを保証。Edge identityにはTrial再利用によるABA混同を避ける固有のcontact instance keyを持つ（これはSimulatorの照合IDであり意味Nodeではない）。

Targetの現在のerrorと、前回送信したsource activityを正確に対応付ける。さらに1step伝達分の一時保管は計算資源として計上。Brain内部へ完全なLife Traceは保持しない。

実験用Snapshotは全Packet・Edge/Unit状態・candidate cursor・必要なScheduler状態を含む。ObserverのArchiveは復帰に必要なBrain因果状態へ混ぜない。

## 6. K0 / K1 / K2 の違い

- **K0（比較）**: a_i[t]自体がs_i[t+1]の予測。予測へのdirect weight influenceは前のさらに1stepのsource activityを介すため、K1と同じ update 式を流用しない。clipped activationの微分が0の状態も検証する。
- **K1（第一候補）**: 送信済みのweighted recurrent driveを次の固定Sensory Targetの予測とする。上の契約。
- **K2（比較）**: Sensory Frame内で内部伝達を複数回行う。何回更新したかは追加Time Priorであり、K1とUnit updates / Edge transmissionsを揃えて比較する。
- **H0（必要なBaseline）**: Predictionなしの時差Hebbian系。予測の優位性を先に決めつけない。

K0/K2にも時刻表・Gradientの定義を別に作ってから実装し、K1の導関数をそのまま流用しない。

## 7. TrialとClockの局所契約

- Potential: Partner IDと接触可能性だけ。Remote activation、error、Global utilityを検索できない。
- Trial: 開始後の実際のsource activityだけを通信。Weightは0から学習。
- Committed: Target incoming slotで限られる。Source側にK_outを別途標準導入しない。
- Candidate選択: targetごとのSeeded Rotation/Permutation。Global RNG stream共有に依存しないようにする。
- Trial終了: sourceExposure/targetOpportunityを局所積算するが、両方0のままだと終了しない可能性がある。失敗条件として測り、恣意的なAge cutoffを黙って追加しない。
- SimulatorのStructural Sweepは固定周期を持ち得るが、Brainが絶対tickや年齢を参照することは禁止。

## 8. 物理テスト（学習性能の評価とは分離）

1. Zero Input: 無入力でNaN/Infや無限増幅がない（自発活動有無はArmで明示）。
2. Single Pulse: 1step伝達の時差を検証。
3. Constant Drive: 定常状態・飽和率を計測。
4. Two-Pulse Reversal: P→QとQ→Pでtrajectoryが違うか。
5. Negative Weight: 実際にtargetへの抑制が生じるか。
6. Loop: ループ増幅・全0・period-2同期artifactを測定。
7. Saturation Recovery: 入力解除後の回復。
8. Unit/Port Relabel: 匿名名義の入替で等価な計算結果。
9. Normal Sensory Cold Birth: Nurseryなしで活動・学習が開始できるか。

## 9. Local Causality Anti-Leakage Tests

| ID | Fixture | Expected |
| --- | --- | --- |
| L01 | t+1のSensoryだけを変更 | tに確定したp[t+1]は不変 |
| L02 | P pulseをtに注入 | target predictionへの時差が1 emission step |
| L03 | PotentialだけでつながるUnitを変化 | 実際にEdgeになるまで信号影響なし |
| L04 | TrialをFrame tに開く | 過去のSource Activityを読めず、当該FrameでEmitted扱いにしない |
| L05 | 送信済みpacketの後でWeightを変える | packetのweightedDriveは不変 |
| L06 | Unit更新ループの順序を置換 | 同じ結果（浮動小数点和は正規化順序を固定） |
| L07 | 外部Simulationのtick offsetだけ変更 | Brain state / prediction同等 |
| L08 | Port名とAnchor列を同時置換 | 同値な結果 |
| L09 | sourceが高頻度だがtargetに無関係 | Trialの誤昇格と重み増加を記録 |
| L10 |途中から全状態Snapshot復帰 | 連続実行と完全一致 |
| L11 | Scientist Archiveを遮断 | Brain学習・活動に変化なし |
| L12 | Freeze Learning/Structure/Homeostasis | 評価中のWeight/Topology/Threshold不変 |
| L13 | tでWeightを更新しt+1へ送信 | tへ届いた古いpに新Weightが反映されない |
| L14 | tでTrialをRelease | その後に旧Edge packetを新Edgeへ誤配送しない |
| L15 | 毎回targetがほぼ0 / targetが飽和 | 数値成功を知能成功と誤認しない |

L01/L02/L05/L06/L10/L11/L13/L14は第一の実装Gate。すべて未実装・未実行である。

## 10. 簡易追跡例（教育用fixture）

~~~text
At t: P -> Unit j has activity 1.
Edge j->i starts w=0 and emits source activity 1.
At t+1: World emits Q, local target s_i=1.
Frozen prediction p_i=0.
delta_i=1.
With eta=.1 and delivered x=1:
  w_new = 0 + .1*1*1 = .1.
Next P->Q repetition (same source=1), p_i=.1:
  delta_i=.9, w_new=.19.
~~~

Fixtureは事前定義された役割（Pを表すj、Qを表すi）を**テストでのみ**使用。本番のBorn MicroUnitへ意味Nodeを配らない。

K1が1step関係を正しく学習し得ることの最小例であって、0BのHigher-order learningや自然にできたTopologyの証拠ではない。

## 11. 監査記録

Runごとに Kernel ID、全方程式、parameter、Snapshot schema version、Source時刻、Sent Weight、Observed Sensory、Direct Local Error、Unit/Edge costs、Seed、Hash、成功/失敗判定を保存。Scientistだけが正解・Lesion utility・全体Accuracyを知る。
