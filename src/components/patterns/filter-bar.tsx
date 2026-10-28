import { type ComponentProps, type ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/** The caller supplies query state and controls with their native tab order. */
export function FilterBar({ search, filters, actions, children, className, ...props }: ComponentProps<"div"> & {
  search?: ReactNode
  filters?: ReactNode
  actions?: ReactNode
}) {
  return <div data-slot="filter-bar" className={cn(className)} {...props}>
    <div data-slot="filter-bar-controls">
      {search && <div data-slot="filter-bar-search">{search}</div>}
      {filters && <div data-slot="filter-bar-filters">{filters}</div>}
      {actions && <div data-slot="filter-bar-actions">{actions}</div>}
    </div>
    {children && <div data-slot="filter-bar-applied">{children}</div>}
  </div>
}

/** The full chip is a remove button. Supply an explicit name including the
 * filter value, e.g. removeLabel="Remove status: Active". */
export function FilterChip({ removeLabel, onRemove, children, className, ...props }: Omit<ComponentProps<typeof Button>, "onClick" | "aria-label" | "render" | "nativeButton"> & {
  removeLabel: string
  onRemove: ComponentProps<typeof Button>["onClick"]
}) {
  return <Button type="button" variant="outline" size="sm" {...props} data-slot="filter-chip" className={(state) => cn("evenform-filter-chip", typeof className === "function" ? className(state) : className)} aria-label={removeLabel} onClick={onRemove}>
    <span data-slot="filter-chip-label">{children}</span><X aria-hidden="true" />
  </Button>
}
