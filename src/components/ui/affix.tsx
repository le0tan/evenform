import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

/** Sticky positioning stays inside the nearest scroll container and keeps its normal flow space.
 * Configure --ds-affix-offset on this element to clear a local header or footer. */
function Affix({
  edge = "top",
  className,
  ...props
}: ComponentProps<"div"> & { edge?: "top" | "bottom" }) {
  return (
    <div
      data-slot="affix"
      data-edge={edge}
      className={cn("evenform-affix", className)}
      {...props}
    />
  )
}

export { Affix }
