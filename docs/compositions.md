# Composing collections and reports

Locally open `/#patterns/records` for the **Record browser** example in
[src/playground/record-browser.tsx](../src/playground/record-browser.tsx).
It uses illustrative documents, without product APIs or persistent data.

The example combines HeaderShell, FilterBar, a grid/list view and a report Sheet.
Search, collection/category filters, export, copying, panel expansion and empty
results work in the preview. State stays in Showcase. Adopt the structure and
replace the records and actions with your product behavior.

## Mixed controls

Use `TabsList size="control"` in a horizontal toolbar beside default Input,
SelectTrigger and Button. Its outer box follows `--ds-control-height` (32px in
Compact, 40px in Comfortable with Auto sizing), instead of adding the list inset
to a full control-height trigger. Default Tabs keep their existing navigation
spacing. Vertical lists also keep their original trigger contract.

```tsx
<Tabs defaultValue="grid">
  <TabsList size="control" motion="slide" aria-label="Document view">
    <TabsTrigger value="grid">Grid</TabsTrigger>
    <TabsTrigger value="list">List</TabsTrigger>
  </TabsList>
  <TabsContent value="grid">{/* grid */}</TabsContent>
  <TabsContent value="list">{/* list */}</TabsContent>
</Tabs>
```

`--ds-tabs-control-height` overrides that outer sizing target;
`--ds-tabs-inset` and `--ds-tabs-trigger-height` remain intentional component
escapes. Tall content may expand the list. On coarse pointers every trigger
retains a minimum 44px target; inset makes the outer list taller than 44px.
Do not shrink those targets to force touch controls onto one line.

## Sheet header with actions

Turn off the independently positioned default close button, then compose the
existing SheetClose in the same row as your other actions. Keep a SheetTitle,
a named close action and SheetBody so focus/presence and scrolling remain with
the primitive. No extra header component is required.

```tsx
<SheetContent showCloseButton={false}>
  <SheetHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start">
    <SheetTitle className="wrap-anywhere">{longTitle}</SheetTitle>
    <div className="flex items-center gap-1" role="group" aria-label="Report actions">
      {/* Labeled copy, download and expand buttons */}
      <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close report" />}>
        <X />
      </SheetClose>
    </div>
    <SheetDescription className="col-span-full">{recordId}</SheetDescription>
  </SheetHeader>
  <SheetBody>{/* report */}</SheetBody>
</SheetContent>
```

On narrow screens, the example puts all four actions together above the title
so a long title does not squeeze their targets. It keeps the title complete.
Its CSS stays local to Showcase; choose truncation or wrapping for the actual
reading task. Copy/download require the corresponding browser capabilities.

## Main content inside a disclosure

AccordionContent inherits the surrounding text color. It does not decide that
all collapsed content is secondary. For an auxiliary disclosure use
`<AccordionContent className="text-muted-foreground">`. Existing consumers that
relied on the old muted default should add that class intentionally.

Keep long reports across the available width, separate from short metadata.
The example uses a focusable, labeled scroll region around its wide Table and
sets a local 40rem reading width. The shared Table already supplies an overflow
wrapper; here only the outer region scrolls, allowing keyboard reading. If an
application handles global arrow keys, it must ignore events from this region
and other nested interactive controls. Evenform registers no global report
shortcuts.

## Adoption

