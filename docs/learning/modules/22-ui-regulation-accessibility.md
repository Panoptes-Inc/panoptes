# Module 22: UI Regulation / Accessibility

Status: `COMPLETE / READY_FOR_M23`  
Phase: `TB-23`  
Difficulty: `INTERMEDIATE`  
Prerequisites: `M01`–`M21`（direct curriculum dependencies: `M03`–`M05`, `M18`–`M21`）

## 1. 学習目標（Learning goals）

このModuleを終えた学習者は、次の内容を説明し、判断できます。

1. UI RegulationをVisual Style Guideより広い共通Contractとして説明する。
2. 同じ意味・状態・操作へCanonical Component、Semantic Token、共通interactionを適用する。
3. Link/Button、Hover/Focus、Pressed/Selected、Disabled/Loadingを区別する。
4. Product stateを正しいUI stateへ写像し、Empty/Error/Partial等を潰さない。
5. Semantic HTML、keyboard、focus、accessible name/label、contrast、target size、reduced motionを評価する。
6. Form validation、Feedback channel、Destructive Actionを責務に沿って判断する。
7. Responsive、Token、Tailwind、Component責務とAccessibilityを接続する。
8. ExceptionとReview結果を追跡し、Documentationと実測Verificationを区別する。

## 用語ガイド

- **UI Regulation:** 見た目だけでなく、interaction、state表現、accessibility、Component利用を含む共通規約。
- **Accessibility（アクセシビリティ）:** 障害の有無や操作手段にかかわらず、内容と機能を利用できるようにする性質。
- **Affordance:** 何をクリック・入力・操作できるかが、見た目や文脈から理解できる手掛かり。
- **Accessible name:** Screen readerなどがcontrolの目的を読み上げるための名前。
- **Tracked exception:** 規約から外れる理由、owner、範囲、見直し条件を記録した例外。

## 2. UI Regulation fundamentals

UI Regulationは、UIの見た目、操作、状態、Accessibilityを一貫して扱う共通Contractです。

```text
UI Regulation != Visual Style Guide only
```

少なくとも次を統合します。

- visual consistency
- interaction semantics
- Product/UI state representation
- accessibility baseline
- Canonical Component usage
- Responsive/Token/Tailwind compliance
- exception handling and review

「綺麗に見えるか」だけでなく、「意味が正しく、操作でき、状態が伝わるか」を判断します。

## 3. Visual consistency

Canonical Principle:

```text
same meaning + same state + same operation
-> Canonical Component + Semantic Token + common interaction pattern
```

Color、Typography、Spacing、Sizing、Radius、Border、Shadowは、Design Tokenの契約を正本とします。共通化するときは、見た目の近さだけでなく、目的、状態、Product上の意味、操作の開始から終了までの流れが同じかを確認します。

Featureはlocal compositionを所有できるが、shared visual foundationを再定義しません。

## 4. Canonical Component reuse

新しいComponentを作る前に、owning FeatureとShared UIから同じ責務のCanonical Componentを確認します。

Reuse判断:

- semantic meaning
- interaction contract
- state lifecycle
- accessibility contract
- responsibility/owner
- stable props/variant contract

見た目が同じでも、navigationとactionは別の意味を持ちます。逆に見た目が多少違っても、同じcontractをvariantで表せる場合があります。

## 5. Visual and interaction model

| State / control    | 意味                                | Required behavior                                  |
| ------------------ | ----------------------------------- | -------------------------------------------------- |
| Link               | 別location/resourceへのnavigation   | native `a`をdefault、destinationを持つ             |
| Button             | current contextでのaction           | native `button`をdefault、keyboard activation      |
| Hover              | pointer向け補助feedback             | 唯一の意味/操作手掛かりにしない                    |
| Focus              | keyboard/current interaction target | visible indicatorを保つ                            |
| Active / pressed   | 押下中等の一時state                 | selected/currentと混同しない                       |
| Selected / current | 持続的選択/現在地                   | patternに応じたprogrammatic state                  |
| Disabled           | 操作不能                            | native semantics、visual indication、必要なら理由  |
| Loading            | 処理進行中                          | 二重実行防止、progress/label、必要ならannouncement |

