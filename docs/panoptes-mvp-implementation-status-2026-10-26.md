# Panoptes MVP — アプリケーション実装状況

> **評価基準日：2026年10月26日**  
> **評価対象：アプリケーションの実装・接続・動作検証（ドキュメント整備率は含まない）**  
> **情報源：CodexによるRepository調査・ローカル検証の報告**  
> **公開判定：外部顧客へのMVP公開は不可**

## 1. エグゼクティブサマリー

| 指標 | 結果 | 読み方 |
|---|---:|---|
| **MVP総合進捗** | **14.5%** | 重要度を考慮した受け入れ条件の達成スコア |
| 機能実装進捗 | 13.1% | 機能系15領域（重み90%）に対する評価 |
| 公開準備基盤 | 27.5% | Testing・Security・Deployment（重み10%）に対する評価 |
| 評価の信頼度 | Medium | 実Backendや本番環境は未検証 |
| **公開を妨げるP0** | **9件** | 相互依存する実装パッケージ。件数＝工数ではない |

### 結論

**Frontendの表示・状態制御や認証／Organizationの基礎は存在する一方、実URLの収集から分析・戦略生成・Snapshot保存に至る本番用の業務経路は未成立。**

特に、本番用の業務Clientは分析操作に対して **503 `business_api_unavailable`** を返す。Railsで確認できた公開経路は認証・Organization関連の **GET 5件**であり、Project・AnalysisJob・Snapshotの永続化経路は未確認または未実装。競合分析、6軸評価、戦略提案など、表示されるデータの多くはMock生成である。

> **注意：14.5%は残工数・残期間を示さない。** また、未確認（UNKNOWN）の受け入れ条件は採点上0点としているため、実装済み機能の絶対的な割合とも異なる。

## 2. MVP公開の完成条件

外部顧客が本番環境で以下を利用できる状態を100%とする。

1. 実ユーザーの認証とOrganization単位の認可
2. URL登録、Bootstrap推定と利用者確認、Project／Jobの冪等な作成
3. 自社と**競合10社**の実Web収集（HTML／Screenshot等）
4. 内部構造・ビジュアルの共通6軸分析
5. 業界構造、自社・競合の差分分析
6. 根拠に紐づく戦略提案3案と30／60／90日計画の生成
7. Evidenceの保管、正式Snapshotの確定、履歴・再表示
8. 非同期Job、Queue、Worker、Retry／Cancel／Timeoutの安全な実行
9. Frontend → BFF → Rails → Worker／DB間の実接続
10. 本番環境のセキュリティ、監視、復旧と運用受け入れ

正式MVP v1.0では「10 competitors」と表現されている。最大10社でよいかは正式な受け入れ条件として確認が必要。Snapshot／Partialの扱いには後発のPD-04も関係する。

## 3. 領域別の実装進捗

| 領域 | 重み | 達成率 | 総合寄与 | 状況・不足点 |
|---|---:|---:|---:|---|
| Frontend / UI | 6% | **50.0%** | 3.000pt | SSR・画面の基礎あり。結果表示はDummy／Mock中心 |
| Authentication / Organization | 8% | 37.5% | 3.000pt | 認証・所属検証の実装あり。実顧客利用経路は未統合検証 |
| Project / URL Registration | 4% | 12.5% | 0.500pt | 入力制御あり。実Project／Jobの保存なし |
| SvelteKit BFF | 4% | 25.0% | 1.000pt | GET転送・一部エラー処理あり。業務Mutation未接続 |
| Rails API / Authorization | 6% | 25.0% | 1.500pt | JWT・所属認可のコードあり。分析APIなし、Rails実行未確認 |
| PostgreSQL / Migrations / RLS | 6% | 12.5% | 0.750pt | Identity系schemaあり。業務DB保存とtenant分離の実検証なし |
| Crawler / Chromium / Screenshots | 8% | **0%** | 0pt | 実行可能な収集Workerを確認できず |
| Internal Structure Analysis | 6% | **0%** | 0pt | HTML／DOMから正式Observationを生成する経路なし |
| Visual Analysis | 6% | **0%** | 0pt | Screenshotを入力する正式分析経路なし |
| Competitor / Industry Analysis | 7% | **0%** | 0pt | 10社分析はMock factory生成 |
| Gap Analysis / Six Axes | 5% | **0%** | 0pt | 表示はあるが、正式な計算・差分・欠損処理は未接続 |
| LLM / Strategy Generation | 8% | **0%** | 0pt | 実LLM呼出しなし。戦略・計画はMock |
| AnalysisJob / Queue / Worker / Retry | 7% | 12.5% | 0.875pt | Frontendのpollingあり。Job永続化・Queue／Workerなし |
| Snapshot / Evidence / History | 6% | **0%** | 0pt | memory／localStorageのMockのみ。正式保存・再表示なし |
| Error / Loading / Progress | 3% | 37.5% | 1.125pt | UI局所制御あり。実Job進捗・障害復旧未確認 |
| Automated Testing / E2E | 4% | 37.5% | 1.500pt | Unit・Smoke成功。実Backend／Browser E2Eなし |
| Security / Observability | 4% | 25.0% | 1.000pt | 限定的Guard・Secret検査あり。SSRF防御・監視・Audit未成立 |
| Deployment / Production Readiness | 2% | 12.5% | 0.250pt | Build・配備素材あり。本番接続・復旧検証なし |
| **合計** | **100%** | — | **14.500pt** | **外部MVP公開不可** |

