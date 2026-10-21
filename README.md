<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/evenform-logo-dark.svg" />
    <img src="public/brand/evenform-logo.svg" alt="Evenform" width="280" />
  </picture>
</h1>

An opinionated, token-driven React design system built on shadcn/ui.

Evenform brings shared CSS tokens, accessible component primitives, and reusable
layouts to React applications. It includes a component Showcase for exploration
and a separate Starter for building your own product.

[Live demo](https://le0tan.github.io/evenform/) · [Get started](docs/getting-started.md) · [Components](docs/components.md) ·
[Design contract](DESIGN.md) · [Contributing](CONTRIBUTING.md)

Explore the application examples: [Data dashboard](https://le0tan.github.io/evenform/#dashboard),
[Support inbox](https://le0tan.github.io/evenform/#inbox),
[Workspace](https://le0tan.github.io/evenform/#workspace), and
[Settings](https://le0tan.github.io/evenform/#settings). Examples use illustrative data and browser-local state.

## What you get

- **One source of design parameters.** Primitive → Semantic → Component CSS
  variables coordinate typography, spacing, controls, and layouts. No manually
  synchronized TypeScript or JSON token copy.
- **Light, dark, and system themes**, with compact and comfortable density
  presets and preference restoration before React's first paint.
- **Composable components and patterns.** shadcn/ui's Base UI Nova style is the
  foundation; React Aria, TanStack, Tiptap, and other focused libraries support
  dates, data, editing, and interaction.
- **Charts that follow your tokens.** A lazy-loaded VChart adapter reads the
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
[dependency boundaries](docs/dependencies.md). This is a source-first repository;
it does not currently publish an npm component package or a shadcn registry.

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
npm run build
npm run build:starter
```

GitHub CI is manually triggered from **Actions → CI → Run workflow**; pushes
and pull requests do not start it. Pages deployment is also manual; current
availability and setup are recorded in the [release guide](docs/releasing.md).

For browser verification and the theme/density matrix, see the
[development guide](docs/development.md). Current examples use illustrative
data and browser-local state. Authentication, API transport, authorization,
payments, and persistence belong to the consuming application. Browser-focused
components need additional integration work and verification in SSR hosts.

Evenform is pre-1.0; component APIs and tokens may change. Report reproducible
bugs or propose focused improvements through this repository's issues and pull
requests. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a change.

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
