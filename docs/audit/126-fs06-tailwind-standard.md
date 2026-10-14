# Panoptes Phase FS-06 Tailwind Standard

Date: 2026-09-14  
Status: `APPROVED / COMPLETE`  
Scope: Documentation-only

## 1. Objective and baseline

Design Token Contract v1を入力に、Tailwindのrole、Token integration、utility/class境界、arbitrary value、CSS共存、responsive handoff、段階migrationを正式化した。

確認時点では`src/lib/ui/tokens.css`、Tailwind dependency、`tailwind.config.js`、`tailwind.config.ts`はいずれも存在しない。`tokens.css`はFS-05で承認された**実装予定のcanonical path**であり、実体が導入済みという意味ではない。本PhaseではTailwind install/config、Token/CSS/component Sourceを変更していない。

## 2. Canonical role

Tailwindは`Styling Consumer / Utility Layer`であり、Design Token Source of Truthではない。

```text
src/lib/ui/tokens.css
  -> Tailwind token adapter
     -> semantic utilities / variants
        -> Svelte component
```

- Design値とsemantic meaningは`tokens.css`が所有する。
- Tailwindはlayout utilityと、CSS Custom Propertyを参照するsemantic utilityを提供する。
- Tailwind theme/configだけにcolor、spacing、radius等の値を持たせない。
- Tailwind導入は責務整理、directory移動、visual redesign、Product logic実装の手段にしない。

## 3. Token integration contract

Tailwind adapterはSemantic CSS Custom Propertyを参照する派生設定とする。概念上のutilityは次の形を目標とする。

```text
bg-surface-default       -> var(--p-color-surface-default)
text-primary             -> var(--p-color-text-primary)
border-subtle            -> var(--p-color-border-subtle)
rounded-control-md       -> var(--p-radius-control-md)
shadow-surface-elevated  -> var(--p-shadow-surface-elevated)
```

- adapterへHex、px、shadow literal等を複製しない。
- Raw tokenを一般utilityとして公開しない。ComponentはSemantic utilityをdefaultとする。
- Tailwind固有のdefault palette/spacingとPanoptes semantic tokenが競合する場合、Panoptes UIはSemantic側を正本とする。
- `bg-[var(--p-...)]`の反復利用でintegrationを代替しない。反復するsemantic roleはadapterのnamed utilityにする。
- 実装時に採用するTailwind major versionとSvelteKit integration方式に合わせてadapter syntaxを決めるが、このconsumer directionは変更しない。
- `tokens.css`またはTailwindを実装するPhaseでは、base import orderと一つのreset ownerを決め、現行`reset.css`とPreflight相当の二重適用をvisual validationなしで行わない。

## 4. Utility convention

Utility-firstをdefaultとし、classの責務を次に分ける。

| Kind | Examples of responsibility | Rule |
| --- | --- | --- |
| Layout | display、position、grid/flex、alignment、overflow | structural composition ownerが指定 |
| Spacing / sizing | gap、padding、control/icon/container size | Token scaleまたは承認済み例外を使用 |
| Typography | role、weight、leading、tracking | semantic typography utilityを優先。DOM heading levelと分離 |
| Semantic appearance | text/surface/border/action/status/shadow/radius | `tokens.css`参照utilityのみをpublic standardにする |
| State | hover、active、focus-visible、disabled、selected、ARIA/data state | presentation stateを表し、business判定を実装しない |
| Responsive | named breakpoint variant | FS-07承認後のbreakpointだけを利用 |
| One-off composition | art direction、algorithmic geometry、complex effect | local CSSまたは記録済みarbitrary exception |

Class記述は原則として`structure -> sizing/spacing -> typography -> appearance -> interaction/state -> responsive`のまとまりで読み取れるようにする。formatterの具体的sort順はTailwind implementation Phaseで採用versionに合わせて決める。

Conditional classはcomplete literalまたは静的mapから選び、scannerが検出できない文字列連結をdefaultにしない。classはpresentation stateを反映できるが、score threshold、permission、workflow eligibility等のbusiness ruleを計算しない。

## 5. Styling ownership and component class boundary