For this example use `core.css` plus `workflow-aids.css` (HeaderShell) and
`utility-aids.css` (CopyButton), with the transitive local imports of each part.
The [dependency map](dependencies.md#base-entry-and-common-adoption-map) explains
source, CSS, npm and license boundaries. Keep product overrides after shared
styles. Copying the whole Showcase is unnecessary.

## Operational review: one selection, several views

Open `/#patterns/operations`. The anonymous
[operational example](../src/playground/operations-example.tsx) composes existing
DetailLayout, independent Cards, Stat/StatGroup, Badge, Table, Button, Tooltip
and native disclosures. Its [sample model](../src/playground/operations-model.ts)
and path rules stay in Showcase; neither is a shared topology or monitoring API.
The sample selector exposes a dominant contribution, recorded zeros, all-unknown
observations and near-100% rounding. No product identifiers or responses are used.

The compact summary leads with the review exception, then the current path's
known total and missing-observation count. The workspace and inspector have
separate contours and a shared gap; the heading and Tabs sit outside both.
Existing DetailLayout provides the responsive columns. Local Stat tokens adjust
columns and value sizes without adding a layout API.

### Readable contribution strip

Each strip segment is a real Button with an **8rem minimum width**. Flex starts
with that minimum for every segment and distributes leftover space by its real
share of the known total. If the minimums do not fit, only this region scrolls.
The amount, category and percentage stay inside the target. A 99.8% contribution
and a contribution below 0.01% are both operable with the pointer and keyboard.

This is an operational selection strip with adjusted widths, **not a strictly
proportional chart**. Its visible and accessible note states that distinction.
No fabricated share, minimum numeric contribution or inflated chart data is
passed to EvenformChart. If a product needs an exact proportional graphic, use
EvenformChart with the original amounts, plus a full-size exact list as its
selection alternative. Do not put an invisible clickable layer over subpixel
chart marks: coordinate rounding can select a neighbor even with correct labels.

The strip, desktop Table, identity-first mobile comparison and inspector all use
one contribution model and selected ID. Nonzero values below 0.01% show `<0.01%`;
a value just below 100% shows `>99.99%`, rather than rounding a non-whole share to
100%. Known zero stays zero; unknown observations are excluded from the sum.
An all-unknown total stays unknown, rather than becoming a synthetic zero. Zero
and all-unknown totals replace the strip with different empty states and retain
the precise records. An existing entity with a null observation still opens its
inspector. A missing entity has a labeled placeholder and disabled selection in
the workflow and both comparison views; it never renders an enabled dead action.

Selection reveals only the relevant horizontal region with an explicit instant
scroll, preserving the initiating focus and vertical reading position. The
workflow reveals the selected item itself; selecting Validation rules must not
scroll that trigger away to reveal its linked owner. The contribution-only strip
can reveal the related owner because it has no context segment. A compact
check slot beside the category keeps selection feedback from changing layout.
The recipe excludes itself from browser scroll anchoring. There is no animated
scrolling in either normal or reduced motion; instant scroll also overrides a
host's smooth-scroll CSS. Existing CSS reduced
motion paths still apply to Button transitions. Only **Inspect selection**
intentionally moves focus to the inspector heading.

### Parallel entries and shared downstream work

Both compact path summaries show their own known totals. They overlap on shared
downstream work and must not be added together. The workflow has a unique node
set, including two alternative entries; the analysis shows the active path once.
Choosing an entry changes the path. Choosing a shared node preserves the active
path. Changing the summary preserves a shared selection, or replaces a previous
entry selection with the newly active entry.

`pathItems` filters mutually exclusive entries **before** `contextOwner` resolves
containment and fallback. The same context can therefore belong to Collection's
entry or Import's entry without a first-owner lookup across both paths. The
refresh action exercises unchanged, changed and absent relationships. The owner
gets a dashed linked border and a link icon; only the selected item has
`aria-pressed=true`. Manually closing a context survives an unchanged refresh;
a new relationship reveals its context, and an absent owner clears the marker.
These rules are an illustrative host policy, not a universal graph API.

### Cascade and legal interactive compositions

A components-layer rule loses to a utility even when its selector is more
specific. Button ships utilities for background, border and `items-center`.
The recipe intentionally overrides them at the call site:

```tsx
<Button
  variant="outline"
  aria-pressed={selected}
  data-linked={linked || undefined}
  className="items-stretch aria-pressed:bg-[var(--op-selected)] aria-pressed:text-foreground aria-pressed:border-[var(--op-tone)] aria-pressed:hover:bg-[var(--op-selected)] data-linked:border-dashed data-linked:border-[var(--op-tone)] dark:aria-pressed:bg-[var(--op-selected)] dark:aria-pressed:border-[var(--op-tone)] dark:aria-pressed:hover:bg-[var(--op-selected)] dark:data-linked:border-[var(--op-tone)]"
/>
```

These local CSS roles resolve on the same `data-category` element, including
inside a Button. The Table row also intentionally overrides its selected utility
with `data-[state=selected]:bg-[var(--op-selected)]`. Verify computed background,
border and alignment after transitions settle; reading CSS alone is insufficient.
Include the dark pressed/linked modifiers: the outline variant also ships dark
background, border and hover utilities. Keep the primitive's separate keyboard
focus ring. Do not globally increase specificity or replace focus feedback with
a pressed marker.

- Embedded Cards can use `rounded-none ring-0` when their parent owns the outline;
  the independent workspace and inspector keep their own contours.
- Buttons contain phrasing content only. Stat's `dl` and native `details` stay
  outside the selection control; a Badge rendered as a span is safe inside it.
  Mobile identity buttons and their Stat values are siblings.
- Context summaries remain native keyboard controls outside contribution buttons.
  Card clipping is intentional; the recipe uses a local `outline-offset: -2px`
  for native summary and inspector-heading focus rather than disabling clipping.

A multiline Button also needs an explicit vertical inset: the shared Button
contract provides horizontal padding for a single-line control. The workflow
nodes and strip use equal token-based inset, free-wrapping titles, and a bottom
metadata/value group. Category and a compact selection check share one row; an
empty full-width selection row is not reserved. A tinted CardHeader needs the
local Card's `padding-block-start: 0` so its color reaches the outer top edge;
keep child horizontal inset and the Card's bottom padding intact.

### Category color and status on selected surfaces

The recipe uses existing exported blue/violet/teal/amber primitive pairs for
intake, processing, delivery and context identity. Light/Dark doses and local
surface/boundary roles live only in
[operations-example.css](../src/playground/operations-example.css). Ordinary
amounts remain neutral. Categories, current-path text, pressed state, a check
and a dashed linked marker supply non-color cues. Severity stays independent:
**Needs review** uses destructive, regardless of a node's category.

Consumers should use the tokens actually present in their adopted version.
Evenform exports selected primitive pairs, not a complete numbered color scale.
If a new dose is necessary, derive it in product CSS from an existing primitive;
do not reference an undefined red shade or duplicate CSS values in TypeScript.
When replacing older per-category rules, remove or account for the selectors
that still win the cascade, and inspect the resolved colors in the browser.

A translucent destructive Badge over a tinted inspector header must be checked
against the **composited background**, including all ancestor layers. Measuring
raw red on white, or treating an alpha background as opaque, does not establish
its text contrast. Also verify that the resolved role retains a red hue: an
undefined variable can silently inherit neutral text while passing contrast.
This recipe locally deepens destructive in Light and lightens it in Dark, using
existing red primitives. It does not change the global destructive token or
certify arbitrary consumer tints. Check category identity, selected surface and
status Badge together in both themes before adopting different doses.

### Reading on muted surfaces

`--muted-foreground` is the existing subdued role; it is not a guarantee of
4.5:1 on every background. For secondary reading text on `--muted`, use
`--ds-reading-muted-foreground` (neutral-600 in Light, neutral-400 in Dark).
The operational composition maps this role locally; the global palette remains
unchanged. Selected surfaces use `accent-foreground` for secondary text too.

```css
.product-muted-reading-surface {
  background: var(--muted);
  --muted-foreground: var(--ds-reading-muted-foreground);
}
.product-selected-surface {
  background: var(--accent);
  color: var(--accent-foreground);
  --muted-foreground: var(--accent-foreground);
}
```

`verify:reading-contrast` measures actual CSS pairs across light/dark, Neutral /
Indigo / Teal / Rose / one generated Custom preset, and both densities. Its
baseline measurement records the old muted-foreground/muted pair separately;
that known pair is not presented as passing. This is a targeted role/surface
check, not an accessibility certification or an audit of arbitrary host themes.
