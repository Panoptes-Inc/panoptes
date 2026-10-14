# Panoptes Phase FS-08 UI Regulation

Date: 2026-09-14  
Status: `APPROVED / COMPLETE`  
Contract: `Panoptes UI Regulation v1`  
Scope: Documentation-only

## 1. Objective and authority

FS-02〜07のTaxonomy、Boundary、Directory、Design Token、Tailwind、Responsive Contractを、日常のUI作成・変更・reviewで使う統合規約へまとめた。本Phaseでは代表12 UIのSourceを限定確認しただけで、全UI適合監査、browser/keyboard/contrast検証、Source変更、build/test/quality、inventory再集計は行っていない。

## 2. Visual consistency

- 同じ意味・状態・操作には同じCanonical Component、Semantic Token、interaction patternを使う。
- color、typography、spacing、sizing、radius、border、shadowはDesign Token Contract v1を正本とする。
- 色や見た目の近さではなく、purpose、state、Product semanticsが同じかで共通化を判断する。
- Featureはlocal compositionを所有できるが、shared foundationを再定義しない。
- Brand、status、focus、destructive、selectedをhardcoded colorだけで表現しない。
- Visual hierarchyはheading、spacing、surface、position、copyを組み合わせ、shadow/gradient/animationだけに依存しない。
- Product/brand固有visualまたはone-off art directionは、Token exceptionとしてownerとreview conditionを記録する。

## 3. Interaction rules

| State / behavior | Regulation |
| --- | --- |
| Clickable affordance | navigationは`a`、actionは`button`をdefaultとする。Pointer cursor、color、iconだけを唯一の手掛かりにしない |
| Hover | pointer利用者への補助。Hoverなしでも意味・操作・selected stateを理解可能にする |
| Focus | keyboard focusを常に視認可能にし、hover styleでfocus ringを消さない |
| Active / pressed | 押下中の一時state。現在地/selected stateと混同しない |
| Selected / current | visualだけでなく`aria-current`、`aria-selected`、`aria-pressed`等、control patternに合うprogrammatic stateを持つ |
| Disabled | native `disabled`を優先。理由が不明なdisabledを作らず、色/opacityだけで表現しない |
| Loading | 二重実行を防ぎ、処理対象/labelを保持し、必要に応じて`aria-busy`またはstatus announcementを使う |

Clickable containerを作る場合も内部interactive elementとの競合、keyboard activation、focus orderを解決する。Business conditionはFeature/Backendが決め、UIは受け取った`disabled/loading/selected`等を表現する。

## 4. State representation

| Canonical UI state | Meaning | Required representation |
| --- | --- | --- |
| Loading | request/job/actionが進行中 | progress/status、重複操作防止、必要ならcancel/retry policy。既存内容を無理由に消さない |
| Empty / no data | 正常に取得完了したが対象が0件 | 空である対象と次の可能行動。Error toneを使わない |
| No current analysis | entityはあるがcurrent analysis/snapshotがない | create/start/select actionをProduct contractに従い提示 |
| Success | 明示actionが成功 | 結果、次の状態、必要な次action。通常のdata表示と混同しない |
| Warning | 利用可能だが注意・制約あり | reason、影響、回避/継続action。色だけで伝えない |
| Error / failed job | operation/jobが失敗 | 何が失敗したか、安全なmessage、recoverability、retry/support action |
| Unavailable | resource/capabilityが現在利用不能 | temporary/permanentが分かる範囲、retry可否、代替。Error/Emptyと混同しない |
| Forbidden | 認証済みだが権限がない | permission denialと安全な戻り先。存在/機密detailを漏らさない |
| Disabled | actionは表示されるが現在実行不可 | reasonまたは成立条件。Loading、Forbiddenと混同しない |
| Partial | canonical outputに既知の未完了segmentがある | completed/missing scope、利用上の注意。欠損を0や成功へ変換しない |
| Limited | permission/provider/contract等で表示scopeが限定 | limitation sourceと影響。Partialと推測で相互変換しない |
| Unsupported historical | recordはあるが現renderer/contractで非対応 | record存在、非対応理由、可能な代替/upgrade path |