Visual stateとprogrammatic stateは両方必要です。

```text
gray appearance != disabled semantics
selected color  != aria-selected/current automatically
```

## 6. Link vs Button

- Link: navigation。
- Button: action。

要素は見た目ではなく、操作の目的で選びます。`div onclick`には、標準のkeyboard操作、focus、role、disabledなどが自動では備わらないため、基本の選択肢にはしません。Container全体をclick可能にする場合は、内部の操作要素との入れ子、keyboardでの実行方法、focusの順序を解決します。

## 7. Hover, focus, pressed, selected

Hoverはtouch/keyboard userに存在しない場合があるため補助に留める。

Focus indicatorは「design上邪魔」という理由で削除しません。`:focus-visible`等を使う場合もkeyboard focusが常に識別できることを確認します。

Pressedは一時的interaction、Selected/Currentは持続的stateです。Active Tabなら`aria-selected`等、そのwidget patternに合うprogrammatic stateを持たせる。

## 8. Disabled and loading

Disabled:

- native `disabled`等のsemanticを優先する。
- opacityだけで表現しない。
- keyboard behaviorを正しくする。
- 重要actionでは実行不能理由を理解できるようにする。

Loading:

- repeated submissionを防ぐ。
- 処理対象やbutton labelのcontextを保つ。
- progress/statusを伝える。
- 必要に応じて`aria-busy`またはstatus announcementを使う。

UIのLoadingはrequest/action presentation stateであり、M12のAnalysisJob lifecycle stateそのものではありません。

## 9. State representation

| Canonical UI state     | 意味                             | Representation principle                                    |
| ---------------------- | -------------------------------- | ----------------------------------------------------------- |
| Loading                | request/job/action進行中         | progress、重複防止、既存内容を無理由に消さない              |
| Empty / no data        | 正常取得したが対象0件            | 対象と次の可能行動、Error toneなし                          |
| No current analysis    | entityはあるがcurrent resultなし | start/create/select actionをContractに従い提示              |
| Success                | 明示action成功                   | resultと次state/action                                      |
| Warning                | 継続可能だが注意が必要           | impactと必要action                                          |
| Failed / Error         | operation/result成立せず         | scope、recovery、safe message                               |
| Unavailable            | resource/serviceを利用できない   | unavailable reasonとretry/alternative                       |
| Forbidden              | access denied                    | Empty/Not Foundへ無断変換しない                             |
| Disabled               | action不能                       | semantic stateと理由                                        |
| Partial                | 一部結果のみ成立                 | available/unavailable、coverage、limitation                 |
| Limited                | Product contract上の制約付き結果 | scope、allowed use、next action                             |
| Unsupported historical | 古いrecordを完全表示できない     | explicit historical limitation、silent current fallback禁止 |

これらをGeneric Emptyへ統合しません。

## 10. Product State to UI flow

```mermaid
flowchart LR
    B[Business / Product State<br/>Rails + approved contract]
    M[Feature mapping<br/>view model / presentation state]
    U[UI Representation<br/>content + semantic component]
    I[Interaction / Feedback<br/>action, retry, navigation]
    B --> M --> U --> I
    U -. stateを推測しない .-> B
```

AnalysisJob `failed`、Partial Result、Forbidden Resource、No AnalysisはProduct semanticsを持ちます。UI mapperは意味をgeneric cardや0/emptyへ潰しません。

## 11. Accessibility fundamentals

Accessibilityは、障害の有無にかかわらず、できるだけ多くのUserが情報と操作へ到達できる設計です。

Panoptes v1 baseline:

- Semantic HTML
- Keyboard operation
- Logical focus order and focus management
- Visible focus
- Accessible name and Form label
- Contrast
- Target size
- Reduced motion
- Not color-only
- Appropriate live feedback

Accessibilityは完成後に上から追加する装飾ではなく、Component Contractの一部です。

## 12. Semantic HTML

意味に合うnative elementを優先します。

- `button`: action
- `a`: navigation
- `nav`: navigation region
- `main`: primary content
- heading: document structure
- `form` / `label` / native control
- table/list/dialog等のsemantic structure

