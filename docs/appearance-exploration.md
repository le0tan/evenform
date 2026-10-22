# Palette and elevation exploration

Status: feature proposal on `feature/palette-elevation-exploration`. This is not
an approved change to Evenform's defaults or a production deployment.

Open `/#appearance` in the Showcase, or use **Design tokens** on any page.

## Palette

Neutral preserves the monochrome palette. Indigo, Teal and Rose introduce a
brand color into primary actions, checked controls, selection and focus. Each
has a dark-theme counterpart with a light fill and dark text. Backgrounds and
body text stay neutral to preserve reading hierarchy. Success, warning, error
and chart categories retain their independent semantics.

CSS owns all colors in `src/styles/appearance.css`; TypeScript only names the
available choices. `data-palette` selects a preset on the HTML root. The brand
color maps to existing `primary`, `primary-foreground`, `accent`, `ring` and
sidebar semantics. The primary-button hover fill uses a darker/lightened opaque
mix instead of reducing opacity, to keep colored button labels readable.

Custom adds a native color picker and a validated 3/6-digit HEX field. It
creates an 11-step sRGB tint/shade ramp (50–950), then solves separate light and
dark semantic roles against the existing CSS neutral surfaces. This is a simple
sRGB interpolation ramp, not a perceptually uniform OKLCH scale. Light/dark
roles may differ from the selected seed; the seed remains available as shade
500. CSS still owns the neutral surfaces and preset defaults; the generator
only calculates user-derived values.

