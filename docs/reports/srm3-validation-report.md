# SRM-3 Validation Report

## 1. 概要

SRM-3 最小実装（promotionRules.ts / promoteRevisionState.ts）の接続確認と検証結果です。

- `npm run build` ✅
- `npm run lint` ✅
- `npm run test:run` ✅ — 75 tests passed (6 test files)

## 2. 実行コマンドと結果

```
npm ci              → 成功
npm run build       → 成功（dist/ 生成）
npm run lint        → 成功（eslint エラーなし）
npm run test:run    → 成功（6 files / 75 tests passed）
```

## 3. テストファイルと件数

| テストファイル | テスト数 | 対象 |
|---|---|---|
| `src/revision/__tests__/promotionRules.test.ts` | 12 | `deriveChangeStatus` / `getChangePromotionStats` |
| `src/revision/__tests__/promoteRevisionState.test.ts` | 6 | `promoteRevisionState` の再計算・immutability |
| `src/revision/__tests__/revision.test.ts` | 18 | `addRevisionEntry` / `syncRevisionState` |
| `src/home/__tests__/homeLayer.test.ts` | 14 | Home Layer |
| `src/core/__tests__/runNodePipeline.test.ts` | 15 | Node Pipeline |
| `src/studio/__tests__/buildStudioViewModel.test.ts` | 10 | Studio ViewModel |
| **合計** | **75** | |

## 4. SRM-3 実装ファイル確認

### promotionRules.ts
- `getChangePromotionStats`: cross-entry での keep / soften / reverted / occurrence 集計
- `deriveChangeStatus`: ルール判定（reverted → locked → promoted → provisional → ephemeral）
- `summarizePromotion`: ObserveMode の Promotion / Growth セクション用サマリ生成

### promoteRevisionState.ts
- `promoteRevisionState`: 全 entry・change を走査して status を再計算し、plasticity を再構築して新 immutable state を返す

### revisionLog.ts
- `syncRevisionState` → `promoteRevisionState` の接続確認済み
- `addRevisionEntry` が entry を prepend した後、`syncRevisionState` を通して昇格が計算される

## 5. UI 確認

ObserveMode の Promotion / Growth セクション（`src/ui/modes/ObserveMode.tsx`）:
- `summarizePromotion(revisionState)` の import は破綻なし
- `totalEntries === 0` の場合は非表示（空セクション回避）
- 4 カード構成: Revision Growth / Recently Promoted / Provisional Queue / Thickened Pipes
- 各カードに空状態メッセージあり

## 6. 確認した整合性

- `revisionLog.ts` の `syncRevisionState` → `promoteRevisionState` の接続: ✅
- `ObserveMode.tsx` の `summarizePromotion` import: ✅
- テストの import パス（`../promotionRules`, `../promoteRevisionState`, `../defaultRevisionState`, `../types`）: ✅
- README の現在地: SRM-3 実装済みに更新済み

## 7. 現在地判定

**SRM-3 done**

change 単位の ephemeral / provisional / promoted / reverted、昇格判定ロジック、state 全体再計算、revisionLog との接続、ObserveMode での可視化が揃っています。

## 8. 残課題

- SRM-3.5 / SRM-4 相当の refinement・summarization（昇格後の memory 圧縮・要約）は未着手
- `mode state`（Observe / Experience の選択）は非永続
- relation boost の UI 実地での強い蓄積例の確認
- 自然さ・安心感などの主観評価は引き続き人手確認が必要
