# Phase A-1 Build復旧とWrapper正本化

実施日: 2026-08-06

## 結果

- `npm run build`: **成功（終了コード0）**
- 静的import解決不能: **0件**
- 全Svelte個別compile: **136件成功 / failure 0 / warning 0**
- import cycle: **0件**
- SSR smoke check: `/`、`/app`、`/app/analysis`、`/admin`、`/app/dev/ui`、`/dev/analysis-preview`が全てHTTP 200
- 対象ファイルの削除: **0件**

最初のsandbox内build/dev起動はfilesystem制限によりVite設定の読み取りが拒否されたため、同じコマンドを許可済みのsandbox外で再実行した。コード起因のbuild errorではない。sandbox外のproduction buildは成功した。

## 正本判断の原則

1. 現行routeの合成元である`ComponentsBase/AdminConsole.svelte`と、そのdata contractを優先した。
2. repository内、調査メモ、生成物、隣接backup directoryを検索したが、Admin 6件が参照していた親directoryの同名実体は存在しなかった。
3. Adminは存在しない旧実体を新たな親directoryへ推測復元せず、現行import先である`admin/`配下を正本とした。
4. Signupは親directoryに実体が現存するため、それを正本とし、parts wrapperは互換層として残した。
5. UI/業務機能の新規外部送信は追加していない。Admin追加ボタンは既存dummy/admin previewの範囲に留め、backend mutationを行わない。

## 8件の調査と対応

| 対象 | 変更前import / 失敗理由 | 候補・利用箇所・到達性 | props契約 | 正本判断 / 変更 | 見た目・挙動への影響 |
|---|---|---|---|---|---|
| `admin/AdminAddUserForm.svelte` | `../AdminAddUserForm.svelte`。参照先不存在 | 同名実体なし。変更前は直接利用0。現行Admin screenshot/data contractに追加formがある | 旧wrapperは無型passthroughで契約不明 | wrapperを廃止し、このファイルを正本化。`AdminDashboard`から合成 | build不能だったためruntime比較不能。参照画像にあるemail/password/2 actionを復元。actionは外部処理なし |
| `admin/AdminDashboard.svelte` | `../AdminDashboard.svelte`。参照先不存在。build最初の停止点 | `ComponentsBase/AdminConsole.svelte`から`summary`,`users`付きで利用。`/admin`と`/app/dev/ui`から到達 | `summary: AdminSummary`, `users: AdminUserRow[]` | wrapperを廃止し、このファイルを正本化。現行4 leaf componentを合成 | current dummy summary/user tableを表示。新規業務mutationなし |
| `admin/AdminMetricCard.svelte` | `../AdminMetricCard.svelte`。参照先不存在 | 同名実体なし。変更前直接利用0。dashboard screenshotに4 metrics | `label`, `value`, optional `tone`を明示 | wrapperを廃止し、admin正本としてDashboardから利用 | metric表示のみ。外部作用なし |
| `admin/AdminProgressCard.svelte` | `../AdminProgressCard.svelte`。参照先不存在 | 同名実体なし。変更前直接利用0。summaryにpriority/capacityがある | `value`, `max`, optional `label` | wrapperを廃止し、admin正本としてDashboardから利用 | current summaryから進捗ringを表示。外部作用なし |
| `admin/AdminTabs.svelte` | `../AdminTabs.svelte`。参照先不存在 | `AdminConsole.svelte`から利用。`/admin`と`/app/dev/ui`から到達 | `activeTab: AdminTab`, `onTabChange(AdminTab)`。呼出側と一致 | wrapperを廃止し、このファイルを正本化 | dashboard/logs切替という既存呼出側の意図を実装。routeや認証は変更なし |
| `admin/AdminUserTable.svelte` | `../AdminUserTable.svelte`。参照先不存在 | 同名実体なし。変更前直接利用0。current `adminUsers`と参照画像にtableがある | `users: AdminUserRow[]` | wrapperを廃止し、admin正本としてDashboardから利用 | dummy usersを表示し、local checkbox選択のみ追加。backend mutationなし |
| `parts/button/signup/SignUpBtn.svelte` | `../../../../SignUpBtn.svelte`は`src/lib/components/SignUpBtn.svelte`へ上がり過ぎ、参照先ファイルが存在しない | 正本は`ComponentsBase/SignUpBtn.svelte`。root `SignUpForm.svelte`がparts wrapperをimport。root form自体は現行routeから未到達 | wrapper passthrough。正本は`label`,`type`,`disabled` | wrapper維持。`$lib/components/ComponentsBase/SignUpBtn.svelte`へ明示import | markup/style/props passthroughを維持し、見た目・挙動変更なし |
| `parts/input/signupform/SignUpForm.svelte` | `../../../../SignUpForm.svelte`は`src/lib/components/SignUpForm.svelte`へ上がり過ぎ、参照先ファイルが存在しない | 正本は1,075行の`ComponentsBase/SignUpForm.svelte`。parts wrapperの現行import元は0 | wrapper passthrough。正本はoptional `mode: 'signup' | 'login'` | 未使用断定による削除を避けwrapper維持。`$lib/components/ComponentsBase/SignUpForm.svelte`へ明示import | markup/style/props passthroughを維持し、見た目・挙動変更なし |

