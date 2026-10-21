# Contributing to Evenform

Bug reports, focused fixes, documentation improvements, and accessible component
extensions are welcome. For a substantial API or architectural change, open an
issue describing the problem and proposed behavior before implementing it.

## Work locally

Use Node.js 22.13+ (22.x) or 24+ and npm. Run `npm ci`, then `npm run dev`. See the
[development guide](docs/development.md) for build and browser checks.

Before editing UI, read [DESIGN.md](DESIGN.md). Reuse existing primitives,
patterns, and semantic tokens when they fit. Keep application data and demo
state out of shared components. Preserve upstream accessibility, focus,
keyboard, and controlled-state contracts. Use `src/starter/App.tsx` for product
pages; Showcase examples remain in `src/playground/`.

## Submit a pull request

- Explain the concrete problem and resulting behavior. Keep unrelated changes
  out of the diff.
- Update the canonical component/token documentation when its contract changes.
- Run typecheck, lint, navigation verification, and both builds. For UI changes,
  include representative screenshots and the interactions/viewports checked.
  State any checks you did not run.
- Add or preserve third-party provenance and license notices for copied source
  or assets. Do not contribute proprietary UI kits, icons, or templates.

New dependencies should solve a demonstrated need and have reviewed license,
bundle, accessibility, and maintenance implications. Do not create parallel
design-token files in TypeScript or JSON.

By submitting a contribution, you agree to license your original contribution
under the project's [MIT license](LICENSE). You must have the right to contribute
the code and retain any applicable third-party notices. No separate CLA is
required.

Please follow the [code of conduct](CODE_OF_CONDUCT.md). Use the
[security policy](SECURITY.md) for vulnerability reports.
