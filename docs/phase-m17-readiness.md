# M17 着手条件 — Phase M17 Readiness Checklist

このドキュメントは、Phase M17（Surface Translator 実装）に進むための条件を明確にします。

## M17 に進んでよい条件

Phase M17 に着手してよい条件は以下の通りです：

### 1. Facade Runtime ディレクトリが存在

**確認項目**:
- ✅ `src/core/facadeRuntime/` ディレクトリが存在する
- ✅ 以下のファイルが実装されている:
  - `facadeRuntimeTypes.ts`
  - `facadeCapabilityPolicy.ts`
  - `buildFacadeView.ts`
  - `resolveFacadeRequest.ts`
  - `facadeActionRouter.ts`
  - `runFacadeRuntime.ts`
  - `facadeRuntimeRegistry.ts`

**現在地**: ✅ **完了** — Phase M16 で実装済み

---

### 2. get_view が少なくとも1本動作

**確認項目**:
- ✅ `runFacadeRuntime()` が `get_view` request を処理できる
- ✅ crystallized_thinking mode が facade runtime 経由で view を取得できる
- ✅ observer mode が facade runtime 経由で view を取得できる

**現在地**: ✅ **完了** — Phase M16 で実装済み

**検証方法**:
```bash
npm run test:run -- integrateFacadeRuntime.test.ts
```

---

### 3. Capability Policy が効く

**確認項目**:
- ✅ `getFacadeCapabilityPolicy()` が各 mode の policy を返す
- ✅ crystallized_thinking: read (trunk + branch), write (branch), promotion read/write
- ✅ observer: read-only (trunk + branch), promotion read
- ✅ jibun_kaigi_api: read-only (branch), no promotion
- ✅ future_app: minimal access (branch), no promotion

**現在地**: ✅ **完了** — Phase M16 で実装済み

**検証方法**:
```bash
npm run test:run -- facadeCapabilityPolicy.test.ts
```

---

### 4. Facade View が Observe で見える

**確認項目**:
- ✅ `buildFacadeView()` が CoreView から FacadeView を構築できる
- ✅ FacadeView が capability policy に基づいてフィルタされている
- ✅ Observe mode が facade view を取得できる
- ✅ `getStudioFacadeView()` が observer 用に facade view を提供できる

**現在地**: ✅ **完了** — Phase M16 で実装済み

**検証方法**:
```bash
npm run test:run -- integrateFacadeRuntimeToStudio.test.ts
```

---

### 5. Build / Lint / Test が通る

**確認項目**:
- ✅ `npm run build` が成功する
- ✅ `npm run lint` がエラーなしで完了する
- ✅ `npm run test:run` が全テスト通過する

**現在地**: ⏳ **検証中** — Phase M16 実装完了後に検証

**検証方法**:
```bash
npm run build
npm run lint
npm run test:run
```

---

## M17 で何をするか

Phase M17 に進んだ後、以下を実装します：

### 1. Surface Translator 実装

**目的**: Facade View を各アプリの表面表現に変換する translator layer を実装する

**主要コンポーネント**:
- `src/surface/translator/`: surface translator の実体
  - `surfaceTranslatorTypes.ts`: translator の型定義
  - `translateFacadeViewToSurface.ts`: FacadeView → SurfacePresentation
  - `applySurfaceBias.ts`: アプリごとの presentation bias を適用
  - `buildSurfaceReply.ts`: 最終的な surface reply を構築

### 2. Presentation Bias 導入

**目的**: アプリごとに異なる表現バイアスを定義する

- crystallized_thinking: 内部結晶を尊重した表現
- observer: デバッグ情報を含む詳細表現
- jibun_kaigi_api: 会話体の自然な返答
- future_app: 将来のアプリ用の stub

### 3. じぶん会議方式との本格統合

**目的**: jibun_kaigi_api mode が facade runtime を経由して Mother Core と接続する

- jibun_kaigi_api が facade runtime 経由で personal branch にアクセス
- provider 選択は surface translator の後で適用

---

## M17 に進めない場合の対応

もし上記の条件のいずれかが満たされていない場合、以下を優先して対応してください：

1. **Facade Runtime が動かない**: `src/core/facadeRuntime/` の実装を完了させる
2. **get_view が通らない**: `runFacadeRuntime()` と `resolveFacadeRequest()` を修正する
3. **Capability Policy が効かない**: `facadeCapabilityPolicy.ts` を見直す
4. **Facade View が見えない**: `buildFacadeView()` の実装を確認する
5. **Tests が通らない**: テストを修正し、build/lint エラーを解消する

---

## Phase M16 完了報告テンプレート

M16 完了時に以下の形式で報告してください：

```
* 変更したファイル: [リスト]
* 追加したファイル: [リスト]
* facadeRuntime 実体化: ✅ 完了
* crystallized 側の接続: ✅ 完了
* observer 側の接続: ✅ 完了
* capability policy の扱い: ✅ 完了
* facade view の扱い: ✅ 完了
* README 更新: ✅ 完了
* M17 着手条件: ✅ 完了
* build: ✅ 通る
* lint: ✅ 通る
* test:run: ✅ 通る
* まだ残る課題: [あれば記載]
* 現在地判定: M16 完了、M17 着手可能
```

---

## まとめ

Phase M17 に進むためには、Phase M16 の以下が完了している必要があります：

1. ✅ Facade Runtime ディレクトリ存在
2. ✅ get_view が動作
3. ✅ Capability Policy が効く
4. ✅ Facade View が Observe で見える
5. ⏳ Build / Lint / Test が通る（検証中）

**現在地**: Phase M16 実装完了、build/lint/test 検証待ち

**次のステップ**: Build/Lint/Test を実行し、全て通ることを確認したら M17 着手可能
