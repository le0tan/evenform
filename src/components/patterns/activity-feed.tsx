import type { ComponentProps, ReactNode } from "react"
import { cn } from "cn"

export function ActivityFeed({ className, ...props }: ComponentProps<"ol">) {
  return (
    <ol
      data-slot="activity-feed"
      className={cn("evenform-activity-feed", className)}
      {...props}
    />
  )
}
export interface ActivityItemProps extends Omit<ComponentProps<"li">, "title"> {
  icon?: ReactNode
  title: ReactNode
  time?: ReactNode
  actions?: ReactNode
}
export function ActivityItem({
  className,
  icon,
  title,
  time,
  actions,
  children,
  ...props
}: ActivityItemProps) {
  return (
    <li
      data-slot="activity-item"
      className={cn("evenform-activity-item", className)}
      {...props}
    >
      {icon && (
        <span data-slot="activity-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div data-slot="activity-body">
        <div data-slot="product-meta">
          <div data-slot="activity-title">{title}</div>
          {time && <span data-slot="product-time">{time}</span>}
        </div>
        {children && <div data-slot="product-content">{children}</div>}
        {actions && <div data-slot="product-actions">{actions}</div>}
      </div>
    </li>
  )
}
