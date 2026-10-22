import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { cn } from "@/lib/utils"

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.Trigger

function CollapsibleContent({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={(state) =>
        cn(
          "evenform-disclosure-panel",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
