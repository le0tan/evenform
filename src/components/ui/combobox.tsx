import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Preserve Base UI generics, filtering, form integration and multiple selection.
const Combobox = ComboboxPrimitive.Root
const ComboboxValue = ComboboxPrimitive.Value
const ComboboxLabel = ComboboxPrimitive.Label
const ComboboxCollection = ComboboxPrimitive.Collection
const ComboboxGroup = ComboboxPrimitive.Group
const useComboboxFilter = ComboboxPrimitive.useFilter

function ComboboxInputGroup({
  className,
  ...props
}: ComboboxPrimitive.InputGroup.Props) {
  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-input-group"
      className={(state) =>
        cn(
          "evenform-combobox-group",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={(state) =>
        cn(
          "evenform-combobox-input",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function ComboboxTrigger({
  className,
  children,
  "aria-label": ariaLabel = "Show options",
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      aria-label={ariaLabel}
      className={(state) =>
        cn(
          "evenform-combobox-action",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    >
      {children ?? <ChevronDownIcon aria-hidden="true" className="size-4" />}
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxClear({
  className,
  children,
  "aria-label": ariaLabel = "Clear selection",
  ...props
}: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      aria-label={ariaLabel}
      className={(state) =>
        cn(
          "evenform-combobox-action",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" className="size-4" />}
    </ComboboxPrimitive.Clear>
  )
}

type ComboboxContentProps = ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "sideOffset" | "align" | "alignOffset" | "anchor"
  >

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxContentProps) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={(state) =>
            cn(
              "evenform-floating-panel evenform-combobox-popup",
              typeof className === "function" ? className(state) : className
            )
          }
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={(state) =>
        cn(
          "evenform-combobox-list",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={(state) =>
        cn(
          "evenform-menu-item evenform-menu-choice",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <ComboboxPrimitive.ItemIndicator className="evenform-menu-indicator">
        <CheckIcon aria-hidden="true" className="size-4" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={(state) =>
        cn(
          "evenform-combobox-empty",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function ComboboxGroupLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-group-label"
      className={(state) =>
        cn(
          "evenform-menu-label",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function ComboboxChips({ className, ...props }: ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={(state) =>
        cn(
          "evenform-combobox-chips",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function ComboboxChip({ className, ...props }: ComboboxPrimitive.Chip.Props) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={(state) =>
        cn(
          "evenform-combobox-chip",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function ComboboxChipRemove({
  className,
  children,
  "aria-label": ariaLabel = "Remove selection",
  ...props
}: ComboboxPrimitive.ChipRemove.Props) {
  return (
    <ComboboxPrimitive.ChipRemove
      data-slot="combobox-chip-remove"
      aria-label={ariaLabel}
      className={(state) =>
        cn(
          "evenform-chip-remove",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" className="size-3" />}
    </ComboboxPrimitive.ChipRemove>
  )
}

export {
  Combobox,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxGroupLabel,
  ComboboxValue,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxClear,
  ComboboxCollection,
  useComboboxFilter,
}
export type { ComboboxContentProps }