State identityはRails/BFF/client/Feature contractに従う。欠損fieldや見た目からUIがcanonical stateを推測しない。UI mappingが所有するのはlabel、tone、icon、format、action callbackへの接続までである。

## 5. Accessibility baseline v1

- **Semantic HTML:** heading/list/table/form/navigation/dialog等は意味に合うnative elementを優先する。
- **Keyboard:** pointerで可能な操作をkeyboardでも実行可能にし、logical focus order、modal focus management、close/return focusを保つ。
- **Visible focus:** focus indicatorを常時視認できる。Panoptes内部基準としてnon-text indicatorは周囲に対し3:1以上を目標とする。
- **Accessible name:** icon-only、chart、menu/disclosure、close controlは目的を表すnameを持つ。同じ「詳細」だけでcontextを失わない。
- **Form label:** controlはprogrammatically associated labelを持つ。Placeholderをlabelの代替にしない。
- **Contrast:** Panoptes v1内部基準を通常text 4.5:1以上、large text 3:1以上、meaningful UI boundary/focus 3:1以上とする。Token実装時に測定する。
- **Reduced motion:** `prefers-reduced-motion`を尊重し、非essential animationを停止/短縮する。state変化とfeedbackは静的にも理解可能にする。
- **Target size:** primary touch controlは44×44 CSS px以上をdefaultとする。Dense/inline controlは24×24 CSS px以上か同等のtarget spacingを確保し、例外を記録する。
- **Not color-only:** status、score、selected、errorはtext/icon/pattern/position等を併用する。
- **Live feedback:** urgent errorとpolite statusを使い分け、同じmessageを重複announcementしない。

これはv1 implementation baselineであり、既存UIのWCAG適合を証明するものではない。Exact conformanceはautomated + keyboard/screen reader + contrast + browser reviewを伴う別検証が必要である。

## 6. Component usage

| Category | UI Regulation usage |
| --- | --- |
| Primitive | semantics-neutral building block。native semantics/accessibility invariantを壊さない |
| UI / Presentation | render、local interaction、presentation state、typed callback。API/command/Product ruleを持たない |
| Composite | UIを意味あるpresentation unitへ構成。Feature state orchestrationを持たない |
| Feature | canonical stateをview modelへmapし、command/recovery/actionを調整する |
| Layout / Shell | persistent navigation/chrome、global composition、responsive frameを所有する |

新規Component作成前に、対象scopeで`rg`、Frontend Inventory、owning feature/shared UIを確認し、同名だけでなく同じpurpose/contractを検索する。Canonical Componentがある場合はreuseまたは拡張をdefaultとし、再利用でconditional Product branchingが増える場合は無理に共通化しない。透明wrapperや新しい`ComponentsBase`を作らない。

## 7. Token and Tailwind compliance

- ComponentはSemantic Tokenをdefaultとし、Raw Token direct useを例外扱いにする。
- TailwindはToken consumerであり、Design値をTailwind側だけに定義しない。
- Semantic utility、typed variant、local component CSSを責務に応じて選ぶ。
- Arbitrary value/hardcoded design valueはFS-05/06の例外recordを必要とする。
- New codeは標準に従い、touched legacy codeはscopeを限定して`keep / migrate / exception`を判断する。
- Token/Tailwind未実装期間を理由に、別paletteや暫定utility systemを新しい正本として作らない。

## 8. Responsive compliance

- Mobile-firstとFS-07の`sm/md/lg/xl/2xl`を使用し、device名として扱わない。
- Root/pageのaccidental horizontal scrollを禁止する。
- Meaningful content、唯一のnavigation/actionを狭幅で安易にhideしない。
- Table/chart/tabs等のlocal scrollにはkeyboard/touch reachabilityとoverflow cueを持たせる。
- CSS visual orderとDOM reading/focus orderを一致させる。
- Global変更はFS-07の6 viewports、利用Breakpointの1px below/atを確認する。
- Component/Page/Layoutのadaptation ownerを越えてstyleを上書きしない。

## 9. Form and control rules

