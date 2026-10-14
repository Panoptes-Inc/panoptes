# API・Data Access・Auth

## 呼び出し一覧

| caller | endpoint/service | server/client | auth/org | error/retry |
|---|---|---|---|---|
| `panoptes/api/client.ts` | `GET /api/project/list` | client fetch | 明示なし | envelope検証、5xxをretryable扱い。timeout/retry実行なし |
| 同上 | `GET /api/project/:id` | client | 同上 | 同上 |
| 同上 | `POST /api/project/create-and-start-analysis` | client | 同上 | idempotency keyをbodyに含む |
| 同上 | `GET /api/analysis/:job/progress` | client polling | 同上 | action側で継続poll/backoff表示 |
| 同上 | `POST /api/project/:id/inference/confirm` | client | 同上 | actionでtoast |
| 同上 | `POST /api/project/:id/reanalyze` | client | 同上 | idempotency keyあり |
| 同上 | `POST /api/project/:id/strategy/select` | client | 同上 | optimisticではなくresponse反映 |
| 同上 | `POST /api/strategy/task/update-status` | client | 同上 | transition response |
| 同上 | `GET /api/usage/current` | client | 同上 | UIとの接続は限定的 |
| `SignUpForm.svelte` | Supabase Auth signUp/signIn/resend | client SDK | Supabase session | 独自error文字列分類、cooldown |
| 同上 | `POST /api/waitlist/join` | client | Turnstile token | response error処理あり。route実装なし |

SvelteKitの`+server`、`+page.server`、server load、actionsは0件なので、上記same-origin APIはrepository内では提供されません。実backend接続は「設計済みだが未接続」です。

## Mock API

`PUBLIC_USE_MOCK_API === 'true'` の場合、`mockPanoptesApiClient`を使用します。stateは`panoptes.mock.v3_3.state`としてlocalStorageに保存され、project/job/snapshot/idempotencyを模倣します。実顧客データは含まずdemo seedです。

注意:

- public flagのため利用者がbundle/configを観察できること自体は問題ではないが、productionでtrueになればmockが正本に見える。
- mock stateに将来機密情報を入れない。localStorageはXSSで読み取り可能。
- real clientもmock implementationを静的importする。

## Supabase

`supabaseClient.ts`はPUBLIC URL/anon keyからbrowser clientを生成し、未設定時はplaceholder URL/keyへfallbackします。UIが即crashしない利点はありますが、設定不備をbuild/deploy時に検知できず、実行時errorに遅延します。

Supabase直接accessは到達不能の`SignUpForm.svelte`に限定され、DB `.from()`、RPC、Storage、Realtime、Edge Functionsは未確認です。RLS policy/migrationもrepositoryに実装されていないため、RLS安全性は評価不能です。

## Form棚卸し

| form | validation | submit | 状態 | Rails移行時 |
|---|---|---|---|---|
| LoginModal | client email/password | callbackなしなら閉じるだけ | 見かけ上成功し得る | Rails/Supabase auth adapterへ |
| ContactModal | client required/email | callbackなしなら成功表示 | 仮送信 | server action + mail/jobへ |
| SurveyModal | client required/email | callbackなしでも成功表示 | 仮送信 | server action + persistenceへ |
| SignUpForm | client + Supabase + Turnstile | direct SDK/fetch | 到達不能だが実装大 | auth featureとして分離 |
| AnalysisStartSearchBar | action層URL検証 | API client | 実API欠如 | Rails job createへ |
| CreateProjectSheet |親callback | 親action | form elementではない | schema共有、server validation必須 |
| InferenceReview | 親callback | action | 3 inputs | Rails transition validationへ |

## Rails移行境界

推奨するtransportは `Browser -> SvelteKit BFF -> Rails API -> PostgreSQL / Python queue` です。BrowserからRailsへ直接接続する場合でも、cookie/CORS/CSRF/org scopeを統一する必要があります。

Rails responseは現行`PanoptesApiClient`の型をversioned contractとして再利用できますが、`normalizeContractAliases`に複数旧名が残るため、移行完了時に正規field名を一本化します。生成typeは`api/contracts/generated`へ隔離し、UIはview model経由で利用します。

