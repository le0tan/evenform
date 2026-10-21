import type { ComponentProps, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** The consuming table/list owns selection and destructive actions. */
export function SelectionBar({ selectedCount, onClear, selectedLabel = (count) => `${count} selected`, clearLabel = "Clear selection", children, className, ...props }: ComponentProps<"div"> & { selectedCount: number; onClear: () => void; selectedLabel?: (count: number) => ReactNode; clearLabel?: ReactNode }) {
  if (selectedCount <= 0) return null
  return <div role="group" aria-label="Selected item actions" className={cn("ds-selection-bar", className)} {...props}><span aria-live="polite">{selectedLabel(selectedCount)}</span><div className="toolbar">{children}<Button variant="ghost" size="sm" onClick={onClear}>{clearLabel}</Button></div></div>
}
