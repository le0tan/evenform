# Source adoption field notes

An existing React 19 dashboard was adopted into a non-Vite host with Tailwind v4,
PostCSS and legacy TypeScript node resolution. Its business transport and data
calculations remained application-owned. Browser validation used synthetic data;
it is not evidence of backend integration or universal host compatibility.

## Findings and fixes

| Finding | Resolution | Boundary |
| --- | --- | --- |
| Manually collecting TSX, CSS, class metadata and notices is easy to get wrong. | `scripts/adopt-source.mjs` follows local imports, exports core CSS/bootstrap/notices, reports package requirements and protects differing host source files. | Additional pattern CSS still requires explicit selection; no package installation or host configuration changes. |
| Legacy TypeScript node resolution cannot resolve `cn/engine` through modern exports and rejects the explicit `.ts` class-table import. | Optional exporter compatibility mode provides an extensionless import and upstream type bridge. | Use only when the host cannot change module resolution; validate the actual host build. |
| A nested `calc()` in the Tabs control-height fallback triggered a host PostCSS warning. | Resolve the inset through a private CSS variable before calculating trigger height. | Public sizing tokens and primitive interactions are preserved. |
| Six auto-fit metrics became cramped before the useful content grid breakpoint; large metric typography was excessive in the inspector. | StatGroup now accepts `--ds-stat-group-columns`; Stat accepts `--ds-stat-value-size`. | Defaults stay unchanged. The product selects three desktop columns, two mobile columns and smaller inspector metrics in CSS. |
| HeaderShell retained desktop horizontal padding on a narrow screen. | Its mobile padding follows the existing AppShell cap of `min(page-padding, space-4)`. | Header/main/footer remain aligned; responsive children still belong to the application. |
| Chart animation did not follow the JavaScript reduced-motion preference. | EvenformChart disables VChart animation when the media query matches and listens for preference changes. | CSS motion and application scrolling require their own reduced-motion paths. |

## What tokens can and cannot solve

Use the semantic layer for content width, page padding, section gaps, type,
control height and category colors. Scope component tokens to the usage when
summary statistics and an inspector need different metric sizes. Keep geometry
specific to a topology (node width, horizontal flow and inspector placement) in
the product's CSS; it is not a new universal Evenform layout.

The application reused HeaderShell, StatGroup, Stat, Card, Tabs, Select,
DateRangePicker, Table, DescriptionList, StatusMessage, EmptyState and
EvenformChart. It needed composition for stage navigation, caller-scoped metrics
and asynchronous queue groups. A generic topology component is not introduced
from one consumer.

Wide topology content must have an explicit local scroll boundary and its grid
ancestors must allow shrinking (`min-width: 0` / `minmax(0, 1fr)`). Tokens alone
cannot repair an incorrect intrinsic-size boundary. Likewise, reporting absent
data as zero, stale refreshes as current, or a failed query as perpetual loading
are application state problems, not theme problems.

## Validation and remaining costs

A follow-up task-oriented review found that successful token adoption and usable
controls did not by themselves establish a readable dashboard. Six large,
equal-weight statistic cards pushed the primary diagram below the fold; an
expanded analysis competed with navigation and node details. The consumer fixed
the hierarchy using private compositions of existing components:

| Private composition | Reused building blocks | Candidate library follow-up |
| --- | --- | --- |
| Compact operational summary | One Card, StatGroup/Stat and contextual Hint; exceptional values lead, inventory detail is secondary. | A documented recipe may be enough. Distinguish an operational status strip from six equally prominent dashboard tiles. |
| Selected-item inspector | Card header/body, Badge, Tabs, Stat and DescriptionList; an explicit selection link moves focus into the inspector. | Compare against DetailLayout in other consumers before introducing another general pattern. Selection identity, focus target and metadata grouping need an application-owned contract. |
| Responsive interface comparison | Desktop Table; narrow screens render each method identity with its three associated Stat values from the same data. | Consider a responsive comparison recipe. Horizontal reachability alone is insufficient when scrolling hides the identity column. |
| Progressive analysis disclosure | A native details/summary with Badge, retaining an estimated total and partial-data warning when collapsed. | Explain when analytical detail should follow the primary task. Accordion is appropriate when a coordinated collection is needed; a single disclosure does not require a new primitive. |

The same review found that a successful collection status had been displayed as
healthy even when the service error rate was critical. The consumer now derives
health separately and prioritizes failed/missing metrics. Badge color cannot
infer business health from a transport or collection status. These are consumer
findings and recipes, not proposed universal topology or monitoring APIs.

Surface changes also need a text-pair check: the consumer's new muted canvas
exposed a light-theme muted-foreground/canvas contrast of about 4.34:1. A local
mapping to the existing neutral-600 raised that pair to 7.15:1; the existing dark
pair measured 5.83:1. Review this pairing when documenting muted reading surfaces.
This consumer override does not change the shared palette or establish a full
contrast audit.

The adoption fixture checks a copied core host without optional calendar
dependencies, source collision protection, then calendar CSS/package/license
inclusion. The real host also passed its production build and TypeScript checks.
Browser review covered light/dark, compact/comfortable and 375/390px screens,
pipeline and inspector selection, calendar dismissal, keyboard selection,
loading, empty, failure and recovery with mock responses. Record host-specific
details and screenshots in the consuming repository, not this public library.

Existing hosts still need to align aliases, Tailwind v4/PostCSS, preference keys,
head/static asset handling, their own distribution notices and optional CSS.
The exporter is an adoption aid, not an installable package or automatic upgrade
system. SSR, arbitrary bundlers and every chart animation mode remain outside
this field test. The new chart media-query path has build/static coverage here;
the dashboard deliberately disables chart animation even without that preference.