- Visible labelをdefaultとし、space制約が明確な場合のみvisually hidden labelを許可する。Placeholderは補助例に限定する。
- Required/optional、format、constraintは入力前または必要時に理解できるcopyで示す。
- Validation errorは該当fieldとprogrammatically関連付け、複数error時はsummary/focus strategyを検討する。入力値を無理由に消さない。
- Error表示は問題と修正方法を安全なlanguageで示し、provider/raw errorや機密情報を露出しない。
- Disabledは実行不能の理由を提供する。Loadingによるdisabledはprogressと組み合わせ、二重submitを防ぐ。
- Destructive actionは動詞と対象を明示し、irreversibleまたは重大な場合はimpactを説明してconfirmationを要求する。可能ならundo/recoveryを優先する。
- Confirmationをroutine non-destructive actionへ乱用しない。Product-specific workflow/eligibilityは本規約で決めない。

## 10. Feedback and notification

| Channel | Use | Persistence / action |
| --- | --- | --- |
| Inline feedback | field、section、specific contentに直結 | context内に保持し、修正/retry actionを近接配置 |
| Toast | non-blocking success/info、既存画面を中断しない短い結果 | 自動消去可。ただしcritical detail/唯一のrecoveryを置かない |
| Banner / page state | persistent warning、degraded/partial/unavailable、page-wide issue | condition解消まで残し、impact/actionを提示 |
| Blocking dialog | continuation不能、重大decision、destructive confirmation | focus管理、明確なprimary/secondary action、dismiss policy必須 |

Urgencyはtoneだけでなくannouncement priority、persistence、placement、required actionで表す。Recoverable errorはretry/re-entry/support等を示す。Toastをfailed job、forbidden、partial resultの唯一の表現にしない。

## 11. Empty, error, and partial analysis states

- `no data`、`no current analysis`、`partial result`、`failed job`、`unavailable resource`、`forbidden`、`unsupported historical`をgeneric Emptyへ統合しない。
- Emptyは正常結果、Failedは失敗、Unavailableはcapability/resource、Forbiddenはauthorization、Partial/Limitedはscopeというidentityを保持する。
- Partial/Limitedではavailable dataを隠さず、missing/limited範囲と意思決定への影響を表示する。
- Unknown score/axisを`0`、空文字、success toneへ変換しない。
- Retryはidempotency、backend state、failure reason上安全な場合だけFeatureが提示する。
- Historical compatibilityはcurrent snapshotへ暗黙変換せず、contract/versionと代替を明示する。

## 12. Motion

Motionはfeedback、hierarchy、state/route transitionの理解を助ける場合に使う。装飾だけのcontinuous/large motionはcontent/operationを妨げず、停止・短縮可能にする。

- Duration/easingはMotion Tokenを利用する。
- Loading animationはprogressの意味を補助し、処理完了を保証する表現にしない。
- Hover-only motionへ重要なinformationを置かない。
- Reduced-motionではnonessential parallax、loop、large transformを停止/置換し、essential state changeはinstant/fade等で残す。
- GSAP/SVG固有timelineはlocal ownerを持ち、cleanup、route transition、reduced-motion behaviorを検証する。

## 13. Exception process

Regulation例外は次を記録する。

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

Temporary例外は期限または再審査triggerなしに承認しない。Permanent例外もToken、Product、accessibility、browser contract変更時に再審査する。一つの例外をcustom utility、shared component、別standardへ自動昇格させない。反復する場合はstandard改訂proposalとしてreviewする。

## 14. Review process

新規または大幅変更UIは次のlightweight checklistを使う。

1. Taxonomy、canonical owner、state/command boundaryが明確か。
2. 同目的のCanonical Componentを検索し、reuse/非reuse理由を説明できるか。
3. Loading/Empty/Error/Partial/Disabled等、該当state contractを列挙したか。
4. Semantic Token、Tailwind consumer、local CSS、arbitrary/hardcoded exceptionが規約通りか。
5. FS-07 viewports、overflow、content priority、navigation reachabilityを確認したか。
6. Semantic HTML、keyboard、focus、name/label、contrast、target、motion、announcementを確認したか。
7. Source変更に比例したunit/integration/browser/visual evidenceとexception recordがあるか。

