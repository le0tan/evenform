# Third-party notices

Evenform's original code is licensed under [MIT](LICENSE). Third-party code,
fonts, and icons retain their respective copyright and license terms.

The Modules logo is original artwork by Tan Yuanhong, supplied by its owner
under the project's MIT license, including its adapted variants. It is not a
third-party asset. See [brand provenance](docs/brand.md).

## Source incorporated in this repository

The base components in `src/components/ui/` were generated using the official
shadcn CLI 4.22.1 with the `base-nova` style, then adapted to Evenform's tokens.
These adaptations do not remove the upstream MIT notice:

- **shadcn/ui** — Copyright (c) 2023 shadcn. [Full MIT license](licenses/shadcn-ui.txt).
  [Upstream source](https://github.com/shadcn-ui/ui).

When copying these components into another project, retain this notice and the
linked license text alongside Evenform's license. A visible UI credit is not
required by MIT; retaining the legal notices is required.

## Installed dependencies and distributed assets

VChart is an installed npm dependency, imported through `@visactor/vchart/esm/`
by `src/components/ui/vchart-runtime.ts`. Its upstream source tree is not vendored
in this repository. The Showcase distribution includes its compiled code.

- **VChart 2.2.0 / VRender 1.1.12 / VUtil 1.0.28** — MIT, Copyright (c) 2023
  Bytedance, Inc. and its affiliates. Reviewed snapshots:
  [VChart](licenses/visactor-vchart.txt), [VRender](licenses/visactor-vrender.txt),
  [VUtil](licenses/visactor-vutil.txt).
- **React Aria / React Stately / internationalized utilities** — Apache-2.0.
- **Base UI, React, Tailwind CSS, Tiptap, TanStack, FullCalendar standard features,
  Embla, and other installed packages** — their package-specific licenses apply.
- **Lucide** — ISC, with MIT notices for icons derived from Feather, as included
  in the installed `lucide-react/LICENSE`.
- **Geist** — SIL Open Font License 1.1, as included in the installed
  `@fontsource-variable/geist/LICENSE`. Font software is not relicensed as MIT.

Every production build writes `LICENSE`, `THIRD_PARTY_NOTICES.md`, and
`third-party-licenses.json` into its output directory. These include full texts
for bundled JS dependencies and explicit CSS/font inputs. Keep them with the
deployed or redistributed build. Some npm tarballs omit their license file;
`licenses/sources.json` maps exact reviewed versions to upstream snapshots.
The build fails when a bundled dependency lacks a license identifier or text.

The generated inventory describes that particular build. It does not assert
that every dependency in the lockfile is shipped to the browser. Build tools
can have different licenses, including MPL-2.0, without changing the license of
Evenform's original code. See the [license review](docs/license-audit.md).

## Design and capability references

Untitled UI and Arco were consulted for component categories and documentation
navigation. No source or asset incorporation from those projects was identified
in the current source review. They are documented as references in the
[capability audit](docs/reference-audit.md), rather than represented as bundled
dependencies. Their names and trademarks belong to their respective owners;
no endorsement is implied. Untitled UI PRO, Figma, and icon licenses must not be
inferred from the MIT license of its public React repository.

## GitHub repository icon

`public/brand/github-mark.svg` is the mark-github icon from GitHub Octicons
(Copyright (c) 2026 GitHub Inc.), distributed under MIT. The full license is
in `licenses/github-octicons.txt` and included in built distribution notices.
Source: https://github.com/primer/octicons/blob/main/icons/mark-github-16.svg.
The GitHub mark belongs to GitHub; no endorsement is implied.
