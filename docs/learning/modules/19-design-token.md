# Module 19: Design Token

Status: `COMPLETE / READY_FOR_M20`  
Phase: `TB-20`  
Difficulty: `FOUNDATION`  
Prerequisites: `M01`–`M18`（curriculum上の直接前提はM03–M05）

## 1. 学習目標（Learning goals）

このModuleを終えた学習者は、次の内容を説明し、判断できます。

1. Design Tokenを単なるCSS variableではなく、名前付きDesign Decisionとして説明する。
2. Raw/Foundation TokenとSemantic Tokenを区別する。
3. `Raw -> Semantic -> Component`の依存方向を守る。
4. PanoptesのCanonical Token Categoryと命名規則を使って分類する。
5. Token、Tailwind、Responsive、Motion、Product Contractの責務を分離する。
6. hardcoded/arbitrary valueの例外と段階migrationを判断する。
7. Target DesignとCURRENT implementationを混同しない。

## 用語ガイド

- **Design Token:** 色、余白、文字サイズなどのdesign判断へ名前を付け、再利用できる形にした値。
- **Raw / Foundation Token:** 色番号やspacing scaleなど、designの基礎となる値。
- **Semantic Token:** `text-primary`のように、値そのものではなくUI上の役割を表すToken。
- **Hardcoded value:** Component内へ直接書かれた色やsize。すべてが禁止ではないが、共通判断として再利用しにくい。
- **Consumer:** Tokenを利用して最終的なstyleへ変換する側。PanoptesではTailwindもConsumerとして扱う。

## 2. Design Tokenとは何か

Design Tokenは、UIの色や余白などのdesign上の判断を、再利用できる名前付きの値として表す仕組みです。

```text
Design meaning -> named contract -> implementation value
```

Color、Typography、Spacing、Radiusなどの値を、画面ごとの偶然な数値ではなく、共有できる意味として扱います。

```text
Design Token != CSS Custom Property
```

CSS Custom Propertyは、Tokenを実装する手段の一つです。変数名を付けるだけでなく、その意味、管理責任、依存方向、変更規則が定まっていなければ、適切なToken契約とは限りません。

## 3. Hardcoded valueの問題

Componentへ`#564aff`、`16px`、`999px`、`0.18s`等を直接書くこと自体が常に誤りではありません。しかし意味のある値が各所へ複製されると、次が起きる。

- 同じ意味なのに異なる見た目になる。
- 値が同じだけで意味の異なるものが誤って結合される。
- redesign/theme変更の影響箇所を追えない。
- component固有のmagic numberが増える。
- arbitrary valueが新しい非公式standardになる。
- visual/accessibility検証の範囲が曖昧になる。

Tokenは「意味」と「現在値」を分離します。

## 4. Raw / Foundation Token

Raw Tokenは、paletteやscaleなどの基礎値です。「何色か」「scaleのどの段階か」を識別しますが、UI上の用途は表しません。

Canonical naming:

```text
--p-raw-{category}-{scale-key}
```

説明用例:

```css
--p-raw-color-brand-500: #564aff;
--p-raw-color-neutral-900: #2d2d2d;
--p-raw-spacing-4: 1rem;
--p-raw-motion-duration-fast: 180ms;
```

これらは構造説明用であり、実装済みToken値の提示ではありません。Raw TokenはToken declaration内でSemantic Tokenを構成するために使い、Componentのpublic contractにはしません。

## 5. Semantic Token

Semantic Tokenは「何色か」ではなく「何のための値か」を表します。

Canonical naming:

```text
--p-{category}-{role}-{variant?}-{state?}
```

FS-05で示されたrole例:

```text
--p-color-text-primary
--p-color-surface-default
--p-color-border-subtle
--p-color-action-primary
--p-color-focus-ring
--p-color-status-error
--p-space-component-md
--p-size-control-md
--p-radius-control-full
--p-shadow-surface-elevated
--p-z-toast
--p-motion-duration-interaction
```

