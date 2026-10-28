import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** A routed document section. */
export function ShowcasePagePanel({ active, keepMounted, className, children }: { active: boolean; keepMounted?: boolean; className?: string; children: ReactNode }) {
  if (!active && !keepMounted) return null
  return <div hidden={!active} className={cn("showcase-page-panel", className)}>{children}</div>
}
