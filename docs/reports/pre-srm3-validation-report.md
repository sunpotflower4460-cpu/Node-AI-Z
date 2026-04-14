# Pre-SRM-3 Validation Report

## 1. Summary

- `npm run lint` / `npm run build` は成功し、TypeScript・lint・import/export の基本健全性に重大な破綻は見つかりませんでした。
- Node Pipeline / Self-Revision / Plasticity / Home Layer / Observe Mode / Experience Mode / localStorage の導線は、コードレビューとブラウザ実地確認の範囲では安全側に収まっています。
- SRM-3 には **Ready with caution** と判断します。重大ブロッカーはありませんが、自然さ・安心感・会話継続性の最終評価は人手確認が必要です。

## 2. Commands Run

- `git fetch origin main:refs/remotes/origin/main` — 成功
- `npm ci` — 成功
- `node -e "const pkg=require('./package.json'); console.log(JSON.stringify(pkg.scripts,null,2))"` — 成功
- `npm run lint` — 成功
- `npm run build` — 成功
- test script 確認（`package.json`） — `NO_TEST_SCRIPT`
- `npm run dev -- --host 127.0.0.1` — 成功
- Playwright で Observe / Experience / tuning / reload / localStorage を確認 — 成功
- 修正後 `npm run lint` — 成功
- 修正後 `npm run build` — 成功

## 3. Findings

### build/lint/test

- lint / build は修正前後とも通過。
- 未使用 import・型破綻・主要 import/export 破綻は今回の検証範囲では未検出。
- main から辿れる Observe / Experience の主要画面はブラウザ上で表示確認済み。
- 既存の `test` script は存在しないため、自動テスト追加は既存構成優先で見送り。

### revision

- `NodeStudioPage` で返答ごとに `buildRevisionEntry()` → `addRevisionEntry()` が走る構造になっており、revision candidate 生成導線は存在。
- `applyUserTuning()` により keep / soften / revert / lock が `revisionState.tuning` と change status に反映され、`syncRevisionState()` を通して plasticity 再計算まで接続されている。
- proposed change が 0 件でも `SelfRevisionCard` は空状態を描画できる実装。
- Observe Mode で keep 後、次回 run の `Applied This Turn` に source `keep` として反映されることをブラウザ実地で確認。
- Experience Mode は最小 tuning（keep / soften / revert）に限定され、観察 UI より軽いまま保たれている。

### plasticity

- `rebuildPlasticityState()` が memory + tuning から node / relation / pattern / home trigger / tone bias を再構築し、次回 `runNodePipeline()` と `runHomeCheck()` に流れている。
- `selectEffectivePlasticity()` の表示対象と runtime 側の参照先は概ね一致。
- delta 上限は `PLASTICITY_LIMITS` で制限され、今回観測した適用値は `±0.007`〜`±0.028` 程度で「じわっと効く」範囲に収まっていた。
- relationBoosts / homeTriggerBoosts の導線はコード上で確認済み。home trigger は実地でも適用表示を確認。relation boost は今回の UI 実地では強い蓄積ケース未確認だが、`buildRelationBoostKey()` → `rebuildPlasticityState()` → `applyRelationBoost()` の接続は存在。

### home layer

- `runHomeCheck()` は urgency / ambiguity / fragility / belongingSignal に基づき return を発火し、stable 時は `needsReturn: false` で毎回介入しない。
- `applyReturnAdjustment()` は reason ごとに断定緩和・指示口調緩和・関係維持文追加を行い、最終的に tone bias を重ねる構造。
- Observe Mode で before / after は `rawReplyPreview !== adjustedReplyPreview` のときのみ表示され、条件は妥当。
- Home View / raw inspect / Reply 上の before-after 表示は同じ `studioView.homeCheck` / `rawReplyPreview` / `adjustedReplyPreview` を参照しており、コード上のズレは見当たらない。

### observe/experience

- Observe Mode は構造観察中心、Experience Mode は会話中心という役割分離は概ね維持。
- Experience Mode から Observe Mode へ戻る導線は有効で、体験会話が History に反映されることを確認。
- 明確な重複表示として、Experience Mode の展開内にあった重複 `観察で見る` ボタンを削除した。
- revision UI は Experience 内では折りたたみ・最小表示に留まり、会話画面の主役を大きく奪ってはいない。

### persistence

- localStorage 保存キーは以下の 3 つを確認:
  - `node-ai-z:revision-state`
  - `node-ai-z:experience-messages`
  - `node-ai-z:api-selection`
- `revision-state` は plasticity / memory / tuning をまとめて保持し、`experience-messages` と `api-selection` は別責務で分離されている。
- reload 後に experience messages と revision plasticity は復元されることをブラウザ実地で確認。
- mode state（Observe / Experience の現在選択）は永続化されていない。
- reset 系は責務ごとに分かれており、`clearRevisionState()` は revision 系のみ消す。experience messages や API 選択は別管理のまま残るため、全体リセット期待とは挙動が異なる点に注意。

### README

- README 冒頭に SRM-2 / pre-SRM-3 の現状を明記。
- 実装済み plasticity を `nodeBoosts` のみの表現から、現状実装に合わせて `node / relation / pattern / home trigger / tone bias` へ軽く補正。
- 今後の予定も `SRM-2 への進行` から `SRM-3` に更新し、現状との整合を取った。

## 4. Fixes Applied

- `src/ui/modes/ExperienceMode.tsx`
  - 展開済み Self-Revision 内の重複 `観察で見る` ボタンを削除し、Experience Mode の重複表示を軽減。
- `README.md`
  - 現在段階が pre-SRM-3 であることを明記。
  - 実装済み plasticity の記述を現状コードに合わせて修正。
  - roadmap の SRM 表現を現状に合わせて更新。

## 5. Remaining Risks

- 自然さ・安心感・「近くにいる感じ」は主観評価が必要で、自動判定しきれない。
- relation boost はコード導線は確認できたが、今回の UI 実地確認では強い蓄積例を十分に踏めていない。
- 自動テスト基盤が未整備のため、今後 SRM-3 に入る前に純関数テストを追加できると回帰確認がしやすい。
- mode state が非永続のため、ブラウザ再読込後の作業復帰体験は限定的。
- revision clear と experience clear が別責務のため、ユーザーが「全部リセット」を期待すると認知差が出る可能性がある。

## 6. Manual Check Needed

- 返答の自然さ
- 「判断しているAI感」がどれくらい残るか
- Home return 後の安心感
- Experience Mode で会話が止まらないか
- “分からないまま近くにいる感じ” が出ているか
- 信頼を損なう断定が残っていないか

## 7. Final Recommendation

Ready with caution