標準HTML要素が持つ意味や操作を、ARIAで作り直しません。ARIAは不足する名前・状態・関係を補うために使い、標準の操作を省略する手段にはしません。

### Heading structure

Headingはvisual sizeではなくdocument hierarchyを表します。`h1/h2/h3`を見た目都合だけで選びません。Visual typographyはTokenで、document levelはHTML structureで管理します。

## 13. Keyboard and focus

Pointerで可能な操作は原則keyboardでも可能にします。

- Tab: focus移動
- Enter/Space: control patternに応じたactivation
- Escape: dismissible dialog/menu等で適切にclose
- Arrow keys: Tabs/menu等の標準widget patternで必要な場合

Custom widgetではnative patternまたは標準interaction modelを理解します。

Responsive visual reorder時もDOM/focus orderを不自然にしません。

Modal/Dialogではfocus entry、必要なcontainment、close後のtriggerへのfocus returnを考慮します。新しいUI frameworkは本Moduleで導入しません。

## 14. Accessibility responsibility flow

```mermaid
flowchart LR
    H[Semantic HTML]
    K[Keyboard + Focus]
    N[Accessible Name + Label]
    V[Visual / Token<br/>contrast, target, not-color-only]
    Q[Verification<br/>browser, screen reader, contrast]
    H --> K --> N --> V --> Q
```

一つだけ満たしてもAccessibility完了ではありません。

## 15. Accessible name and label

Interactive controlにはpurposeを表すaccessible nameが必要です。Icon-only close/menu buttonは、見た目のiconだけでなくscreen readerが理解できる名前を持ちます。

同じ「詳細」だけではcontextを失う場合、対象を含むnameを検討します。`aria-label`は必要時に使い、visible text/native associationを置き換えるdefaultにしません。

Inputには、HTML上で関連付けられたlabelを設けます。Placeholderは入力後に消え、制約やerrorとの関係も表せないため、labelの代わりにしません。

## 16. Contrast, color, target size

FS-08 v1 internal baseline:

- Normal text: `4.5:1`以上。
- Large text: `3:1`以上。
- Meaningful UI boundary/focus indicator: `3:1`以上を目標。
- Primary touch control: `44 × 44 CSS px`以上をdefault。
- Dense/inline control: `24 × 24 CSS px`以上、または同等target spacingと例外record。

Tokenが存在するだけでcontrast適合を証明しません。Actual valuesを実測します。

Error、Success、Warning、Selected、Score等を赤/緑/黄などの色だけで示さず、text、icon、label、pattern、positionを併用します。

## 17. Reduced motion

Motionはfeedback、hierarchy、transitionの理解を助ける場合だけ使用します。

- Motion Tokenを利用する。
- `prefers-reduced-motion`を尊重する。
- Nonessential parallax、loop、large transformを停止/短縮する。
- Essential state changeはinstant/fade等で理解可能に残す。
- Hover-only motionへ重要情報を置かない。
- GSAP/SVG timelineはlocal owner、cleanup、route transition behaviorを持つ。

## 18. Form and control rules

- Visible labelをdefaultにする。
- Required/optional、format、constraintを入力前または必要時に示す。
- Validation errorをfieldとprogrammatically関連付ける。
- Errorは問題と修正方法をsafe languageで示す。
- 入力値を無理由に消さない。
- Disabled reasonを必要に応じて示す。
- Loadingではprogressと二重submit防止を組み合わせる。
- Destructive Actionは動詞、対象、impactを明確にする。
- Irreversible/重大な場合だけproportional confirmationを使い、可能ならundo/recoveryを優先する。

Frontend validationはimmediate UX feedback、Rails validationはBusiness truthです。

```text
Frontend valid != Server validation unnecessary
```

## 19. Feedback and notification

| Channel             | Use                                                       | Persistence / action                                       |
| ------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| Inline              | field/section/specific content                            | context内に保持、修正/retryを近接                          |
| Toast               | non-blocking success/info                                 | short-lived可、critical detail/唯一のrecoveryを置かない    |
| Banner / Page state | persistent warning、partial、unavailable、page-wide issue | condition解消まで残しimpact/actionを示す                   |
| Blocking dialog     | continuation不能、重大decision、destructive confirmation  | focus management、primary/secondary action、dismiss policy |

