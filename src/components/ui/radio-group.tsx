import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { cn } from "cn"

function RadioGroup<Value = string>({
  className,
  ...props
}: RadioGroupPrimitive.Props<Value>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={(state) =>
        cn(
          "evenform-radio-group",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function RadioGroupItem<Value = string>({
  className,
  children,
  ...props
}: RadioPrimitive.Root.Props<Value>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={(state) =>
        cn(
          "evenform-radio",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    >
      <RadioPrimitive.Indicator className="evenform-radio-dot" />
      {children}
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
