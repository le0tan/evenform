import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group"
import { cn } from "@/lib/utils"

function CheckboxGroup({ className, ...props }: CheckboxGroupPrimitive.Props) {
  return (
    <CheckboxGroupPrimitive
      data-slot="checkbox-group"
      {...props}
      className={(state) =>
        cn(
          "evenform-checkbox-group",
          typeof className === "function" ? className(state) : className
        )
      }
    />
  )
}

export { CheckboxGroup }
