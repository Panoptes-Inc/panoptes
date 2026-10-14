# Panoptes Phase FS-07 Responsive Standard

Date: 2026-09-14  
Status: `APPROVED / COMPLETE`  
Contract: `Panoptes Responsive Contract v1`  
Scope: Documentation-only

## 1. Objective and scope

Design Token Contract v1とTailwind Standardを入力に、Breakpoint、mobile-first principle、Layout/Component/Page adaptation、content priority、dense UI、navigation、overflow、acceptance、例外を正式化した。本Phaseでは代表11 UIだけを確認し、CSS、Tailwind、Token、Component、routeは変更していない。

## 2. Breakpoint Contract

Base styleは`0〜639px`を扱い、次の5 named breakpointを採用する。

| Name | Value | Intended semantic use |
| --- | ---: | --- |
| `sm` | `640px` | compact contentの余白拡張、無理のないcontrol並列化、小規模grid |
| `md` | `768px` | medium-width composition、form/modal、1→2 column候補 |
| `lg` | `1024px` | App/Marketing navigation、sidebar、major region分割の候補 |
| `xl` | `1280px` | wide content grid、dense analysis panel、desktop spacing |
| `2xl` | `1536px` | wide analytics densityと余白調整のみ。必須layout modeにしない |

NamingはTailwind adapterとBreakpoint Tokenで一致させる。Conceptual tokenは`--p-breakpoint-sm`等とするが、CSS Custom Propertyをmedia conditionへ直接利用できないため、実装方法はFS-05/06の制約に従い一つのregistryから投影する。

`xs`は採用しない。Baseでnarrow mobileを扱えるためである。`2xl`はdense workspaceでのみ必要性が確認できるため`APPROVED_WITH_CONSTRAINTS`とし、通常Pageのmax-width解除には使わない。

既存`560 / 720 / 900 / 980 / 1180 / 1280 / 1600px`はmigration evidenceであり、canonical breakpointではない。置換時は最も近いnamed breakpointへ機械変換せず、visual behaviorを比較してowner単位で移行する。

## 3. Responsive principle

Mobile-firstをdefaultとする。Baseに狭いviewportで成立するreading/action orderを定義し、`sm:`以上は利用可能なspaceに応じたenhancementとして追加する。

- Breakpointはdevice分類ではなく、content/layoutが適応を必要とするthresholdである。
- Pointer、hover、orientation、input methodをwidthだけから推測しない。
- Width variantはbaseとの差分だけを記述し、desktop ruleを相殺する大量overrideを作らない。
- 既存desktop-first CSSはBig Bangで反転せず、componentを触る時にvisual parityを保って段階移行する。
- Viewport breakpointはglobal/Page/Layout adaptation、再利用Componentは必要に応じてcontainer availabilityも判断材料にする。

## 4. Layout adaptation

### Shared rules

- content max-widthとresponsive horizontal gutterをLayout/Page contractとして持つ。
- `100%`、`minmax(0, 1fr)`、flex wrapping等を使い、childのintrinsic widthでrootを押し広げない。
- persistent/fixed chromeの高さ・safe area・content offsetを同じLayout ownerが管理する。
- major column collapse、sidebar/drawer、global navigationはLayoutが所有する。
- Pageはsection orderとprimary/secondary regionの優先順位を所有する。

### Marketing

- Marketing PageはHeader、Hero、section flowを所有するFS-03判断を維持する。
- Baseではsingle-column reading orderとprimary actionを優先し、wideでは余白・visual compositionを拡張する。
- Decorative Hero visualはcontentを隠したりroot overflowを発生させない。copy/actionのDOM orderをvisual reorderしない。

### App

- App LayoutはHeader、persistent navigation frame、global content gutterを所有する。
- `lg`未満ではpersistent sidebar/expanded navigationをcompact trigger、drawer、またはstackへ適応し、全destinationへの代替到達手段を保持する。
- Dense analysis regionのgrid/scroll/disclosureはFeature/Component ownerへ委譲し、Layoutがdomain-specific ruleを持たない。
- Wide viewportでもcontent max-width/reading measureを維持し、単に全幅へ引き伸ばさない。

## 5. Component and Page boundary

| Owner | Responsive responsibility |
| --- | --- |
| Component | internal wrap/stack、local gap、control sizing、redundant label visibility、component-local overflow、chart minimum usable size |
| Composite | child arrangement、local column count、summary/detail disclosure |
| Feature | dense use-case region、view selection、mapped summary/detail priority |
| Layout | route-family frame、persistent navigation、sidebar、global columns/gutter/max-width |
| Page Entry | major region composition、section order、Hero flow、page-level content priority |

