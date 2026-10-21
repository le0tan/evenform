import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return <kbd data-slot="kbd" className={cn("ds-kbd", className)} {...props} />
}
