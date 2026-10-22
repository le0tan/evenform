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
