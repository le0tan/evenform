<h1>
  <a href="https://github.com/le0tan/evenform#gh-dark-mode-only">
    <img src="public/brand/evenform-logo-dark.svg#gh-dark-mode-only" alt="Evenform" width="280" />
  </a>
  <a href="https://github.com/le0tan/evenform#gh-light-mode-only">
    <img src="public/brand/evenform-logo.svg#gh-light-mode-only" alt="Evenform" width="280" />
  </a>
</h1>

A React design system built on shadcn/ui, with shared CSS tokens, component
primitives and layouts. Browse the Showcase or build a product from the Starter.

[Live demo](https://le0tan.github.io/evenform/) · [Appearance lab](https://le0tan.github.io/evenform/#appearance) · [Get started](docs/getting-started.md) · [Components](docs/components.md) ·
[Design contract](DESIGN.md) · [Contributing](CONTRIBUTING.md)

Explore the application examples: [Data dashboard](https://le0tan.github.io/evenform/#dashboard),
[Support inbox](https://le0tan.github.io/evenform/#inbox),
[Workspace](https://le0tan.github.io/evenform/#workspace), and
[Settings](https://le0tan.github.io/evenform/#settings). Examples use illustrative data and browser-local state.

## What you get

- **One source of design parameters.** Primitive → Semantic → Component CSS
  variables coordinate typography, spacing, controls, and layouts.
- **Light, dark, and system themes**, with compact and comfortable density
  presets and preference restoration before React's first paint.
- **Configurable appearance.** Choose a preset or custom theme color, Flat /
  Soft / Layered elevation, and control sizing independent of density.
  [Appearance lab](https://le0tan.github.io/evenform/#appearance) combines live
  preview, numeric tokens and CSS export; see the [appearance guide](docs/appearance.md).
- **Motion.** Shared timing, interruptible overlays, opt-in sliding
  Tabs and list updates, stable action/loading feedback and reduced-motion support.
  [Motion examples](https://le0tan.github.io/evenform/#components/motion) · [Guide](docs/motion.md).
- **Composable components and patterns.** shadcn/ui's Base UI Nova style is the
  foundation; React Aria, TanStack, Tiptap, and other focused libraries support
  dates, data, editing, and interaction.
- **Charts.** A lazy-loaded VChart adapter reads the
  local CSS palette and typography, with loading and error feedback.
- **A product starting point.** The Starter shares the same components and CSS
  while keeping Showcase pages, demo data, and the token editor out of its bundle.

## Run locally

Use Node.js 24 (recommended) or Node.js 22.13+ from the 22.x line, with npm. Clone or download this
repository, then run these commands from its root:

```bash
npm ci
npm run dev
```

Open the [Showcase](http://localhost:5173) to browse foundations, components,
patterns, and charts. Open the [Starter](http://localhost:5173/starter.html) for
the minimal application entry.

```bash
npm run dev:starter       # Develop your product at /starter.html
npm run build            # Build both Showcase and Starter into dist/
npm run build:starter    # Build only the product into dist-starter/
npm run preview:starter  # Preview the standalone product
```

Start product work in `src/starter/App.tsx`. To adopt selected components in an
existing application, follow the [adoption guide](docs/getting-started.md) and
[dependency boundaries](docs/dependencies.md). Adoption is through source; npm packages and a shadcn registry are currently unavailable.

## Repository map

```text
src/
  components/ui/        Component primitives and adapters
  components/patterns/  Reusable layouts and product compositions
  styles/               CSS tokens and shared component styling
  starter/              Product entry, separate from the Showcase
  playground/           Showcase, examples, and token editor
public/                 Local assets and preference bootstrap
docs/                   Adoption, component, chart, and maintenance guides
licenses/               Reviewed upstream license snapshots
scripts/                Build helpers and focused verification
.github/                CI and contribution templates
```

[DESIGN.md](DESIGN.md) defines design and engineering contracts;
[AGENTS.md](AGENTS.md) provides concise guidance for coding agents. Detailed
guides are indexed in [docs/README.md](docs/README.md).

## Development

```bash
npm run typecheck
npm run lint
npm run verify:navigation
npm run verify:palette
npm run verify:motion # local dev server required
npm run build
npm run build:starter
```

Trigger GitHub CI from **Actions → CI → Run workflow**. Pages deployment is also manual; current
availability and setup are recorded in the [release guide](docs/releasing.md).

For browser verification and the theme/density matrix, see the
[development guide](docs/development.md). Authentication, API transport, authorization,
payments, and persistence belong to the consuming application. Browser-focused
components need additional integration work and verification in SSR hosts; see
the [React Router SSR guide](docs/react-router-ssr.md) and
[source adoption recipes](docs/source-adoption-contracts.md).

Evenform is pre-1.0; component APIs and tokens may change. Report reproducible
bugs through issues. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a change.

## License and acknowledgments

Evenform's original code is [MIT licensed](LICENSE). It builds on
[shadcn/ui](https://github.com/shadcn-ui/ui),
[Base UI](https://github.com/mui/base-ui), and the libraries documented in the
[dependency guide](docs/dependencies.md). Charts use
[VisActor VChart](https://github.com/VisActor/VChart).

Third-party code, fonts, and icons keep their own licenses. Preserve
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the accompanying license
texts when redistributing source; production builds include their own complete
notices. The [license review](docs/license-audit.md) records what was incorporated
and what was used only as a reference.
