# Source adoption contracts

Recipes for restored values, free-entry suggestions, SVG dialog focus,
bounded workspaces, menus, scrolling feeds and surface presets.
See the runnable **Patterns → Workflow → Scrolling workspace** example, or
[`workspace-adoption-example.tsx`](../src/playground/workspace-adoption-example.tsx).
**Patterns → Workflow → Inputs and focus** adds runnable input/focus recipes in
[`input-adoption-example.tsx`](../src/playground/input-adoption-example.tsx).
For framework setup and preference hydration, see [React Router SSR](react-router-ssr.md).

## Free-entry suggestions

Choose the data contract first. A closed-set selector submits a selected item;
a free-entry field submits the user's text even when it is absent from the
suggestion list. Keep that draft separate from the Combobox selection:

```tsx
const [draft, setDraft] = useState(savedId)
const input = useRef<HTMLInputElement>(null)

<Combobox items={items} inputValue={draft}
  value={items.includes(draft) ? draft : null}
  onInputValueChange={(text, details) => {
    if (details.reason === "input-change") setDraft(text)
  }}
  onValueChange={(selected) => {
    if (selected !== null) setDraft(selected)
  }}>
  <ComboboxInputGroup>
    <ComboboxInput ref={input} aria-label="Record ID" />
    {draft && <Button variant="ghost" size="icon-sm" aria-label="Clear record ID"
      onClick={() => { setDraft(""); input.current?.focus() }}><X /></Button>}
    <ComboboxTrigger aria-label="Show records" />
  </ComboboxInputGroup>
  <ComboboxContent>
    <ComboboxEmpty>No suggestions.</ComboboxEmpty>
    <ComboboxList>{(item: string) =>
      <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
    }</ComboboxList>
  </ComboboxContent>
</Combobox>
```

The primitive can emit `input-clear` after an unmatched input loses focus. For
this contract, process deliberate typing (`input-change`) and non-null selected
items; clear the draft only through the field's explicit clear action or typing
an empty string. `ComboboxClear` clears a **selection** and can be absent for unmatched
text; the separate Button above clears the free-entry **input**.

The host owns ID validation, form serialization, request debouncing and
persistence. Serialize `draft` explicitly in forms.

The runnable recipe loads suggestions on opening. It aborts the preceding request,
ignores aborted completions (even when a loader ignores its signal), preserves
the draft across loading/error/retry, and focuses the input after clearing.
Show loading, error and empty-success states separately, preserving the draft
on failure. Replace the sample loader with the application data source.

## Dialogs opened from SVG or removed elements

Use the normal `DialogTrigger render={<Button />}` for HTML triggers. For a
controlled Dialog opened by an SVG chart part, keep the opening element in a
host ref at the pointer/keyboard event. Default HTML focus restoration does not
cover that SVG element. `DialogContent` forwards Base UI's `finalFocus`:

```tsx
const opener = useRef<SVGRectElement | null>(null)
const fallback = useRef<HTMLButtonElement>(null)

<DialogContent finalFocus={() => {
  if (opener.current?.isConnected) {
    opener.current.focus()
    return false // prevent a second default focus move
  }
  return fallback.current?.isConnected ? fallback.current : true
}}>
  {/* DialogTitle, content and actions */}
</DialogContent>
```

The source example captures the opener on both click and Enter/Space, exposes
SVG controls inside a `role="group"` root, and uses a stable HTML reset action
when the selected element is removed. An SVG `role="img"` root can hide
interactive descendants from assistive technology. Give each interactive part
an accessible name, keyboard action and visible focus treatment. Scope the
custom focus policy to this Dialog and return only connected elements. Provide
a fallback when filtering, virtualization or navigation removes the opener.

## Restored Select labels

Lazy popup content cannot supply a label before its items mount. Give `Select`
an `items` map/array when the saved value differs from its human label:

```tsx
const options = [
  { value: "fields", label: "Fields" },
  { value: "optional", label: "Optional" },
]
<Select items={options} value={value} onValueChange={setValue}>
  <SelectTrigger aria-label="Field mode"><SelectValue /></SelectTrigger>
  <SelectContent>
    {options.map(option => <SelectItem key={option.value} value={option.value}>
      {option.label}
    </SelectItem>)}
  </SelectContent>
</Select>
```

For a flat string-valued list, `OptionSelect` supplies both declarations from one
array. Root props (including value/defaultValue, onValueChange, disabled, name,
required and controlled open state) remain Base UI props. `triggerProps` accepts
an accessible name, ref, className and size; `contentProps` accepts popup props
and positioning. Use the Select parts for groups, object values or multi-select.

```tsx
import { OptionSelect } from "@/components/ui/option-select"
<OptionSelect options={options} value={value} onValueChange={setValue}
  triggerProps={{ "aria-label": "Field mode" }} />
```

Asynchronous options must include the saved selection's label while the full
list loads. Seed from a saved `{value, label}` record, then merge the response by
unique value. The host owns loading, request cancellation, errors and retry:

```tsx
// Seed the label from the restored record.
const byValue = new Map<string, SelectOption>()
if (selectedRecord) byValue.set(selectedRecord.value, selectedRecord)
for (const option of loadedOptions ?? []) byValue.set(option.value, option)
const options = [...byValue.values()]
<OptionSelect options={options} value={value} onValueChange={setValue}
  triggerProps={{ "aria-label": "Owner", "aria-busy": loading }} />
```

Updating `options` or a controlled `value` updates a closed trigger immediately;
opening the popup is unnecessary. Use the explicit items collection for labels;
React child traversal cannot reliably resolve wrappers or lazy content.

## A viewport workspace with independent scrolling

