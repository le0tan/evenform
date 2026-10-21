import { X } from "lucide-react"
import { type ComponentProps, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Controlled visibility: removal is the caller's responsibility. Default role
 * is neutral; use role=status/alert only when an announcement is appropriate. */
export function Banner({ children, icon, actions, onDismiss, dismissLabel = "Dismiss announcement", tone = "neutral", className, ...props }: ComponentProps<"div"> & {
  icon?: ReactNode
  actions?: ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  tone?: "neutral" | "info" | "warning" | "success"
}) {
  return <div data-slot="banner" data-tone={tone} className={cn(className)} {...props}>
    {icon && <span data-slot="banner-icon" aria-hidden="true">{icon}</span>}
    <div data-slot="banner-content">{children}</div>
    {actions && <div data-slot="banner-actions">{actions}</div>}
    {onDismiss && <Button data-slot="banner-dismiss" variant="ghost" size="icon-sm" aria-label={dismissLabel} onClick={onDismiss}><X aria-hidden="true" /></Button>}
  </div>
}