Componentは親route名を見てresponsive behaviorを変えない。同じComponentが異なるcontainerで使われる場合、viewport breakpointよりcontainer-aware layoutまたは明示variantを優先できる。Page/Layoutはchild内部のfont、card grid、chart geometryを個別上書きしない。

## 6. Content priority and adaptation choice

狭いspaceでは次のpriorityを維持する。

1. current state、error/warning、primary decision/action。
2. summary、score/context、navigation/orientation。
3. supporting evidence、secondary action、detail。
4. decorative/redundant visual。

Technique criteria:

| Technique | Use when | Constraint |
| --- | --- | --- |
| Wrap | text/controlが複数行でも意味と操作が保てる | overlap回避のdefault |
| Stack | parallel columnがminimum readable widthを下回る | logical/DOM orderを維持 |
| Collapse | secondary detailを任意に開ける | trigger、state、accessible nameを保持 |
| Reorder | summary-first等で理解が改善する | CSS visual orderとfocus/reading orderを乖離させない |
| Local scroll | table/chart/tabsの関係やaxisを維持する必要がある | container単位、到達可能、scrollbarを隠さない |
| Truncate | full valueが別手段で取得できるrepeated label | primary message/error/actionには使わない |
| Hide | decorativeまたは完全にredundant | 唯一の情報・navigation・actionを隠さない |

## 7. Dense UI standard

- **Tables:** semantic tableを維持し、container-local horizontal scrollをdefault候補とする。重要列固定やcolumn priorityはFeature ownerが決める。意味を失うcard変換を自動適用しない。
- **Charts / radar / ring:** minimum readable plot/label sizeを守る。縮小で判読不能になる場合はlocal scroll、summary-first、accessible data summary/tableを使う。geometry/formulaは変えない。
- **Competitor cards:** available containerに応じてgrid columnを縮退し、card minimum usable widthを守る。Viewport別の同義grid rule乱立よりcontainer-aware compositionを優先する。
- **Analysis panels:** summary-first、detail stack、progressive disclosureを使い、error/current status/primary actionを先に残す。
- **Strategy views:** phase/order/task/actionを保持し、狭幅ではvertical stackまたはlocal scrollを選ぶ。PD-03 Plan RailのProduct意味をResponsive Phaseで決めない。
- **Tabs:** nowrapでviewportを押し広げず、local horizontal scroll、wrap、またはapproved compact selectorをComponent ownerが選ぶ。active tabと全optionへの到達性を維持する。

## 8. Navigation adaptation

### Marketing Header

Marketing Page Entryが所有する。Base/compactではmenu triggerとprimary actionを優先し、`lg`以上でexpanded navigationをdefault候補とする。Linkを非表示にする場合は同じdestinationへ到達できるmenuを必須とする。

### App Header

App Layoutが所有する。Base/compactではcurrent location、primary navigation trigger、essential account/session actionを優先する。`lg`以上でpersistent/expanded navigationへ移行できる。Feature-specific actionをglobal Headerへ移さない。

現行Marketing Headerは`980px`以下で5番目以降のlinkを非表示にするが、限定確認では代替menuまで証明できなかった。Sourceは変更せず、実装前にnavigation reachabilityを確認する必要がある。

## 9. Typography and spacing adaptation

- Typography/SpacingはFS-05 Semantic Tokenを使用し、Breakpointごとの任意値を増やさない。
- Base typography/spacingでreading orderとcontrol usabilityを成立させ、wide variantは明確なdensity/measure理由がある場合だけ使う。
- Fluid typography/spacingは`clamp()`等をToken contractへ接続し、minimum/maximumと意図を記録する。
- Heading styleとDOM heading levelを分離する。狭幅を理由にsemantic levelを変えない。
- Controlのtap/click targetとlabel可読性をspacing縮小より優先する。Exact accessibility minimumはFS-08で承認する。
- Heroの固定`240px` typographyは既存visual evidenceであり、canonical responsive scaleではない。

## 10. Viewport acceptance

Global manual/visual baselineは次の6 viewportsとする。

| Label | Viewport | Purpose |
| --- | --- | --- |
| Narrow mobile | `320 × 568` | supported minimum width、overflow/critical action |
| Standard mobile | `390 × 844` | primary mobile composition |
| Tablet | `768 × 1024` | `md` boundary、portrait composition |
| Laptop | `1024 × 768` | `lg` boundary、navigation/major columns |
| Desktop | `1440 × 900` | primary desktop visual baseline |
| Wide desktop | `1920 × 1080` | max-width、dense grid、excess whitespace |

Breakpointを変更・導入するComponentは、利用するthresholdの1px below/at（例: `767/768`）も対象範囲で確認する。Landscape/orientation、browser zoom、touch/hoverはwidth viewportの代替ではなく、該当機能のriskに応じて追加する。

Acceptance criteria:

