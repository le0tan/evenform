# Motion

Evenform uses motion for selection, spatial continuity and action feedback. It
keeps the Nova appearance, CSS token hierarchy and mature interaction primitives.
There are no page transitions, section entrances, hover lifts or automatic Card
animations. [Try the interactive examples](https://le0tan.github.io/evenform/#components/motion)
after this change is deployed; locally open `/#components/motion`.

## Review of main before implementation

Reviewed against main `121066ea7823bcec4788cb048e57c5d0d47f81c3`, fetched on
2026-10-22. This is an extension of the existing system, not a replacement.

| Area | Existing behavior | Decision |
| --- | --- | --- |
| Button | Fast token, ease-out; 1px press on ordinary buttons | Preserve press distance; transition the actual `translate` property and allow a local duration override |
| Accordion / Collapsible | CSS height transition from Base UI measured panel height; tokenized chevron | Preserve; no custom presence or height measurement engine |
| Popover / Menu / PreviewCard / Combobox | Shared fast fade/0.98 scale; interruptible CSS | Keep structure; replace scale literal with shared semantic and centralize popup timing |
| Dialog / Select / Tooltip | 100ms / animation-utility defaults, 95% scale and directional utility distances | Replace with shared CSS transitions and Base UI starting/ending styles |
| Sheet / Sidebar | Fixed 150/200ms, ease-in-out/linear, 2.5rem Sheet displacement | Tokenize; keep directional Sheet movement at three enter distances |
| Toast / Tree chevrons / Scrollbar | Tokenized opacity/transform and swipe behavior | Preserve; Toast entrance distance now follows the motion semantic |
| Tabs | Background/line moved instantly between triggers | Opt-in persistent Base UI Indicator, no separate selection store |
| CopyButton | Immediate loading, replaced text/icon, changing intrinsic width | Reuse controlled FeedbackButton with reserved faces and delayed loading visibility |
| SortableList | React Aria pointer/touch/keyboard collection DnD | Optional native layout continuity after state changes; retain the interaction engine |
| Skeleton / Spinner | Indeterminate progress cycles | Keep their own cycle semantics; reduced motion stops/reduces these cycles |
| Static content, form values, page routes, virtual rows | Immediate updates or engine-owned layout | No added animation or global entrance choreography |

## Token contract

CSS is the only source of visual defaults. `src/styles/tokens.css` defines the
shared parameters; `src/styles/motion.css` maps them to state semantics in the
components layer. No JavaScript/JSON copy of durations, distances or curves exists.

| Shared token | CSS default | Use |
| --- | --- | --- |
| `--ds-duration-fast` | `140ms` | Button feedback, floating popups, first Tooltip entrance, modal exits, Toast, chevrons |
| `--ds-duration-standard` | `200ms` | Tabs indicator, Dialog/Sheet entrance, disclosure height, list continuity, loading replacement |
| `--ds-ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Shared deceleration without overshoot |
| `--ds-motion-enter-distance` | `6px` | Tooltip offset, Dialog entrance, Toast; Sheet uses three times the distance along its edge |
| `--ds-motion-enter-scale` | `0.98` | Floating popup and Dialog entrance/exit |

No slow duration or additional easing preset is necessary for these short
interactions. Colors, selected surfaces, radius, density, control size and
elevation continue to come from their existing tokens.

### Global configuration

Appearance lab → **Tokens → Motion** and the global Design tokens panel share
four controls: Fast duration, Standard duration, Enter distance and Enter scale.
The duration sliders use milliseconds; scale is unitless. Reset clears overrides,
and returning a slider to its current CSS fallback removes the redundant entry.
Changing density clears only density-dependent geometry. Independent Motion
settings persist and export under global `:root`, so both densities share them.

```css
/* Import after Evenform's shared styles. */
:root {
  --ds-duration-fast: 120ms;
  --ds-duration-standard: 180ms;
  --ds-motion-enter-distance: 4px;
}
```

The editor resolves `px` via length measurement, unitless scale/leading via a
1px-font line-height probe, and `ms` via computed transition-duration. This
supports CSS aliases and `calc()` without treating time as width. Overrides
persist under the existing `evenform-tokens-v1` key. The parser-blocking
`public/evenform-init.js` restores validated time strings before React starts,
and continues to accept the legacy numeric format. CSS export preserves each
unit and records only overrides. Keep that bootstrap when adopting persistence.

### Local configuration

Component overrides resolve on the actual animated element, falling back to the
shared semantic: `--ds-button-duration`, `--ds-popup-duration`,
`--ds-dialog-duration`, `--ds-sheet-duration`, `--ds-tabs-duration`,
`--ds-list-duration`, `--ds-popup-enter-scale` and `--ds-toast-enter-distance`.
For example:

```tsx
<TabsList motion="slide" style={{ "--ds-tabs-duration": "160ms" } as CSSProperties}>
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="activity">Activity</TabsTrigger>
</TabsList>
```

Pass an override to the popup itself when it is portalled; custom properties on
only the trigger's parent do not cross a Portal. Root overrides apply everywhere.
Ordinary utility/inline overrides can deliberately replace component styling.

## Components and behavior

### Tabs

`TabsList motion="slide"` opts into a single persistent `Tabs.Indicator` per
list. `motion="none"` remains the default, preserving the existing API and
immediate selected surface. Both Default and Line variants, horizontal and
vertical orientations, controlled/uncontrolled values, null values and Base UI
keyboard activation stay with the primitive. Appearance lab and the real Workspace view switcher use the opt-in style after
visual validation. Workspace also opts its reorderable checklist into list motion.
The reusable Tabs and SortableList defaults remain unchanged.

CSS transforms track the primitive's active-tab coordinates; bounded absolute
indicator width/height transitions accommodate unequal labels without scaling
text. CSS interrupts from the current interpolated position. Geometry updates
come from Base UI, not a per-frame application measurement loop, shared layout ID
or cross-instance global state. Custom nested trigger markup still needs checking
against the underlying primitive's layout contract.

### Tooltip and overlays

TooltipProvider defaults to a **200ms initial hover delay** and **400ms group
warm window**, with all Provider props still configurable. These are interaction
timers, not visual design defaults. Base UI cancels early departures and handles
warm switching, focus and Escape. Showcase Tooltip groups contain only
non-interactive descriptions. Formatting help uses an explicit, focusable Popover
for its action link, accessible by click, keyboard or touch. Its `data-instant` focus,
dismiss and group transitions remain instant. Do not duplicate its state machine
or add redundant ARIA naming over the primitive's current accessibility contract.

Floating popups fade with a very small scale. Tooltips fade and translate toward
their trigger. Dialogs use the standard duration with a small offset/scale, exits
use Fast; Sheets move from the correct edge. Item-aligned Selects omit scaling to
retain the selected-row anchor. Accordion/Collapsible retain height transitions.
Base UI continues to own portals, presence/unmount, focus traps/restoration,
outside interaction, Escape, controlled state, ARIA and scroll locking.

### FeedbackButton / CopyButton

`FeedbackButton` composes Button with `state="idle" | "loading" | "success" |
"error"`, optional loading/success/error labels, icon and status message. All
faces occupy the same grid cell and reserve the widest label's footprint;
Inactive faces are hidden immediately and the incoming face fades in without changing button width. Labels never paint on top of each other, including when a copy finishes before the loading delay. Choose concise
labels appropriate to the available space. Explicit button size/variant/render
props remain available. A loading state is immediately `aria-busy` /
`aria-disabled`, while its visual face appears after `loadingDelay` (150ms by
default), so short work does not flash a spinner. Focus remains available.

The consumer owns submission, an in-flight guard, completion, error and retry.
The button blocks click handlers while controlled state is loading; it is not an
async task manager or a substitute for request deduplication. `CopyButton` reuses
this presentation, retains its synchronous pending guard, Clipboard handling,
success reset and unmount cleanup. Errors announce the supplied `errorLabel` and
offer a short Retry copy face. Custom children remain the visible label.

### SortableList

`<SortableList motion ... />` opts into native Web Animations for a **non-virtual**
collection. It uses stable keyed DOM identities, batches rectangle reads before
writes, and FLIPs rows with the independent `translate` property. A second update
includes the currently drawn offset rather than restarting at the previous
endpoint. Inserted rows fade; removed rows leave immediately and remaining rows
move into place. Exit clones are intentionally absent: no duplicate IDs, stale
focus targets or detached accessible content.

React Aria retains pointer, touch, keyboard DnD, DropIndicator, move buttons and
focus. Active dragging suppresses our layout animation; CSS transforms used by
the drag engine are never replaced. Width changes snap to a new baseline.
Observers, media listeners and animations are disconnected/cancelled on unmount.
Unsupported Web Animations browsers fall back to immediate layout. Do not attach
this hook to VirtualList or another engine that owns row positioning.

`src/lib/motion.ts` reads the **effective element-level CSS** time/curve through a
computed-style probe immediately before a layout update. It resolves aliases and
`calc()` and adds no numerical duration fallback. No persistent frame loop runs.

### LoadingSwap

`<LoadingSwap ready={ready} skeleton={...}>…</LoadingSwap>` overlaps placeholder
and content in one grid cell, reserves the larger footprint, crossfades and
announces busy/completion. Hidden content is inert. There is no minimum wait
before completed content can be used. Supply a suitable skeleton/minimum height
for genuinely unknown content; no generic component can reserve an unknown final
document height. It does not fetch data or impose a global loading framework.

## Reduced motion and boundaries

System `prefers-reduced-motion: reduce` shortens CSS transitions to effectively
instant changes, removes overlay displacement/scale, limits indeterminate cycles,
and bypasses/cancels JavaScript layout animations. Selection, busy/result text,
content and focus remain usable. A local `data-motion="reduce"` subtree supports
the Showcase comparison and optional local reduction; it cannot force motion
back on when the system asks to reduce it. Portal examples use the system
preference rather than pretending local DOM ancestry crosses a portal.

CSS transitions handle hover, press, selection and popup reversal. Web Animations
is limited to opt-in list layout. Motion for React and AutoAnimate were evaluated
but are **not installed**: Base UI already supplies selection geometry, and the
remaining non-virtual list needs a small native animation adapter. Starter does
not import FeedbackButton, list motion or the lazy Motion gallery unless a
consumer chooses them. Shared CSS is still part of the full stylesheet.

### Morphing Popover (opt-in)

`MorphingPopoverContent` in `components/patterns/morphing-popover` composes the
ordinary `PopoverContent`. Pass a ref shared with its `PopoverTrigger`:

```tsx
const trigger = useRef<HTMLButtonElement>(null)

<Popover>
  <PopoverTrigger ref={trigger} render={<Button variant="outline" />}>
    Edit project
  </PopoverTrigger>
  <MorphingPopoverContent anchorRef={trigger} align="start">
    <PopoverTitle>Edit project</PopoverTitle>
    <Input aria-label="Project name" />
    <PopoverClose render={<Button />}>Save project</PopoverClose>
  </MorphingPopoverContent>
</Popover>
```

A decorative surface transitions from the measured trigger rectangle to the
positioned popup. The popup and its text never scale. CSS transitions reverse
from their current visual state when interrupted; Base UI still owns presence,
Portal, collision positioning, controlled state, Escape, outside dismissal and
focus restoration. Its opacity transition also keeps the popup mounted through
exit. Geometry observers disconnect on unmount; a single style read establishes the measured origin before expansion, with no per-frame measurement loop. The scrollable content retains
the available viewport height.

`--ds-morph-duration` falls back to `--ds-duration-standard`; surface color,
radius and elevation use the ordinary Popover tokens. At widths up to 40rem,
and with Reduced Motion, the surface remains unscaled and uses the normal fade.
The ordinary Popover has no morph by default. The optional component accepts
ordinary content props except `render` and function children, because its own
content wrapper keeps text separate from the animated surface.

### Reset acknowledgement

`ResetButton` composes the existing Button and Lucide reset icon. Each successful
click advances a finite icon rotation using Standard duration and the shared
curve. Repeated clicks retarget the current rotation. It announces completion
in a live region, including with Reduced Motion. Appearance lab and the token
export panel use the same control; neither simulates an asynchronous task.

## Coverage review and adoption

| Component | Current behavior and decision |
| --- | --- |
| Navigation Menu | Fast content fade and bounded popup width/height transitions use Base UI's measured size variables. Native hover/keyboard, activation direction, interruption and presence remain with the primitive. No extra route-selection indicator: opened menus are not Tabs. |
| Toast stack | Existing enter/exit/swipe behavior remains. Expanded notifications use Base UI's measured offset/index for Standard transform continuity on insertion/removal; no collapsed-card redesign or JS animation engine. Viewport height follows measured toast heights to retain hover/focus pausing. |
| Switch | Existing color and thumb transitions already resolve shared Fast timing; retain them. |
| Checkbox | Existing Fast color transition and immediate checkmark communicate the binary state clearly; retain them. |
| Radio | Add the same Fast color/border transition as Checkbox. Keep its small dot immediate. |
| Progress | Existing determinate width transition uses shared CSS timing. Preserve it without introducing a loop, overshoot or artificial delay. |
| Tabs / SortableList | Compatibility defaults remain no-slide / no-layout-motion. Workspace opts into both, so the gallery is not their only live use. Tabs is a good candidate for broader adoption after product feedback; list motion belongs on explicit reordering tasks, not every list. |

The list observer coalesces DOM mutations into one frame and compares stable row
identities, order and unanimated coordinates before changing an animation. Text
or status changes that leave layout intact preserve the current Animation and
its timeline; rows unaffected by another row's movement also continue. Starting
a React Aria drag cancels optional layout animations. Fast subsequent reorders
retarget from current drawn positions, and Reduced Motion cancels in-flight work.
A true text reflow can legitimately move neighboring rows and animate that change.

Useful future coverage: virtualized/windowed collection adapters and cross-list
DnD need separate positioning contracts; neither is covered by this non-virtual
SortableList hook. Anchored/multi-region toast composition and dynamic nested
navigation content deserve targeted checks when a consuming product uses them.
There is no demonstrated need for global page transitions or card entrances.

Targeted review commands:

```sh
node scripts/verify-motion-review.mjs
node scripts/verify-motion-review.mjs --webkit
node scripts/record-motion-demo.mjs
```

The WebKit command uses Playwright's local engine, not the Safari application
or a claim of complete iOS hardware coverage. Both engines check density/export,
mutation stability during reorder, keyboard drag cancellation, rapid moves,
Reduced Motion, actionable formatting help, navigation and Toast continuity.
The existing `verify:motion` keeps pointer/keyboard reorder and overlay coverage.
Generated reports, screenshots and the short interaction video stay under ignored
`evidence/motion-review/`; they are not shipped with Starter.

## References and licensing

Reviewed 2026-10-22. These are behavioral/architectural references, **not copied
component sources or installed dependencies**:

- [interior.dev](https://github.com/ddoemonn/interior/tree/b6b272307464ba79db7183cee0515846d7eb1f9c/components/interior): segmented selection, tooltip warm groups, stable loading faces, skeleton replacement; MIT. Evenform uses Base UI behavior and its own CSS/controlled presentation.
- [Motion Primitives](https://github.com/ibelick/motion-primitives): Animated Background's instance isolation and Morphing Popover coordination; [MIT](https://github.com/ibelick/motion-primitives/blob/main/LICENCE.md). The docs host returned 403 during this review; the official repository was used instead.
- [Animate UI Base UI Tabs documentation](https://animate-ui.com/docs/primitives/base-ui/tabs): primitive/animated-part separation. Its [license](https://github.com/imskyleen/animate-ui/blob/e6cea6b5ae5a4985d3bf3cc0ebea173555eafd72/LICENSE.md) is MIT **with a Commons Clause restriction**, not unrestricted MIT. No source or bulk replacement commands are used.
- [GodUI motion guidelines](https://godui.design/docs/guidelines/motion): transform/opacity, FLIP interruption and reduced motion. Guidelines only; no code or assets reused. Disclosure height transitions remain appropriate here.
- [FormKit AutoAnimate](https://github.com/formkit/auto-animate), [MIT](https://github.com/formkit/auto-animate/blob/master/LICENSE): collection identity and add/remove/reorder continuity. No dependency or source reuse.
- [Base UI animation](https://base-ui.com/react/handbook/animation), [Tabs](https://base-ui.com/react/components/tabs) and [Tooltip](https://base-ui.com/react/components/tooltip): installed primitives and current animation/presence contracts. Existing upstream notices remain required.
- [Motion for React](https://motion.dev/docs/react): evaluated for shared layout; not selected for this scope.

See [license audit](license-audit.md), [third-party notices](../THIRD_PARTY_NOTICES.md)
and [dependency boundaries](dependencies.md). Reference-only study does not add a
vendored-code license obligation or make restricted components safe to copy.

## Verification

Run the local server and `npm run verify:motion`. The targeted Playwright check
records actual animation frames/progress, rapid state changes, grouping and
keyboard/focus behavior, token propagation, persistence/export/reset/bootstrap,
layout reservations and reduced motion. It saves a JSON report, screenshots and
video under ignored `evidence/motion/`. Static screenshots verify layout; they do
not establish motion continuity on their own. Run typecheck, lint, navigation,
Showcase and standalone Starter builds as documented in [development](development.md).
