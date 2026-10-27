# Developmental Node v2 — 現行研究設計（第1〜25巡統合）

- 更新日: 2026-10-28
- 状態: **設計・未実装・未実証**
- 対象: Node-AI-Z の独立した Developmental Substrate
- 基準実験: Phase 1 / Twin Life 0
- 本文書は 2026-10-07 版 developmental-node-v2-design.md より**新しい参照文書**である。旧版は履歴として残す。
- 技術的実行順序と比較実験の詳細は、同じ docs/ にある kernel-contract.md / experiment-protocol.md / decision-ledger.md を参照。

## 0. 目的と証拠の扱い

中心命題は **「知能の構造を人間が完成させない。人生が脳を作る」**。

意味・記憶・目標・感情などの完成済み機構を与えるのではなく、同じ出生条件の単純な局所系が別々の経験を受けたとき、Weightだけでなく**実際の接続構造、活動軌道、将来の学習傾向**まで変わり、能力の違いを生むかを調べる。

最初の実験では「知能」「意識」「自己」の発生を立証しようとしない。厳密な対象は**経験依存の予測能力・履歴保持・構造分化とその因果的寄与**である。複雑な模様、異なる最終Hash、Edge数増加だけでは成功ではない。

各仕様には次の状態を区別する。

- **Boundary / 合意方針**: BrainとScientistの分離、意味付きの初期Unit禁止、同一出生対照、既存Runtime非改変。
- **Candidate / 現在の第一候補**: K1の局所予測Kernel、Balanced Sparse Anchor、Blind Trial、Target側Slot制限など。結果が出る前に「正しい方式」と呼ばない。
- **Ablation / 比較対象**: Hebbian、K0/K2、Homeostasis各種、Capacity各種など。
- **Deferred / 後段**: Action、Goal、Replay、Consolidation、Metaplasticity、STP、可塑的入力配線、Unitの増減、言語。
- **Retired as default / 旧版の標準案から除外**: predictedActivationの自己予測を確定仕様とすること、Global Counterfactual UtilityによるBrain内選別、必須Nursery、同時にK_inとK_outを課すこと、EdgeのAgeで保存/削除すること。

## 1. Project境界

- **World**: 感覚系列や物理条件を生む。P/Q/R/Sや正解ルールを知るのはWorld / Scientistだけ。
- **Brain**: MicroUnit + 接続可能性 + 現在のTrial / Committed Edge + 局所状態。自身の正解率・Lifeラベル・全脳情報は知らない。
- **Birth / Simulator**: 乱数Seed、匿名Port配線、更新スケジューラ、数値実行を管理する。SimulatorのtickはBrainの認知状態ではない。
- **Scientist / Observer**: 完全履歴、全体指標、因果Lesion、対照実験、意味づけ。解析結果をBrainの学習信号へ流さない。
- **Body / Incarnation（後段）**: 行動Portを物理世界に接続する。行動の意味はBody/World側。
- **AI Village（後段）**: 異なる発達基盤を独立に比較する実験場。Aeterna等の場ベース方式をNode-AI-Zへ無断統合しない。