- accidental root horizontal scrollなし。
- primary information/action/navigationが到達可能。
- overlap、unintended clipping、unreadable text/chartなし。
- DOM reading/focus orderとvisual orderが整合。
- local scroll/disclosureの存在とactive/current stateが認識可能。
- fixed/sticky elementがcontentを恒常的に隠さない。

## 11. Overflow and exception rule

Root/pageのaccidental horizontal scrollは禁止する。Intentional horizontal scrollはtable、chart、tabs、dense rail等のlocal containerに限定し、keyboard/touchで到達可能にし、scrollbar/overflow cueを隠さない。Nested two-axis scrollはdefaultにしない。

Fixed width/min-widthはminimum usable control、data visualization、intrinsic media、dense workspace、third-party widgetで許容できる。ただしcontainer内で処理し、root overflowへ伝播させない。

Exception recordは`reason / owner / component or route / affected viewport / behavior / risk / fallback / review or removal condition`を持つ。既存Product/Design decision待ちは推測修正せず`PRODUCT_DECISION_REQUIRED`または`VISUAL_BASELINE_REQUIRED`として追跡する。

## 12. Representative validation

全UI/media query監査は行わず、次の11 representative UIを確認した。

| # | Representative | Confirmed evidence | Standard interpretation |
| ---: | --- | --- | --- |
| 1 | `PanoptesSiteHeader.svelte` | 1280/980px、nowrap、980pxで一部link非表示 | `xl/lg`へ段階整理。代替navigation要確認 |
| 2 | `LandingHeroPrimaryVisual.svelte` | 240px/40px/24px固定type、local responsive queryなし | Page-owned adaptationとfluid/token scale候補 |
| 3 | `LandingHeroSecondaryVisual.svelte` | Primary同様の固定type | 同上。visual redesignは本Phase外 |
| 4 | `src/routes/app/+layout.svelte` | max-width 1680px、720px padding変更 | Layout ownerに適合。720pxは`md`移行時にvisual比較 |
| 5 | `PanoptesShellMainSurface.svelte` | grid、14px gap、min-height 720px | Feature region。heightはviewport widthと別に評価 |
| 6 | `PanoptesTabNav.svelte` | nowrap、button min-width 92px | local overflow/wrap/compact selectorが必要な候補 |
| 7 | `CompetitorAnalysisCompanyCard.svelte` | fixed 180×240px、internal truncation | minimum usable card sizeとfull text access要確認 |
| 8 | `CompetitorAnalysisCardGrid.svelte` | 1600/1280/900/560pxで5→4→3→2→1列 | container/grid contractへ段階整理するcandidate |
| 9 | `SelfAnalysisDualRingGauge.svelte` | 200px ring、46px score | chart minimum sizeとsummary fallback候補 |
| 10 | `StrategyAnalysisRoadmapPhaseCard.svelte` | 1180pxでsummary wrap | local Component adaptation。canonical `xl/lg`へ比較移行 |
| 11 | `SignUpFields.svelte` | full-width 48px controls、fixed internal icon/padding | Base mobile formに概ね適合。overflowを親Formで確認 |

限定sampleはBreakpointの乱立、fixed dense UI、Header reachability、Hero scale、Tab overflowという実装課題を示した。これは全UIの問題件数ではなく、FS-07でSource変更やvisual合否を断定していない。

## 13. Decision and DoD

Panoptes Responsive Contract v1を`APPROVED`とする。

| # | DoD | Result |
| ---: | --- | --- |
| 1 | breakpoint contract defined | PASS |
| 2 | responsive principle defined | PASS |
| 3 | Layout adaptation defined | PASS |
| 4 | Component/Page boundary defined | PASS |
| 5 | content priority rule defined | PASS |
| 6 | dense UI rule defined | PASS |
| 7 | navigation adaptation defined | PASS |
| 8 | viewport acceptance defined | PASS |
| 9 | overflow/exception rule defined | PASS |
| 10 | FS-08 UI Regulationへhandoff可能 | PASS |

FS-07 DoD: `10 / 10 PASS`。October Parent Closure Criterion 6は`PASS`。

## 14. FS-08 handoff

FS-08は本Contractを再議論せず、visual consistency、interaction rules、state representation、accessibility baseline、component usage、exception/review processへ統合する。特にnavigation reachability、hide/collapse controls、local scroll cues、truncationのfull-text access、chart/table alternative、focus/reading orderをUI Regulationで具体化する。Responsive Source変更、Tailwind/Token実装、visual redesignは別Implementation Phaseで検証する。

## References

- [October Frontend Standardization Plan](../architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [FS-05 Design Token Foundation](./125-fs05-design-token-foundation.md)
- [FS-06 Tailwind Standard](./126-fs06-tailwind-standard.md)
