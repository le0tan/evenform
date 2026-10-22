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
[operational example](../src/playground/operations-example.tsx) composes the
existing DetailLayout, two independent Cards, Stat/StatGroup, Badge, Table,
Button, Tooltip, native disclosures and EvenformChart. Its data and relationship
rules stay in Showcase; it does not introduce a topology or monitoring API.

The compact summary leads with the review exception, then the recorded total
and missing-source count. Inventory does not get six equally prominent cards.
The main workspace and inspector have separate contours and a shared gap;
the heading and Tabs sit outside both. Existing DetailLayout provides the
responsive two-column structure, so another inspector layout API is unnecessary.
StatGroup columns and value sizes use local component tokens.

A single selected ID drives the workflow, proportional composition, exact
comparison and inspector. A context item resolves its current owner from the
latest data. The owning node gets a related marker; only the directly selected
item has `aria-pressed=true`. Selecting a contribution chooses its owner;
selecting a context item chooses that item. The exact comparison gives tiny
segments a full-size alternative target without increasing their plotted width.

The refresh action exercises unchanged, changed and missing context ownership.
A new relationship reveals its context; closing it manually survives a refresh
with the same relationship. Missing relationships clear the related highlight.
Selection keeps the trigger's focus and vertical reading position; only the
workflow's local horizontal scroll is adjusted when needed. The explicit
“Inspect selection” action intentionally moves focus to the inspector heading.

Desktop Table rows align exact amounts and shares. On narrow screens, the same
records produce identity-first rows with paired Stat values; the identity never
scrolls away from its numbers. The collapsed analysis retains the total,
partial-data warning and selected identity. Its native summary remains keyboard
operable, independent of contribution/context selection controls.

Recorded amounts form one proportional bar with an exact comparison. Zero,
missing data and excluded policy context are distinct. These synthetic work
units are not elapsed time, an execution timeline, or an end-to-end percentile.
Never sum stage percentiles and label the result as an observed total latency.

### Cascade and legal interactive compositions

- A more specific components-layer selector still loses to an intentional
  utility. Use `className="rounded-none ring-0"` for an embedded Card whose
  parent supplies the boundary. Independent panels keep their own Card outline;
  adding another outer border repeats that boundary.
- Button's `outline-none` utility outranks a components-layer outline. Use a
  separate non-interactive selection marker; keep primitive keyboard focus
  feedback. A local hit layer can cancel press translation using the same
  modifier: `active:not-aria-[haspopup]:translate-y-0`. Do not remove Button
  feedback globally.
- A native button accepts phrasing content. Keep Stat's `dl`, report blocks and
  `details` outside it. The mobile example places a labeled absolute Button and
  non-interactive display content as siblings. Context disclosures are outside
  that target, so their summaries and child actions work independently.
- Card's clipping is intentional. For a disclosure near its edge, use a local
  `outline-offset: -2px`; an inspector focus wrapper can use the same radius as
  the Card. Do not disable clipping or flatten every Card to repair one focus
  target.

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
