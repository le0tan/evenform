# Source adoption field notes

For the consolidated implementer handoff, including committed-versus-in-progress
status and follow-up acceptance criteria, see
[Evenform 实测反馈与实现交接](IMPLEMENTER_FEEDBACK_2026-10-22.md).

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
The exporter remains an adoption aid, with a versioned hash manifest and
read-only integrity check; see the [upgrade workflow](getting-started.md#reproduce-and-review-a-source-upgrade).
It is not an installable package or an automatic merge system. SSR, arbitrary bundlers and every chart animation mode remain outside
this field test. The new chart media-query path has build/static coverage here;
the dashboard deliberately disables chart animation even without that preference.

## Contribution comparison follow-up

A collapsed analysis can still be unreadable when expanded. One consumer's
horizontal strip assigned equal weight to counted contributions and excluded
context, truncated identities, and repeated the same inclusion caveat per item.
The private replacement composes Stat, Badge and Table into contribution rows:
full identities, aligned values, a common percentage scale, and owner-specific
context behind native disclosures. A single largest-contribution cue is enough;
more colors or another chart library were unnecessary.

Token configuration controls scale and density, while the consumer must establish
which observations contribute and which are context. Distinguish unknown values
from measured zero; hide unknown tracks and retain explicit numeric values for
tiny contributions. Label a sum of stage quantiles accurately rather than implying
it is a measured end-to-end quantile. Consider documenting this comparison recipe
before proposing a universal component API. Business data, sources and screenshots
remain in the consuming repository.

## Whole-page review: overlooked data and validation states

A second pass found consumer issues beyond visual hierarchy. Formatting timestamps
to hours/minutes before assigning chart coordinates loses identity for sub-minute
or multi-day samples. A consumer recipe should preserve raw time coordinates,
format sparse ticks with units, retain exact dated table values, distinguish no
samples from measured zero, and show a point for one observation. These needs fit
EvenformChart plus a Table and a small availability Badge; no new chart primitive
was required.

The existing DateRangePicker `isInvalid`/`errorMessage` contract was sufficient for
invalid query windows. Keep field validation distinct from network failure/retry.
Similarly, metadata and prominent health badges must share one consumer-owned
state calculation. Local layout of existing Stat definitions can align values
beneath wrapped labels without fixing label heights or replacing the component.
These are adoption recipes and consumer responsibilities, not defects attributed
to the underlying primitives.

## Composition bars and shared outlines

One consumer replaced repeated percentage tracks with a single stacked composition
bar and compact exact values. It reuses EvenformChart and Stat/Table, preserves
source order and progressively disclosed context, and omits a fake full bar when
the known sum is zero or unavailable. Tiny segments retain their true width; the
exact list carries identities and numbers without tiny interactive targets.

Adjacent same-category segments needed a token-based separator. The chart bridge
now resolves `--ds-chart-bar-separator-width` (default 0px) and
`--ds-chart-bar-separator-color` (fallback `--card`) at the chart instance, converting
the color to sRGB for the bar theme. Data palettes and existing line charts keep
their prior behavior. In the consuming host, using a palette-key object directly
in the mark spec produced an unintended stroke; the final implementation uses
the supported theme bridge and does not retain that attempted configuration.

Nested compositions also need one owner for their outer outline. A consumer's
component-layer zero radius/ring rule was overridden by the Card's utility layer.
Use intentional className utility overrides for an embedded Card, preserve its
header/content primitives, and let the outer workspace clip the shared contour.
Check anchor and disclosure focus feedback after introducing clipping. This
requires no global change to Card rounding.

## Linking a composition to an existing selection

A consumer can reuse its existing selection identity across a diagram, a
composition bar and exact-value rows. Resolve the relationship from the same
normalized contributions used to draw the bar: a selected item may contribute
directly or be context included in a parent contribution. Show that distinction
instead of attributing the entire parent value to the selected child.

This recipe composes EvenformChart, Stat, Badge and Table. A noninteractive,
token-colored outline can mark the true proportional segment while the exact
list provides full names, values and selection text. Do not inflate tiny values
into click targets or invent a segment for unknown/zero shares. Existing tokens
are sufficient; this does not establish a need for a generic linked-chart API.

Preserve the user's reading position and focus. An outer disclosure can retain
its state while its summary identifies the relationship. Reveal the selected
child's context when that relationship changes, and respect a manual close on
data refresh. Recompute ownership when data availability changes or the user
switches pipelines. Keep business identities and screenshots in the consumer.

A follow-up required selection in both directions. The consumer reused Button
for proportional segment hit areas, complete contribution rows, and disclosed
child controls, all calling the same application selection callback. Keep the
exact list as the larger alternative for tiny segments; never expand the data
geometry. A segment selects its contributing owner, while a child control selects
the child. Related-owner highlighting is distinct from `aria-pressed` selection.

Do not wrap Stat's definition-list structure in a button: an empty positioned
Button with a complete accessible name can be a sibling of the visible content.
Keep nested disclosures outside that hit area. Button's utility `outline-none`
overrides component-layer outlines, so a separate noninteractive selection marker
or pseudo-element can preserve chart highlighting. Match the primitive's exact
active modifier when intentionally removing its press translation from a chart
hit area. These were consumer composition fixes; the existing Button contract
did not require a library change.

## Separating a workspace from its inspector

One consumer's shared outer frame produced repeated horizontal bands meeting a
continuous inspector divider. A better fit for these independent reading tasks
was two Card surfaces separated by the existing panel-gap token. Keep a single
outline per surface, and let the common heading and tabs establish their shared
context. The diagram and its analysis stay together inside one surface; they do
not each need another Card. Remove repeated selection rows when an existing
summary already identifies the same selection, retaining a reachable detail link
in the toolbar.

Internal boundaries follow reading needs: spacing can separate an inspector's
heading and summary metrics, while trend or table separators still help compare
values. Native disclosure focus outlines need a local inset treatment when a Card
clips overflow. An anchor-focus wrapper can share the Card radius without adding
another visible border. Existing Card, spacing and radius tokens covered this
case; no generic workspace API or global Card styling change was necessary.
