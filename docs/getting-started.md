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
   in `src/styles/tokens.css` or a product stylesheet loaded last.
4. Keep the synchronous `public/evenform-init.js` script in the HTML head. Match
   its theme/density keys and default theme to the React providers. The Starter
   uses `app-theme` / `app-density`, separately from the Showcase.
5. Run `npm run build:starter` and deploy the contents of `dist-starter/`, including
   its license notices. The finalized HTML entry is `dist-starter/index.html`.

The standalone Starter excludes Showcase modules, chart demo data, the token
editor, and the VChart runtime. Add `EvenformChart` from
`@/components/ui/evenform-chart` when your product needs charts.

## Adopt into an existing React application

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
this Starter does not establish an SSR compatibility guarantee.
