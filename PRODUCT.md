# Evenform

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers and coding agents building React applications, including product
interfaces with forms, structured data, editing, navigation, and workflows.
Consumers can start a new application from the repository or adopt selected
components into an existing compatible React codebase. Web-stack desktop
applications can use the same system inside their renderer or webview.

## Product Purpose

Provide a reusable foundation for consistent product interfaces, with design
decisions coordinated through CSS tokens instead of repeated page-level fixes.
Success means a consumer can compose an appropriate page, adjust shared design
parameters, and retain coherent behavior across components, themes, and densities.

## Positioning

**An opinionated, token-driven React design system built on shadcn/ui.**

Evenform builds on the official shadcn/ui Base UI Nova style, connects components
and layouts to one CSS token hierarchy, and supplies both contextual examples
and a separate product Starter. Mature interaction libraries provide specialized
behavior; Evenform coordinates their appearance and composition.

The adoption model is source-first: consumers own and adapt the source. The
repository is pre-1.0 and does not currently publish an npm component package or
a shadcn registry. The upstream `base-nova` identifier remains a shadcn preset
name, independent of the Evenform brand.

## Operating Context

The implementation uses React, TypeScript, Vite, and Tailwind CSS v4. Current
dependency versions and commands belong in [package.json](package.json), the
lockfile, and the [development guide](docs/development.md).

- **Explore:** the Showcase starts at Foundations and provides searchable
  Components, Patterns, Charts, and illustrative Data dashboard, Support inbox, Workspace and Settings pages.
  Its token editor previews changes and exports CSS overrides.
- **Build:** new product pages start in `src/starter/App.tsx`, sharing components,
  styles, and theme support with the Showcase. An existing application can adopt
  selected modules and their required imports/styles.
- **Distribute:** the full build includes both HTML entries; the standalone
  Starter build excludes Showcase pages, demo data, the token editor, and the
  VChart runtime until a product imports the chart adapter.

Adoption steps live in [getting started](docs/getting-started.md); design and
engineering contracts live in [DESIGN.md](DESIGN.md). This product record defines
purpose and scope rather than duplicating component APIs or visual parameters.

## Capabilities and Constraints

The current system includes light, dark, and system themes; compact and
comfortable density presets; responsive layouts; and preference restoration
before React's first paint. CSS is the sole source of design parameters, organized
as Primitive → Semantic → Component. Theme and density remain independent.

Reusable controls and patterns cover forms, navigation, overlays, structured
data, dates, media, editing, and workflows. Base UI provides the primary
interaction primitives; React Aria, TanStack, Tiptap, and other focused libraries
support specialized behavior. Exact APIs and boundaries are documented in the
[component catalog](docs/components.md) and [dependency guide](docs/dependencies.md).

`EvenformChart` manages VChart's lifecycle, local CSS theme bridge, responsive
sizing, and loading/error feedback. VChart is an installed dependency, not a
vendored source tree. Consumers own chart data, filters, legends, summaries, and
accessible data alternatives. The [chart guide](docs/charts.md) defines its scope.

Showcase data is illustrative and state is held in memory or browser-local
storage. Authentication, authorization, API transport, uploads, persistence,
payments, and notification delivery belong to the consuming application.
Visual patterns for those tasks do not implement the underlying services.

The Starter is browser-focused. SSR hosts need client boundaries and hydration
verification; desktop hosts own native window controls, menus, resource paths,
and CSP. Availability of a component is not a guarantee of full upstream feature
parity, production readiness for every use case, or certification of accessibility.

Evenform's original code uses [MIT](LICENSE). Third-party code, fonts, and icons
retain their own terms; distributions include generated license notices. Source
provenance and reference-only use are recorded in the [license review](docs/license-audit.md).

## Brand Commitments

The project name is **Evenform**, with the positioning sentence above used as its
description. The supplied **Modules** logo is the project identity: preserve its
module shapes and purple accent. Original assets and full, compact, icon, and
dark-background variants are documented in [brand assets](docs/brand.md).

Product language is calm, clear, and professional. Familiar behavior across
applications is welcome. The shadcn Nova baseline and current visual decisions
are governed by DESIGN.md; this file does not define a competing visual system.

## Evidence on Hand

- The runnable Showcase and Starter provide inspectable implementations and
  illustrative workflows, rather than customer case studies or production data.
- [docs/assets/showcase.png](docs/assets/showcase.png) is a curated Showcase
  capture; supplied logo originals are retained in [docs/assets/brand/](docs/assets/brand/).
- Verification scripts, local run records, and screenshots cover specific
  interactions, token propagation, themes, densities, and viewports. Their scope
  and freshness matter; historical `evidence/` records do not prove the current
  checkout passes every check.
- CI configuration and local checks exist. Their presence alone does not prove
  hosted CI has run, a release has been published, or downstream adoption.

## Product Principles

1. **Coordinate through shared decisions.** Keep CSS as the single source of
   design parameters; extend the appropriate token layer when a shared need is real.
2. **Compose for the task.** Choose controls and layouts from the actual content
   and workflow; a persistent application shell is one option, not a requirement.
3. **Preserve mature interaction contracts.** Reuse primitives and maintain their
   keyboard, focus, state, and semantic behavior when adapting their appearance.
4. **Keep ownership explicit.** Shared components provide reusable structure and
   interaction; applications own business data, services, and policies.
5. **Make claims traceable.** Distinguish implemented capability, demonstrated
   behavior, historical verification, and open integration work.

## Accessibility & Inclusion

Preserve meaningful labels, native or primitive semantics, keyboard operation,
visible focus, and appropriate focus restoration. Controls and layouts should
remain usable on narrow screens, with coarse pointers, and across supported
themes and densities. Canvas charts need readable summaries and data alternatives.

Verify affected interactions in their real context. No independent accessibility
audit or formal conformance certification is established by this product record.
