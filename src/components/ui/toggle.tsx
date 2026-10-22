import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cn } from "@/lib/utils"
function Toggle<Value extends string>({className, ...props}: TogglePrimitive.Props<Value>) {
 return <TogglePrimitive data-slot="toggle" className={(state) => cn("evenform-toggle-item", typeof className === "function" ? className(state) : className)} {...props} />
}
export { Toggle }
