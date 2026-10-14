# Module 09 — PostgreSQL / Source of Truth

Status: `COMPLETE / READY_FOR_M10`  
Phase: `TB-10`  
Difficulty: `INTERMEDIATE`  
Prerequisites: `M01`–`M08`

## 1. Learning goals

このModuleを終えたLearnerは、次を自分の言葉で説明・判断できる。

1. RDBとPostgreSQLの基本要素を説明する。
2. Decision OwnershipとDurable Data Ownershipを分けて説明する。
3. RailsとPostgreSQLの責務境界を判断する。
4. Entity、relation、key、constraintを読み取る。
5. transactionとconcurrency controlが必要な理由を説明する。
6. current、historical Snapshot、derived data、cacheを区別する。
7. CURRENT schemaとTARGET designを混同せずに読む。

## 2. Database / PostgreSQL fundamentals

Relational Databaseは、dataをtableとして保持し、keyによってrelationを表現するdurable storageである。PostgreSQLはPanoptes Railsが利用するRDBMSであり、現在の`database.yml`は`postgresql` adapterを指定している。

| Concept     | Meaning                                   | Panoptesでの読み方                  |
| ----------- | ----------------------------------------- | ----------------------------------- |
| Table       | 同種recordの集合                          | `users`、`organizations`等          |
| Row         | 1 record                                  | 1 User、1 Organization等            |
| Column      | recordの属性                              | `status`、`slug`、`user_id`等       |
| Schema      | table・column・constraint等の構造         | CURRENTは`rails/db/schema.rb`で確認 |
| Primary key | row identity                              | CURRENT 4 tableはUUID               |
| Foreign key | 別table rowへの参照整合性                 | Membership→User/Organization        |
| Index       | lookupを支えるdata structure              | `supabase_user_id`、slug、FK等      |
| Constraint  | invalid shape/relationを拒否するDB rule   | NOT NULL、UNIQUE、FK、CHECK         |
| Transaction | 複数DB operationをatomic unitにする仕組み | Target Job/Usage/Audit作成等        |

SQL全体の暗記が目的ではない。重要なのは、どのbusiness factをdurableにし、どのinvariantをDBでも守り、誰が保存判断をするかである。

## 3. PostgreSQL role in Panoptes

```text
Browser / Frontend
  -> SvelteKit BFF
  -> Rails Business API
  -> PostgreSQL
```

PostgreSQLが持つもの:

- Persistent Business Data
- row間のrelation
- referential integrity
- committed transaction result
- historical recordを保持できるdurability
- query/index support

PostgreSQLが単独では決めないもの:

- Actorがoperationを実行してよいか
- Analysisを開始できるか
- Jobを次のbusiness stateへ進めてよいか
- Partial resultがProductとしてusableか
- SnapshotをcurrentやStrategy sourceへ昇格してよいか

したがって、`DB != Business Decision Owner`である。

## 4. Source of Truth

Source of Truthとは、ある種類のfactについてcanonical authorityとして参照される場所またはcontractである。ただし「正本」は1種類だけではなく、何のauthorityかを明示する必要がある。

| Kind                        | Owner                  | Meaning                                           |
| --------------------------- | ---------------------- | ------------------------------------------------- |
| Business decision authority | Rails                  | rule、authorization、transition、保存可否を決める |
| Durable canonical data      | PostgreSQL             | Railsが確定したbusiness stateを永続保持する       |
| Derived data                | calculation/read model | canonical inputから再計算・再構築できる           |
| Cache                       | Frontend/server cache  | performanceのための一時copy。stale/missし得る     |
| Presentation state          | Frontend               | tab、modal、入力途中等。business truthではない    |
| Replica                     | DB/infrastructure      | canonical dataのcopy。write authorityとは限らない |

「Railsが正本」と「DBが正本」は、対象を省略すると曖昧になる。Panoptesでは次のように言い分ける。

> Rails is the Canonical Business Decision Owner.  
> PostgreSQL is the Persistent Canonical Data Store.

