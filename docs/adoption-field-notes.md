# Source adoption field notes

These findings come from a React 19 dashboard using Tailwind v4, PostCSS and
legacy TypeScript node resolution in a non-Vite host. Browser review used
synthetic data. The application owned transport, calculations and persistence.

## Integration findings

| Finding | Integration |
| --- | --- |
| Source adoption needs TSX, CSS, class metadata, package requirements and notices. | `scripts/adopt-source.mjs` follows local imports, exports core CSS/bootstrap/notices and protects differing host files. Select additional pattern CSS explicitly; configure and install dependencies in the host. |
| Legacy node resolution rejects `cn/engine` exports and the explicit `.ts` class-table import. | Optional exporter compatibility mode supplies an extensionless import and upstream type bridge. Validate it with the host build. |
| Nested `calc()` in the Tabs height fallback triggered a PostCSS warning. | The inset resolves through a private CSS variable before trigger height is calculated. Public sizing tokens are unchanged. |
| Six auto-fit metrics crowded the dashboard and inspector. | `--ds-stat-group-columns` controls StatGroup columns; `--ds-stat-value-size` controls Stat size. The host uses three desktop columns, two mobile columns and smaller inspector values. |
| HeaderShell needed narrower mobile padding. | Header, main and footer use the AppShell cap, `min(page-padding, space-4)`. The application arranges responsive children. |
| Chart animations needed JavaScript reduced-motion handling. | EvenformChart reads the media query and responds to preference changes. Application scrolling and CSS animation need their own reduced-motion handling. |

The exporter provides a versioned hash manifest, read-only integrity checks,
compatibility transformation provenance and notice conflict preflight. The host
configures aliases, Tailwind/PostCSS, preference keys, static assets, distribution
notices and optional CSS. See the [source upgrade workflow](getting-started.md#reproduce-and-review-a-source-upgrade).

## Tokens and application layout

Use semantic tokens for content width, padding, gaps, typography, control height
and category colors. Scope component tokens when summary statistics and an
inspector need different sizes. Keep topology geometry, horizontal flow and
inspector placement in product CSS.

Wide content needs a local scroll boundary and shrinkable grid ancestors:
`min-width: 0` and `minmax(0, 1fr)`. Preserve distinct loading, error, missing-data
and measured-zero states in the application.

The reviewed application reused HeaderShell, StatGroup, Stat, Card, Tabs, Select,
DateRangePicker, Table, DescriptionList, StatusMessage, EmptyState and
EvenformChart. It composed stage navigation, caller-scoped metrics and
asynchronous queue groups around these components.

## Page hierarchy and data interpretation

A compact summary keeps the primary diagram visible. Put exceptional values
first and inventory detail second. Use separate Card surfaces for the workspace
and inspector, with the existing panel-gap token between them. Keep the diagram
and its analysis in the same surface; use spacing and local separators to group
related content. A reachable detail link can move focus into the inspector.

Progressively disclose detailed analysis with `details`/`summary`, keeping the
estimated total and partial-data status in the collapsed summary. Use a desktop
Table for comparisons; on narrow screens, keep each identity beside its
associated values. Both layouts should use the same data.

Derive health from business metrics separately from collection status. A
successful query can return a critical service error rate. Metadata and prominent
health badges should share the same application-owned calculation.

Preserve raw time coordinates in charts and format tick labels for display.
Keep exact dated values in the data table, distinguish missing samples from zero,
and show a point for a single observation. DateRangePicker's `isInvalid` and
`errorMessage` handle invalid query windows; network errors need separate retry
feedback.

## Contribution comparison and selection

Use one normalized contribution model for the diagram, comparison, exact-value
rows and inspector. Resolve ownership after filtering mutually exclusive entries.
A selected item may contribute directly or be context included in a parent;
show that relationship explicitly.

- Distinguish absent entities, existing records with null observations, measured
  zero and known values. Absent entities can be disabled placeholders; records
  with unknown observations remain inspectable.
- Retain full identities, exact values and a common percentage scale. Describe
  sums of stage quantiles as sums of stage quantiles.
- Keep proportional charts faithful to data. For a minimum-width interactive
  strip, label the adjusted geometry and show the actual contribution percentage.
  Exact-value rows provide a larger selection target for tiny contributions.
- Use a common selection callback for segments, rows and context controls.
  Segments select their owner; child controls select the child. Linked-owner
  highlighting remains separate from `aria-pressed` selection.
- Preserve reading position and focus. Reveal context when the selected
  relationship changes, respect manually closed disclosures on refresh, and
  recompute ownership when availability or the active path changes.

Keep Stat's definition-list structure outside buttons. A sibling positioned
Button can provide the hit area with a complete accessible name; nested
disclosures belong outside that hit area. Intentional utility overrides control
selected surfaces and press translation. Verify computed styles and focus
feedback when the enclosing Card clips overflow.

The [operational review recipe](compositions.md#operational-review-one-selection-several-views)
implements these interactions with synthetic work units in the Showcase.

## Surfaces and chart boundaries

In the recorded host review, muted text on a muted light canvas measured about
4.34:1. A local mapping to neutral-600 raised that pair to 7.15:1; the dark pair
measured 5.83:1. Check the actual text/background pair when composing reading
surfaces. Selected text uses its paired foreground. Measure status Badge text
against its composited surface, keeping category identity separate from severity.

For adjacent chart segments, EvenformChart resolves
`--ds-chart-bar-separator-width` (default `0px`) and
`--ds-chart-bar-separator-color` (fallback `--card`) at the chart instance,
converting the color to sRGB for the bar theme.

Give each nested surface one owner for its outline. Use `className` utilities to
override an embedded Card's radius or ring, preserve its header/content parts,
and let the outer surface clip the contour. Inset native disclosure focus rings
when necessary to keep them visible.

## Verification scope

The adoption fixtures cover a copied core host, optional calendar
CSS/package/license inclusion, source collision protection and legacy
node-resolution typechecking. The reviewed host passed its production build and
TypeScript checks. Browser review covered light/dark, compact/comfortable,
375/390px screens, selection, calendar dismissal, keyboard operation, loading,
empty states, failures and recovery with mock responses. Keep host evidence in
the consuming repository.

The chart regression measures horizontal stacked-bar geometry/colors with a
coexisting line and automatic categorical palette, initial and dynamic reduced
motion, running-animation interruption, and release/listener cleanup. See
[chart regression](charts.md#lifecycle-and-bar-boundary-regression).

The actual-CSS contrast matrix checks the opt-in reading role and selected text
pairs. The operational recipe adds minimum-width selection, path ownership,
missing/zero data, focus, scroll preservation and category/status composition.
See [development](development.md#implementer-feedback-regression) for commands
and tested theme/viewport combinations. SSR, other bundlers and additional chart
families require their own host checks.