Semantic TokenはShared UI/Primitiveが利用するpublic contractです。Componentが知るべきなのは「brand-500」ではなく「primary action」や「primary text」のようなroleです。

Stateは独立paletteではなく、必要に応じて`hover / active / focus / disabled / selected / success / warning / error`等を該当roleのvariantとして表現します。

## 6. Canonical dependency

```mermaid
flowchart LR
    R[Raw / Foundation Token<br/>palette and scale]
    S[Semantic Token<br/>role and state]
    C[Component<br/>consumer]
    R --> S --> C
    C -. defaultでは禁止 .-> R
```

ComponentがRawへ直接依存すると、「何に使うか」という意味と現在の値が強く結び付きます。Raw値を調整したときに、どのUIの役割へ影響するか追いにくくなり、Componentごとの解釈もばらつきます。

## 7. なぜSemantic Layerが必要か

Primary textをneutral-900からneutral-800へ変更するとします。

Raw直参照の場合:

```css
.title {
	color: var(--p-raw-color-neutral-900);
}
.body {
	color: var(--p-raw-color-neutral-900);
}
```

Component側が「この値はprimary text」という意味を持たないため、変更対象の探索が必要になります。

Semantic経由の場合:

```css
:root {
	--p-color-text-primary: var(--p-raw-color-neutral-900);
}

.title {
	color: var(--p-color-text-primary);
}
```

Semantic Tokenと基礎値の対応付けをneutral-800へ変更すれば、用途を保ったまま値を更新できます。ただし、変更時には見た目とcontrastを検証する必要があります。Token化しても、検証なしで変更してよいわけではありません。

## 8. Canonical categories

FS-05で承認済みのCategoryは次の10種です。指示文中の「9 Category」という記載より、Primary Standardの列挙とContractを優先します。

| 分類       | 担当すること                                                    | 重要な責務の境界                          |
| ---------- | --------------------------------------------------------------- | ----------------------------------------- |
| Color      | brand/neutral foundation、text、surface、border、action、status | HexをProduct meaningにしない              |
| Typography | family、size、weight、line-height、letter-spacing               | DOM heading levelとvisual roleを分離      |
| Spacing    | margin、padding、gapのrhythm                                    | Sizingと混同しない                        |
| Sizing     | control/icon/avatar/container/max-size                          | 全px値やintrinsic geometryをToken化しない |
| Radius     | control、surface、pill/fullのshape role                         | 値ではなく用途で命名                      |
| Border     | width、style、semantic border color                             | focus/stateと責務を分離                   |
| Shadow     | elevation、focus/interaction補助                                | art direction固有effectは例外可           |
| Z-index    | named layer                                                     | 任意数値競争を作らない                    |
| Breakpoint | responsive adaptation threshold                                 | device categoryではない                   |
| Motion     | common duration/easing、reduced-motion relation                 | 固有timelineを無理に共通化しない          |

必要なcontractだけをToken化します。「値が存在する」ことと「Token Categoryへ登録すべき」ことは同義ではありません。

## 9. Color Token

Semantic roleは少なくともtext、surface、border、interactive/action、statusを区別します。Component内のHex乱用を避ける理由は、色の値ではなく用途を共有するためです。

`status-error`はvisual roleであり、何をerrorと判定するかはProduct/Feature Contractが決めます。TokenはBusiness Decisionを所有しません。

## 10. Typography Token

Typographyはfont-sizeだけではありません。

- font family
- size
- weight
- line-height
- letter-spacing

Typographyは、見出し、本文、label、captionなど、見た目の役割に沿って扱います。`h1`というToken名はHTML上の意味とstyleを結び付けるため、標準にはしません。見出しの階層はHTML構造で、見た目はTypography Tokenで管理します。

## 11. Spacing and Sizing

Spacingは要素間・内部のrhythmを表します。