Rails process memoryだけに状態を置けば再起動で失われる。一方、DBに値があるだけでは、その値へ至るdecisionが正しかったことや、閲覧actorに権限があることまでは証明できない。

## 5. Rails vs PostgreSQL

| Concern          | Rails                                   | PostgreSQL                                |
| ---------------- | --------------------------------------- | ----------------------------------------- |
| Business rule    | canonical owner                         | 決定結果を保持し、単純invariantを補強     |
| Authorization    | actor・membership・operationを評価      | relation dataを保持するが許可判断はしない |
| State transition | 遷移可否とmeaningを判断                 | accepted stateをdurableに保存             |
| Transaction      | operation群とfailure policyを組み立てる | BEGIN/COMMIT/ROLLBACKを実行する           |
| Persistence      | 何をいつ保存するか決める                | row/index/constraintとして保持する        |
| Query            | use caseに必要なqueryを選ぶ             | execution/index supportを提供する         |

例: RailsはAnalysisJobを`completed`へ遷移できるかをevidenceとpolicyから判断する。PostgreSQLは確定した`completed`と関連lineageをtransactionで保存する。

## 6. Entity and relation model

### CURRENT

```text
User
  | 1
  |--< OrganizationMembership >--| 1 Organization
  |
  `--< SystemRole
```

| Entity                 | Identity                                   | Relation                    | Owner / lifecycle                                                 |
| ---------------------- | ------------------------------------------ | --------------------------- | ----------------------------------------------------------------- |
| User                   | UUID、external identity=`supabase_user_id` | Membership/SystemRoleを持つ | Railsがverified Supabase subjectからmap。active/suspended/deleted |
| Organization           | UUID、human-facing unique slug             | Membershipを持つ            | Rails business resource。active/suspended                         |
| OrganizationMembership | UUID + unique `(organization_id,user_id)`  | UserとOrganizationを接続    | role/statusを持つassociation                                      |
| SystemRole             | UUID + unique `(user_id,role)`             | Userに属する                | CURRENTはsystem_adminのみ                                         |

### TARGET / DEFERRED

```text
Organization
  -> Project
      -> AnalysisJob
          -> Evidence / Result
          -> Snapshot (conditional immutable history)
              -> Strategy Source (explicit policy relation)
```

Project、AnalysisJob、Evidence、Result、Snapshot、Usage、Audit、Lineageのphysical table/modelはCURRENT Rails schemaに存在しない。上図は承認済みcontractを説明するlogical targetであり、実装済みschemaではない。

## 7. Primary key and external identity

Primary keyはrowを一意に識別するrecord identityであり、business meaning全体ではない。

CURRENT tableは`pgcrypto`の`gen_random_uuid()`をdefaultとするUUID primary keyを使う。Userには別にSupabaseのexternal identityである`supabase_user_id`があり、UNIQUE constraintがある。

区別:

- `users.id`: Panoptes内部row identity。
- `users.supabase_user_id`: Supabase actorとの対応identity。
- email: 変更可能であり、CURRENTではnullable。primary identityではない。
- Organization slug: human-readable lookup keyだが、immutable primary keyとは限らない。

## 8. Foreign key and referential integrity

Foreign keyは「参照先rowが存在する」ことを守る。CURRENTでは次を確認できる。

- `organization_memberships.user_id -> users.id`
- `organization_memberships.organization_id -> organizations.id`
- `system_roles.user_id -> users.id`

これらは`on_delete: :cascade`を持つ。親削除時に従属rowも消えるため、将来のretention/audit requirementに同じ方針を無条件適用してはいけない。

重要:

```text
Referential integrity != Authorization
```

Membership rowが存在しても、statusが`suspended`かもしれず、roleがoperationを許さないかもしれない。ProjectがOrganizationへ属していても、現在actorのaccess permissionはRailsがresource chainとoperationから判断する。

## 9. Constraints and Rails validation

### CURRENT DB constraints

- NOT NULL: identity、status、role等の必須値。
- UNIQUE: Supabase User ID、case-insensitive Organization slug、Membership pair、SystemRole pair。
- FOREIGN KEY: Membership/SystemRoleの参照整合性。
- CHECK: User/Organization/Membership/SystemRoleの許可status・role。

### Layer boundary

| Layer               | Purpose                                        | Example                                        |
| ------------------- | ---------------------------------------------- | ---------------------------------------------- |
| Frontend validation | 即時feedback、入力補助                         | required表示、format hint                      |
| Rails validation    | application/business-friendly validation       | slug format、name length、enum、operation rule |
| DB constraint       | raceや別write pathにも効くintegrity safety net | UNIQUE、NOT NULL、FK、CHECK                    |

Rails validationだけでは、同時requestの競合やRails以外のwriteからDBを完全には守れない。DB constraintだけでは、context-sensitiveなbusiness error、authorization、複数resourceのpolicyを十分に説明できない。重複して見える場合も、canonical meaningと各layerの目的を明示する。

## 10. Transaction

Transactionは複数のDB changeを1つのatomic unitとして扱う。

```text
BEGIN
  change A
  change B
  change C
