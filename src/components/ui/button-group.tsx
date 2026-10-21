import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

/** Groups ordinary buttons; selection and arrow navigation belong to ToggleGroup. */
export function ButtonGroup({ orientation = "horizontal", className, ...props }: ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return <div role="group" data-slot="button-group" data-orientation={orientation} className={cn("ds-button-group", className)} {...props} />
}
export function ButtonGroupText({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("ds-button-group-text", className)} {...props} />
}
