# Evenform logo

The project uses the Modules logo supplied in `evenform-04-modules-svg.zip`.
The original SVGs are retained in [assets/brand/](assets/brand/).

Tan Yuanhong created and owns the logo and confirmed on 2026-10-21 that the
original assets and all project variants are distributed under the project's
[MIT license](../LICENSE). This includes the original SVGs, full and compact
lockups, light/dark variants, standalone marks, and favicon. Retain the project
copyright and license notice when redistributing this artwork. This license
does not grant trademark rights or imply project endorsement.

- `public/brand/evenform-logo.svg`: full logo, with surrounding whitespace
  trimmed through the viewBox for interface and README use.
- `public/brand/evenform-logo-dark.svg`: the same shapes, with the deep indigo
  changed to a light ink for dark backgrounds. The purple accent is unchanged.
- `public/brand/evenform-logo-compact.svg` and its `-dark` variant: sidebar
  lockup with a tighter icon/wordmark gap, displayed at 128px wide. The mark
  reads at roughly 28px and the wordmark at 16px to fit the navigation scale.
- `public/brand/evenform-icon.svg` and `evenform-icon-dark.svg`: standalone marks.
- `public/favicon.svg`: standalone mark with an embedded system-theme media
  query so it remains visible on light and dark browser chrome.

The Showcase uses the root `.dark` class to select its logo, so manual theme
selection and System Theme agree with the application. README uses GitHub's `#gh-dark-mode-only` / `#gh-light-mode-only` image and link
fragments to select the asset for the actual GitHub theme, including when that
theme differs from the operating system. See [GitHub theme-specific images](https://github.blog/changelog/2021-11-24-specify-theme-context-for-images-in-markdown/).
The wordmark is outlined SVG and does not depend on an installed font.
