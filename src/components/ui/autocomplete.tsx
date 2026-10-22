import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import { ChevronDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Suggestions complete free text; Base UI owns filtering, keyboard and form semantics.
const Autocomplete = AutocompletePrimitive.Root
const AutocompleteValue = AutocompletePrimitive.Value
const AutocompleteStatus = AutocompletePrimitive.Status
const AutocompleteCollection = AutocompletePrimitive.Collection
const AutocompleteGroup = AutocompletePrimitive.Group
const useAutocompleteFilter = AutocompletePrimitive.useFilter

function AutocompleteInputGroup({
  className,
  ...props
}: AutocompletePrimitive.InputGroup.Props) {
  return (
    <AutocompletePrimitive.InputGroup
      data-slot="autocomplete-input-group"
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

function AutocompleteInput({
  className,
  ...props
}: AutocompletePrimitive.Input.Props) {
  return (
    <AutocompletePrimitive.Input
      data-slot="autocomplete-input"
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

function AutocompleteTrigger({
  className,
  children,
  "aria-label": ariaLabel = "Show suggestions",
  ...props
}: AutocompletePrimitive.Trigger.Props) {
  return (
    <AutocompletePrimitive.Trigger
      data-slot="autocomplete-trigger"
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
    </AutocompletePrimitive.Trigger>
  )
}

function AutocompleteClear({
  className,
  children,
  "aria-label": ariaLabel = "Clear text",
  ...props
}: AutocompletePrimitive.Clear.Props) {
  return (
    <AutocompletePrimitive.Clear
      data-slot="autocomplete-clear"
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
    </AutocompletePrimitive.Clear>
  )
}

type AutocompleteContentProps = AutocompletePrimitive.Popup.Props &
  Pick<
    AutocompletePrimitive.Positioner.Props,
    "side" | "sideOffset" | "align" | "alignOffset" | "anchor"
  >

function AutocompleteContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: AutocompleteContentProps) {
  return (
    <AutocompletePrimitive.Portal>
      <AutocompletePrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <AutocompletePrimitive.Popup
          data-slot="autocomplete-content"
          className={(state) =>
            cn(
              "evenform-floating-panel evenform-combobox-popup",
              typeof className === "function" ? className(state) : className
            )
          }
          {...props}
        />
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  )
}

function AutocompleteList({
  className,
  ...props
}: AutocompletePrimitive.List.Props) {
  return (
    <AutocompletePrimitive.List
      data-slot="autocomplete-list"
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

function AutocompleteItem({
  className,
  children,
  ...props
}: AutocompletePrimitive.Item.Props) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={(state) =>
        cn(
          "evenform-menu-item",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    >
      <span className="min-w-0 flex-1">{children}</span>
    </AutocompletePrimitive.Item>
  )
}

function AutocompleteEmpty({
  className,
  ...props
}: AutocompletePrimitive.Empty.Props) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="autocomplete-empty"
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

function AutocompleteGroupLabel({
  className,
  ...props
}: AutocompletePrimitive.GroupLabel.Props) {
  return (
    <AutocompletePrimitive.GroupLabel
      data-slot="autocomplete-group-label"
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

export {
  Autocomplete,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteTrigger,
  AutocompleteContent,
  AutocompleteList,
  AutocompleteItem,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteValue,
  AutocompleteClear,
  AutocompleteCollection,
  AutocompleteStatus,
  useAutocompleteFilter,
}
export type { AutocompleteContentProps }