- margin
- padding
- gap

Sizingはcomponentやcontainerの寸法contractを表します。

- control height
- icon/avatar size
- shell/container max-size
- minimum usable size

```text
Spacing != Sizing
```

`gap: 16px`と`button height: 48px`は、どちらも長さだが意味が違う。Layout固有compositionやasset intrinsic sizeまで同じscaleへ押し込まない。

## 12. Radius, Border, and Shadow

- Radiusはcomponent shapeのrole。
- Borderは領域・状態・control境界の分離。
- Shadowはelevationまたはinteraction補助。

似ている見た目を毎回別値で作りません。一方、Landing Hero固有の複合shadowなど、art directionに強く依存するeffectはlocal exception候補として評価します。

## 13. Z-index Token

Z-indexは数字の大きさではなくlayering meaningを表します。base、dropdown/popover、sticky、overlay、modal、toast等のnamed layerが候補になります。

```css
/* anti-pattern */
z-index: 999999;
```

巨大値はstacking context問題を解決せず、局所的な数値競争を作ります。Exact hierarchy/valueは承認済みContractなしに本教材で発明しません。

## 14. Breakpoint Token

FS-07で承認されたBreakpoint Contract:

| Name  |       値 | Semantic use                                |
| ----- | -------: | ------------------------------------------- |
| Base  | `<640px` | base/mobile-first behavior                  |
| `sm`  |  `640px` | compact spacing/control/grid enhancement    |
| `md`  |  `768px` | medium composition、form/modal、1→2 columns |
| `lg`  | `1024px` | navigation、sidebar、major region split     |
| `xl`  | `1280px` | wide grid、dense analysis、desktop spacing  |
| `2xl` | `1536px` | wide analytics density only                 |

Breakpointはmobile/tablet/desktopという端末分類ではなく、layoutが適応を必要とするthresholdです。既存`720px`等をclosest Tokenへ機械変換しません。

CSS Custom Propertyは、通常のmedia queryの条件へ直接は使えません。そのため、`tokens.css`を正本とし、その値をCSS/Tailwindで使える形へ接続する処理をadapterが担当します。同じ値を別の場所へ手書きして、正本を二重にしません。

## 15. Motion Token

Motion Tokenはcommon duration、easing、transition relationを扱います。Motionはfeedback、hierarchy、transitionの理解を助ける場合に使います。

- decorative motionを操作理解より優先しない。
- `prefers-reduced-motion`でnonessential motionを停止・短縮する。
- state/feedbackを静的にも理解可能にする。
- Hero/GSAP/SVG固有timelineを汎用Tokenへ無理に含めない。

Tokenがあるだけでreduced-motion対応が完了するわけではなく、Component behaviorの確認が必要です。

## 16. Component usage boundary

| 管理・決定の責任を持つ主体 | 原則とする利用方法                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| Shared UI / Primitive      | Semantic Tokenをdefaultとする。Raw direct useは記録された例外のみ                             |
| Composite                  | Semantic appearance + composition styling                                                     |
| Feature UI                 | Semantic Token + feature-local composition。Product stateをpresentation mapping後にroleへ接続 |
| Layout / Page              | surface、spacing、container、named layer、Breakpoint Contract                                 |
| Preview                    | Productionと同じsemantic contract。独自paletteを正本化しない                                  |
| Data visualization / SVG   | text/surface/statusはSemantic。algorithmic geometryや固有gradientはlocal exception可          |

Feature固有のvisual needでも、まずSemantic Tokenで表現できるか確認します。Product固有意味をgeneric Tokenへ混ぜません。

## 17. Design Token vs Product meaning

```text
warning color                         = Design Token
partially_completedのBusiness meaning = Product Contract
```