実装境界は別Runtime **src/developmental/**。従来のSemantic Node、Signal Field、New Signal Mode、Crystallized Thinking、Layered Thinkingは独立Baselineとして保存。既存の会話RuntimeやUI、保存契約をPhase 1で書き換えない。

## 2. 出生物理 — 最小の部品

### 2.1 MicroUnit

出生時に意味・役職・領域・Emotion/Memory/Goal/Attentionの専用クラスを持たない。Phase 1ではUnit数を固定（64は軽量Pilot例、256は本実験候補。確定値ではない）。

第一候補の状態:
- activation（0〜1の単一Scalar）
- threshold（出生時同じ値）
- activityEMA（Homeostasis armでのみ因果的に利用）
- 必要な前活動/入力の通信バッファ（実行上の状態）
- predictionErrorは現在の観測から算出可能な値。errorEMAは必要な比較arm以外、常設しない。

**出生時から存在しない**: ageを読む機構、generations、parentIds、split/merge lifecycle、role、meaning、per-unit semantic vector、専用prediction neuron、dendritic branch、専用E/I cell type。Functional NodeはObserverが軌道・ensemble・部分空間・motifを検証して初めて付ける名称であり、出生時0個。

### 2.2 可能性と実際の接続

- **Potential Contact**: 出生時の有界な接続可能性グラフ（例: 1 Unitあたり8/16/32候補のPilot）。接触可能というだけで、相手の活動は読めない。
- **Trial Edge**: Potentialを実際に局所観測できる一時接触へ変えたもの。weight 0から開始。局所source activityとerrorを通じて学習できる。通信は無料ではない。
- **Committed Edge**: Trialが局所の残存判定に通過したもの。Committedは「有用とScientistが証明した」を意味しない。
- **Functionally Causal Edge**: ScientistがLesionと対照で検証した場合に限る研究上の呼称。

Edgeの基本は source, target, **bounded signed weight** だけ。短期eligibility/usageTraceは比較armに限り許す。Utility/Importance、Age、stability class、履歴一覧をBrainへ標準搭載しない。正負どちらのEdgeも同一Unitから出力でき、Dale制約/E-I分化は後のAblation。

### 2.3 Finite Resource

Potential Graph自体に接続可能性の上限がある。別途、Target側の**Committed Incoming Slots**だけを第一候補とし、各Targetで同一のcapacity fraction（例: potential indegreeの25%/50%/100%）を比較。維持用Slotとは別に一時Trial Slot 1本を試す。Source側に独立したK_out capを最初から課さない（Potential Graphによる有限outdegreeは残る）。Weight mass constraint、space-based wiring cost、capacityの発達は後の比較。Capacity 100%・構造固定を必ず対照に含める。

## 3. Sensory — 「世界を見る窓」と学習経路を分ける

- Worldが匿名 Sensory Ports（初期例16本）へ値を送る。P/Q/R/SラベルやPortの意味はBrainへ渡さない。
- **Immutable Sensory Anchor**: Seedで決定される固定・balanced・sparse投射。各UnitのSensory fan-inを揃え、各Portのfan-outも可能な範囲で揃える。target s_i(t) は固定した外界由来の量。
- **Afferent Routing**: 実際にBrainへ感覚を届ける経路。Phase 1では同じ固定投射を利用してよいが、概念上Anchorとは分離。将来はRoutingのみ可塑化できる。
- Anchor Targetの定義・値域は必ず固定し、学習によって「予測しやすい見え方」に変えて誤差を下げられないようにする。最初は0〜1に正規化された s_i(t) を対象とする。
- 接続相手の意味や視覚等のModalityは生まれつき与えない。合成Twin WorldではSensory Portの空間的な近さも与えない。
- 「全Unitへ薄いAnchorを持たせる」は予測学習比較の便宜的な**Birth Prior**。fan-in 1/2/4/8やSensory frontier only条件を将来比較。
- Portの改名と投射の同時置換で同等になること、Anchor HashがLife前後で一致することをテストする。

## 4. 最小MicroUnit Dynamicsと局所予測（候補）

**K1が第一候補であり未検証。** K0（自身の次activation）とK2（Frame内の複数内部更新）、Hebbian/Predictionなしを比較する。

到着時点で凍結された再帰Driveを p_i(t)、今届いた固定Anchorを s_i(t) とする。

- prediction error: δ_i(t) = s_i(t) − p_i(t)
- activation: a_i(t) = clip_[0,1](s_i(t) + p_i(t) − θ_i)
- direct one-step local weight update: Δw_ji(t) = η × x_ji(t) × δ_i(t)
- x_ji(t) は**時刻t−1に実際にContact j→iから送信した source activity**。現在のa_j(t)ではない。
- 新Weightは ±w_max で有界化。新活動と確定したWeightから次stepのDriveを送信する。

具体的には p_i(t) = Σ_j [ w_ji(at emission t−1) × x_ji(t) ] であり、Weightが更新されても既に送った p_i(t) は書き換わらない。p_i(t) は符号付きの生の予測値とし、活動のclipと混同しない。

直前のsource activityを使う更新はこの固定された局所1step readoutに対する直接勾配に沿うが、**再帰系全体の厳密なgradientではない**。長期eligibilityは活動EMAを延ばしただけで正しい因果勾配になるとは限らず、別Ablationとする。

重要な未解決問題:
- 同じrecurrent driveを「次入力の予測」と「現在活動の形成」に共用すると、自己増幅や飽和が起き得る。
- signed weightを許しても意味ある抑制が自然形成されるとは限らない。
- 固定平均値・強いbase rate・頻出sourceへのWeight集中で予測できる場合がある。
- 0Bの高次文脈をこの簡潔なルールだけで保持・学習できるとは限らない。
- 局所予測誤差が小さいこととWorld Model/意味理解は同一ではない。

数式を満たすだけでは成功としない。具体的なKernel順序、in-flight buffer、Trialの開始時刻は **developmental-node-v2-kernel-contract.md** に規定する。

## 5. 時間・局所性の実装契約

Phase 1は**deterministic synchronous double-buffer**。全Unitは同じ前状態を読み、計算を確定してからswapする。Unit IDや配列走査順が因果構造にならないようにする。Global tick index/absolute age/Life sequence positionはBrain入力にしない。Simulatorは更新周期、Structural Sweep、Trace decayを管理してよいが、それらは**明示的なBirth/Physics Prior**である。

Spatial locality: 未接続Unitを探索してその活動を見ない。Potential Contactは情報路ではない。Trial/Committed Contactを通る通信のみを利用。

Temporal causality: 予測は未来のSensory arrivalより前に凍結。局所Weight updateは、実際にその予測を生んだsource packetだけを参照。削除・置換前の最後のpacketは評価を完了。Trial生成時に過去の活動をさかのぼって取得しない。

同一Birth/Sensory/Config/RNG streamなら全State Hash一致を要求。Snapshotには未配送Packet、局所状態、Trial exposure、候補カーソル、Simulator RNG/phaseを含める（ただしBrainへGlobal Tickを認知入力しない）。

## 6. Structural Plasticity — 盲目的Trialと経験による選別（候補）

第一候補は**Basal Blind Local Exploration**。

1. TargetのPotential inbound candidatesを出生Seedで匿名Permutationにする。試す相手を予測誤差・未接続相手のactivity・Global utilityで検索しない。
2. 空いているTrial Slotで順番に接触を試す。初期 weight=0、source activityは接触後のみ観測可。
3. Weightは現在の局所予測学習則で増減する。
4. 評価機会: sourceExposure += |source activity|、targetOpportunity += |target sensory| の局所量をTrial中だけ蓄積。
5. 十分なsourceExposure **または** targetOpportunityが得られたら |trial weight| による最小保持判定を試す。両方0なら「判定不能なままTrial Slot占有」の問題があり、Pilotで検証する。
6. TargetのCommitted Slotに余裕があればCommit。満杯ならTargetのIncoming Committedのうち最小|weight|と比較。勝者だけ残す。Tie処理は決定的に。
7. Releaseされた接続はPotentialへ戻る。古いageやCounterfactual UtilityでBrain内の選別をしない。
8. Trial interval、exposure閾値、保持閾値などは固定された研究parameterであって知能ではない。Seed/設定/コストを記録する。

**反証対象**: 頻出だが無関係な接続が|weight|を獲得する、Noiseでchurnする、Trial候補順に結果が支配される、未活動Contactで探索停止する、必要な接続を発見できない。必要ならUsage Trace、Homeostatic/Prediction-gated trial、局所hysteresis等を独立Ablationにし、勝手に本体へ混ぜない。

## 7. Memory / Forgetting / 初期経験

Memoryはraw Life Archiveではなく、現在のWeight/Topology/activation/threshold/dynamical tendenciesに残った過去の**因果効果**。BrainはScientist Archiveを読めず、raw replayや専用Memory ModuleをPhase 1へ入れない。忘却はweight更新と有限Slotの競争から検証する。全Edge一括のunused-age purge、passive decay、勝手なstability rankは初期標準にしない。

Nurseryは**必須ではない**。Cold Birth（出生直後Split）を最小基準とする。Quiet / spontaneous / generic sensory / structured prehistory と、Shared Childhood後Splitを独立研究。Nurseryがないと学習開始できない場合は、先にBirth Physicsと通常入力範囲を監査する。

Homeostasisは局所の遅いThreshold更新に限った候補。H0なし、H1固定Band、H2経験由来Band、H3 Nursery由来基準を比較。全Unitを同一平均活動に強制しない。予測学習をHomeostasisが打ち消す可能性も測る。

## 8. Twin Life / エビデンス

基準: **same Birth + different Life → different internal structure AND measurable functional consequence**。

- 0A: P→Q→R→S vs P→S→R→Q（出現頻度は同じ、1step遷移が異なる）。
- 0B: 全4記号の頻度と全16 bigramの頻度を同じにし、2記号以上の文脈で次記号が異なる系列。固定Interval暗記を避けるためTiming Jitterも別要因で比較。
- 0C: A→B、B→A、A→A、B→B、A→B→Aの切替・保持・Savings。
- Early Life: 生まれ直後Split / 共通幼少期後Split / 異なる幼少期→同じ後半Life。
- 必須比較: Hebb/Predictionなし、Weight-only/Fixed Topology、No Structure、same-life clone、baseline predictors、shuffle、matched random lesion、no-collapse、resource cost。
- PilotとConfirmatoryを分離。Pilotの結果を見てから確定し、Confirmatoryのデータで再調整しない。Seed配分やHold-outを事前登録。

成功は複数Gateで評価。Prediction Accuracy単体、Topology Jaccard単体、派手な活動、自己報告から「知能が生まれた」とは主張しない。詳細は **developmental-node-v2-experiment-protocol.md**。

## 9. 後段への自由度の解禁順

Phase 1: Fixed N、同一MicroUnit、固定Anchor、固定Potential Graph、局所Weight/Trial/Committed、Cold Birth基準。

その後は**Phase番号に拘束されない独立Ablation**として、必要性が実証されたものを順次比較する。

- Local Homeostasisの発達、可塑的Unit timescale/eligibility、Metaplasticity
- Eligibility拡張、fast/slow weight、Consolidation、休息や自発再活性、Replay
- EdgeのSTP/release probability、E/I制約、局所Normalization、Delay Plasticity、Event-driven更新
- Afferent Routing発達（固定Anchorを参照点として維持）、Body Geometry依存の感覚配線
- 身体と匿名Action Port、Active vs Yoked Passive、行動後のObservation Prediction
- Spontaneous exploration → learned action bias → proto-goal。Curiosity/reward/empowermentは比較仮説であり、標準出生物理へ入れない。
- Functional motif/overlapping assemblies、将来のmacro/community compression（Observerが脳へ昇格させない）。
- Fixed N後にDormant Reserve → reversible dormancy → growth/true birth → death/turnover（必要性を確認してから）
- 最後に言語を経験から育った構造へ接続。LLMはTeacher/translator/observer候補でありBrainの代替にはしない。

## 10. Innate Information Budget

全実験で「生まれつき与えたもの」を列挙・定量化する。特にN、Potential degree、Sensory fan-in、Sensor encoding、Threshold、Activation nonlinearity、Weight bound、learning rate、eligibility decay、Trial order、Slot fraction、Structural Sweep周期、Worldの持続時間、spontaneous drive有無など。

**誰でも結果を再現できる決定論**と**人間が知能の答えを与えていないこと**は別問題である。固定Worldや固定Hyperparameter自体も帰結を強く左右する。特定のBirth Seedや設定にだけ成立する現象を一般化しない。

## 11. 未解決課題（実装前の最優先）

1. K0/K1/K2とHebbの比較。とくにK1のprediction-and-drive共用による自己増幅。
2. 1step source packetと対象errorが本当に対応するか。トポロジー変更時のin-flight整合。
3. s_i ∈ [0,1] と signed p_i と bounded activationの値域・閾値整合。
4. 定数・平均頻度・前記号のBaselineを超えて0Bのhigher-order ruleを学べるか。
5. Blind Trial / |weight|だけで、不要な高頻度Edgeを除き必要Edgeを残せるか。
6. Potential Graph／Anchor Seedのlotteryに結果が支配されないか。
7. Cold Birthが通常Sensoryで活動できるか。Nurseryが設計欠陥を隠さないか。
8. Falsificationを受け入れ、改善のために未検証機構を一度に足さない。

**これらはまだ実装・実証されていない。** 本文書は仕様・試験設計の最新版であり、実験成功の報告ではない。
