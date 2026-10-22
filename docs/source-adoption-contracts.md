# Source adoption contracts

These recipes cover restored values, bounded workspaces, menu anatomy, scrolling
feeds and surface presets. They retain the Base UI interaction contracts.
See the runnable **Patterns → Workflow → Scrolling workspace** example, or
[`workspace-adoption-example.tsx`](../src/playground/workspace-adoption-example.tsx).

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
unique value. Do not assume an unknown ID has a human-readable label. Loading,
request cancellation, errors and retry are application state:

```tsx
// selectedRecord comes from the restored record, not a second label dictionary.
const byValue = new Map<string, SelectOption>()
if (selectedRecord) byValue.set(selectedRecord.value, selectedRecord)
for (const option of loadedOptions ?? []) byValue.set(option.value, option)
const options = [...byValue.values()]
<OptionSelect options={options} value={value} onValueChange={setValue}
  triggerProps={{ "aria-label": "Owner", "aria-busy": loading }} />
```

Updating `options` or a controlled `value` updates a closed trigger immediately;
opening the popup is unnecessary. Never infer labels by traversing React children:
wrappers, lazy content and asynchronous lists make that unreliable.

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

The default shell owns the single `main` landmark and skip link. Children must not
add another main. Inside an existing main use `contentAs="div"`; the containing
application owns the landmark. Give multiple embedded shells unique `mainId`s.
Product panels own their responsive arrangement, headings and scroll focus.
Do not fix the body height globally just to repair one panel's scroll boundary.

## Named menu groups and multiple choices

`DropdownMenuGroupLabel` (also exported as `DropdownMenuLabel` for compatibility)
is Base UI GroupLabel and **requires a DropdownMenuGroup ancestor**. Keep labels
inside their group; do not wrap them in an implicit group that excludes the items.

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

Card now defaults to `flex-shrink: 0`, so a constrained column scrolls instead of
compressing each card and clipping content behind `overflow: hidden`.
This changes flex allocation; layouts intentionally shrinking a card can use
`className="shrink"` or `--ds-card-shrink: 1` and must provide their own content
scroll boundary. Grid sizing and ordinary content pages retain their layout.
For a feed mixing cards, messages and other flex children, protect **all** direct
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
| `--ds-backdrop-opacity` | `10%` (color-mix percentage, not a unitless number) |
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

Defaults match the prior boundary, corner and backdrop treatment. Backdrop tint
is mixed into the background color; it does not replace the primitive's animated
opacity. Existing presence, focus restoration and CSS reduced-motion behavior
remain in `motion.css`. Utilities such as `rounded-none`, `ring-0`, `shrink` and
`bg-transparent` intentionally override components-layer defaults. Card header,
footer and image corner rules follow the public radius token.