## Admin UIの根拠

Admin 6件については、参照される旧実体そのものが存在しなかったため「旧実装と新実装の見た目比較」は不可能だった。復元時は次の現存資料だけを根拠にした。

- `src/lib/components/ComponentsBase/AdminConsole.svelte`: Dashboard/Tabsの利用契約とlogs表示
- `src/lib/components/ComponentsBase/admin/data/admin-data.ts`: summary/user/log/serviceの型
- `src/lib/db/dummy/panoptes_dummy_ui.ts`: 現行dummy mapping
- `src/lib/db/UI/admin/パノプテス-admin.png`: dashboard、metrics、追加form、user tableの視覚参照

したがって、今回のAdmin変更は「存在する旧UIを別版へ置換」ではなく「失われた参照先に依存するwrapperを、現行contractと参照画像に沿った正本へ戻す」対応である。正確なpixel同一性は旧source不在のため保証できない。

## 変更したimport

- `parts/button/signup/SignUpBtn.svelte`
  - 変更前: `../../../../SignUpBtn.svelte`
  - 変更後: `$lib/components/ComponentsBase/SignUpBtn.svelte`
- `parts/input/signupform/SignUpForm.svelte`
  - 変更前: `../../../../SignUpForm.svelte`
  - 変更後: `$lib/components/ComponentsBase/SignUpForm.svelte`
- Admin 6件の不存在親実体へのimportは除去。
- `admin/AdminDashboard.svelte`から同じ`admin/`配下の4 leaf componentへ直接importを追加。

## Build・route検証

### Production build

```text
vite v7.3.1
SSR: 428 modules transformed
Client: 404 modules transformed
Build: success (exit code 0)
```

adapter-autoはproduction environmentを特定できない旨の警告を出すが、build failureではない。

### SSR smoke check

| route | status |
|---|---:|
| `/` | 200 |
| `/app` | 200 |
| `/app/analysis` | 200 |
| `/admin` | 200 |
| `/app/dev/ui` | 200 |
| `/dev/analysis-preview` | 200 |

Browser UIによる視覚確認も試みたが、この実行環境には接続可能なbrowser instanceがなかった。HTTP SSR、production build、全Svelte個別compileでレンダリング前段のクラッシュがないことを確認した。

## 未解決事項・新たに確認した問題

1. `/admin`には認証・権限・Organization guardがない。今回の200応答は公開安全性を意味しない。
2. Admin追加formの2 actionはbackend contractが存在しないため、意図的にmutation未接続。見た目のplaceholderである。
3. Admin旧sourceが存在せず、参照画像との厳密なvisual regression比較はできない。
4. Signup root formとparts form wrapperは現行routeから未到達。削除せず互換性を維持した。
5. `adapter-auto`はdeploy targetを検出できない。deploy先確定後に専用adapterが必要。
6. repositoryには`check`/lint/test scriptがまだない。

## 変更ファイル

- `src/lib/components/ComponentsBase/admin/AdminAddUserForm.svelte`
- `src/lib/components/ComponentsBase/admin/AdminDashboard.svelte`
- `src/lib/components/ComponentsBase/admin/AdminMetricCard.svelte`
- `src/lib/components/ComponentsBase/admin/AdminProgressCard.svelte`
- `src/lib/components/ComponentsBase/admin/AdminTabs.svelte`
- `src/lib/components/ComponentsBase/admin/AdminUserTable.svelte`
- `src/lib/components/ComponentsBase/parts/button/signup/SignUpBtn.svelte`
- `src/lib/components/ComponentsBase/parts/input/signupform/SignUpForm.svelte`
- `docs/audit/12-build-recovery.md`

## 次に必要な作業

1. Phase A-2として`svelte-check`を導入し、`npm run check`を品質gateにする。
2. `/admin`の認証・role・Organization guardを別タスクで実装する。
3. Admin screenshotを使ったvisual regression baselineを作り、今回復元UIの差分をproduct ownerが確認する。
4. Admin追加user actionのbackend contractが決まるまで、ボタンを実処理へ接続しない。
5. Signup entry route/利用方針を確認し、wrapperを残す期間を決める。