通知方法は、緊急度、表示を残す必要性、復旧できるかどうか、ユーザーの操作が必要かどうかで選びます。すべてのErrorをToastや同じ赤いbannerで表示しません。

Live feedbackではurgent errorとpolite statusを使い分け、同じmessageを重複announcementしません。

## 20. Empty, Error, Partial, Historical

### Empty

まだ分析していない状態、検索結果が0件の状態、権限不足、resourceの不存在、読み込み失敗は、それぞれ意味が異なります。正常な0件だけをEmptyとして扱い、ForbiddenやErrorを隠しません。

### Error

復旧可能なerror、処理を続けられないerror、入力項目固有のerror、利用不能、権限不足、System障害を区別します。影響する範囲と復旧方法を示し、Providerの生のerrorや機密情報は表示しません。

### Partial / Limited

M18/PD-04に従い、limitation、available information、unavailable information、coverage、next actionを示します。Full Resultの見た目だけ流用して意味を隠しません。

### Unsupported Historical

M15に従い、古いSnapshotを完全表示できない場合はexplicit historical stateまたはview-only limitationを示します。Current dataへsilent fallbackしません。

## 21. Responsive and dense UI accessibility

M21のResponsive adaptationでは、content hide、alternative navigation、DOM/focus order、local scroll、label visibilityを確認します。MobileでError、Result limitation、唯一のaction/navigationを消しません。

Table/Chart/Radar等はvisual representationだけに依存せず、必要に応じてlabel、text summary、data table、keyboard reachability、semantic alternativeを検討します。

Local scrollはkeyboard/touchで到達でき、overflow cueとvisible focusを持ちます。

## 22. Component responsibility

| 分類              | Accessibilityの責務                                                              |
| ----------------- | -------------------------------------------------------------------------------- |
| Primitive         | minimal stable native/accessible contract                                        |
| UI / Presentation | rendering、name/label、keyboard/focus、presentation interaction                  |
| Composite         | accessible child composition、reading/focus order                                |
| Feature           | use-case orchestration、Product state mapping、loading/error/action coordination |
| Layout / Page     | landmarks、major reading order、navigation、responsive content priority          |

Accessibilityを「後から別layerが追加するもの」にしません。各ownerが自分のcontract内で担う。

## 23. Token / Tailwind compliance

M19/M20に従い、Semantic Token、semantic utility、state/responsive utilityを使います。Hardcoded colorだけでsemantic stateを表現しません。

Token/Tailwindは、contrast、focusの見た目、操作対象のsizeなどを支援できます。ただし、HTMLの意味、keyboard操作、ARIA、Product状態との対応付けまで自動的に提供するわけではありません。

```text
Token/Tailwind used != accessible
```

## 24. Exception process

UI Regulation例外には次を記録します。

```text
Exception ID
Rule being excepted
Reason and evidence
Owner
Scope / affected component or route
Temporary or permanent
Risk and user impact
Fallback / mitigation
Approval
Review date or trigger
Removal criteria where temporary
```

Temporary例外は期限/review triggerなしに承認しません。Permanent例外もToken、Product、Accessibility、Browser Contract変更時に再審査します。

```text
One-off exception != new standard
```

## 25. Review process

新規または大幅変更UIは次を確認します。

1. Taxonomy、owner、state/command boundary。
2. Canonical Component検索とreuse/non-reuse理由。
3. Loading/Empty/Error/Partial/Disabled等のstate contract。
4. Semantic Token、Tailwind、local CSS、exception。
5. FS-07 viewports、overflow、content priority、navigation reachability。
6. Semantic HTML、keyboard、focus、name/label、contrast、target、motion、announcement。
7. Riskに比例したunit/integration/browser/visual evidenceとexception record。

Review result:

- `PASS`
- `PASS_WITH_TRACKED_EXCEPTION`
- `BLOCKED`