Tokenは色、余白、文字サイズなど、見た目の共通ルールを扱う契約です。`PARTIAL`の判定、Strategyへの利用可否、Organizationへのaccess許可など、正式な業務判断の正本は、承認済みProduct Contractに従うRails Business APIです。FrontendのFeatureは表示用の状態やユーザー操作を制御し、業務処理の結果・状態をpresentation mappingで承認済みsemantic roleへ接続してUIで表現します。Design Tokenそのものは業務上の判定を行いません。

## 18. Source of Truth

Target runtime Source of Truth:

```text
src/lib/ui/tokens.css
```

RawとSemantic declarationを単一のCSS Custom Properties fileで管理します。Tailwind config、Component-local style、手書きTypeScript objectを別の正本にしません。

重要: これは承認済みTarget pathであり、CURRENT repositoryに実装済みという意味ではありません。FS-05/06時点で`tokens.css`は未実装です。

JavaScript/SVGでToken referenceが必要なら、CSS Custom Property参照または明示adapterを使います。手書きTS mirrorへ同じ値を複製しません。Generatorはmulti-platform等の実需要が生じるまで導入しません。

## 19. Tailwind boundary

```mermaid
flowchart LR
    T[src/lib/ui/tokens.css<br/>Single Source of Truth]
    A[Tailwind adapter<br/>Semantic properties only]
    U[Semantic utility]
    C[Component]
    T --> A --> U --> C
    A -. Design値を複製しない .-> T
```

```text
Tailwind != Design Token Source of Truth
```

TailwindはTokenを使うStyling Consumer / Utility Layerです。adapterはSemantic CSS Custom Propertyを参照し、Hex、px、shadow等をTailwind側へ複製しません。Raw/default palette direct useや、反復する`[var(--p-...)]`でadapterを代替しません。

Tailwindのutility、arbitrary value、CSS coexistence、migration詳細はM20へhandoffします。

## 20. Responsive and fluid values

Responsive adaptationでもSemantic spacing/sizing/typographyを優先し、Breakpointごとにmagic numberを乱立させない。`clamp()`等のfluid valueにはminimum、maximum、意図を持たせ、Semantic Token Contractへ接続します。

Componentごとに異なるfluid formulaを無秩序に埋め込まない。Exact fluid scaleは承認済みでないため、本教材では新設しません。

## 21. Accessibility boundary

Color Tokenを選ぶ時はcontrastとnot-color-onlyを考慮します。Focus Tokenがあっても、focus indicatorが表示されなければaccessibleではありません。

```text
Token present != accessibility verified
```

Actual contrast、keyboard/focus、reduced-motion、target size、screen reader behaviorはSource変更時のbrowser/accessibility verificationで確認します。

## 22. Exception model

FS-05/06が許容する主な例外:

- asset intrinsic size
- algorithmic/generated value
- browser/framework constraint
- approved one-off visual/art direction
- temporary migration debt
- complex local animationやgeometry

例外は少なくとも`reason / owner / scope / exact value / review trigger or removal condition`を追跡可能にします。Raw/hardcoded値を使う場合は、なぜSemantic Tokenで表現できないか説明します。

反復する例外はToken/custom utility/shared component候補として再審査します。ただし「2箇所で同じ値」だけで同じ意味とは断定しません。

## 23. Token evolution and compatibility

| Change class              | 意味                        | Required handling                            |
| ------------------------- | --------------------------- | -------------------------------------------- |
| Additive                  | 新role/scaleを追加          | naming/owner/reuse needを確認                |
| Raw value change          | foundation値変更            | affected Semantic rolesとvisual impactを検証 |
| Semantic reference change | roleは維持して参照Rawを変更 | owner approval、visual/contrast validation   |
| Semantic rename/removal   | public contract変更         | consumer migration、期限付きalias、削除条件  |
| Semantic meaning change   | role自体が変化              | 既存Tokenを再利用せず新Token + migration     |

Contract versionは文書metadataで追跡し、Token名へ`v1`を埋め込まない。Exact deprecation toolingは未決定のため新設しません。

