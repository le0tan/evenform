import { type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** The application owns selection, navigation and focus. Both panes stay mounted;
 * only activePane is shown when the available container becomes narrow. */
export function SplitLayout({ list, children, activePane = "list", listLabel = "Records", detailLabel = "Record details", className, ...props }: ComponentProps<"div"> & {
  list: ReactNode
  activePane?: "list" | "detail"
  listLabel?: string
  detailLabel?: string
}) {
  return <div data-slot="split-layout" data-active-pane={activePane} className={cn(className)} {...props}>
    <div data-slot="split-layout-columns">
      <section data-slot="split-layout-list" aria-label={listLabel}>{list}</section>
      <section data-slot="split-layout-detail" aria-label={detailLabel}>{children}</section>
    </div>
  </div>
}
