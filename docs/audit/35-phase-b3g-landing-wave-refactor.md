# Phase B-3G Landing Wave共通化実装記録

## 実装結果

共通化判断`SHARE_ANIMATION_CORE`を実装した。Primary内に重複していたgeometryと3つの`onMount`を除去し、B-3Eで作成したshared helperへ接続した。Primary Sectionは31行のcompositionとなり、SVGは210行のPrimary Visualへ分離した。

## 変更ファイル

- `src/lib/components/ComponentsBase/LandingHeroPrimarySection.svelte`
- `src/lib/features/landing/components/LandingHeroPrimaryVisual.svelte`（新規）
- `src/lib/features/landing/components/LandingHeroSecondaryVisual.svelte`
- `src/lib/features/landing/animation/landing-hero-wave.ts`
- `tests/unit/landing-hero-wave.test.ts`
- `docs/audit/34-landing-wave-shared-analysis.md`
- `docs/architecture/landing-wave-architecture.md`
- `docs/audit/35-phase-b3g-landing-wave-refactor.md`
- `docs/architecture/landing-hero-component-map.md`
- `docs/DEVELOPMENT_LOG.md`

Browser検証用の一時QA routeとAuth policy許可は最終成果物から削除済みである。

## 共通化範囲

- Wave control pointsと30点sampling
- Cubic Bezier / Catmull-Rom path生成
- Edge gate / right damping
- A/B shape head
- Primary / Secondary animation config
- GSAP headline timeline
- Ticker、phase progression、DOM `d`更新
- Gradient tween
- Reduced-motion gate
- SVG instance ID factory
- Idempotent lifecycle cleanup

SVG Visual、copy、orientation、gradient direction/colors、preview、section layoutは共通化していない。

## SVG ID修正

Primaryの固定6 IDを削除した。Primary / Secondaryは両方ともinstance固有8 IDを持つ。Browser上でPrimaryを2 instances mountした結果は、変更前duplicate 6件、変更後0件だった。通常の`/`、`/lp`、`/plan`もduplicate ID 0件である。

## Accessibility / lifecycle

- Primary SVGへ`role="img"`、title、description、`aria-labelledby`を追加した。
- Primaryも`prefers-reduced-motion: reduce`でanimationを開始しない。
- Ticker、timeline、gradient tweenをdestroy時に全てcleanupする。
- Cleanupは複数回呼ばれても1回だけ実行する。

## Tests

`landing-hero-wave.test.ts`を4件から9件へ拡張した。

- Primary / Secondary config値と独立object
- 両configからのdeterministic path
- Instanceごとの8 unique SVG IDs
- Cleanup順序とidempotency
- 既存geometry、時間変化、A/B head回帰

全体は11 files / 108 testsが成功した。

## Browser確認

Browserスキルを使い、`/`、`/lp`、`/plan`を1440、768、390pxで変更前後比較した。

- 全9ケースでPrimary 1回 / Secondary 1回。
- 全9ケースでwave pathが時間変化した。
- Primary / Secondary双方のgradient transformが時間変化した。
- Sectionのx、y、width、heightは全9ケースで変更前後一致。
- 通常routeのduplicate SVG IDは0件。
- 複数Primary QAは変更前6件、変更後0件。
- Reduced motion QAは変更前Primaryのみ動作、変更後は双方停止。
- `/ → /lp → /plan → /`の遷移後も各Hero 1回、duplicate ID 0件。
- Copy、gradient色、waveform座標、preview位置に意図した変更なし。
- Existing Mobile overflowは維持し、responsive修正は行っていない。

Browser control surfaceからload時console streamを直接取得できないため、B-3E既知の`MutationObserver` errorを解消済みとはしていない。Wave実装はMutationObserverを利用しておらず、直接関係しないと判定した。

## Quality

| Gate | Result |
|---|---|
| `npm run check` | 0 errors / 0 warnings |
| `npm run lint` | 0 errors / 60 warnings、変更ファイル0 warning |
| `npm run format:check` | PASS |
| OpenAPI | 18 operations / 18 unique operation IDs、PASS |
| `npm run test` | 11 files / 108 tests、PASS |
| Auth smoke | 5 scenarios、PASS |
| `npm run build` | PASS、unresolved import 0 |
| Secret scan | 65 build files、PASS |
| Route smoke | 7 routes、PASS |
| `npm run quality` | exit 0（73秒） |

Build・test・import graph上で新規cycleは検出されていない。Rails、OpenAPI、Auth、Contact、Strategy Plan Rail、PanoptesShellPageは変更していない。

## Defer

- Tablet / Mobile responsiveとoverflow。
- `MutationObserver.observe` errorの独立調査。
- Component test / Browser E2E / visual regression基盤。
- Shared config分岐時のvisual regression fixture。