Product state/meaningが不明ならUIで推測せずProduct/Backend ownerへ戻します。

## 26. Verification boundary

このModuleはConcept/Contract教材です。実際のconformanceには次が必要になります。

- keyboard test
- screen reader review
- contrast measurement
- target size check
- browser behavior
- reduced-motion behavior
- automated checker
- Responsive viewport and visual review

```text
Documentation complete != Accessibility verified
Source pattern exists   != Runtime behavior verified
```

## 27. Worked example: Submit Form

### Idle

- Associated visible labelとconstraintを示す。
- Buttonはnative action control。
- Focus orderがlogical。

### Client validation error

- Errorを該当fieldへ関連付ける。
- `aria-invalid`/description等のpatternを使う。
- Messageは問題と修正方法を示す。
- Multiple errorsではsummary/focus strategyを検討する。

### Loading

- 二重submitを防ぐ。
- Button label/contextとprogressを維持する。
- 必要ならpolite status announcement。

### Success

- Inline、Toast、navigation等をpersistence/actionに応じて選ぶ。
- 次のstateとactionを明確にする。

### Server error

- Business validationはRails responseを正本とする。
- Field errorならfieldへ、page-wide issueならBanner/Page stateへ配置する。
- Raw provider detailを露出せず、retry/recoveryを示す。

これはinteraction contractの説明であり、正式なUI redesignではありません。

## 28. CURRENT / TARGET / DEFERRED

| 分類           | Confirmed scope                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CURRENT        | Sourceにはnative links/buttons/inputs、labels、`aria-*`、focus style、Toast、Tabs、state UI、SVG labels等の良いpatternとgapが混在する。                         |
| CURRENT caveat | Source reviewだけでkeyboard、screen reader、contrast、target size、reduced motion、Responsive viewportの実動作は証明できない。全UIのRegulation適合宣言はない。  |
| TARGET         | UI Regulation v1をnew/touched UIへ適用し、Canonical reuse、state representation、Accessibility baseline、Responsive/Token compliance、review evidenceを揃える。 |
| DEFERRED       | Full accessibility audit、screen reader/keyboard/browser testing、contrast/target measurement、visual regression、全Component remediation、exception closure。  |

## 29. Representative repository mapping

全UI監査ではなく、FS-08で限定確認済みの12 examplesを教材上で再利用した。

| Source                                    | 確認できた意味・操作上の長所                                 | Accessibilityの課題・目標                                     | 状態                       |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- | -------------------------- |
| `PanoptesSiteHeader.svelte`               | semantic nav/link/button、`aria-expanded`、focus-visible     | compact時の代替navigation未証明                               | CURRENT partial            |
| `LandingHeroPrimaryVisual.svelte`         | SVG title/descriptionとlabel association                     | fixed scale、motion/reduced-motion、contrast未検証            | verify later               |
| `SignUpFields.svelte`                     | associated labels、`aria-invalid/describedby`、native inputs | hidden label方針、contrast/target実測                         | CURRENT good pattern + gap |
| `SignUpBtn.svelte`                        | native button/disabled                                       | loading announcement、disabled reasonはForm統合               | owner coordination         |
| `SignUpFeedback.svelte`                   | field error IDs、`role=alert/status`                         | announcement重複、focus strategy実測                          | browser verification       |
| `PanoptesToastStack.svelte`               | `aria-live=polite`、level区別                                | close control name、Error urgency/persistence                 | remediation candidate      |
| `PanoptesTabNav.svelte`                   | nav label、native buttons                                    | activeがvisual classのみ、selected/current state不足          | remediation candidate      |
| `CompetitorAnalysisCompanyCard.svelte`    | contextual labels、actions、`aria-pressed`                   | truncated full-value access、target/contrast                  | verify later               |
| `CompetitorAnalysisRadarChart.svelte`     | SVG accessible label                                         | graphic role/title/description、numeric alternative、contrast | verify/remediate           |
| `PanoptesAnalysisSurface.svelte`          | empty/failed/loadingを分離                                   | unavailable/partial/limited/historical接続                    | Target state expansion     |
| `StrategyAnalysisRoadmapPhaseCard.svelte` | native button、`aria-pressed`                                | dense keyboard/target/contrast                                | verify later               |
| `SelfAnalysisDualRingGauge.svelte`        | scoreをaccessible labelへ含む                                | graphic role、detail alternative、color-only risk             | verify/remediate           |