COMMIT   # all succeed

ROLLBACK # one fails; partial commitを残さない
```

TARGETのAnalysis開始例:

```text
Rails authorization / eligibility decision
  -> BEGIN
       create AnalysisJob
       record Usage decision/reservation
       record audit-worthy event
     COMMIT
  -> enqueue technical work after durable Job identity exists
```

Jobだけ作成されUsage/Auditが欠ける、またはUsageだけ消費されJobがない、といったpartial writeを防ぐためにtransaction boundaryが必要になる。ただしQueue publishとのatomicityにはoutbox等の追加設計が必要になり得る。exact implementationはDEFERREDである。

CURRENTの確認範囲では、AnalysisJob/Usage/Audit transactionはなく、application codeに明示的なmulti-record transactionも確認できない。教材の例をCURRENTと表現しない。

## 11. Isolation and concurrency

同じdataへ複数requestが同時に到達すると、application側で先に読んだ状態が保存時には古くなっていることがある。

| Risk                   | Rails decision                 | DB support candidate                      |
| ---------------------- | ------------------------------ | ----------------------------------------- |
| 同じJobの二重開始      | idempotency/eligibilityを定義  | unique idempotency key、transaction、lock |
| Usage二重消費          | reservation/consumption policy | unique event identity、atomic update      |
| duplicate Snapshot     | materialization policy         | unique lineage/Job relation               |
| 同じMembership二重作成 | readable validation/error      | CURRENT unique `(organization,user)`      |

CURRENTの`UserMapper`はunique `supabase_user_id`に対するraceで`ActiveRecord::RecordNotUnique`をretryする。これはDB UNIQUEが最終的な競合防止線である小さな例である。

Exact isolation level、lock方式、deadlock retry、outbox/idempotency schemaは後続実装・reliability Moduleへhandoffする。

## 12. Current resource vs historical Snapshot

```text
Current Project state     = mutable operational context
AnalysisJob               = process and outcome identity
Snapshot                  = immutable historical result
Current pointer           = mutable policy-selected reference
Strategy source relation  = explicit approved source selection
```

したがって次は同義ではない。

```text
latest != current != Strategy source != historical Snapshot
```

Chronological latest rowを自動的にcurrentと解釈してはいけない。Snapshotを上書きしてcurrent stateのように使うと、「当時何を根拠に判断したか」を再現できなくなる。

## 13. Snapshot persistence and PD-04

承認済みlogical contract:

| Job outcome               | Snapshot policy                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `completed`               | Snapshot作成可。policy-driven current promotion可                                   |
| `partially_completed`     | limitations付きLimited Snapshotを条件付き作成可。自動current/Strategy promotionなし |
| `failed`                  | Formal Snapshot作成不可                                                             |
| `cancelled` / `timed_out` | 途中artifactとFormal Snapshotを分離                                                 |

Snapshotはimmutable historyとして、生成時のmeaning、version、evidence、lineageを保持する。Partial Snapshotのexact threshold、physical schema、retention、promotion exceptionはDEFERREDである。

## 14. Lineage and versioning

Lineageは「このResultが何から、どのcontract/versionで作られたか」を追跡できる関係である。

```text
AnalysisJob
  -> collected Evidence / Artifact
  -> Analysis Result
  -> immutable Snapshot
  -> explicit Strategy Source relation
