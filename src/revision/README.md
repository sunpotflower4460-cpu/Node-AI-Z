# revision/

Self-Revision / Memory / Promotion（SRM-3）層です。返答ごとに revision entry を生成し、memory に蓄積し、change の昇格状態を管理します。

## SRM-3 主要ファイル

| ファイル | 役割 |
|---|---|
| `promotionRules.ts` | change ごとの昇格判定。`deriveChangeStatus` が ephemeral → provisional → promoted を決める。`summarizePromotion` は ObserveMode の Promotion / Growth 表示用。 |
| `promoteRevisionState.ts` | state 全体の status 再計算。全 entry・change を走査して status を更新し、plasticity を再構築して新しい immutable state を返す。 |
| `revisionLog.ts` | entry 追加時の update 導線。`addRevisionEntry` → `syncRevisionState` → `promoteRevisionState` の順で promotion が通る。 |
| `revisionTypes.ts` | `ChangeStatus`（`ephemeral` / `provisional` / `promoted` / `reverted`）などの型定義。 |

## change の状態遷移

```
ephemeral → provisional → promoted
    ↓
 reverted（keep 後でも revert 操作で固定）
```

- **ephemeral**: 初期状態。keep も occurrence も閾値未満。
- **provisional**: keep ≥ 2 または occurrence ≥ 3。昇格候補。
- **promoted**: keep ≥ 2 かつ occurrence ≥ 3。plasticity に強く反映。
- **reverted**: 明示的に revert 操作済み。自動昇格されない。
- **locked**: 自動昇格の対象外（keep/revert 後に lock で固定）。

## その他のファイル

| ファイル | 役割 |
|---|---|
| `applyPlasticity.ts` | plasticity を pipeline 入力に適用 |
| `applyUserTuning.ts` | keep / soften / revert / lock の tuning アクション処理 |
| `buildProposedChanges.ts` | 返答結果から proposed change を生成 |
| `buildRevisionEntry.ts` | revision entry を組み立てる |
| `defaultPlasticityState.ts` | plasticity の初期値 |
| `defaultRevisionState.ts` | revision state 全体の初期値 |
| `getRevisionSummary.ts` | revision summary 文字列生成 |
| `plasticityState.ts` | plasticity state の再構築（`rebuildPlasticityState`） |
| `revisionStorage.ts` | localStorage への保存・読み込み |
| `selectEffectivePlasticity.ts` | 表示・runtime 用の effective plasticity 抽出 |
| `statusMeta.ts` | status ラベル・badge クラスなどの表示メタ |
| `types.ts` | revision 層の型定義（`RevisionState`, `RevisionEntry`, `ProposedChange` 等） |

## テスト

```
src/revision/__tests__/promotionRules.test.ts      — deriveChangeStatus / getChangePromotionStats
src/revision/__tests__/promoteRevisionState.test.ts — promoteRevisionState の再計算・immutability
src/revision/__tests__/revision.test.ts             — addRevisionEntry / syncRevisionState
```

`npm run test:run` で全テストが通ることを確認してから変更を加えてください。