**集計：** 総合 `14.50%`、機能系 `11.75pt ÷ 90% = 13.1%`、公開準備系 `2.75pt ÷ 10% = 27.5%`。

### 特に重要な読み取り

- **あるもの：** UI、SSR、状態制御、Mock結果表示、認証／Organizationの一部、BFF GET境界、テスト基盤。
- **まだないもの：** 実URLの安全な収集、証跡の永続保存、内部／Visual観測、競合・業界分析、6軸計算、実LLM戦略生成、正式Snapshot確定。
- **混同しないこと：** Mock画面が動くことは、分析エンジンが動くことを意味しない。API仕様やSQLファイルの存在は、実装・適用・統合成功の証明ではない。

## 4. 実行した検証と限界

| コマンド／確認 | 結果 | 確認できた範囲 |
|---|---|---|
| `npm run check` | 成功（errors 0／warnings 0） | Svelte／TypeScript静的検査 |
| `npm run lint` | 成功（errors 0／warnings 38） | 現行Lint設定 |
| `npm run test` | **22ファイル・257件成功** | Unit、Mock境界、状態制御 |
| `npm run build` | 成功 | 本番Bundle生成（本番配備の成功ではない） |
| `npm run test:smoke` | **10 route成功** | HTTP応答、Redirect、開発Route遮断 |
| `npm run test:auth-smoke` | **5確認成功** | Mock認証によるRoute制御 |
| `npm run check:openapi` | 成功（18 operation） | OpenAPI定義の検査（API実装数ではない） |
| `npm run test:secrets` | 成功 | 限定的なClient Secret検査 |
| Rails／PostgreSQL統合テスト | **未実施** | Ruby／BundlerがPATHになく、Docker daemonへ接続不可 |
| 実Supabase／Rails／DB／Browser E2E | **未確認** | 本番相当の縦方向の成功は未証明 |

初回のTest／Buildで発生したサンドボックス権限による停止は、切り分け後の再実行で成功したためアプリのBuild不具合として扱っていない。

## 5. MVP公開を止めるP0：9件

| # | ブロッカー | 成立させる内容 | 完了の証明 | 推奨担当 |
|---|---|---|---|---|
| 1 | 実認証・Organization | 実ユーザー、所属管理、権限変更／失効の反映 | 実DBでログイン・権限変更・cross-org拒否 | Auth／Backend |
| 2 | Project・URL・開始API | URL正規化・到達性、Project／Job保存、冪等作成、確認後再開 | 二重送信が一要求、Refresh後も保存 | Backend／API |
| 3 | Job・Queue・Worker | 永続状態、Attempt、Retry／Cancel／Timeout、重複防止 | Queue起動と再配送・競合の試験 | Backend／Worker |
| 4 | 安全な収集 | SSRF・Redirect防御、Chromium、HTML／Screenshot／Artifact | 許可URL取得と内部宛先拒否、資源制限 | Worker／Security |
| 5 | 分析・6軸・差分 | 内部／Visual観測、共通6軸、10社・業界、欠損対応 | Evidence付きFixtureで再現性を確認 | Analysis／Backend |
| 6 | 実LLM戦略生成 | 3案と30／60／90計画、根拠、出力検証、費用制御 | 承認付き実LLM統合試験 | AI／Backend |
| 7 | Snapshot・Evidence保存 | 業務Schema、Object保存、Commit／昇格、履歴・Lineage | 別Session再表示、重複Commit拒否、Partial条件 | Backend／Data |
| 8 | Frontendと実Backendの接続 | 業務BFF／Client、正式結果、実進捗・回復 | 実認証から分析・保存・再表示までBrowser E2E | Frontend／API／QA |
| 9 | 本番配備・運用受け入れ | 配備・Secret・TLS・監視・通知・Backup／Restore・Rollback | 本番相当の安全性・復旧・負荷試験 | Platform／Security／QA |

**優先順位の考え方：** 上記9件は相互依存する実装パッケージ。すべてを独立した工数として足し算しない。また、P0が残る限り、進捗率が高くても公開可とは判定しない。

### P1／P2の扱い

- **P1：** 主要操作の妨げにならない範囲のResponsive／Accessibility改善、Lint警告、性能・運用導線。重大な操作不能やAccessibility障害が判明した場合はP0へ引き上げる。
- **P2：** 追加比較モード、高度な監視分析、非必須の装飾・構造整理。全面的なDirectory／Tailwind移行より中核の実接続を優先する。

## 6. MVP公開までのCritical Path

