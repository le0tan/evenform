# Development

Install dependencies with `npm ci` on Node.js 22.13+ (22.x) or 24+; the manual CI workflow checks Node.js 22 and 24.
Read [DESIGN.md](../DESIGN.md) before changing UI behavior, layout, or tokens.
CSS is the only source of design parameters.

## Fast checks

```bash
npm run typecheck
npm run verify:classes
npm run verify:adoption
npm run lint
npm run verify:navigation
npm run verify:palette
npm run build
npm run build:starter
```

The navigation check validates catalog links and example targets. Production
builds also generate complete dependency notices and fail when required license
metadata/text is missing. `npm run build` writes both HTML entries to `dist/`;
`npm run build:starter` produces an independent root entry in `dist-starter/`.
Keep `LICENSE`, `THIRD_PARTY_NOTICES.md`, and `third-party-licenses.json` with
either deployment.

## Manual GitHub checks

Run GitHub CI through **Actions → CI → Run workflow**. Pages deployment is a separate manual workflow;
see [publishing and releases](releasing.md#manual-github-workflows) for its
deployment steps.

Maintainers initiate dependency version updates.

## Browser verification

Install Chromium once:

```bash
npx playwright install chromium
```

Start `npm run dev -- --host 127.0.0.1 --port 5173` in another terminal, then run:

```bash
npm run verify:ui
npm run verify:quality
```

`verify:quality` checks every gallery page across themes, densities, and mobile/desktop
layouts, then runs token, input, overlay, data/media, and pattern interaction checks.

For checks that exercise the production bootstrap and built Starter, build both
outputs and start `npm run preview -- --host 127.0.0.1 --port 4173`, then run:

```bash
npm run verify:refinements
npm run verify:details
```

`EVENFORM_URL` overrides the target origin for these scripts. The default is
port 5173 for `verify:ui` and `verify:quality`, and port 4173 for the production checks.
`PLAYWRIGHT_EXECUTABLE_PATH` can point to an existing Chromium executable.
Scripts write screenshots and results under `evidence/`, associated with their
checkout and run. Coverage focuses on the flows listed below.

The Foundations page, library search, and controls have focused browser checks
against the source dev server (port 5173 by default):

```bash
node scripts/verify-foundations.mjs
node scripts/verify-library-navigation.mjs
node scripts/verify-control-resilience.mjs
```

All accept `EVENFORM_URL` and `PLAYWRIGHT_EXECUTABLE_PATH`. They cover the live
Foundations interactions and narrow layouts, keyboard search and focus return,
and long Select labels, Textarea sizing, and invalid grouped-input feedback.
Each saves a fresh report and screenshots under its own `evidence/` directory.

`npm run verify:feedback` targets the source dev server (default port 4173). It
generates an isolated fixture under ignored `evidence/field-feedback/`, checks
font/color composition, both densities/themes and four control sizes with fine
and emulated coarse pointers, then exercises the Record browser at
320/390/768/1381px. `verify:classes` and `verify:adoption` need no browser server.
The latter retains its temporary host path in stdout for inspection.

Set `EVENFORM_EVIDENCE_DIR` to an absolute directory path ending in `/` to save a
new run separately without overwriting older results.

Match verification to the change: a local component adjustment needs its own
state/keyboard checks; shared layout or token changes need representative uses,
light/dark, compact/comfortable, and desktop/mobile screenshots. Documentation
changes do not require browser runs. Do not copy third-party documentation
screenshots into public assets without reviewing their reuse rights.

## Appearance verification

[Appearance lab](appearance.md) and the Design tokens panel use the same editors
and preference state. For changes to shared appearance settings, check both
surfaces, a portal overlay, light/dark, Compact/Comfortable, Auto/explicit control
sizes, and a custom color. Verify Reset and CSS export, including restoring a
slider to its inherited value without leaving an override marker.

`verify:palette` checks 1,212 seeds in both themes against the generated semantic
role pairs. Verify page layout and interaction separately. Keep screenshots and
reports in the ignored `evidence/` directory.

## Updating dependencies

Use npm and commit `package-lock.json` with intentional dependency updates. The
lockfile uses the public npm registry. Inspect upstream API and license changes,
run relevant UI verification, and rebuild both outputs. Some packages omit
license files from npm; the exact-version mappings in `licenses/sources.json`
need a reviewed upstream snapshot after those versions change. Do not substitute
a generic MIT text without the correct copyright holder.

`components.json` retains the official `base-nova` style identifier. That is the
upstream shadcn preset name, independent of the Evenform project name.

## Motion verification

With `npm run dev -- --host 127.0.0.1` running, use `npm run verify:motion`.
Set `EVENFORM_URL` for a different local port. The targeted check launches an
isolated Playwright Chromium context, exercises animations and interruption,
and records JSON, screenshots and video in ignored `evidence/motion/`.
See [Motion](motion.md#verification) for measured animation and interaction coverage.

## Source adoption contract verification

With the source dev server running on port 4173, run
`npm run verify:source-contracts` (or set `EVENFORM_URL`). It generates an ignored
fixture, checks restored/controlled Select labels before popup mounting,
asynchronous option labels, named menu groups and mouse/keyboard keep-open,
Escape focus restoration, 18 mixed-height cards and independent workspace
scrolling. The matrix covers desktop/narrow, light/dark and both densities.
It also checks shared Dialog/Sheet/AlertDialog backdrop parameters under normal
and reduced motion, plus Card token/utility precedence. Screenshots and JSON
are saved in `evidence/source-contracts/`.

`verify:adoption` checks deterministic versioned manifests, exact direct package
versions, source/license integrity, consumer-edit protection and a copied Vite
host using OptionSelect and HeaderShell (including its additional CSS).
The fixture links installed packages. Verify transitive dependency reproducibility
with the host lockfile and CI installation.

With the same source server, `npm run verify:input-adoption` checks 16 viewport,
theme, density and reduced-motion combinations, free-entry async/retry/cancellation,
SVG dialog return/fallback and ordinary HTML trigger restoration. `npm run verify:ssr`
checks zero server storage reads, three deterministic SSR snapshots and 18 preference
hydration cases, including blocked storage and system-mode changes. They write to
`evidence/input-adoption/` and `evidence/ssr/`. The SSR fixture uses actual server
rendering/hydration; validate React Router deployment in the consuming host.

`npm run analyze:adoption-size -- /path/to/consumer BEFORE_SHA AFTER_SHA` profiles
archived consumer builds without editing the consumer or installing packages.
See [size analysis](adoption-size-analysis.md) for optional temporary ablations,
runtime requirements and the distinction between build size and runtime performance.

## Implementer feedback regression

With the source server running at port 4173, use `verify:chart-contracts`,
`verify:operations` and `verify:reading-contrast` (all accept `EVENFORM_URL` and
`PLAYWRIGHT_EXECUTABLE_PATH`). They save JSON and the applicable screenshots in
ignored `evidence/chart-contracts/`, `evidence/operations/` and
`evidence/reading-contrast/`. Chart lifecycle/mark tests use the real runtime;
composition tests use synthetic records; contrast tests measure selected actual
CSS pairs. Test application integration and additional chart/theme combinations
in the consuming host.

`verify:operations` covers desktop/mobile × Light/Dark × Compact/Comfortable
(eight cases): real pointer selection of the minimum-width tiny contribution,
keyboard/list/inspector synchronization, selected computed styles, context-trigger
visibility and scroll preservation with pointer/Enter/Space, path-scoped
ownership, same/changed/missing relationships, absent versus null records,
zero/all-unknown/near-100% samples, focus and vertical position, and initial plus
dynamic OS/local reduced motion. It records instant horizontal scroll requests.
The compact cases additionally check Neutral/Indigo/Teal/Rose in both viewports
and themes (16 cases), resolving CSS colors through Canvas and compositing the
actual translucent destructive Badge over its tinted inspector background.
Selected text and category Badge pairs are checked within the same recipe matrix.
