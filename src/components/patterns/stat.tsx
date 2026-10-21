import { type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export function StatGroup({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="stat-group" className={cn(className)} {...props} />
}

/** Change meaning is explicit: a lower number can be beneficial or adverse.
 * Include direction and comparison period in the change label when relevant. */
export function Stat({ label, value, change, help, actions, children, className, ...props }: ComponentProps<"div"> & {
  label: ReactNode
  value: ReactNode
  change?: { label: ReactNode; tone?: "beneficial" | "adverse" | "neutral" }
  help?: ReactNode
  actions?: ReactNode
}) {
  return <div data-slot="stat" className={cn(className)} {...props}>
    <dl>
      <dt data-slot="stat-label">{label}</dt>
      <dd data-slot="stat-value">{value}</dd>
    </dl>
    {change && <div data-slot="stat-change" data-tone={change.tone ?? "neutral"}>{change.label}</div>}
    {help && <div data-slot="stat-help">{help}</div>}
    {children}
    {actions && <div data-slot="stat-actions">{actions}</div>}
  </div>
}