```text
実認証・Organization
        ↓
Project／AnalysisJobのDB永続化
        ↓
Queue → Workerの起動・再試行
        ↓
安全なURL収集・HTML／Screenshot取得
        ↓
内部／Visual観測・共通6軸・業界／競合分析
        ↓
根拠に基づくLLM戦略生成
        ↓
Evidence・Snapshotの正式Commit
        ↓
Frontendの実業務Client接続・Browser E2E
        ↓
本番配備・安全性／復旧／運用受け入れ
```

### 推奨する最初の実装マイルストーン

**Milestone 01：First Real Analysis Pipeline（提案・未承認）**

1. 実ユーザー・Organizationから実URLを登録する。
2. Project／AnalysisJobをDBへ保存する。
3. Queueから実Workerを起動する。
4. 許可URLのHTMLとScreenshotを取得する。
5. Evidenceを永続保存する。
6. Refresh後もJobとEvidenceを再取得できる。
7. 他Organizationからの参照を拒否する。

**この段階では6軸分析、LLM戦略、正式Snapshot確定まで完了させる必要はない。** まず一つの縦方向の実処理を接続し、その後に分析対象・計算・戦略・Snapshotへ広げる。

### 推奨する実装順序

1. 業務DB、Project／Job API、認証・所属の実統合
2. Queue → Worker → 収集 → Evidence保存
3. 分析・計算・戦略出力の正式Contractへの適合
4. Snapshot確定とFrontendのMock置換
5. Browser E2E、本番運用受け入れ

## 7. 技術契約・未決定事項との接続

実装着手に先立ち、着手範囲に関係する以下の契約を確認する。

| 契約 | 確認事項 |
|---|---|
| Organization / Authorization | 所属・Role・Resourceの最終認可と失効反映 |
| Project / AnalysisJob | 作成・状態遷移・冪等性・再分析とRetryの区別 |
| BFF / Rails API | Request／Response／Error／Scopeと業務Mutation |
| Queue / Attempt | 再配送、Timeout、Cancel、古いAttemptの結果拒否 |
| Evidence | Objectの保存場所、所有範囲、参照・追跡 |
| Snapshot | Committed判定、Partial、昇格・再表示・Lineage |

未決定の契約は実装で勝手に確定しない。可読性改善のClosureとは切り離し、既存のP0引き継ぎに沿って管理する。

## 8. 主なRepository根拠

以下はCodexの報告に挙げられた相対パス。**このファイルの作成時点で、実際のRepositoryを独立検査したものではない。**

| パス | 報告された確認事項 |
|---|---|
| `src/lib/panoptes/api/client.ts` | Mock／本番用Clientの選択 |
| `src/lib/panoptes/api/unavailable-canonical-business-client.ts` | 本番用業務操作が503を返す |
| `rails/config/routes.rb` | Identity／Organization関連GET 5件 |
| `rails/db/schema.rb` | User／Organization／Membership／SystemRoleの4表 |
| `src/lib/server/auth/supabase.ts` | Frontend認証・所属Context |
| `rails/app/controllers/concerns/organization_authorization.rb` | Rails側の所属・権限検証 |
| `src/lib/server/rails/client.ts` | RailsへのBearer転送・Scope確認・Timeout |
| `src/lib/panoptes/actions/analysis.ts` | URL入力・確認・Polling・再分析のFrontend制御 |
| `src/lib/panoptes/api/mock/snapshot-factory.ts` | 10社・観測・戦略データのMock生成 |
| `src/lib/panoptes/api/mock-backend.ts` | Mock Backendとmemory／localStorage |
| `src/lib/components/ComponentsBase/PanoptesShellEntryPage.svelte` | `dummySnapshot`によるFallback表示 |
| `src/lib/db/role/Panoptes_DB_Migration_v3_3_Complete.sql` | 業務SQL案は存在するが適用・動作未確認 |
| `src/lib/db/role/panoptes_mvp_spec_final_reviewed_v_1_0.md` | 正式MVP v1.0の受け入れ要件 |

## 9. 採点ルールと今後の更新

各領域を4つの受け入れ条件で等分評価した。

| 判定 | 点数 | 意味 |
|---|---:|---|
| ○ | 1.0 | 今回のローカル実行で限定条件を確認 |
| △ | 0.5 | 実装を確認したが、必要な統合動作は未確認 |
| × | 0 | 未実装・未接続・Mockのみ |
| ? | 0 | 証拠不足でUNKNOWN（未実装と同義ではない） |

`領域進捗 = 4条件の得点合計 ÷ 4 × 100`  
`総合進捗 = Σ（領域の重み × 領域進捗）÷ 100`

**継続評価の推奨：** 次回以降は同じWeight・受け入れ条件を基本的に固定し、○／△／×／?の内訳、実Browser E2Eの成立数、未検証事項、P0の解消状況も併記する。評価基準を変更した場合は旧スコアと単純比較しない。

---

**総括：** Panoptesは、画面・境界設計・一部認証処理の基盤を持つ一方、MVPの主価値である実Web観測から戦略提案・履歴保存までの一連の処理が未接続。次の優先事項は新たな資料作成ではなく、最初の実分析パイプラインを小さく成立させ、実接続と検証に基づいて進捗を更新すること。