## 24. Migration strategy

承認済み順序:

1. Contractを正本化する（FS-05完了）。
2. 現行visual baselineと等価なminimal `tokens.css`を実装する。
3. new/touched codeからSemantic Tokenへ寄せる。
4. Shared UI / Layoutを段階移行する。
5. touched Feature UIをowner単位で移行する。
6. hardcoded/arbitrary/legacy CSS debtを縮退する。
7. Tailwind adapterをToken consumerとして接続する。

Implementation handoff上はToken実装後にTailwind接続を行います。既存画面の一括変換、全px値のToken化、Token導入とvisual redesignの同時実施は禁止します。

## 25. Worked example

次は構造説明用であり、正式なPanoptes Token値を新設するものではありません。

Before:

```css
.example-card {
	color: #2d2d2d;
	background: #ffffff;
	padding: 16px;
	border-radius: 16px;
}
```

Target direction:

```css
:root {
	/* illustrative Raw layer */
	--p-raw-color-neutral-900: #2d2d2d;
	--p-raw-color-neutral-0: #ffffff;
	--p-raw-spacing-4: 16px;
	--p-raw-radius-4: 16px;

	/* illustrative Semantic layer */
	--p-color-text-primary: var(--p-raw-color-neutral-900);
	--p-color-surface-default: var(--p-raw-color-neutral-0);
	--p-space-component-md: var(--p-raw-spacing-4);
	--p-radius-surface-md: var(--p-raw-radius-4);
}

.example-card {
	color: var(--p-color-text-primary);
	background: var(--p-color-surface-default);
	padding: var(--p-space-component-md);
	border-radius: var(--p-radius-surface-md);
}
```

同じ16pxでもSpacingとRadiusは別category・別meaningです。値が同じという理由で一つのTokenへ統合しません。

## 26. CURRENT / TARGET / DEFERRED

| 分類           | Confirmed scope                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CURRENT        | `src/app.css`、Svelte `<style>`、component-local CSS、hardcoded Hex/px/shadow/z-index/transition、既存media queryがある。                                                |
| CURRENT caveat | `src/lib/ui/tokens.css`は未実装。Tailwind dependency/configも未導入。既存CSS variableや反復値があってもCanonical Token Contract実装済みとは言えない。                    |
| TARGET         | `src/lib/ui/tokens.css`を単一runtime SoTとし、Raw→Semantic→Componentを適用。TailwindはSemantic Token adapter/consumerとする。                                            |
| DEFERRED       | minimal Token値実装、full migration、legacy cleanup、Tailwind connection、visual regression/accessibility verification、exact TS adapter/generator/deprecation tooling。 |

Target SoTはImplementation Completeを意味しません。

## 27. Representative repository mapping

全CSS監査ではなく、FS-05で限定確認済みの10 examplesを教材上で再利用した。

| Current source                       | Current styling evidence                                 | Token / exception interpretation                  | 移行状況                                 |
| ------------------------------------ | -------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------- |
| `src/app.css`                        | page background、global font                             | surface/font Semantic candidate                   | CURRENT hardcoded; TARGET token consumer |
| `PanoptesSiteHeader.svelte`          | brand gradient、surface、pill、transition、z-index       | color/radius/motion/layer candidates              | touch-and-migrate                        |
| `LandingHeroPrimarySection.svelte`   | surface、16px radius、complex shadow                     | surface/radius candidate; shadow exception review | no redesign                              |
| `LandingHeroSecondarySection.svelte` | repeated surface/radius/shadow                           | repeated Semantic candidate                       | validate parity first                    |
| `PanoptesShellMainSurface.svelte`    | gap、minimum height                                      | spacing candidate + feature sizing exception      | owner review                             |
| `SignUpBtn.svelte`                   | gradient、control height、pill、hover shadow、transition | action/control/type/motion candidates             | Shared UI priority after SoT             |
| `SignUpFields.svelte`                | input height、radius、text、focus ring                   | form/state Semantic candidates                    | Shared UI priority after SoT             |
| `PanoptesToastStack.svelte`          | status border/surface/shadow、z-index 120                | status/elevation/named layer candidates           | owner review                             |
| `src/routes/app/+layout.svelte`      | z-index 79、gap、720px media query                       | layer/spacing/breakpoint migration evidence       | do not mechanically map 720px            |
| `AppLogo.svelte`                     | intrinsic/responsive `min()` sizing                      | asset/component sizing exception candidate        | may remain local                         |

