import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cn } from "cn"

function ToggleGroup<Value extends string = string>({
  className,
  ...props
}: ToggleGroupPrimitive.Props<Value>) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={(state) =>
        cn(
          "evenform-toggle-group",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function ToggleGroupItem<Value extends string = string>({
  className,
  ...props
}: TogglePrimitive.Props<Value>) {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={(state) =>
        cn(
          "evenform-toggle-item",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
