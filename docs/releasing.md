# Publishing and releases

## First public repository

Use **evenform** as the repository name and this description:

> An opinionated, token-driven React design system built on shadcn/ui.

The source repository is [le0tan/evenform](https://github.com/le0tan/evenform).
It was deleted and recreated as a private repository on 2026-10-21 to remove
old PR references and development history. Only a single root `Initial commit`
was pushed. The repository was subsequently made public on the same date.
Package metadata points to its actual
repository and issue URLs. The local directory name does not affect the project name.

Before publishing or changing visibility, review the exact source diff and the Git history that
will be published for credentials, internal URLs, personal paths, private data,
and third-party materials. The initial snapshot is the root of the public history;
subsequent updates use feature/fix branches, pull requests and normal merges.
Do not amend or force-push public main.
Historical screenshots and run records remain local. `.gitignore` and
`export-ignore` do not remove existing GitHub PR references or cached commits. In particular, keep external
reference captures such as `reference-untitled.png` out of public source and
release assets; no redistribution permission for those screenshots is assumed.

`evidence/` is local validation material, not a public documentation dependency.
Historical records remain available locally but are not tracked in the source
snapshot. New records are ignored, and the directory is excluded from release
archives.
Public guides describe reproducible checks. Curated, first-party screenshots
for documentation belong in `docs/assets/`.

Enable GitHub private vulnerability reporting before inviting reports. Branch
protection and reviewer policies should match the maintainer team. CI is
**manual only**: push and pull-request events do not start it. The CI workflow
uses a read-only token; the separate Pages deploy job receives only the additional
Pages/OIDC permissions it needs. No npm publication credentials are configured.

`private: true` prevents accidental **npm** publication; it does not prevent a
public GitHub repository or MIT-licensed source distribution. Evenform currently
ships source and application builds. A future npm package or shadcn registry
needs an intentional public API, exports, packaging, and release workflow.

## Validate a release

```bash
npm ci
npm run typecheck
npm run lint
npm run verify:navigation
npm run verify:palette
npm run build
npm run build:starter
```

Run the relevant [browser checks](development.md) for the changed surface and
review screenshots. Include loading/error states and keyboard behavior when
affected. Check both outputs' license inventories and retain their legal files.
The build generates notices from actual JS chunks plus explicit stylesheet/font
inputs; it fails on missing license text. Dependency updates require reviewing
upstream licenses and any exact-version snapshots in `licenses/`.

Choose and record a version before tagging an actual release; do not advertise
unpublished releases in the README. Publish release notes describing changed
behavior, API/token migration steps, verification, and limitations. Attach only
the intended source or built output and preserve `LICENSE`, third-party notices,
and upstream texts. The Showcase's large chart/editor chunks are optional demo
costs; use `build:starter` for the minimal application distribution.

## Manual GitHub workflows

In the repository's **Actions** tab, choose **CI** → **Run workflow** to run the
Node.js 22/24 validation matrix. Both CI and **Deploy GitHub Pages** use only
`workflow_dispatch`; pushing source or opening a pull request does not run them.

**Pages status (2026-10-22):** The repository is public and Pages is enabled
with **GitHub Actions** as its build source. The site URL is
[le0tan.github.io/evenform](https://le0tan.github.io/evenform/).

Appearance lab, theme colors, elevation and independent control sizing shipped
via [PR #1](https://github.com/le0tan/evenform/pull/1). The corresponding
[CI run](https://github.com/le0tan/evenform/actions/runs/39710576138) and
[Pages run](https://github.com/le0tan/evenform/actions/runs/39710578537) succeeded
on commit `d488f1d`. See the [appearance guide](appearance.md) for current usage.

To publish updates, manually run **Deploy GitHub Pages** on `main`. It builds the Showcase and Starter, preserves license notices,
and deploys only `dist/`. Its base path comes from `configure-pages` metadata;
`VITE_BASE_PATH` configures Vite and public asset links for the project subpath.
The deploy job is restricted to `main`. The configured Pages environment must
allow deployments from that branch.

For a local project-subpath check:

```bash
VITE_BASE_PATH=/evenform/ npm run build
npm run preview
```

Open `/evenform/`, including `/evenform/starter.html`, and verify local assets,
logo variants, charts, and navigation. A root build remains the default when
`VITE_BASE_PATH` is unset.
