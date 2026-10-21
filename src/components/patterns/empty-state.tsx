import { useId, type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Empty content, with product-specific copy and actions supplied by the caller. */
export function EmptyState({ icon, title, description, actions, children, headingLevel = 3, className, ...props }: Omit<ComponentProps<"div">, "title"> & {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  headingLevel?: 2 | 3 | 4
}) {
  const id = useId()
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4"
  return <div data-slot="empty-state" className={cn(className)} aria-labelledby={id} {...props}>
    {icon && <div data-slot="empty-state-icon" aria-hidden="true">{icon}</div>}
    <div data-slot="empty-state-copy">
      <Heading id={id} data-slot="empty-state-title">{title}</Heading>
      {description && <div data-slot="empty-state-description">{description}</div>}
    </div>
    {children}
    {actions && <div data-slot="empty-state-actions">{actions}</div>}
  </div>
}