```

Target metadata候補には、input/resource ID、evidence/artifact ID、Axis/Formula/Observation/Pipeline version、prompt/model、calculated time、parent/reanalysis Job等がある。承認済みcontractはsilent reinterpretを禁止するが、exact tables/columnsは未決定・未実装である。

## 15. Canonical, derived, cache, and presentation data

### Derived data

Derived dataはcanonical inputから計算・再構築できるdataである。display score、summary、selected count等が候補になる。

保存する利点:

- expensive calculationを繰り返さない。
- historical outputを当時のversionと共に固定できる。
- query/read performanceを改善できる。

保存するrisk:

- source更新と同期せずstaleになる。
- formula/versionなしでは意味を再現できない。
- 同じmeaningの第二正本になり得る。

「再計算できるから絶対保存しない」でも「表示するから常に保存する」でもない。cost、history、version、consistency requirementで決める。

### Cache

Cacheはperformance optimizationでありSource of Truthではない。cache miss時はcanonical storeから復元でき、stale cacheによってauthorizationやbusiness correctnessが変わってはいけない。

- Frontend cache/store: 表示と再fetch最適化。
- BFF/server cache: upstream requestやshared readの最適化。
- DB buffer/replica: infrastructure-level optimization。

いずれもwrite authorityやbusiness decision ownerへ自動昇格しない。

## 16. Audit data

Business auditは通常のapplication logと異なり、後からbusiness-sensitive operationを追跡するdurable recordである。

最低限の問い:

- who: actorは誰か。
- what: operationは何か。
- when: いつか。
- target: Organization/resourceは何か。
- outcome: success/rejection/failureは何か。
- correlation: request/Jobとどう結び付くか。

CURRENT schemaにはbusiness audit tableがない。exact schema、retention、privacy/access policyはDEFERREDである。単なるdebug logをcanonical audit recordと呼ばない。

## 17. Migration

Rails migrationはschemaを順序立てて変更するdefinitionである。

- Schema migration: table/column/index/constraint等を変更。
- Data migration: existing rowを新contractへ変換。
- Forward migration: deploy先を新schemaへ進める。
- Backward compatibility: rolling deploy中にold/new codeが共存できる範囲を考える。

`rails/db/schema.rb`はCURRENT database structureのsnapshotであり、直接編集するruntime business logicではない。migration fileも「schemaをどう変えるか」の履歴であり、requestごとにbusiness decisionを実行する場所ではない。

Source変更を伴うfuture migrationでは、expand/contract、backfill、constraint追加順、rollback/recovery、large-table lock riskを別途検討する。

## 18. Index

Indexはquery performanceを支える。CURRENTではlookup/uniqueness/FK access用indexを確認できる。

- unique Supabase User ID
- case-insensitive unique Organization slug
- unique Organization/User membership pair
- unique User/Role pair
- MembershipのOrganization/User FK index

Indexにはwrite/update costとstorage costがある。index数を増やせば常に速くなるわけではなく、実query、selectivity、execution plan、workloadを根拠に選ぶ。Indexはrelationやauthorizationの意味そのものではない。

## 19. CURRENT / TARGET / DEFERRED

| Area             | CURRENT                                                             | TARGET                                  | DEFERRED                                    |
| ---------------- | ------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------- |
| DB adapter       | PostgreSQL、development/test/production config                      | managed production persistence          | platform provisioning/tuning                |
| Identity schema  | User、Organization、Membership、SystemRole                          | resource-derived Organization scope     | advanced identity lifecycle                 |
| Integrity        | UUID、NOT NULL、UNIQUE、FK、CHECK、indexes                          | business resourceごとのintegrity        | exact constraints/index tuning              |
| Project/Analysis | none in Rails schema                                                | Organization-scoped Project/AnalysisJob | physical tables/migrations                  |
| Snapshot/history | logical contract only                                               | immutable Snapshot + lineage            | schema、retention、promotion implementation |
| Usage/Audit      | none in Rails schema                                                | durable usage decision/audit event      | unit、price、schema、retention              |
| Transaction      | ordinary ActiveRecord persistence; no reviewed Analysis transaction | Job+Usage+Audit atomic persistence      | isolation/outbox/idempotency details        |
| Cache/derived    | frontend/server-specific existing caches                            | reconstructable read/derived boundary   | materialization policy                      |

## 20. Representative repository mapping

以下は限定確認した10例であり、全schema/migration監査ではない。

| Source                                                                         | Current role                                    | Relation / constraint                           | Rails owner                | Status              |
| ------------------------------------------------------------------------------ | ----------------------------------------------- | ----------------------------------------------- | -------------------------- | ------------------- |
| `rails/config/database.yml`                                                    | PostgreSQL connection/environment config        | adapter、pool、DB name/URL                      | Rails configuration        | `CURRENT`           |
| `rails/db/schema.rb`                                                           | CURRENT schema snapshot                         | 4 tables、UUID、index、CHECK、FK                | migration結果をRailsがload | `CURRENT`           |
| `rails/db/migrate/20260807000000_create_identity_and_organization_boundary.rb` | identity/org schema creation                    | NOT NULL、UNIQUE、FK、CHECK                     | Rails migration            | `CURRENT`           |
| `rails/app/models/application_record.rb`                                       | ActiveRecord model base                         | DB access boundary                              | Rails models               | `CURRENT`           |
| `rails/app/models/user.rb`                                                     | User association/status/validation              | Membership/SystemRole、unique Supabase ID       | identity lifecycle         | `CURRENT`           |
| `rails/app/models/organization.rb`                                             | Organization association/status/slug validation | Membership、case-insensitive slug               | Organization invariant     | `CURRENT`           |
| `rails/app/models/organization_membership.rb`                                  | User–Organization relation                      | belongs_to pair、scoped uniqueness、role/status | membership vocabulary      | `CURRENT`           |
| `rails/app/models/system_role.rb`                                              | system-level role relation                      | belongs_to User、unique user/role               | system role vocabulary     | `CURRENT`           |
| `rails/app/services/auth/user_mapper.rb`                                       | verified subjectをUserへpersist                 | unique raceを`RecordNotUnique` retry            | identity mapping decision  | `CURRENT`           |
| Project/AnalysisJob/Snapshot/Usage/Audit/Lineage schema                        | repository内にphysical implementationなし       | logical relationのみ承認済み                    | future Rails use case      | `TARGET / DEFERRED` |

## 21. Common misunderstandings

### 「DBがSource of TruthならDBがBusiness Rule Owner」

Durable canonical dataの保持と、operationの意味・可否を決めるauthorityは別である。前者はPostgreSQL、後者はRails。

### 「Foreign keyがあればAuthorizationできる」

FKは参照先存在を守るだけで、actor、membership status、role、operation permissionを評価しない。

### 「Rails validationがあればDB constraintは不要」

同時requestや別write pathを考えると、DB invariantにはconstraintが必要である。

### 「DB constraintがあればBusiness validationは不要」

DBはcontext-sensitive rule、safe error、authorization、cross-resource policyのcanonical ownerではない。

### 「latest = current」

latestは時系列、currentはpolicy-selected pointer。Strategy sourceとhistorical Snapshotも別概念。

### 「Snapshotはcurrent recordのcopyなので上書き可能」

Snapshotはimmutable historical evidenceであり、変更はnew Job/new Snapshotとlineageで表す。

### 「Cacheを読めればDBを確認しなくてよい」

Cacheはstale/missし得る。business correctnessとauthorizationはcanonical boundaryへ戻れる必要がある。

### 「Migrationはruntime processing」

Migrationはschema/data shapeを展開するdeploy-time operationであり、request business flowではない。

### 「Indexがrelationを作る」

Indexはaccess path/uniqueness supportであり、relation meaningはFK/model/business contractが担う。

## 22. Decision heuristic — どこへ置くか

1. Business ruleやoperation可否か。  
   → Rails。
2. 確定したbusiness dataをdurableにするか。  
   → PostgreSQL。
3. Relation存在やdata shapeのinvariantか。  
   → DB constraint。Rails validationも適切に併用。
4. 即時UX feedbackか。  
   → Frontend validation。ただしcanonical validationではない。
5. 高価なread/calculationの高速化か。  
   → index、cache、materialized/derived dataを候補にし、正本を明示。
6. 過去時点を再現するimmutable recordか。  
   → Snapshot/history modelとlineage。

例: 「同じOrganizationに同じUserのMembershipを二重作成しない」はDB UNIQUEで守る。「そのMembership roleでAnalysisを開始できるか」はRailsが判断する。「Form入力が空」はFrontendで即時表示し、Railsでも検証する。

## 23. Practice

### 23.1 Knowledge Check

1. Primary keyとforeign keyの違いは何か。
2. UNIQUE constraintとindexはどのように関係し、同義ではない点は何か。
3. RailsがBusiness Decision Owner、PostgreSQLがPersistent Canonical Data Storeとはどういう意味か。
4. transactionのCOMMITとROLLBACKを説明せよ。
5. cacheをSource of Truthにしてはいけない理由は何か。

### 23.2 Responsibility Exercise

次をFrontend / Rails / PostgreSQLへ分類する。

1. input formatをtyping中に表示する。
2. Analysis開始eligibilityを決める。
3. accepted AnalysisJob rowを保存する。
4. Organization/User Membershipの重複を拒否する。
5. Snapshotをcurrentへ昇格できるか決める。
6. current pointerを保存する。

### 23.3 Relation Exercise

`Organization -> Project -> AnalysisJob -> Snapshot`について、各arrowが何を意味するか、FKで守れることとRailsが判断すべきことを分けて説明せよ。

### 23.4 Constraint Exercise

次に適切なconstraint候補を選び、Rails validationも必要か説明せよ。

1. `AnalysisJob.organization_id`は必須。
2. 同じidempotency keyでJobを二重作成しない。
3. statusは定義済みvalueだけ。
4. Jobが参照するOrganizationは存在する。
5. actorがJobを作成可能である。

### 23.5 Transaction Exercise

Job creation、Usage decision、Audit eventを別々にcommitすると、どのpartial failureが起こるか。どこまでをtransactionに含め、Queue publishはどう扱うべきか論点を挙げよ。

### 23.6 Violation Detection

問題点を指摘せよ。

1. Project rowが存在したので、任意のauthenticated Userへ返した。
2. Frontend validationを通ったためRailsはeligibilityを確認しなかった。
3. Reanalysis時に既存Snapshot rowを上書きした。
4. CacheのJob statusをcanonical outcomeとして課金判定した。
5. Membership FKがあるためrole/statusを見ずwriteを許可した。

### 23.7 Design Exercise — Create AnalysisJob

「AnalysisJobを作成する」を次に分けて設計せよ。

- Rails decision
- DB transaction
- relation
- constraint
- Queue handoff
- CURRENT / TARGET / DEFERRED

## 24. Answers / Explanation Guide

### 24.1 Knowledge Check要点

1. PKはrow identity、FKは別rowへのreference integrity。
2. UNIQUEは重複禁止invariant。PostgreSQLではunique indexで支えられることが多いが、index一般はperformance access pathでもあり、すべてがbusiness uniquenessではない。
3. Railsが意味・可否を決め、PostgreSQLが確定結果をdurableに保持する。
4. COMMITはtransaction内変更をまとめて確定し、ROLLBACKは途中変更を確定させない。
5. Cacheはstale/miss/evictionがあり、canonical reconstructionとcorrectnessを保証するownerではない。

### 24.2 Responsibility回答

1. Frontend。Rails validationは別途必要。
2. Rails。
3. PostgreSQL。作成判断はRails。
4. PostgreSQL UNIQUE。Railsはusable errorとpre-validationを担う。
5. Rails。
6. PostgreSQL。更新policyとauthorizationはRails。

### 24.3 Relation回答

FKは各childが存在するparentを参照することを守る。RailsはactorがOrganizationへ属するか、Project/Job/Snapshotへそのoperationでアクセスできるか、Snapshot materialization条件を満たすかを判断する。CURRENTにはこのtarget chainのphysical schemaはない。

### 24.4 Constraint回答

1. NOT NULL + Organization FK。Railsでもrequired relationをvalidation。
2. scoped UNIQUE候補。scopeとretry semanticsはRails contractで定義。
3. CHECK/enum constraint + Rails enum/transition validation。
4. FK。authorizationは別。
5. DB constraintでは表現し切れないbusiness authorization。Railsで判断し、membership relation/constraintをinputに使う。

### 24.5 Transaction回答

Jobだけ存在してUsage/Auditが欠ける、Usageだけ記録されJobがない等が起こり得る。canonical DB changesは同一transaction候補である。Queue publishはDB transactionと別systemならdual-write failureが残るため、commit後enqueue、outbox、idempotent consumer等を検討する。exact choiceは未決定。

### 24.6 Violation回答

1. Existenceとauthorizationを混同。Railsでresource-derived Organization authorizationが必要。
2. Frontendはtrusted authorityではない。Railsで再検証。
3. Immutable historyを破壊。new Job/new Snapshotとlineageを使う。
4. Cacheをbusiness truthに昇格し、Usageとbillingも混同している。
5. FKはpermissionを示さない。active membership、role、operationをRailsで確認。

### 24.7 Design Exercise回答例

```text
Rails
  authenticate actor
  authorize Organization/resource
  validate eligibility and idempotency intent
  decide initial canonical state

