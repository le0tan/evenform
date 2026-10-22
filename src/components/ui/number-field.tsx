import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { MinusIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function NumberField({ className, ...props }: NumberFieldPrimitive.Root.Props) {
  return (
    <NumberFieldPrimitive.Root
      data-slot="number-field"
      className={(state) =>
        cn(
          "evenform-number-field",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function NumberFieldGroup({
  className,
  ...props
}: NumberFieldPrimitive.Group.Props) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={(state) =>
        cn(
          "evenform-number-group",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function NumberFieldInput({
  className,
  ...props
}: NumberFieldPrimitive.Input.Props) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={(state) =>
        cn(
          "evenform-number-input",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function NumberFieldIncrement({
  className,
  children,
  "aria-label": ariaLabel = "Increase",
  ...props
}: NumberFieldPrimitive.Increment.Props) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      aria-label={ariaLabel}
      className={(state) =>
        cn(
          "evenform-number-step",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    >
      {children ?? <PlusIcon aria-hidden="true" className="size-4" />}
    </NumberFieldPrimitive.Increment>
  )
}

function NumberFieldDecrement({
  className,
  children,
  "aria-label": ariaLabel = "Decrease",
  ...props
}: NumberFieldPrimitive.Decrement.Props) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      aria-label={ariaLabel}
      className={(state) =>
        cn(
          "evenform-number-step",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    >
      {children ?? <MinusIcon aria-hidden="true" className="size-4" />}
    </NumberFieldPrimitive.Decrement>
  )
}

const NumberFieldScrubArea = NumberFieldPrimitive.ScrubArea

export {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
  NumberFieldScrubArea,
}