Review resultは`PASS / PASS_WITH_TRACKED_EXCEPTION / BLOCKED`のいずれかを記録する。Product state/meaningが不明ならUIで推測せずProduct/Backend decisionへ戻す。大型Design Review ceremonyは必須にしない。

## 15. Representative validation

全UI監査は行わず、次の12 representative UIをSource reviewした。

| # | Representative | Confirmed strength | Gap / handoff |
| ---: | --- | --- | --- |
| 1 | `PanoptesSiteHeader.svelte` | semantic nav/link/button、`aria-expanded`、focus-visible | compact時にhideするlinkの代替navigation未証明 |
| 2 | `LandingHeroPrimaryVisual.svelte` | SVG title/descriptionとlabel association | fixed scale、motion/reduced-motion、contrastは未検証 |
| 3 | `SignUpFields.svelte` | associated labels、`aria-invalid/describedby`、native inputs | visually hidden label方針、contrast/targetを実画面確認要 |
| 4 | `SignUpBtn.svelte` | native button/disabled | loading announcement、disabled reasonはowner Formとの統合要 |
| 5 | `SignUpFeedback.svelte` | field error IDs、`role=alert/status` | announcement重複・focus strategyをbrowser確認要 |
| 6 | `PanoptesToastStack.svelte` | `aria-live=polite`、level区別 | close「×」のaccessible nameなし。Error urgency/persistence要review |
| 7 | `PanoptesTabNav.svelte` | nav label、native buttons | activeがvisual classのみ。programmatic selected/current stateなし |
| 8 | `CompetitorAnalysisCompanyCard.svelte` | contextual labels、action buttons、`aria-pressed` | truncated textのfull-value accessとtarget/contrast未検証 |
| 9 | `CompetitorAnalysisRadarChart.svelte` | SVG accessible label | role/title/description、numeric alternative、contrast未検証 |
| 10 | `PanoptesAnalysisSurface.svelte` | empty/failed/loading flowを分離 | unavailable/partial/limited/historical contractは別途接続要 |
| 11 | `StrategyAnalysisRoadmapPhaseCard.svelte` | native buttonと`aria-pressed` | dense layoutのkeyboard/target/contrastを未検証 |
| 12 | `SelfAnalysisDualRingGauge.svelte` | scoreをaccessible labelに含む | explicit graphic role、detail alternative、color-only riskを未検証 |

Source上の良いpatternと改善候補を確認したが、keyboard操作、screen reader、contrast、target size、reduced motion、6 viewportsを実測していない。この限定確認を既存UIのRegulation適合やaccessibility conformanceとは扱わない。

## 16. Decision and DoD

Panoptes UI Regulation v1を`APPROVED`とする。

| # | DoD | Result |
| ---: | --- | --- |
| 1 | visual consistency rule defined | PASS |
| 2 | interaction rule defined | PASS |
| 3 | state representation defined | PASS |
| 4 | accessibility baseline defined | PASS |
| 5 | component usage rule defined | PASS |
| 6 | token/Tailwind compliance defined | PASS |
| 7 | responsive compliance integrated | PASS |
| 8 | exception process defined | PASS |
| 9 | review process defined | PASS |
| 10 | FS-09 Parent Closure Reviewへhandoff可能 | PASS |

FS-08 DoD: `10 / 10 PASS`。October Parent Closure Criterion 7は`PASS`。

## 17. FS-09 handoff

FS-09はFS-02〜08の7成果物、Criterion 1〜7、migration/deferred ledger、未実装Source、verification evidence、Bootcamp readinessを評価する。FS-08で見つかった改善候補は既存全UIのfailure件数ではなく、owner、risk、implementation dependency、review conditionを持つhandoffとして扱う。未実装のToken/Tailwind/Responsive/UI remediationを実装済みとみなさない。

## References

- [October Frontend Standardization Plan](../architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [FS-05 Design Token Foundation](./125-fs05-design-token-foundation.md)
- [FS-06 Tailwind Standard](./126-fs06-tailwind-standard.md)
- [FS-07 Responsive Standard](./127-fs07-responsive-standard.md)