これはSource上のpattern/gap確認であり、runtime accessibility conformanceではありません。

## 30. Common misunderstandings

| Misunderstanding               | Correction                                |
| ------------------------------ | ----------------------------------------- |
| 見た目が同じ = 同じComponent   | meaning/interaction/lifecycle/ownerで判断 |
| ButtonとLinkはappearanceで選ぶ | action/navigationのpurposeで選ぶ          |
| Opacity = disabled             | native/programmatic stateが必要           |
| Hoverがあればaccessible        | keyboard/touch/focusが必要                |
| Placeholder = Label            | associated labelが必要                    |
| Focus ringを消すと綺麗         | keyboard current targetを失う             |
| Colorだけでstateを示せる       | text/icon/structure等を併用               |
| ToastですべてのErrorを出す     | persistence/scope/actionでchannelを選ぶ   |
| Empty = Error                  | normal zero resultとfailureは別           |
| Partial = Full                 | limitations/coverageを明示                |
| Responsiveでhideすればよい     | priorityと代替導線が必要                  |
| Token/Tailwind = accessibility | semantics、behavior、実測が別途必要       |
| Documentation = Verification   | Runtime conformanceは未証明               |

## 31. Decision heuristic

1. Native semantic elementが使えるか → native first。
2. Same meaningのCanonical Componentがあるか → reuseを検討。
3. Interaction stateはprogrammaticに正しいか → state確認。
4. Keyboardで到達/操作可能か → behavior確認。
5. Accessible name/labelがあるか → semantics確認。
6. Stateがcolor-onlyではないか → multimodal feedback。
7. Error/Empty/Partialを区別するか → correct representation。
8. Semantic Tokenを使うか → visual contract。
9. Responsiveでも意味とfocus orderを失わないか → M21 contract。
10. Exceptionなら追跡可能か → exception record。
11. Runtime verification evidenceがあるか → conformance claim範囲を限定。

## 32. Practice

### A. Knowledge check

1. UI RegulationとVisual Style Guideの違いを説明してください。
2. Visual stateとprogrammatic stateの違いを説明してください。
3. Documentation completionとAccessibility verificationの違いを説明してください。

### B. Semantic element exercise

次をButton / Link / Native form control / generic containerへ分類してください。

1. 別routeへ移動する「詳細」。
2. Modalを開く「詳細」。
3. Email入力。
4. 装飾用Card wrapper。

### C. State exercise

Hover、Focus、Pressed、Selected、Disabled、Loadingについてtemporary/persistent、programmatic state、required feedbackを説明してください。

### D. Accessibility review

次の問題を検出してください。

1. Icon-only buttonにnameがない。
2. Focus outlineを削除し代替がない。
3. Errorを赤いborderだけで示す。
4. `div onclick`だけでActionを実装する。
5. Inputがplaceholderだけを持つ。

### E. Form exercise

Submit FormのValidation Error、Loading、Success、Server Errorについて、button、field、focus、feedback、announcementを設計してください。

### F. Empty/Error/Partial exercise

No Analysis、0 Search Results、Forbidden、Failed Load、Partial Result、Unsupported Historicalを適切なUI stateへ分類してください。

### G. Responsive accessibility

Mobileでnavigation linkをhideし、Cardをvisual reorderし、Tabsをlocal scrollへ変える時に必要な確認を挙げてください。

### H. Violation detection

1. `div onclick`。
2. `outline: none`のみ。
3. Placeholder-only input。
4. Errorを赤色だけで表現。
5. Disabledをopacityのみで表現。
6. ForbiddenをEmpty表示。
7. PartialをFull表示。
8. Navigation hide + alternativeなし。
9. Critical failureをToastだけで通知。
10. Tailwind使用だけでaccessibleと判定。

### I. Architecture explanation

