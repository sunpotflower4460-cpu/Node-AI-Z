# Developmental Node v2 — 決定台帳 / 旧設計との差分

更新日: 2026-10-28
状態: **第1〜25巡の設計議論を統合。実装・実験の採択記録ではない。**

参照優先順位:
1. **developmental-node-v2-current-spec.md** — 現時点の考え方と設計境界。
2. **developmental-node-v2-kernel-contract.md** — 時刻・データアクセス・実行順序。
3. **developmental-node-v2-experiment-protocol.md** — 比較・反証・Gate。
4. **developmental-node-v2-design.md** — 2026-10-07の旧版。変更の履歴として残す。内容が矛盾するときは1〜3を優先。

「採用」は研究設計上の合意方針、「第一候補」は実験が必要な仮説であり、能力の実証ではない。

## 1. 旧版から更新された重要事項

| 項目 | 2026-10-07旧版 | 第25巡時点 | 状態 |
| --- | --- | --- | --- |
| Birth Node | predictedActivation、age、lifecycle、generation、parentIdsを持つDevelopmentalNode | **意味のない固定数MicroUnit**、基本はactivation/threshold＋条件付き局所EMA | 旧標準を置換 |
| Functional Node | Node個体とCommunity階層を想定 | 出生時0。Observerがmotif / dynamic ensemble / subspaceを検証 | 方針 |
| Edge | utilityEma、lowUtilityAge、stable/dormant等 | signed scalar weightのみを核、eligibility/usageTraceはArm別 | 方針 |
| Prediction | 自分自身の次activation | 固定Sensory Anchorへの局所予測。K1第一候補、K0/K2と比較 | 未検証候補 |
| Target | 学習する内部活動 | 独立・不変の外界由来s_i(t) | 方針 |
| Candidate | 未接続sourceを探しgradient/recurrenceを得る | **有界Potential Contact**、実Contact前は活動を読めない | 方針 |
| Edge Birth | gradient EMA / directional reliability / min recurrence | Blind local trial、weight=0、経験後選別 | 第一候補 |
| Edge Utility | counterfactual errorをBrainも利用できそうな記述 | **Scientist専用**。Brainが利用しない | 方針 |
| Edge Retention | lowUtilityAgeでdormant/prune | Trial→Committed/Release。Ageを使わない | 第一候補 |
| Capacity | incoming + outgoing固定 | Target incomingだけのSlot fraction、Potentialでoutgoing有限 | 第一候補 |
| Homeostasis | 固定target activityへ合わせる | Noneも含む、局所Band / lifetime derived / nursery derived比較 | 未検証 |
| Time | fast / medium / slow | 同期Double Buffer、Global tickはBrain不可視、厳密なin-flight時差 | 方針 |
| Sensory | sparse fixed projection | 固定Balanced Anchorと将来可塑的なAfferent Routeを分離 | 方針 |
| Nursery | 全Twin必須 | **Cold Birth**を標準対照にし、Nurseryを独立研究 | 方針 |
| Twin 0A | 2つのPair Ruleが中心 | P→Q→R→S vs P→S→R→Qの循環系列 | 拡充 |
| Twin 0B | なし | bigram頻度一致のHigher-order Twin / timing jitter | 新規 |
| Twin 0C | なし | A→B、B→A、A→A、B→B、Return/Savings | 新規 |
| Eval | Accuracy、structure、lesion | 予測baseline、paired seeds、介入、Edge-Time、誤選択、no-collapse | 拡充 |
| Node Split/Merge | 旧Phase 2の具体仕様 | 生得のUnit count固定で先に検証。後段の比較対象に延期 | 延期 |
| Replay | 第3段の追加機構 | raw life archiveはScientist、Brain replayは後の別実験 | 延期 |
| Action/Goal | 後段の想定 | 匿名Action Port / active-yoked / goal-likeを分けて検証 | 後段 |
| Language | 概念先行、言語後段 | LLMをTeacher/Translator/Observerに限定。Brainの代替不可 | 後段 |

## 2. 第1〜25巡の研究論点と現在の位置