Button text, hover text and accent text use a 4.6:1 solver target above the
WCAG 2.x 4.5:1 minimum. Primary/link
colors also meet 4.5:1 against the neutral surfaces. Focus rings target 3.1:1 above the 3:1 minimum,
including the components' existing 50% opacity over neutral/accent surfaces.
Checks use rounded 8-bit output colors and unrounded ratios. These checks cover
the generated role pairs on Evenform's current surfaces; they do not establish
whole-page WCAG conformance or cover arbitrary colored backgrounds, opacity
utilities, images, or consumer overrides. Status/chart colors remain separate.
See [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

`npm run verify:palette` verifies 1,212 colors (including white, black, yellow,
cyan, saturated colors and a deterministic random sample) in both themes.
Lowest measured ratios: button text 5.2159:1, accent text 4.6000:1, hover text
6.1166:1, half-opacity focus 3.100007:1. The test also checks HEX validation,
known contrast references and every generated CSS value.

The chosen seed and generated CSS variables persist with local preferences.
The preference bootstrap restores the generated variables before React starts;
it validates color names and HEX values rather than duplicating the algorithm.
Export includes the full ramp and both light/dark role sets. It still requires
`appearance.css` and `data-palette="custom"` as noted in the exported comment.

## Theme scope

Primary applies to actions/links, checked controls, progress/meter fills and the
filled portion of Rating (`--ds-rating-selected-color` can override it). Accent
pairs cover selections, active navigation and highlighted options. Tabs use
primary labels/line indicators while keeping their raised neutral surface.
Pagination links and button controls, Toggle, selected table rows (including
pinned cells), range interiors, page navigation, Select and Mention options now
follow those roles. Token-editor range inputs also follow primary. Transfer
hover preserves an existing selection.

Selected containers remap muted supporting copy to the accent foreground; this
prevents a neutral caption from losing contrast on a tinted selection. Mention
adapters explicitly replace the vendor's utility colors with component-local
variables, keeping state colors and consumer utility overrides compatible.

Ordinary text/backgrounds/borders, secondary actions and unselected chips remain
neutral. Destructive/success/info/warning colors, chart categories, syntax,
images/brand assets, gradient/color editor values and user-provided styles are
independent. A theme preset is not a recoloring filter over the whole page.

The source audit and real-component fixture are recorded under ignored
`evidence/theme-scope-audit/`. Neutral, Teal and Custom were checked in both
modes; selection fills agree across Toggle, pagination, table and date range,
while status/chart colors stay stable within each mode. Mention keyboard
suggestions and Select portals were also exercised.

## Elevation

| Preset | Controls (Tabs) | Raised surfaces (Sidebar / Inset) | Popup | Modal | Persistent cards |
| --- | --- | --- | --- | --- | --- |
| Flat | No visible shadow | No visible shadow; boundary remains | No shadow; boundary remains | No shadow; boundary/backdrop remains | No shadow |
| Soft | Original small shadow | Original small shadow | Existing shared shadow | Same shared shadow | No shadow |
| Layered | Small shadow | Moderate surface shadow | Two soft, offset shadows | Larger offset/spread than popup | No shadow |

`--ds-elevation-control` and `--ds-elevation-surface` extend the preference to
in-page controls and raised layouts. Tabs and Sidebar variants consume these
through optional component tokens (`--ds-tabs-shadow`, `--ds-sidebar-shadow`,
`--ds-sidebar-inset-shadow`). Line Tabs remain flat in all presets. Flat uses a
transparent zero-size shadow for these Tailwind-composed shadows so border and
keyboard focus rings remain valid. It does not remove all `box-shadow` values
indiscriminately.

FullCalendar's class callbacks add semantic classes for selected/dragged events
and the portal popover. Their shadows now use control/popup tokens; the portal
also receives the shared calendar theme variables, background and boundary.
The adapter does not depend on the vendor's generated class names. Its caller
class overrides remain available through the existing FullCalendar options.

`--ds-elevation-popup` and `--ds-elevation-modal` are semantic levels.
`--ds-shadow-overlay` remains a compatibility alias for existing floating
components. Dialog/Sheet/AlertDialog can override `--ds-dialog-shadow` locally.
Dark Layered uses stronger shadow opacity and a lighter popover surface; shadow
alone is difficult to see against a dark canvas. Layout, z-index, focus rings,
modal backdrops and interaction contracts are independent of this preference.

Inspection found that Dialog and Select's utility ring declarations overrode
the component-layer shadow declaration. This branch changes their hairline
boundary to a border so the shadow token can take effect without overriding
consumer utilities. This makes Soft's intended shadow visible on those two
components as well; it is a small rendering difference from main, even though
Neutral + Soft is the closest baseline. This is a reason to review the branch
before merging, rather than assuming exact pixel equivalence.

The lab places settings beside a live workspace form. General contains the
common appearance presets; Tokens exposes all 41 numeric controls, with six
advanced groups collapsed initially; Export provides CSS copy, inspection and
reset. The lab and global panel share the token editors and export behavior.
Editor IDs are unique when both surfaces are mounted. Long token groups scroll
within the settings pane while the category tabs and preview remain available.

A floating action bar is always visible in the preview and uses the same popup
elevation token. Its actions focus the workspace field or open the real dialog.
Popover, Select and Dialog also expose the selected depth on interactive
surfaces. A popover stays open while a setting is changed.
Flat retains a boundary; Layered leaves persistent cards grounded.

## Preferences and adoption

Palette and elevation persist alongside density and numeric overrides under
the existing Showcase storage key. The parser-blocking bootstrap restores them
before the first paint. Switching density preserves palette/elevation; Reset
restores Neutral / Soft / Compact. Starter retains its own preference key.

The token export includes the selected HTML attributes and explicitly requires
`src/styles/appearance.css` after the base theme. It does not embed a second
manually maintained palette copy. When adopting the branch's theme presets,
copy/include this CSS file together with the normal design-system styles.

## Review recommendation

Keep Neutral + Soft as defaults. Treat theme color and elevation as independent
axes rather than bundling them into named visual themes. Indigo is a natural
first colored preset alongside the existing logo; Teal and Rose demonstrate
that the mapping is reusable. Prefer preset depth levels over a continuous
"shadow intensity" slider: each tier can coordinate blur, offset, opacity and
dark surface contrast while maintaining the popup/modal hierarchy.

The theme-scope review applies brand tint to links, active tabs and table
selections as described above. GUI regression covered all component, pattern,
chart and application-example routes, with representative interaction checks
and additional 390px / 596px responsive checks. The latter found and corrected
a crowded mobile header and an intrinsic grid-width overflow in the dashboard.
This is representative coverage, not every component/state combination or a
full accessibility audit. File upload, clipboard copy and actual CSV downloads
were not exercised in that GUI round.

This branch intentionally does not recolor all typography, illustrations,
chart categories, third-party editor internals or status messages.

## Independent control sizing

The existing desktop density presets already render default buttons and inputs
at 32px (Compact) and 40px (Comfortable), both with 14px text. The Inspector's
radio-option labels originally used fixed padding, so they did not reflect
those height changes. They now use the shared control height/padding tokens,
including in the Inspector and the lab.

The experimental Control size setting is independent of page spacing:

| Control size | Default height | Control text | Default icon | Horizontal inset |
| --- | --- | --- | --- | --- |
| Follow density | 32px / 40px | 14px | 16px | Density default |
| Small | 28px | 13px | 14px | 10px |
| Medium | 36px | 14px | 16px | 12px |
| Large | 44px | 15px | 18px | 16px |

These values live only in `src/styles/control-sizing.css`. Button variants,
inputs, select triggers/items, textareas, tabs and compound-input geometry use
the corresponding semantic parameters. Body copy, headings and compact
indicators such as checkbox/switch glyphs are not scaled as page zoom.
Explicit component or utility overrides retain priority.

On coarse-pointer devices, the existing 44px minimum target remains in force
for supported controls and the lab's radio-option labels, so Small/Medium may
have the same outer height while text and padding still differ. This safety
floor is not a bug to remove merely to make presets look different.

`data-control-size` persists and is restored before paint. Changing control size
clears only dependent numeric geometry overrides so stale input/button heights
do not silently block the preset; unrelated overrides are retained. Changing
layout density preserves explicit control size. Reset restores Follow density.
Token exports list both experimental CSS files and the selected root attributes.
The lab keeps implementation measurements and design rationale out of the
visible preview; developer verification results stay in the audit evidence.

## Chart tooltip integration

The audit found VChart tooltips hard-coded a transparent zero shadow, so
Layered did not affect them. The adapter now reads the resolved CSS popup
shadow (or `--ds-chart-tooltip-shadow` when intentionally overridden). VChart
supports one shadow, so the adapter maps the last/outermost CSS shadow layer;
it does not mirror preset pixel values in TypeScript. Flat remains shadowless.
Root preference-attribute changes are explicitly observed rather than relying
on a density write as a side effect.
