# Appearance

[Appearance lab](https://le0tan.github.io/evenform/#appearance) provides settings
beside a live workspace preview. These settings are available on main and in
the deployed Showcase. The **Design tokens** panel exposes the same controls
from other pages.

## Choose a configuration

| Setting | Choices | Default |
| --- | --- | --- |
| Mode | Light, Dark, System | Light on a fresh profile |
| Density | Compact, Comfortable | Compact |
| Control size | Auto, Small, Medium, Large | Auto |
| Theme color | Neutral, Indigo, Teal, Rose, Custom | Neutral |
| Elevation | Flat, Soft, Layered | Soft |

**General** contains these choices. **Tokens** contains seven primary sliders
plus a Motion group (Fast/Standard duration, enter distance/scale) and six advanced
groups for layout, controls, forms, data, overlays and typography.
**Export** provides CSS inspection, copying and reset. On wide screens, the
settings pane scrolls independently while the preview stays available; narrow
screens stack settings above the preview.

The preview includes a workspace form, floating action bar, Select, Popover
and Dialog. Settings apply throughout the Showcase, including portal content.
**Reset to Evenform defaults** restores Compact / Auto / Neutral / Soft and
clears numeric overrides. Mode is managed separately and keeps its selection.

## Theme color

Presets are defined in `src/styles/appearance.css`. `data-palette` on the HTML
root selects Neutral, Indigo, Teal, Rose or Custom. Primary colors apply to
main actions, links, checked controls, progress and Rating fills. Accent colors
apply to selected rows, navigation, highlighted options and calendar ranges.
Tabs use primary text and line indicators with a neutral raised surface.

Ordinary content, page backgrounds, cards and general borders stay neutral.
Success, warning, error and chart categories retain their own semantics;
syntax colors, brand artwork and user-selected content colors remain independent.
Component-specific tokens and deliberate utility overrides still take priority.

### Custom colors and contrast

Custom accepts a native color-picker selection or a 3/6-digit HEX value. The
generator in `src/lib/theme-palette.ts` produces an 11-step sRGB tint/shade ramp
(50–950), keeping the seed at 500, and solves separate light/dark semantic roles
against the CSS neutral surfaces. This interpolation is not a perceptually
uniform OKLCH scale. The usable role colors may differ from the selected seed.

Text on primary, hover and accent fills targets at least 4.6:1. Primary/link
colors also meet 4.5:1 against the supported neutral surfaces. Focus colors
target 3.1:1, including the components' 50% ring opacity. The checks use rounded
8-bit output colors and unrounded ratios. See [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

`npm run verify:palette` checks 1,212 seeds in both themes. These checks cover
the generated role pairs on Evenform surfaces; they do not establish whole-page
WCAG conformance or cover arbitrary colored backgrounds, images, opacity
utilities or consumer overrides. Verify the final UI in its actual context.

## Elevation

| Preset | Controls | Raised layouts | Popups / modals | Persistent cards |
| --- | --- | --- | --- | --- |
| Flat | No visible shadow | No visible shadow | Boundary/backdrop, no shadow | No shadow |
| Soft | Small shadow | Small shadow | Shared soft depth | No shadow |
| Layered | Small shadow | Moderate shadow | Stronger popup depth; greatest separation for modals | No shadow |

The shared levels are `--ds-elevation-control`, `--ds-elevation-surface`,
`--ds-elevation-popup` and `--ds-elevation-modal`. Tabs and raised Sidebar
variants consume the first two; line Tabs remain flat. Select, menus, Popover,
Dialog, Sheet and other overlays use popup/modal levels. FullCalendar selected
or dragged events and its portal popup use these semantics as well.

Borders, focus rings, status outlines and z-index are independent of decorative
depth. Flat retains those cues; Layered does not add shadows to ordinary cards.
Dark Layered also lightens the popup surface. Optional component overrides
include `--ds-tabs-shadow`, `--ds-sidebar-shadow`, `--ds-sidebar-inset-shadow`
and `--ds-dialog-shadow`. `--ds-shadow-overlay` remains a compatibility alias.

VChart tooltips read the resolved popup shadow, or an explicit
`--ds-chart-tooltip-shadow`. VChart supports a single shadow, so the adapter
maps the outermost CSS shadow layer rather than duplicating preset values in
TypeScript.

## Control size and density

Density changes page spacing and the default control height. Control size can
follow it or override the control scale independently:

| Control size | Default height | Text | Default icon | Horizontal inset |
| --- | --- | --- | --- | --- |
| Auto | 32px Compact / 40px Comfortable | 14px | 16px | Density default |
| Small | 28px | 13px | 14px | 10px |
| Medium | 36px | 14px | 16px | 12px |
| Large | 44px | 15px | 18px | 16px |

These defaults live in `src/styles/control-sizing.css`. Button variants derive
relative heights from the selected scale. Inputs, Select triggers/options,
Textareas, Tabs and compound inputs use the corresponding semantic parameters.
Body text, headings and small indicators are not scaled as page zoom.
Supported controls retain their 44px minimum target on coarse-pointer devices;
Small/Medium may share the same outer height while padding and text differ.

Changing density clears numeric overrides and preserves explicit control size,
palette and elevation. Changing control size clears only dependent geometry
overrides. Moving a slider back to its current CSS-derived value removes the
redundant override, its dot and its exported entry. CSS remains the source of
preset values; editor metadata does not duplicate their defaults.

Motion parameters use the same overrides, persistence, redundant-value removal,
reset and export paths. Durations are read through computed CSS time properties
and exported as `ms`; scale is unitless. See [Motion](motion.md) for component
semantics, local overrides and reduced-motion behavior.

## Preferences and adoption

Showcase uses `evenform-theme` and `evenform-tokens-v1` in browser storage.
The latter holds density, control size, palette, custom seed/generated color
variables, elevation and numeric overrides. The synchronous head script restores
validated values before React starts. ThemeProvider handles mode and resolved
System theme separately. Starter retains its own `app-theme` / `app-density`
keys and does not include the Showcase editors.

The repository's `src/index.css` already imports the appearance and sizing
styles. Existing applications adopting selected modules must include those
shared CSS files after the base theme. Copying the exported overrides alone
does not include the preset rules. The export lists the needed imports and
HTML attributes, for example:

```html
<html data-density="compact" data-control-size="auto"
      data-palette="teal" data-elevation="soft">
```

Import product overrides after shared styles. Custom exports include the full
ramp and both light/dark role sets and require `data-palette="custom"`.
Keep the bootstrap and provider storage keys/default mode aligned if the host
persists these preferences. Do not import Playground state into product components.
See [Getting started](getting-started.md) and [DESIGN.md](../DESIGN.md) for the
component, cascade and host-integration contracts.