| 巡 | 何を調べたか | この時点で残す要点 |
| --- | --- | --- |
| 1 | Local prediction/eligibility | local update仮説とHebbian対照 |
| 2 | Red Team / Twin Birth | 同一出生・同人生対照・causal lesion |
| 3 | Potential Contact / 0A/0B/0C | 未接続活動は読めない、複数Lifeで反証 |
| 4 | MicroUnit / Functional Node | Functional Nodeは初期に作らない |
| 5 | Birth topology | Potentialとactual occupancyを分ける |
| 6 | Born symmetry | Equal physics、balanced匿名Asymmetry |
| 7 | Memory | Brainにraw Life Archiveを置かない |
| 8 | Forgetting | 有限資源と局所競争から検証 |
| 9 | Consolidation | fast/slow weightやstabilityを初期投入しない |
| 10 | Modulation | Global reward/curiosityを初期投入しない |
| 11 | Action Port | 後で匿名sensorimotor loop、yoked対照 |
| 12 | Exploration/Goal | spontaneous→bias→proto-goalの順に研究 |
| 13 | Specialization | 単一共有substrate、機能分化は観測する |
| 14 | Representation | scalar activity、population trajectory / topologyで履歴 |
| 15 | Time | BrainにGlobal tickを渡さず同期Simulator |
| 16 | Prediction Target | self-prediction collapseを避け、外界Anchor候補 |
| 17 | Sensory Anchor | immutable measurementとafferent routing分離 |
| 18 | MicroUnit physics | bounded thresholded scalar、E/IやNormalizationは比較 |
| 19 | Edge physics | 基本weightのみ。eligibility/usageTraceは必要性を試す |
| 20 | Structural selection | Blind local trial、経験によるselection |
| 21 | Finite capacity | Target incoming slotとPotential degreeを分離 |
| 22 | N / Growth | 固定Nから始め、recruitment/birth/deathは後 |
| 23 | Nursery / Childhood | Cold Birth基準、早期経験自体を研究 |
| 24 | Local Causality | 時差・in-flight・未来Leakageを監査 |
| 25 | Kernel K0/K1/K2 | K1局所recurrent drive予測の数式契約、未実証 |

## 3. 合意方針 / 未証明仮説 / 禁止事項

**合意方針**
- Brain/Simulator/Scientistの権限を物理・コード両面で分離する。
- 先天的な意味Node、正解Goal、Reward、LLM理解、Central World ModelをPhase 1に入れない。
- Potential Contactは可能性だけ。接続なしに他Unitの活動を探れない。
- same-birth/same-life再現、same-birth/different-life比較、Lesionによる因果確認を必須にする。
- Phase 1は固定MicroUnit数。既存Repository Runtimeは変更せず、独立して始める。
- 追加したBorn mechanismはInnate Information Budgetへ記録する。

**第一候補（負けてもよい）**
- K1のlocal recurrent-drive prediction / direct one-step plasticity。
- Clipped linear scalar / signed weight / balanced sparse fixed sensory Anchor。
- Basal Blind Trial + |weight| local selection。
- Target側committed slot ratio。
- Cold Birthを標準対照とする。

**禁止または初期段階で除外**
- 未接続Nodeを全探索してsource activity、error、hidden utilityを読む。
- Scientistのlesion utilityやPerformance/Task IDをBrainの学習信号として返す。
- データベース式の完成人生記憶・意味付きModuleを「自然発達」と主張する。
- Global Tick/ageをMicroUnitの意味入力にする。
- Trialを生んだ瞬間に過去activityを読み出す。
- 異なる実験Armを後から混ぜて成功を作る。
- Frozen Evaluation中にplasticity/homeostasis/structureを勝手に変更する。

## 4. 実装前に決める順序と未解決

- N、Potential degree、Anchor fan-in、capacity fraction、World encoding/dwell、seed分割、数値精度と加算順序をconfigへ明記する。
- K1の同じDriveの二重用途で活動が飽和しないか、negative weights/rare patternsが学べるか検証。
- Higher-order 0Bが失敗したとき、学習則の欠陥か、表現容量・時間尺度不足かをLesion/ablationで切り分ける。
- Trial-only/Committedのcommunication costを正しく算出。
- 旧設計で使われたFunctional/Utility/Stableなどの名前をそのまま新Brain schemaへ輸入しない。
- 次研究（第26巡）は**高次時間関係の表現能力と学習可能性**が中心。K1の成功はまだ確認されていない。

## 5. 変更管理

今後の設計変更は、日付、対象節、Before/After、根拠、負けた条件、代替仮説、次の反証Testを追記する。古い仮説を「最初から存在しなかったこと」にせず、旧版とこの台帳のリンクを維持する。

**本更新は文書のみ。Brain Core、TypeScript Runtime、World、Test Codeを動かしたという主張はしない。**
