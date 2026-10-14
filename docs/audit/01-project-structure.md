# プロジェクト構造・依存パッケージ

## 技術構成（確認済み）

| 項目 | 現状 |
|---|---|
| package manager | npm（`package-lock.json` lockfileVersion 3） |
| 実行環境 | 現環境 Node v24.18.0 / npm 11.17.0。repository内に`.nvmrc`/`engines`なし |
| Svelte | package指定 `^5.48.2`、lock実体 5.49.0 |
| SvelteKit | `^2.50.1` / lock 2.50.1 |
| Vite | `^7.3.1` / lock 7.3.1。要求Node `^20.19.0 || >=22.12.0` |
| TypeScript | 直接依存なし。`.ts`は40件あるが`typescript` packageとcheck scriptは未導入 |
| Tailwind/PostCSS | 未導入。設定ファイルもなし |
| UI/icon/form/validation/chart library | 未導入 |
| animation | GSAP 3.14.2（Landing heroで使用） |
| state | Svelte標準 `writable`/`derived` とrunes |
| Supabase | `@supabase/supabase-js` 2.97.0（`SignUpForm`でAuth使用） |
| testing/lint/formatter | package・設定・scriptとも未確認 |
| adapter | `@sveltejs/adapter-auto` 7.0.0 |

Nodeの想定バージョンはrepositoryに固定されていません。依存関係の下限からNode 20.19以上（または22.12以上）と読むのが安全ですが、これはpackage constraintsからの推定です。

## npm scripts

- `dev`: `vite dev`
- `build`: `vite build`
- `preview`: `vite preview`
- `prepare`: `svelte-kit sync || echo ''`（失敗を握り潰すためCI診断性が低い）

## 依存分類

| package | 分類 | 根拠/注意 |
|---|---|---|
| `svelte`, `@sveltejs/kit`, vite plugin | 使用中 | 全UI/route/build基盤 |
| `vite` | 開発・build | scriptsから使用 |
| `adapter-auto` | build/deploy | `svelte.config.js`で使用。デプロイ先確定後は専用adapter推奨 |
| `@supabase/supabase-js` | 使用中だが局所 | `supabaseClient.ts`と到達不能の`SignUpForm.svelte` |
| `gsap` | 使用中 | Landing hero 2ファイル |

重複目的の外部packageはない一方、フォーム・validation・chartを自前実装しているため、実装重複がpackageではなくsource側に現れています。

## ディレクトリ概要

```text
src/
├─ routes/                 # 14 files / 8 URL routes
├─ lib/
│  ├─ components/          # 134 files（Svelte 122 + TS 2ほか）
│  │  ├─ analysis/         # 独立loading preview
│  │  └─ ComponentsBase/   # 現行/旧/dummy/admin/domain UIが混在
│  ├─ panoptes/            # 24 files / 現行app state・API・domain
│  ├─ db/                  # 44 files / dummy、仕様、SQL、参照PNG
│  ├─ stores/              # 1 legacy JS store
│  ├─ styles/              # reset.css
│  ├─ mock/ と mocks/      # 命名重複
│  └─ supabaseClient.ts
└─ app.css
static/                    # 15 files
docs/                      # 調査前は空
repo/                      # architecture/tech-debtメモ3件
```

### 指定ディレクトリの存在

| path | 状態 | 責務/所見 |
|---|---:|---|
| `src/routes` | 14 files | route。空のroute directoryも7件存在 |
| `src/lib` | 209 files | UI、runtime、仕様、画像まで混在 |
| `src/lib/components` | 134 files | component本体。`ComponentsBase`という曖昧な集約名 |
| `src/lib/stores` | 1 file | legacy `analysis-feed.js`。現行storeは`panoptes/stores` |
| `src/lib/server` | 存在しない | BFF/auth実装なし |
| `src/lib/utils` | 存在しない | 現行utilityは`panoptes/utils` |
| `src/lib/types` | 存在しない | 現行typeは`panoptes/types.ts` |
| `src/lib/services` | 存在しない | なし |
| `src/lib/api` | 存在しない | 現行APIは`panoptes/api` |
| `src/lib/actions` | 存在しない | 現行actionは`panoptes/actions` |
| `src/lib/styles` | 1 file | resetのみ |
| `static` | 15 files | logo/icon/cursor/装飾。空dirもある |
| Python関連 | 存在しない | 仕様書内言及のみ |
| `supabase`, `migrations` | 存在しない | SQL仕様は`src/lib/db/role`に置かれるが実migrationではない |
| `tests`, `scripts` | 存在しない | 品質自動化なし |
| Docker/deploy config | 存在しない | adapter-autoのみ |

## 命名・責務上の問題

- `ComponentsBase`配下にlayout、feature、domain、modal、dummyが混在する。
- `mock`と`mocks`、`dummy`が3系統ある。
- `db`配下にDB codeだけでなく仕様書25件、UI参照画像15件、dummy 4件がある。
- `Self`/`Strategy`/`Competitor`はPascalCase、`industry`/`admin`/`top`はlowercaseで不統一。
- `regal`はおそらく`legal`の誤記。`structur`、`fabicon`も綴り不整合。
- 空directoryが多数残り、予定構造と実装済み構造を区別できない。

## 環境変数（名前のみ）

`.env` に `PUBLIC_SUPABASE_URL`、`PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY` を確認。前二者はclient公開前提、service-roleはclient treeからimportされていない。`.env`は`.gitignore`対象だが、private credentialは将来のRails/worker側へ隔離すべきです。