PostgreSQL transaction (TARGET)
  create Organization-scoped AnalysisJob
  record Usage decision/reservation
  record audit-worthy event
  enforce FK / NOT NULL / status CHECK / scoped unique identity

After durable commit
  hand off Job identity to Queue
  use idempotent/outbox-aware delivery design
```

CURRENT schemaはIdentity/Organization boundaryまで。AnalysisJob/Usage/Audit/Queue handoffのphysical implementationはTARGET/DEFERREDであり、この回答例は実装済み証拠ではない。

## 25. Completion Criteria

| Criterion                                     | Result |
| --------------------------------------------- | ------ |
| 1. RDB/PostgreSQL fundamentals explained      | `PASS` |
| 2. Source of Truth explained                  | `PASS` |
| 3. Rails vs PostgreSQL boundary explained     | `PASS` |
| 4. entity/relation explained                  | `PASS` |
| 5. key/constraint explained                   | `PASS` |
| 6. transaction/concurrency explained          | `PASS` |
| 7. current/history/snapshot explained         | `PASS` |
| 8. derived/cache distinction explained        | `PASS` |
| 9. representative repository mapping included | `PASS` |
| 10. exercises + answers included              | `PASS` |

Authoring DoD: `10 / 10 PASS`。

これは教材artifactの完成を示す。Learner assessment合格、production schema完成、migration実行、DB performance/security検証、Production Readinessを意味しない。

## 26. Handoff to M10

Recommended next phase: `TB-11 — Module 10: Auth / Authorization / Organization`。

M10ではCURRENTのSupabase identity、Rails Authentication、Organization membership/role、resource authorization、404/403 boundaryを詳しく扱う。本Moduleではrelation/constraintとauthorizationを分離する原則までを確定し、認証・認可教材を先取りしない。

## References

- [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)
- [M08 Rails Business Backend](./08-rails-business-backend.md)
- [Product Decision Register](../../product/product-decision-register.md)
- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [Rails database configuration](../../../rails/config/database.yml)
- [Rails schema](../../../rails/db/schema.rb)
- [Identity and Organization migration](../../../rails/db/migrate/20260807000000_create_identity_and_organization_boundary.rb)
