# Panoptes Phase FS-05 Design Token Foundation

Date: 2026-09-14  
Status: `APPROVED / COMPLETE`  
Contract: `Panoptes Design Token Contract v1`  
Scope: Documentation-only

## 1. Objective and scope

FS-02〜04で承認した責務・配置を入力に、Panoptes FrontendのToken taxonomy、raw/semantic境界、命名、Source of Truth、適用・例外・migration・変更規則を定義した。本Phaseでは代表10箇所の既存styleだけを確認し、Token file、CSS、component、Tailwind、responsive behaviorは変更していない。

## 2. Canonical token taxonomy

| Category | Decision | Owns | Constraint |
| --- | --- | --- | --- |
| Color | `APPROVED` | brand/neutral foundation、text、surface、border、action、interaction、status | Hex/RGBをProduct meaningにしない |
| Typography | `APPROVED` | family、size、weight、line-height、必要なletter-spacing | headingのsemantic/DOM levelとfont sizeを分離する |
| Spacing | `APPROVED` | gap、padding、margin、insetのrhythm | component dimensionsを混在させない |
| Sizing | `APPROVED_WITH_CONSTRAINTS` | control height、icon/avatar、container/max-size等の反復contract | intrinsic/algorithmic geometryと全px値をtoken化しない |
| Radius | `APPROVED` | control、surface、pill/full等のshape role | 値ではなく用途でsemantic namingする |
| Border | `APPROVED` | width、style、semantic border color | color stateとfocus ruleを分離して追跡する |
| Shadow | `APPROVED` | surface elevation、focus/interaction補助 | decoration固有の複雑shadowは例外可 |
| Z-index | `APPROVED_WITH_CONSTRAINTS` | header、popover、modal、toast等のnamed layer | 任意の数値scaleやcomponent-local競争を作らない |
| Breakpoint | `APPROVED_WITH_CONSTRAINTS` | responsive threshold registry | exact name/value/behaviorはFS-07、Tailwind接続はFS-06/07 |
| Motion | `APPROVED_WITH_CONSTRAINTS` | common duration/easing、reduced-motion contract候補 | Hero/GSAP固有timelineを汎用tokenへ押し込まない |

Stateは独立した色paletteではなく、該当semantic roleのvariantとして扱う。対象は`hover`、`active`、`focus`、`disabled`、`selected`、`success`、`warning`、`error`。exact interaction behaviorとaccessibility baselineはFS-08で確定する。

## 3. Raw and semantic boundary

### Raw / Foundation

Raw tokenは選択可能な値のscaleであり、Product/UI meaningを持たない。

- neutral/brand palette
- font family/size/weight/line-height/tracking scale
- spacing scale
- radius、border width、shadow、duration/easingの基礎値
- FS-07で承認後のbreakpoint値

Naming example:

```text
--p-raw-color-neutral-900
--p-raw-color-brand-500
--p-raw-space-4
--p-raw-font-size-md
--p-raw-motion-duration-fast
```

Raw tokenはToken declaration内でSemantic tokenを構成するために使う。Componentからの直接利用はdefaultで禁止し、Primitiveのvalue-neutral contractまたは承認済み例外に限定する。

### Semantic

Semantic tokenはUI上のroleとstateを表し、Componentが通常参照するpublic contractである。

```text
--p-color-text-primary
--p-color-surface-default
--p-color-border-subtle
--p-color-action-primary-bg
--p-color-action-primary-bg-hover
--p-color-focus-ring
--p-color-status-error
--p-space-component-md
--p-size-control-md
--p-radius-control-full
--p-shadow-surface-elevated
--p-z-toast
--p-motion-duration-interaction
```

Product/domain stateはFeature mappingでapproved semantic roleへ変換する。Tokenはscore formula、workflow result、authorization、severity判定を所有しない。

## 4. Naming contract

CSS Custom Propertyのcanonical syntaxを次とする。

```text
Raw:      --p-raw-{category}-{scale-key}
Semantic: --p-{category}-{role}-{variant?}-{state?}
```

Rules:

