import { type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Static by default. Set role="status" for asynchronous updates or role="alert"
 * for urgent changes; choosing a tone alone never creates a live announcement. */
export function StatusMessage({ tone = "neutral", icon, title, actions, children, className, ...props }: Omit<ComponentProps<"div">, "title"> & {
  tone?: "neutral" | "info" | "success" | "warning" | "error"
  icon?: ReactNode
  title?: ReactNode
  actions?: ReactNode
}) {
  return <div data-slot="status-message" data-tone={tone} className={cn(className)} {...props}>
    {icon && <span data-slot="status-message-icon" aria-hidden="true">{icon}</span>}
    <div data-slot="status-message-content">
      {title && <div data-slot="status-message-title">{title}</div>}
      {children && <div data-slot="status-message-body">{children}</div>}
      {actions && <div data-slot="status-message-actions">{actions}</div>}
    </div>
  </div>
}