このsampleはToken Foundationが適用可能であることを示すが、全repositoryの準拠や値の頻度分布を証明しません。

## 28. Common misunderstandings

| Misunderstanding                   | Correction                                     |
| ---------------------------------- | ---------------------------------------------- |
| Token = CSS Variable               | TokenはDesign Contract、CSS variableは実装手段 |
| Raw = Semantic                     | Rawは値のfoundation、SemanticはUI role         |
| ComponentはRawを使う               | defaultはSemantic consumer                     |
| Tailwind = Token SoT               | Tailwindはconsumer/adapter layer               |
| hardcoded valueは常に禁止          | 記録された例外を許容                           |
| Breakpointはdevice名               | layout adaptation threshold                    |
| Product stateはColor Tokenが決める | Business meaningはProduct/Feature Contract     |
| TokenがあればAccessibility完了     | actual verificationが必要                      |
| 2箇所で同じ値ならToken             | 意味と安定したreuse contractが必要             |
| Target `tokens.css`は実装済み      | 承認済みpathだがCURRENTでは未実装              |

## 29. Decision heuristic

1. 基礎palette/scale valueか → Raw Token。
2. UI上のrole/stateか → Semantic Token。
3. Local algorithmic/intrinsic valueか → Exception candidate。
4. Product/business meaningか → Product Contract。
5. Responsive thresholdか → Breakpoint Token。
6. Common duration/easingか → Motion Token。
7. Component stylingか → Semantic Token consumer。
8. 同じ値が反復するか → 意味、owner、変更単位を確認してからToken候補。

## 30. Practice

### A. Knowledge check

1. Design TokenとCSS Custom Propertyの違いを説明してください。
2. RawとSemanticを分ける理由を説明してください。
3. ComponentがRawへ直接依存するriskを説明してください。

### B. Raw vs Semantic

次を分類せよ: `brand-500`、`text-primary`、`spacing-4`、`surface-elevated`、`status-error`、`duration-fast`。

### C. Refactoring exercise

`color: #2d2d2d; padding: 16px; border-radius: 16px;`をRaw / Semantic / Componentへ分離してください。同じ16pxを一つのTokenにしてよいか説明してください。

### D. Category exercise

font weight、button height、card gap、modal layer、focus border、Hero shadow、layout threshold、interaction durationを10 Categoryへ分類してください。

### E. Exception exercise

次が例外として妥当か判断してください。

1. Logo assetのintrinsic ratio。
2. 全buttonで使うbrand Hexのhardcode。
3. SVG pathから計算する座標。
4. 一時migration中のlegacy value。
5. 3画面で別々に使う`z-index: 999999`。

### F. Tailwind boundary

Token value、semantic mapping、utility projection、Component class、Product status判定を`tokens.css / Tailwind adapter / Component / Feature or Backend`へ分類してください。

### G. Violation detection

1. Tailwind configを別Token SoTにする。
2. Componentから大量にRaw Tokenを参照する。
3. Product Statusの意味をcolor tokenだけで表す。
4. Breakpointごとにmagic numberを追加する。
5. `z-index: 999999`を重ねる。
6. `tokens.css`未実装なのにmigration完了とする。

### H. Architecture explanation

「なぜRaw TokenとSemantic Tokenを分けるのか」を、変更影響、Component contract、theme/redesign、accessibility validationの観点から説明してください。