- prefixは`--p-`、lowercase kebab-caseを使う。
- semantic nameは用途を表し、`orange`、`16px`等の現在値を含めない。
- state suffixはroleの意味が変わらない場合だけ付ける。
- `light/dark`は値の外観ではなくtheme contractが承認された場合だけ使用する。
- typographyは`--p-typography-body-md-size`等、roleごとのatomic leafを持つ。`h1`名はDOM semanticsとstyleを結合するため使わない。
- rename aliasはmigration期間だけ許可し、旧名・新名・owner・削除条件を記録する。

## 5. Source of Truth

v1の実行時Source of Truthは、将来の実装Phaseで配置する単一のCSS Custom Properties file `src/lib/ui/tokens.css`とする。Tailwind導入前からSvelte component、global CSS、plain CSSで利用でき、専用generatorを必要としないためである。

- RawとSemantic declarationを同fileで管理する。
- Component local `<style>`、Tailwind config、TS objectを別の正本にしない。
- JavaScript/SVG計算で値が必要な場合は、CSS Custom Propertyを読むか、明示されたadapterを設ける。手書きのTS mirrorは作らない。
- breakpointはCSS Custom Propertyをmedia query conditionへ直接利用できない制約があるため、FS-07でexact registryを承認し、FS-06/07でCSS/Tailwindへの投影方法を決める。それまでは値を二重定義しない。
- generated artifact/build pipelineは、複数platformまたはmachine-readable exportが実需要になった時だけ再検討する。

本Phaseはdocumentation-onlyのため、`tokens.css`自体とToken値は作成していない。初回実装では現行visual baselineを保つ値を採用し、値変更を同時に行わない。

## 6. Application boundary

| Owner | Default application |
| --- | --- |
| Shared UI / Primitive | Semantic tokenのみをdefaultとする。Raw direct useはPrimitive例外を記録 |
| Feature-specific UI | Semantic token + feature-local composition。Product stateはmapping後にtoken roleへ接続 |
| Layout / Page | surface、spacing、container、layerと、FS-07承認後のbreakpoint tokenを使用 |
| Preview | Actual UIと同じsemantic contractを使い、独自paletteを正本化しない |
| Data visualization / SVG | text/surface/status等はsemantic token。algorithmic geometryや固有gradientはlocal exception可 |

Typography roleはvisual styleであり、document heading levelとは別に選ぶ。Spacingは要素間のrhythm、Sizingはcontrol/icon/container等の寸法contractとして分離する。全ての`px`、asset intrinsic size、one-off geometryをToken化しない。

## 7. Breakpoint boundary

BreakpointはToken taxonomyに含めるが、FS-05ではexact threshold、mobile-first/desktop-first、component reflow、content priorityを決定しない。

- FS-07: canonical breakpoint name/value、responsive behavior、owner、viewport acceptanceを決定。
- FS-06/07: Tailwind `screens`等への投影とCSS利用方法を決定。
- FS-05: ad hoc breakpoint追加を抑止し、既存値はmigration evidenceとして保持。

既存`720px`等を確認したが、限定sampleだけで全体のcanonical breakpointとは断定しない。

## 8. Exception rule

Hardcoded valueは次の場合に限り許容する。

- one-off visual effectまたはart direction固有geometry。
- image/SVG/font等のasset intrinsic size。
- chart、score ring、animation等のalgorithmic value。
- browser/framework constraint。
- Token migration中のtemporary debt。

例外は`reason / owner / scope / exact value / review trigger or removal condition`をPRまたは近接comment/auditへ記録する。Brand/action/status/focus/shared spacingを「one-off」として恒久的にhardcodeすることは許可しない。例外が反復した場合はToken candidateとしてreviewする。

## 9. Migration strategy

1. FS-05 Contractを正本化する（本Phase）。
2. 専用Implementation Phaseで`src/lib/ui/tokens.css`を作り、現行visual baselineと等価な最小Raw/Semantic setを定義する。
3. new/touched componentへsemantic tokenを適用する。
4. shared UI/Primitive、Layout、反復状態表現を優先して段階移行する。
5. Feature固有visualをowner単位で移行し、hardcoded exception/debtを縮退する。
6. FS-06でTailwindをToken consumerとして接続し、別palette/spacing正本を作らない。

Big-bang置換、全hardcoded値のToken化、Token導入とvisual redesignの同時実施は禁止する。

