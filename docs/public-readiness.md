# Public-readiness review

Reviewed on 2026-10-21. The maintainer subsequently authorized public visibility
and GitHub Pages on the same date. This review covers the tracked source snapshot, rebuilt
distributions, and the recreated GitHub repository.

This is a historical review of the initial publication snapshot. Current
capabilities and deployment status are documented in [Appearance](appearance.md)
and [Releasing](releasing.md); later PRs and workflow runs are outside this audit.

## Source snapshot

The publication candidate is a single root commit titled `Initial commit`,
with author and committer `Tan Yuanhong <leotan.yh@gmail.com>`. This identity is
configured only for this repository. Historical development evidence is removed
from the tracked snapshot and preserved locally under the ignored `evidence/`
directory. A recovery bundle of the previous history is retained inside local
`.git/local-backups/`; it is not part of the published tree.

A targeted scan of tracked text checked common private-key, GitHub-token,
AWS-key, LLM-key and JWT patterns, personal absolute paths, company email
addresses, and known internal-domain patterns. No matches were found. This is
pattern-based verification, not an exhaustive secret-scanner certification.
External URL inventory contained public project/documentation/package hosts,
localhost addresses, and illustrative demo addresses. The Showcase screenshot
and logo assets have been visually inspected during preparation. External
reference captures and raw run records are excluded from the source snapshot.

MIT licensing, copied shadcn source attribution, upstream license snapshots,
and generated dependency/font/icon notices are present. Both build inventories
contain license identifiers and full texts for their recorded entries. See
[license review](license-audit.md) for the provenance boundaries and remaining
limitations; this review does not establish ownership of unrecorded inputs.
The Modules logo is owned by Tan Yuanhong, who confirmed that the original
assets and project variants may be distributed under MIT. See [brand provenance](brand.md).
Showcase share-link and workspace URL examples use `example.com`.

## Dependency security

A live `npm audit --json` of the lockfile reported **6 low**, **0 moderate**,
**0 high**, and **0 critical** findings. The six affected package entries trace
one prototype-pollution advisory through VChart / VDataset / GeoJSON packages
to `minimist`. npm reported no available fix for the chain. No dependency update
or automatic audit fix was applied as part of this history cleanup.

`minimist` was absent from both current Vite-generated bundled-package license
inventories. That is evidence about these particular distributions, not a full
exploitability assessment or a guarantee for changed imports/builds. Consumers
handling untrusted data should review their actual module and input paths.
Recheck with `npm audit --json` when preparing releases or changing dependencies,
and review VChart/VDataset upstream fixes before updating the lockfile. No
blanket override or unsupported dependency upgrade is applied to hide findings.

## Recreated GitHub repository

On 2026-10-21 the maintainer authorized deletion and recreation of
[le0tan/evenform](https://github.com/le0tan/evenform) as a private repository.
The new repository ID is `1428336323`. Only the single root `Initial commit` on
`main` was pushed. Verification found no other remote branches or tags, no
`refs/pull/*` references, no PRs, and no Actions runs. The previous repository's
PR references and Actions records are not present in this new repository.
This verification concerns the new repository's exposed references and records;
it does not establish deletion of GitHub-internal caches or copies elsewhere.

Local recovery bundles retain earlier snapshots inside `.git/local-backups/`.
They are not tracked source, release assets, or refs to publish. Future pushes
should target only the intended branch rather than mirror local backup or
internal refs.

## Operational configuration and validation

CI and the prepared Pages deployment workflow use only `workflow_dispatch`.
Scheduled Dependabot version updates are absent. The repository is now public,
and Pages is enabled with GitHub Actions as the build source. Deployment is
started manually; pushing does not deploy. At the time of this review, the dedicated CI matrix had not been
triggered. Results from the deleted repository do not provide a status check
for this commit.

Local validation on 2026-10-21 passed typecheck, lint, navigation verification,
and both production builds. The Showcase inventory contains 114 dependency/asset
entries and the Starter inventory 19; all contain license identifiers and full
texts. Both outputs include `LICENSE`, `THIRD_PARTY_NOTICES.md`, and
`third-party-licenses.json`. This publication cleanup changes documentation and
an illustrative share-link domain; it does not establish fresh browser
acceptance for every component. Reproducible checks and browser coverage are
specified in [development.md](development.md).

The private vulnerability reporting endpoint returned HTTP 404 during review,
so this review does not assert that the feature is enabled. The maintainer's
public profile lists the contact email provided directly in [SECURITY.md](../SECURITY.md).
Verify and enable private reporting when supported before inviting reports via
the GitHub feature; email remains the documented private reporting channel.
