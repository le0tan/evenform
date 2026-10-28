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

GitHub CI runs only through **Actions → CI → Run workflow**. Pushes and pull
requests do not trigger it. Pages deployment is a separate manual workflow;
see [publishing and releases](releasing.md#manual-github-workflows) for its
deployment steps.

Dependency version updates are also maintainer-initiated; no scheduled
Dependabot version-update configuration is installed.

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

`verify:quality` runs the gallery matrix and token, input, overlay, data/media, and pattern interaction checks.

For checks that exercise the production bootstrap and built Starter, build both
outputs and start `npm run preview -- --host 127.0.0.1 --port 4173`, then run:

```bash
npm run verify:refinements
npm run verify:details
```

`EVENFORM_URL` overrides the target origin for these scripts. The default is
port 5173 for `verify:ui` and `verify:quality` and port 4173 for the other scripts.
`PLAYWRIGHT_EXECUTABLE_PATH` can point to an existing Chromium executable.
Scripts write screenshots and results under `evidence/`. Keep results tied to
their actual checkout and run; do not interpret historical screenshots as a
current passing test. These scripts exercise representative flows, not every
upstream component option.

Focused dev-server checks for Foundations, library navigation, and control resilience are available as `node scripts/verify-foundations.mjs`, `node scripts/verify-library-navigation.mjs`, and `node scripts/verify-control-resilience.mjs`. They accept `EVENFORM_URL` and `PLAYWRIGHT_EXECUTABLE_PATH` and save reports under `evidence/`.

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
role pairs. It does not replace GUI checks or establish whole-page accessibility
conformance. Keep screenshots and reports in the ignored `evidence/` directory.

## Updating dependencies

Use npm and commit `package-lock.json` with intentional dependency updates. The
lockfile uses the public npm registry. Inspect upstream API and license changes,
run relevant UI verification, and rebuild both outputs. Some packages omit
license files from npm; the exact-version mappings in `licenses/sources.json`
need a reviewed upstream snapshot after those versions change. Do not substitute
a generic MIT text without the correct copyright holder.

`components.json` retains the official `base-nova` style identifier. That is the
upstream shadcn preset name, independent of the Evenform project name.

The Evenform rename changes project-specific classes, storage keys, custom
events, and the chart adapter to `evenform-*` / `EvenformChart`. Earlier local
Nova Showcase preferences are not migrated. The Starter's separate `app-*`
keys are unchanged. Historical evidence retains the name used when recorded.

## Motion verification

With `npm run dev -- --host 127.0.0.1` running, use `npm run verify:motion`.
Set `EVENFORM_URL` for a different local port. The targeted check launches an
isolated Playwright Chromium context, exercises animations and interruption,
and records JSON, screenshots and video in ignored `evidence/motion/`. It does
not use a personal browser profile. See [Motion](motion.md#verification) for
coverage and boundaries. Screenshot captures alone are not motion validation.

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
The fixture links installed packages rather than downloading them; use the real
host lockfile and CI installation for transitive dependency reproducibility.

With the same source server, `npm run verify:input-adoption` checks 16 viewport,
theme, density and reduced-motion combinations, free-entry async/retry/cancellation,
SVG dialog return/fallback and ordinary HTML trigger restoration. `npm run verify:ssr`
checks zero server storage reads, three deterministic SSR snapshots and 18 preference
hydration cases, including blocked storage and system-mode changes. They write to
`evidence/input-adoption/` and `evidence/ssr/`. The SSR fixture uses actual server
rendering/hydration but is not a full React Router deployment test.

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
CSS pairs. Their evidence does not establish backend, SSO, every chart family,
every custom theme or a complete accessibility audit.

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
Selected text and category Badge pairs are checked too. This local recipe matrix
is not a global status-color audit or coverage of arbitrary custom palettes.
