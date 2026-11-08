# Getting started

## Explore the library

Use Node.js 22.13+ (22.x) or 24+ and npm; the committed lockfile defines the dependency versions.

```bash
npm ci
npm run dev
```

The Showcase starts at Foundations. Components and Patterns provide task-based
examples; Data dashboard, Support inbox, Workspace and Settings are illustrative
applications. Use ⌘/Ctrl+K to search the library.

Open [Appearance lab](https://le0tan.github.io/evenform/#appearance) for side-by-side
settings and preview. General includes theme mode, density, control size, theme
color and elevation; Tokens exposes numeric overrides; Export copies the CSS.
The global Design tokens panel shares these settings. Defaults are Neutral /
Soft / Compact with Auto control size. See [Appearance](appearance.md) for
custom colors, persistence and using the exported configuration in a product.

Charts include seven advanced examples and four analytics examples, with source
tables, theme-aware palettes, and locally held filters. All data is illustrative.
See the [chart guide](charts.md) for supported chart families and boundaries.

## Start a product

1. Download or clone the source, install with `npm ci`, and set your product's
   package name.
2. Build pages in `src/starter/App.tsx`. Choose a layout appropriate to the task;
   a persistent sidebar is optional. Keep Showcase state in `src/playground/`.
3. Use the shared UI, patterns, and CSS directly. Adjust shared design parameters
   in `src/styles/token-values.css` (values) or a product stylesheet loaded last.
4. Keep the synchronous `public/evenform-init.js` script in the HTML head. Match
   its theme/density keys and default theme to the React providers. The Starter
   uses `app-theme` / `app-density`, separately from the Showcase.
5. Run `npm run build:starter` and deploy the contents of `dist-starter/`, including
   its license notices. The finalized HTML entry is `dist-starter/index.html`.

The standalone Starter excludes Showcase modules, chart demo data, the token
editor, and the VChart runtime. Add `EvenformChart` from
`@/components/ui/evenform-chart` when your product needs charts.

## Adopt into an existing React application

For a source-first export, select the modules used by the host:

```bash
node scripts/adopt-source.mjs --to /path/to/host \
  --entry src/components/ui/button.tsx \
  --entry src/components/patterns/header-layout.tsx
```

The helper follows local imports, includes core CSS, the preference bootstrap,
generated class metadata and license notices, and writes `evenform-adoption.json`
with schema version 1, the source revision, selected entries, SHA-256 hashes of
exported source/notices, the source lockfile hash and exact direct package versions
from that lockfile. Hashes identify the exported bytes even for a modified checkout;
the revision alone does not identify uncommitted changes. It does not install
packages or edit host config.
The exporter adds each component's optional stylesheet automatically: a stylesheet
imported by `src/index.css` owns the classes and slots its rules start with, and a
component that renders one of them pulls that stylesheet in. The manifest's
`styleEntries` and the final console line list every CSS file the host must import;
`npm run verify:adoption` checks this for every single-component export. `--style`
remains available for extra stylesheets. Existing differing source files stop the
export; review them before explicitly using `--overwrite`.

When the host already has files with the same names — typically a shadcn
`src/lib/utils.ts` and `src/components/ui/button.tsx` — export into a folder instead:

```bash
node scripts/adopt-source.mjs --to /path/to/host --into src/evenform \
  --entry src/components/ui/dialog.tsx
```

`src/` paths move under `src/evenform/`, `@/` imports become relative, and the host's
own `cn` and components stay untouched; no `@/` alias is needed for Evenform files.

To add modules later, pass `--add`. It reads the host's `evenform-adoption.json`,
keeps the recorded entries, styles, `--into` folder and compatibility mode, and
exports the union, so the manifest never loses earlier components and nothing is
copied or recorded by hand:

```bash
node scripts/adopt-source.mjs --to /path/to/host --add \
  --entry src/components/ui/option-select.tsx
```

Add from the revision recorded in the manifest. If adopted files differ from the
current checkout, `--add` stops and asks for that revision or a full upgrade.

Every export also writes `evenform-catalog.md`: each upstream component and
pattern by task, marked as adopted (✓) or available (+), with the `--add`
command. The host only contains the files it adopted, so this list is the place
to look before writing a select, filter bar, sortable header, pagination,
countdown, timeline, code block, prose or image preview by hand. Point the
host's agent instructions at it, for example:

```md
- UI comes from Evenform (`evenform-catalog.md`). Before building a control,
  overlay, list or layout, check the catalog and add the module with `--add`.
- Do not edit adopted files; product styles go in a stylesheet imported last.
- Size one Sheet/Dialog with `--ds-sheet-max-width` / `--ds-dialog-max-width`,
  not `!important`; use `--ds-text-caption` / `--ds-text-label` for small text.
```

To use only Evenform's design values, import `src/evenform-tokens.css`. It defines
the `--ds-*` primitives, semantics and density as custom properties and adds no
selectors, Tailwind utilities or base styles; semantic values read the host's shadcn
roles (`--background`, `--accent`, `--chart-1`…). `core.css` is the full theme: it
also styles standard shadcn slots (`card`, `table-row`, `select-item`…) and base
elements, so importing it restyles the host's existing shadcn components too.
For a host that must retain TypeScript's legacy `moduleResolution: node`, add
`--legacy-node-resolution` to export an extensionless class-table import and a
type bridge to the upstream `cn` definitions. Validate with the host's TypeScript
and bundler. See [field notes](adoption-field-notes.md) for tested boundaries.

Keep your application architecture. Copy the needed components and patterns,
their transitive local imports, `theme-provider.tsx`, `hooks/use-mobile.ts`, plus
`lib/utils.ts` and its generated `lib/cn-tables.ts`. Install the dependencies
required by those modules; use the
[dependency guide](dependencies.md) to determine the set.

For base controls, overlays and layout patterns, copy `src/core.css` and every
local stylesheet it imports. It includes fonts, light/dark mappings, `@theme`,
base rules and motion, without optional package CSS. Import it in the host entry.
For the complete library use `src/index.css`; add the other CSS modules as needed
for selected components. See the [adoption map](dependencies.md#base-entry-and-common-adoption-map).
Copying TSX alone leaves out styling and preference restoration. EventCalendar
imports its adjacent `event-calendar.css`; copy both when adding the calendar.

All components import the shared `@/lib/utils` merger. Keep the generated
`cn-tables.ts` alongside it; no `cn` package alias is needed. If you change CSS
`@theme` scales, run `npm run generate:cn` or adopt `scripts/build-cn.mjs` with
its CSS entry changed to your host stylesheet. The Vite plugin in this repository
regenerates tables during development; both builds regenerate before TypeScript.
These tables are generated utility-conflict metadata, not a second token source.

Configure `@/` to resolve to your source directory. For shadcn updates, keep
`components.json` on the official `base-nova` style with `cssVariables: true`.
Review CLI diffs before adopting updates so local token connections remain intact.

Align your theme provider and the head bootstrap, including the root `.dark`
class. Use `useTheme().resolvedTheme` for theme-toggle UI. Keep product overrides
after the shared styles and validate light/dark, both densities, keyboard focus,
and narrow screens on a representative page.

Preserve Evenform's [license](../LICENSE) and
[third-party notices](../THIRD_PARTY_NOTICES.md) with copied source. Generate
distribution notices using your host's actual bundle and assets if its build
pipeline differs from this repository's Vite setup.

Electron/Tauri products can use the components in their renderer/webview. Their
host must own native menus, window controls, resource paths, and CSP. SSR hosts
need appropriate client boundaries, stable locale/timezone, and hydration checks;
this Starter does not establish an SSR compatibility guarantee. The
[React Router SSR guide](react-router-ssr.md) gives a checked theme/provider
recipe, dual-alias setup and production-verification boundaries.

## Reproduce and review a source upgrade

Commit `evenform-adoption.json` with the adopted files. In CI, verify the snapshot
without modifying the host (run the helper from your pinned Evenform checkout):

```bash
node /path/to/evenform/scripts/adopt-source.mjs --to /path/to/host --check
```

This compares source and notice bytes to the recorded SHA-256 values; it does not
certify the host's installed dependency graph. Use the host's committed lockfile
and `npm ci` for transitive reproducibility. Regenerating cn metadata after a host
CSS change intentionally changes the snapshot: review that diff explicitly.

For upgrades, keep the old manifest and source in Git, check out the desired
upstream commit, then export the **same recorded entries/styles and compatibility
mode** into a fresh temporary directory. Diff the two source trees and manifests,
including CSS, bootstrap, notices and dependencies. Merge reviewed changes into
the host, update its manifest and lockfile, and run its build and affected browser
checks. `--overwrite` is an explicit replacement, not a three-way merge; never
use it to skip reviewing consumer edits. An unchanged checkout and entry set
produces the same manifest, without timestamps or machine-specific paths.

[Source adoption contracts](source-adoption-contracts.md) covers restored Select
labels, workspace scrolling, grouped menus, feed sizing and surface presets.

The manifest's `transformations` identifies the legacy extensionless import
(with the upstream source hash) and generated upstream type bridge. An empty
map means copied files retain their upstream bytes. Hashes describe exported
bytes after those transformations. Product-private components are not claimed
by the manifest or its checker; keep them outside the adopted file list. Source
and notice conflicts are preflighted before writing any selected source files.
The default dependency list includes the Vite Tailwind adapter; a PostCSS host
should use its own aligned adapter and validate that build rather than install
a second pipeline.
