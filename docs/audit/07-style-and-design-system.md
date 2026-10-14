# Style・Design System・Responsive・Accessibility

## 現状

Tailwind CSS、PostCSS、CSS Modules、SCSSは未導入です。`app.css` + `reset.css`と、99コンポーネントのscoped `<style>`が中心です。inline style 6箇所、Svelte `style:` directive 23ファイルもあります。

静的集計:

- color: 282 distinct / 693 uses
- border-radius: 19 distinct / 193 uses（`999px` 72、`8px` 41）
- box-shadow: 37 distinct / 73 uses
- font-size: 34 distinct / 274 uses
- gap: 19 distinct / 285 uses
- custom property: 定義14、参照76
- media query: 60 occurrences / 51 files
- `!important`: 0

## 推奨token候補

| token group | 候補 |
|---|---|
| brand | orange `#ff6200`系、violet `#564aff`系 |
| text | `#403631`, `#3f3832`, muted `#7b7067/#7b7269` |
| surface | `#fff/#ffffff`, page `#f9f6f4`, warm panels `#fffdfb` |
| radius | pill `999px`, sm `8px`, md `12px`, lg `18/24px` |
| spacing | 4/6/8/10/12/14/16/18/24/32/40px |
| shadow | panel `0 0 4px #00000016` とelevated warm shadow群 |
| z-index | base 0/1、header 79、overlay 90/91、toast 120、legacy modal 1000 |

同じ意味の近似色・radius・shadowを先にsemantic tokenへ寄せ、Tailwind themeへ登録します。いきなりclass置換すると近似値が固定化されるため、token決定を先行させます。

## Tailwind移行案

1. CSS custom propertiesでbrand/surface/text/status/radius/shadow/zを定義。
2. Tailwind導入後、themeをcustom propertiesへ接続。
3. primitive（Button/Input/Badge/Dialog/Panel）からutilityへ移行。
4. feature固有grid/SVG/chartはscoped CSSを維持。
5. arbitrary valueは移行期間だけ許可し、頻出値を定期的にtoken化。

## responsive/scroll

- `100vh` 4件、`100dvh` 5件、fixed 8件、sticky 1件、overflow 35件。
- modalは`calc(100dvh - 40px)`を使うが、content overflow/focus挙動を画面別に確認する必要がある。
- `zoom:0.6`（Landing hero 2件）、`zoom:0.88`（shell）があり、Firefox/アクセシビリティ拡大との相性が悪い。
- headerは980px以下でnavigation項目を隠すが代替menuがない。
- nested scroll候補はpreview/admin/table/card。主要画面はdocument scroll主体。

## UI一貫性

primary actionはorange/violet gradientが多い一方、button implementationは各component内に分散します。status/error/successもtext/colorが個別実装で、共有Loading/Empty/ErrorはPanoptes analysis内に限定されます。Dialog、Button、FormField、StatusBadge、Panel、Toastを共通化対象とします。

## accessibility

確認できた良い点: button 53、label 15、ARIA属性73、全14 imgにalt属性、modalに`role=dialog`/`aria-modal`、Escape close、初期focusがあります。

課題:

- modal focus trap、close後のtrigger focus復帰、背景inertがない（High）。
- form errorとinputの`aria-describedby`/`aria-invalid`関連付けが一貫しない（Medium）。
- mobileでheader linkを非表示にするだけで代替navigationがない（High）。
- loading/statusのlive regionが一貫しない（Medium）。
- chart/radar/matrixの非視覚代替説明をcomponentごとに確認・標準化する必要がある（Medium）。
- 色コントラストは静的色抽出のみで、実測未実施（未確認）。