| Owner | May own | Must not own |
| --- | --- | --- |
| UI / Primitive | semantic utilities、local interaction/state variants | Feature/API/Product rule、foundation値の再定義 |
| Composite | child arrangement、composition spacing、presentation variants | Feature command/state orchestration |
| Feature | feature-specific layout/composition、mapped presentation state | shared Design foundationの再定義、business formula |
| Layout / Shell | persistent grid/frame/chrome、named layer、approved responsive variants | use-case state/command、Feature-specific visual rule |
| Page / Route Entry | section composition。Route Entryは原則thin | generic utility system、domain business rule |

Parentからchildへraw class stringを渡してchild stylingを外部所有する設計をdefaultにしない。Component APIは`size`、`tone`、`state`等の意味あるtyped variantを優先する。`class` passthroughはPrimitiveまたはstructural extension pointで、merge order、上書き可能範囲、accessibility invariantが明確な場合だけ許可する。

## 6. Class extraction and custom extension

次のsignalがある場合に抽出を検討する。

- stableなsemantic patternが複数consumerで反復する。
- state/ARIA/data variantsが増え、markupからinteraction contractを読み取りにくい。
- 同じaccessibility behaviorとvisual contractを一体で守る必要がある。
- class群がcomponent responsibilityや変更理由を隠す。
- shared componentとしてprops/variant contractが成立する。

class数だけでは抽出しない。抽出先は、再利用可能なUI component、feature-local component、または限定的なcustom utilityの順に責務で判断する。custom utility/variantはsemantic meaning、複数consumer、Token整合が説明できる場合だけ追加し、Product固有意味をgeneric名へ混ぜない。`@apply`等は採用versionで有効かつ可読性を改善する局所用途に限り、別Design Systemを作る手段にしない。

## 7. Arbitrary value policy

`[]` arbitrary valueはdefaultにしない。Tokenまたは標準utilityで表現できる値をarbitraryにしない。

許容条件:

- asset intrinsic size。
- chart/SVG/score ring等のalgorithmicまたはgenerated value。
- browser/framework constraint。
- approved one-off visual/art-direction effect。
- temporary migration debt。

許容時は`reason / owner / scope / value / review or removal condition`をPR、近接comment、またはAuditへ記録する。反復したarbitrary valueはToken/custom utility/component candidateとして再審査する。`[720px]`等のad hoc responsive variantはFS-07後のcanonical breakpointへ寄せる。

## 8. CSS and Tailwind coexistence

次はCSSとして維持できる。

- global reset/baseと`tokens.css`。
- complex keyframes、GSAP連携、pseudo-element、art-direction effect。
- algorithmic/custom-property-driven style。
- Tailwindで表すと責務または可読性が悪化するselector。
- migration中のlegacy CSS。

既存CSSをTailwind導入時に一括削除しない。Tailwind utilityとlocal CSSが同じproperty/stateを競合所有しないよう、component単位でownerを決める。legacy CSSは理由なく永久化せず、touch時に`keep / migrate / exception`を判定する。

## 9. Component-local Svelte style

Svelte `<style>`は許容する。適用条件は次のいずれかとする。

- truly component-localなselector/geometry。
- pseudo-element、complex selector、keyframes/animation。
- algorithmic styleまたはruntime CSS Custom Propertyとの連携。
- Tailwind化によりclass stringが責務を隠す、または可読性が低下する。
- migration中のlegacy style。

色、surface、typography、shared spacing/radius/stateは可能な限りSemantic Tokenを参照する。local styleはToken Source of Truthやgeneric shared utilityを再定義しない。

## 10. Responsive handoff

FS-06で承認するのはresponsive utilityの利用原則までである。

- FS-07承認後のnamed breakpoint variantだけをdefaultで使う。
- base styleを明示し、variantは差分だけを上書きする。
- breakpointでbusiness contentやauthorizationを分岐しない。
- component reflowはComponent、route-family frameはLayout、section order/hero flowはPageというFS-03 ownerを維持する。
- exact breakpoint name/value、mobile-first/desktop behavior、content priority、viewport acceptanceはFS-07で確定する。

現在の`@media (max-width: 720px)`はEvidenceであり、FS-07承認前にcanonical Tailwind breakpointへ昇格させない。

## 11. Migration strategy