## 31. Answers / explanation guide

### A. Knowledge check

Tokenは名前、意味、owner、変更規則を持つDesign Decisionで、CSS Custom Propertyはruntime実装手段です。RawとSemanticを分けると値変更とrole meaningを切り離せる。ComponentのRaw直参照は現在値とUI meaningを密結合し、変更影響と例外を追いにくくします。

### B. Raw vs Semantic

- Raw: `brand-500`、`spacing-4`、`duration-fast`。
- Semantic: `text-primary`、`surface-elevated`、`status-error`。

### C. Refactoring exercise

Color/spacing/radiusのRaw scaleを別々に置き、それぞれtext、component spacing、surface radiusのSemantic roleへmappingし、ComponentはSemanticだけを参照します。同じ16pxでもmeaningが違うため一Tokenへ統合しません。

### D. Category exercise

Typography、Sizing、Spacing、Z-index、Border/Color state、Shadow、Breakpoint、Motionの順。Hero shadowはCategory上Shadowだがlocal exceptionになり得ます。

### E. Exception exercise

1と3は妥当候補。4はowner/removal condition付きtemporary debt。2はSemantic Token candidateで例外にしません。5はnamed layer/stacking contextを設計し直す。

### F. Tailwind boundary

- `tokens.css`: Raw valueとSemantic mappingのSoT。
- Tailwind adapter: Semantic utility projection。
- Component: utility/Semantic Token consumer。
- Feature/Backend: Product status判定。

### G. Violation detection

順に、二重正本、dependency inversion、Product/visual meaning混同、Breakpoint contract違反、layer数値競争、Target/CURRENT混同です。

### H. Architecture explanation

Rawはpalette/scaleを安定して管理し、SemanticはUI roleをpublic contractにします。ComponentがSemanticへ依存すれば、roleを維持した値変更やtheme/redesignをmapping側で吸収できます。同時に、変更対象となるroleを特定でき、contrastやvisual regressionの検証範囲も明確になります。

## 32. Completion criteria

|   # | Criterion                                  | Result |
| --: | ------------------------------------------ | ------ |
|   1 | Design Token purpose explained             | `PASS` |
|   2 | Raw Token explained                        | `PASS` |
|   3 | Semantic Token explained                   | `PASS` |
|   4 | Raw→Semantic→Component explained           | `PASS` |
|   5 | Canonical categories explained             | `PASS` |
|   6 | Tailwind boundary explained                | `PASS` |
|   7 | Responsive/Motion relation explained       | `PASS` |
|   8 | Exception/migration model explained        | `PASS` |
|   9 | Repository mapping + two diagrams included | `PASS` |
|  10 | Exercises + answers included               | `PASS` |

M19 authoring result: `10 / 10 PASS`。これは教材完成の判定であり、`tokens.css`、Tailwind、Source migration、visual/accessibility verificationの完成判定ではありません。

## 33. M20 handoff

Recommended next phase: `TB-21 — Module 20: Tailwind`。

M20ではFS-06の承認済みStandardを教材化し、TailwindをSemantic Token consumerとして扱う方法、utility convention、arbitrary value、CSS coexistence、class extraction、段階migrationを説明します。Tailwindのinstall/configやSource rewriteは教材作成と分離します。

## References

- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [October Frontend Standardization Plan](../../architecture/frontend-standardization-plan.md)
- [FS-05 Design Token Foundation](../../audit/125-fs05-design-token-foundation.md)
- [FS-06 Tailwind Standard](../../audit/126-fs06-tailwind-standard.md)
- [FS-07 Responsive Standard](../../audit/127-fs07-responsive-standard.md)
- [FS-08 UI Regulation](../../audit/128-fs08-ui-regulation.md)
- [Module 18: Missing / Partial / Eligibility](./18-missing-partial-eligibility.md)