## 10. Version and change policy

Contract versionはdocument metadataで管理し、token名へ`v1`を埋め込まない。過剰なpackage semverは導入しない。

| Change class | Handling |
| --- | --- |
| Additive token | non-breaking。owner、use case、重複確認を記録 |
| Raw value adjustment | name/meaning上はnon-breakingだがvisual change。影響範囲とvisual validationを必須化 |
| Semantic tokenの参照先変更 | visual change。role meaning維持を確認し、owner approvalとvisual validationを行う |
| Semantic rename/removal | breaking contract。consumer migration、期限付きalias、削除条件を記録 |
| Semantic meaning change | 既存tokenを再利用しない。新tokenを追加して段階migration |

変更理由、class、owner、affected surfaces、validation、migration/deprecationはStructure Policy、該当Audit、Development Logのうち必要な正本へ記録する。

## 11. Representative validation

全CSS監査・hardcoded value集計は行わず、次の10 representative stylesを確認した。

| # | Representative | Evidence | Foundation interpretation |
| ---: | --- | --- | --- |
| 1 | `src/app.css` | page background `#F9F6F4`、`Noto Sans JP` | global surface/font semantic candidate。現行central tokenなし |
| 2 | `PanoptesSiteHeader.svelte` | brand gradient、white surface、pill radius、state transition、z-index | brand/action/surface/radius/motion/layer候補 |
| 3 | `LandingHeroPrimarySection.svelte` | page surface、16px radius、複合shadow | surface/radius候補。Hero shadowはlocal exception評価対象 |
| 4 | `LandingHeroSecondarySection.svelte` | Primaryと同じsurface/radius/shadow | 反復Token candidateを確認 |
| 5 | `PanoptesShellMainSurface.svelte` | 14px gap、720px minimum height | spacing候補とfeature sizing例外の分離が必要 |
| 6 | `SignUpBtn.svelte` | action gradient、46px control、full radius、font、hover shadow、0.18s transition | action/control/typography/motion state候補 |
| 7 | `SignUpFields.svelte` | 48px input、full radius、neutral text/placeholder、focus ring | form semantic/state token候補 |
| 8 | `PanoptesToastStack.svelte` | info/success/warning/error border、surface、shadow、z-index 120 | status/surface/elevation/named layer候補 |
| 9 | `src/routes/app/+layout.svelte` | z-index 79、40px gap、720px media query | layer/spacing/breakpoint registryの必要性を確認 |
| 10 | `AppLogo.svelte` | intrinsic/responsive `min(280px, 52vw)` | asset/component sizing例外として保持可能 |

限定sampleから、反復するfoundation値とsemantic roleの両方が存在し、Raw/Semantic分離を適用できることを確認した。同時にHero effect、AppLogo sizing、Shell minimum heightのようなToken化しない候補も確認できた。値の頻度や全体分布は調査していない。

## 12. Decision and DoD

Panoptes Design Token Contract v1を`APPROVED`とする。

| # | DoD | Result |
| ---: | --- | --- |
| 1 | Token taxonomy defined | PASS |
| 2 | raw/semantic boundary defined | PASS |
| 3 | naming rule defined | PASS |
| 4 | Source of Truth defined | PASS |
| 5 | application boundary defined | PASS |
| 6 | exception rule defined | PASS |
| 7 | migration strategy defined | PASS |
| 8 | version/change policy defined | PASS |
| 9 | representative validation complete | PASS |
| 10 | FS-06 Tailwindへhandoff可能 | PASS |

FS-05 DoD: `10 / 10 PASS`。October Parent Closure Criterion 4は`PASS`。

## 13. FS-06 handoff

FS-06はToken Contract v1を再定義せず、TailwindをToken consumerとして接続するstandardを決める。最低限、CSS Custom Propertiesとの接続、utility convention、arbitrary value policy、component styling boundary、段階migration、exceptionを扱う。FS-07で未決定のbreakpoint値を先取りせず、Tailwind導入をCSS一括置換やvisual redesignにしない。

## References

- [October Frontend Standardization Plan](../architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [FS-04 Directory Structure](./124-fs04-directory-structure.md)
