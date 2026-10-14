# Phase A-2 品質ゲート導入記録

実施日: 2026-08-06

## 結論

Svelte / TypeScript の型検査、ESLint、Prettier、Vitest、production build、主要 route の smoke test をローカルと GitHub Actions で実行できる状態にした。`npm run quality` は終了コード 0 で完了した。既存の UI、業務ロジック、component 配置、Tailwind、Auth / Organization guard、adapter は変更していない。

## 事前調査

- package manager: npm（`package-lock.json` あり）
- ローカル実行環境: Node.js 24.18.0 / npm 11.17.0
- CI 実行環境: Node.js 22
- TypeScript 設定: `tsconfig.json` ではなく既存の `jsconfig.json` を使用
- SvelteKit: Svelte 5 / Vite 7 / `@sveltejs/adapter-auto`
- 導入前は ESLint、Prettier、Vitest、GitHub Actions workflow、`.editorconfig` の設定なし

## 導入したツールとバージョン

lockfile で解決された主要バージョンは次のとおり。

| ツール | バージョン |
| --- | --- |
| TypeScript | 5.9.3 |
| svelte-check | 4.7.4 |
| ESLint | 10.8.0 |
| @eslint/js | 10.0.1 |
| typescript-eslint | 8.66.0 |
| eslint-plugin-svelte | 3.22.0 |
| globals | 17.9.0 |
| Prettier | 3.9.6 |
| prettier-plugin-svelte | 4.1.1 |
| Vitest | 4.1.10 |

TypeScript 7 は現行ツールチェーンとの peer dependency が一致しなかったため採用せず、互換範囲の TypeScript 5.9 を選択した。dependency major update は行っていない。

## 追加した npm scripts

- `check`: SvelteKit 型生成後に `svelte-check --tsconfig ./jsconfig.json`
- `check:watch`: check の watch 実行
- `lint`: `.js`、`.ts`、`.svelte` を ESLint flat config で検査
- `format`: Prettier 対象を整形
- `format:check`: 整形差分の有無を検査
- `test`: Vitest を単発実行
- `test:watch`: Vitest の watch 実行
- `test:smoke`: production preview に対する主要 route の HTTP 検査
- `quality`: check → lint → format:check → test → build → smoke。途中失敗時は非ゼロで停止

既存の `prepare` にあったエラー握りつぶしを廃止し、`svelte-kit sync` の失敗が正しく install / CI を失敗させるようにした。

## 初期検査と段階導入

### svelte-check

初回から 0 errors / 0 warnings。`$lib` alias、generated types、Svelte template、browser/server 型境界を既存 `jsconfig.json` に沿って検査している。既存コード修正は不要だった。

### ESLint

推奨設定をそのまま error として適用した初期結果は 93 problems（82 errors / 11 warnings）だった。大半が既存 Svelte template の key、SvelteKit の `resolve()`、未使用値などであり、一括修正は UI・挙動変更や大規模差分につながるため、既知カテゴリをルール単位で warning に段階化した。無差別な `eslint-disable` は追加していない。

最終結果は 0 errors / 93 warnings（終了コード 0）。内訳:

| ルール | 件数 |
| --- | ---: |
| `svelte/require-each-key` | 57 |
| `svelte/no-navigation-without-resolve` | 15 |
| `@typescript-eslint/no-unused-vars` | 8 |
| `svelte/no-useless-mustaches` | 7 |
| `@typescript-eslint/no-explicit-any` | 3 |
| `svelte/prefer-writable-derived` | 2 |
| `no-useless-assignment` | 1 |

Promise の未処理検査は型情報が利用できる `.ts` に `@typescript-eslint/no-floating-promises` を適用している。Svelte 全ファイルへの型情報付き ESLint は実行が 120 秒を超えたため、Svelte template は `eslint-plugin-svelte` の静的検査、TypeScript は型情報付き検査に分離した。

`src/lib/db/role/**` は実行コードではなく仕様書・archive・参照用の大規模 TypeScript スキーマを同居させた資料領域のため、初期 allowlist として ESLint 対象外にした。`repo/**`、生成物、依存物、coverage、audit 文書も対象外である。

### Prettier

Prettier と Svelte plugin を導入した。今回の大規模 format 差分を避けるため、既存 `src/**`、`static/**`、`docs/audit/**`、README、生成物、build 成果物、dependency、lockfile、既存 audit / log を対象外とし、新規設定・script・test・workflow のみを整形した。最終 `format:check` は成功した。