「なぜAccessibilityをUI完成後の追加作業ではなくComponent Contractの一部として扱うのか」を、semantics、interaction、reuse、remediation costの観点から説明してください。

## 33. Answers / explanation guide

### A. Knowledge check

UI Regulationはvisualだけでなくinteraction、state、Accessibility、reuse、exception/reviewを含む。Visual stateは見た目、programmatic stateはbrowser/assistive technology/interactionが理解する意味。Documentationは期待Contractを示すが、runtime keyboard/screen reader/contrast/browser behaviorを証明しません。

### B. Semantic element exercise

1. Link。2. Button。3. Native input + label。4. Non-interactive generic container。

### C. State exercise

Hover/Pressedは主にtemporary、Focusはcurrent keyboard target、Selectedはpersistent choice、Disabledはoperation unavailable、Loadingはprocessing中です。Selected/Disabled/Loading等はappearanceだけでなくcontrol patternに合うstate/behaviorを持ちます。

### D. Accessibility review

順にaccessible name欠落、visible focus欠落、color-only violation、native semantics/keyboard欠落、associated label欠落です。

### E. Form exercise

Validation Errorはfield associationとfocus strategy、Loadingは二重submit防止とstatus、Successはappropriate channelと次state、Server ErrorはRails responseをsafe mappingしfield/inline/bannerへscopeに応じ配置します。

### F. Empty/Error/Partial exercise

No Analysisは専用state、0 Resultsだけがnormal Empty、Forbiddenはaccess state、Failed LoadはError、Partialはlimitation付きResult、Unsupported Historicalはexplicit historical compatibility state。相互に潰しません。

### G. Responsive accessibility

同じdestinationへの代替navigation、DOM/focus/reading order、hidden content semantics、active Tab reachability、keyboard/touch local scroll、overflow cue、visible focusを確認します。

### H. Violation detection

順にnative semantics欠落、focus欠落、label欠落、color-only、disabled semantics欠落、Product state誤表現、limitation隠蔽、navigation到達不能、feedback channel不適切、verification不在です。

### I. Architecture explanation

Semantic element、keyboard behavior、name/stateはComponentの構造とinteractionへ組み込まれる。後付けではAPI/markup/state contractを壊して修正するcostが高く、同じ欠陥がreuse先へ拡散します。Accessible contractをPrimitive/UIの初期責務にすれば、一貫したbehaviorを共有しFeatureはProduct state mappingへ集中できます。

## 34. Completion criteria

|   # | Criterion                                       | Result |
| --: | ----------------------------------------------- | ------ |
|   1 | UI Regulation purpose explained                 | `PASS` |
|   2 | Visual/interaction consistency explained        | `PASS` |
|   3 | State representation explained                  | `PASS` |
|   4 | Accessibility fundamentals explained            | `PASS` |
|   5 | Semantic/keyboard/focus explained               | `PASS` |
|   6 | Form/feedback rules explained                   | `PASS` |
|   7 | Empty/Error/Partial distinction explained       | `PASS` |
|   8 | Responsive/Token/Component connection explained | `PASS` |
|   9 | Repository mapping + two diagrams included      | `PASS` |
|  10 | Exercises + answers included                    | `PASS` |

M22 authoring result: `10 / 10 PASS`。教材完成はAccessibility conformance、browser/keyboard/screen reader実測、contrast/target audit、UI remediationの完成を意味しません。

## 35. M23 handoff

Recommended next phase: `TB-24 — Module 23: Security Fundamentals`。

M23ではFrontend/BFF/Rails/Workerのtrust boundary、least privilege、secret、input/output validation、CSRF/XSS/SSRF、dependency/privacy/data handlingを扱います。Security auditやSource hardeningは教材作成と分離します。

## References

- [Module 18: Missing / Partial / Eligibility](./18-missing-partial-eligibility.md)
- [Module 19: Design Token](./19-design-token.md)
- [Module 20: Tailwind](./20-tailwind.md)
- [Module 21: Responsive](./21-responsive.md)
- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [October Frontend Standardization Plan](../../architecture/frontend-standardization-plan.md)
- [FS-08 UI Regulation](../../audit/128-fs08-ui-regulation.md)
