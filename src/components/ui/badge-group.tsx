import type { ComponentProps, ReactNode } from "react"
import { cn } from "cn"

/** Pass Badge as badge, and a native anchor as action when the group links onward. */
function BadgeGroup({
  badge,
  children,
  action,
  className,
  ...props
}: ComponentProps<"div"> & { badge: ReactNode; action?: ReactNode }) {
  return (
    <div
      data-slot="badge-group"
      className={cn("evenform-badge-group", className)}
      {...props}
    >
      {badge}
      <span className="evenform-badge-group-description">{children}</span>
      {action}
    </div>
  )
}

export { BadgeGroup }