## Unit test

`src/lib/panoptes/utils/guards` の既存 pure domain logic に対して 5 tests を追加した。

1. analysis step / progress が単調増加すること
2. project / job / session の stale update を拒否すること
3. terminal runtime を非 terminal 状態へ戻さないこと
4. analysis 中だけ stable snapshot を保持すること
5. committed snapshot を transient project status より優先して表示状態を決めること

結果: 1 test file、5 tests passed、0 failed。

## Route smoke test

production build 後に Vite preview を一時起動し、次を検査する script を追加した。

- `/`: 200
- `/app`: 200
- `/app/analysis`: 200
- `/admin`: 200
- `/app/dev/ui`: 200
- `/dev/analysis-preview`: 200

これは route がレンダリング段階で壊れていないことだけを示す。`/admin`、dev route、mock route の公開安全性、認証、権限、Organization guard を保証しない。

## 実行結果

| コマンド | 結果 |
| --- | --- |
| clean install | 成功（同一 lockfile の隔離環境で `npm ci --ignore-scripts`、193 packages） |
| `npm run check` | 成功、0 errors / 0 warnings |
| `npm run lint` | 成功、0 errors / 93 warnings |
| `npm run format:check` | 成功 |
| `npm run test` | 成功、5 / 5 tests |
| `npm run build` | 成功、SSR 428 modules / client 404 modules |
| `npm run test:smoke` | 成功、6 / 6 routes が HTTP 200 |
| `npm run quality` | 成功、終了コード 0 |

Windows のプロジェクト直下での最初の `npm ci` は、VS Code が Rollup native module を読み込んでいたため `EPERM` になった。VS Code は停止せず、同一 `package.json` / `package-lock.json` を一時隔離ディレクトリへ置いた clean install で lockfile 再現性を確認した。プロジェクト直下は `npm install` と `prepare` が成功した状態へ復元し、その状態で全品質ゲートを実行した。

## GitHub Actions

`.github/workflows/quality.yml` を追加した。pull request、`main` push、手動実行で、Ubuntu / Node.js 22 上の次の処理を行う。

1. checkout
2. Node setup と npm cache
3. `npm ci`
4. SvelteKit sync
5. check
6. lint
7. format check
8. unit test
9. production build
10. route smoke test

CI は外部 API / 本番 DB に接続せず、公開可能な placeholder と mock mode だけを使用する。`PUBLIC_SUPABASE_URL` と `PUBLIC_SUPABASE_ANON_KEY` は build / smoke 用 dummy、`PUBLIC_USE_MOCK_API` は mock 選択、Turnstile site key は公開値の placeholder である。CI secret は不要であり、`SUPABASE_SERVICE_ROLE_KEY` は workflow に渡していない。実環境の値は runtime / deployment 環境で別途管理する。

## adapter-auto 警告

build は成功するが、`adapter-auto` が対応 production environment を特定できない旨を表示する。終了コード、成果物、CI、smoke test には影響しない。AWS / Azure / Vercel 等の比較前に今回 adapter を固定する必要はないが、deployment target を決定した時点で対応 adapter を選択すべきである。

## 未解決事項と次の推奨作業

1. ESLint の93 warningをカテゴリ別・小さいPR単位で解消し、解消済みルールから error へ昇格する。
2. `src/lib/db/role/**` の仕様資料と実行コードを区分し、lint allowlist を縮小する。
3. 変更ファイル限定 format を安定運用できるよう、Git repository / staged files を前提とした format script を検討する。
4. npm audit の9件（low 1 / moderate 2 / high 6）を影響範囲ごとに調査する。今回は major update と自動 `npm audit fix` を行っていない。
5. Svelte component test、実ブラウザ E2E、visual regression、accessibility test を別 Phase で導入する。
6. `/admin` の Auth / Organization guard と本番公開可否を別タスクで実装・判断する。
7. deployment target 決定後に adapter を固定する。

## 変更ファイル

- `package.json`
- `package-lock.json`
- `eslint.config.js`
- `prettier.config.js`
- `.prettierignore`
- `vitest.config.js`
- `tests/unit/guards.test.ts`
- `scripts/smoke-routes.mjs`
- `.github/workflows/quality.yml`
- `docs/audit/13-quality-gates.md`

既存 `src/**` は変更していない。UI、業務挙動、API 仕様、mock、component directory、Tailwind、Auth、admin 公開判断に関する変更もない。