1. `src/lib/ui/tokens.css`を現行visualと等価な値で実装する。
2. 採用Tailwind version/SvelteKit integrationを決め、Semantic Token参照adapterとreset/base ownerを接続する。
3. new codeへ本standardを適用する。
4. Shared UI / PrimitiveとLayoutを小さな検証単位で移行する。
5. touched Feature UIをowner単位で移行する。
6. legacy CSSをcomponent単位で`keep / migrate / exception`判定する。
7. hardcoded/arbitrary/custom utility debtを追跡し縮退する。

各Source変更Phaseはcheck/lint/format/test/buildと、影響に応じたbrowser/visual確認を行う。既存画面の一括変換、visual redesign、directory migrationとの抱き合わせは禁止する。

## 12. Exception rule

次は明示例外として記録する。

- Third-party/generated markupでclass制御が困難。
- Tailwind adapterが未実装なmigration window。
- performanceまたはbrowser compatibility上、local CSSが必要。
- approved one-off art direction。
- Product/Design decision待ちでvisual contractを固定できない。

例外にはowner、reason、affected component、chosen technique、risk、review/removal conditionを持たせる。例外をTailwind configのglobal shortcutへ無断昇格させない。

## 13. Representative validation

全CSS/class監査は行わず、10 representative stylesを確認した。

| # | Representative | Tailwind fit | CSS / exception boundary |
| ---: | --- | --- | --- |
| 1 | `src/app.css` | body typography/surfaceはSemantic接続可能 | reset/base、cursor assetはglobal CSS継続 |
| 2 | `PanoptesSiteHeader.svelte` | flex/gap/padding/radius/stateはutility候補 | pseudo gradient、long animationはlocal CSS候補 |
| 3 | `LandingHeroPrimarySection.svelte` | positioning/surface/radiusはutility候補 | 複合shadow/art directionはlocal CSS例外候補 |
| 4 | `LandingHeroSecondarySection.svelte` | Primaryと同じ基本utility候補 | 同じくHero固有effectを保持可能 |
| 5 | `PanoptesShellMainSurface.svelte` | grid/gapはutility適合 | `min-height: 720px`はfeature sizing/exception review対象 |
| 6 | `SignUpBtn.svelte` | control size、semantic action、stateはutility適合 | gradientがsemantic token化されるまではlocal CSS維持可能 |
| 7 | `SignUpFields.svelte` | input layout、semantic focus/disabledはutility適合 | required pseudo、sr-only contractは抽出/継続を責務で判断 |
| 8 | `PanoptesToastStack.svelte` | grid/spacing/status/surface/layerはutility適合 | backdrop blur/compound widthはlocal/arbitrary判断対象 |
| 9 | `src/routes/app/+layout.svelte` | flex/grid/spacingはLayout utility適合 | 720px breakpointはFS-07まで現行CSS維持 |
| 10 | `AppLogo.svelte` | displayはutility適合 | `min(280px, 52vw)`はasset sizing exception候補 |

限定確認の結果、simple layout/stateはutilityに適合し、animation、pseudo、algorithmic/intrinsic geometry、既存breakpointにはCSS継続が必要と判断した。Tailwind適用率や全class数は調査していない。

## 14. Decision and DoD

Panoptes Tailwind Standardを`APPROVED`とする。

| # | DoD | Result |
| ---: | --- | --- |
| 1 | Tailwind role defined | PASS |
| 2 | Token integration rule defined | PASS |
| 3 | utility convention defined | PASS |
| 4 | styling boundary defined | PASS |
| 5 | arbitrary value policy defined | PASS |
| 6 | CSS coexistence rule defined | PASS |
| 7 | component-local style rule defined | PASS |
| 8 | migration strategy defined | PASS |
| 9 | representative validation complete | PASS |
| 10 | FS-07 Responsiveへhandoff可能 | PASS |

FS-06 DoD: `10 / 10 PASS`。October Parent Closure Criterion 5は`PASS`。

## 15. FS-07 handoff

FS-07はexact breakpoint name/value、mobile-first/desktop behavior、Layout/Component/Page adaptation、content priority、viewport acceptance、visual verificationを決める。FS-06のutility directionを維持し、既存`720px`を根拠なくcanonical化しない。Tailwind config変更やresponsive Source rewriteは、FS-07 Decision後のImplementation Phaseへ分離する。

## References

- [October Frontend Standardization Plan](../architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [FS-05 Design Token Foundation](./125-fs05-design-token-foundation.md)