Import `src/styles/workflow-aids.css` alongside core CSS (the source exporter
includes it automatically when selecting HeaderShell). `variant="page"` retains
the content-page defaults. `variant="workspace"` has a bounded `100svh` height,
full-width containers, zero main padding, a compact footer, and no outer scrolling.
Set `--ds-header-shell-height` when embedding below an existing application header.
`headerClassName` and `footerClassName` style their inner containers;
`contentClassName` styles the main slot. Utilities intentionally override defaults.

```tsx
<HeaderShell variant="workspace" header={<WorkspaceToolbar />} footer={<Status />}>
  <div className="workspace-panels">
    <aside aria-label="Records" tabIndex={0}>...</aside>
    <section aria-label="Editor" tabIndex={0}>...</section>
  </div>
</HeaderShell>
```

```css
.workspace-panels {
  display: grid;
  grid-template-columns: minmax(5rem, 1fr) minmax(0, 4fr);
  height: 100%;
  min-height: 0;
}
.workspace-panels > * { min-width: 0; min-height: 0; overflow: auto; }
```

The default shell owns the `main` landmark and skip link. Inside an existing
main use `contentAs="div"`; the containing
application owns the landmark. Give multiple embedded shells unique `mainId`s.
Product panels own their responsive arrangement, headings and scroll focus.
Constrain scrolling on the panel rather than the document body.

## Named menu groups and multiple choices

`DropdownMenuGroupLabel` (also exported as `DropdownMenuLabel` for compatibility)
is Base UI GroupLabel and **requires a DropdownMenuGroup ancestor**. Keep labels
and items inside the same group.

```tsx
<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="outline" />}>Snapshot parts</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuGroup>
      <DropdownMenuGroupLabel>Included parts</DropdownMenuGroupLabel>
      <DropdownMenuCheckboxItem checked={includePlan} onCheckedChange={setIncludePlan}
        closeOnClick={false}>Execution plan</DropdownMenuCheckboxItem>
    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

Use `closeOnClick={false}` for choices that should keep the menu open with mouse
or keyboard. Escape dismisses and returns focus to the trigger. Radix's `asChild`
becomes Base UI `render`, and menu `onSelect` becomes `onClick`; calling
`preventDefault` on a click does not replace the old selection-event recipe.

Checkbox indeterminate state uses a separate `indeterminate` boolean. Query the
visible checkbox by role in browser tests. For a non-dismissable authentication
dialog, cancel Root's `onOpenChange` and use Root's `disablePointerDismissal`.
Visual Table parts can retain the host's TanStack v8 engine; adopting Evenform's
optional v9 DataTable is a separate engine migration. A markdown-source editor
may continue composing CodeMirror with Evenform controls; Tiptap changes its
editing contract.

## Cards in a scrolling feed

Card defaults to `flex-shrink: 0`, so a constrained column scrolls instead of
compressing each card and clipping content behind `overflow: hidden`.
This changes flex allocation; layouts intentionally shrinking a card can use
`className="shrink"` or `--ds-card-shrink: 1` and must provide their own content
scroll boundary. For a feed mixing cards, messages and other flex children, protect **all** direct
children with `*:shrink-0`, or an equivalent components-layer rule:

```css
.activity-feed { display: flex; flex-direction: column; min-height: 0; overflow-y: auto; }
.activity-feed > * { flex-shrink: 0; }
```

The workspace example contains 18 mixed-height cards and native execution-plan
disclosures. Their heights remain intrinsic; the feed and navigation scroll
independently. Disclosure controls remain keyboard operable.

## Public surface parameters

Load product presets after core CSS. Card parameters resolve on each component;
backdrop parameters are semantic and shared by Dialog, Sheet and AlertDialog.
Portals inherit from their DOM container, so use `:root` / `.dark` or a deliberate
portal container rather than a local React ancestor for backdrop overrides.

| Parameter | Default |
| --- | --- |
| `--ds-card-radius` | `var(--radius-xl)` |
| `--ds-card-boundary-width` | `1px` |
| `--ds-card-boundary-color` | foreground at 10% in Oklab |
| `--ds-card-shrink` | `0` |
| `--ds-backdrop-color` | `#000` |
| `--ds-backdrop-opacity` | `10%` (color-mix percentage) |
| `--ds-backdrop-blur` | `4px` |

```css
:root {
  --ds-card-radius: var(--radius-lg);
  --ds-card-boundary-width: var(--ds-border-width);
  --ds-card-boundary-color: var(--border);
  --ds-backdrop-color: #000;
  --ds-backdrop-opacity: 18%;
  --ds-backdrop-blur: 0px;
}
.dark { --ds-backdrop-opacity: 32%; }
```

Backdrop tint mixes into the background color independently of animated
opacity. Presence, focus restoration and CSS reduced-motion behavior
remain in `motion.css`. Utilities such as `rounded-none`, `ring-0`, `shrink` and
`bg-transparent` intentionally override components-layer defaults. Card header,
footer and image corner rules follow the public radius token.

### Anchored chart tooltips

`TooltipContent` accepts `positionerProps` for SVG or virtual anchors, fixed positioning and collision boundaries. Keep coordinates on the positioner and transitions on the popup. A controlled chart can retain its last anchor/content while closing, then update both before opening again. `showArrow={false}` supports dense previews; use popup `className` to compose a neutral surface. The host owns hover/focus state, `aria-describedby`, Escape handling and the chart data.

### Host clipboard bridges

`CopyButton` uses the browser Clipboard API by default. Hosts can provide `writeText(value)` for an existing native bridge or compatibility adapter; resolve only after writing and reject/throw on failure. The component continues to own pending-action protection, success/error feedback and live announcements. Transport or environment fallbacks stay in the host.
