import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"
export function NotificationList({
  className,
  ...props
}: ComponentProps<"ul">) {
  return (
    <ul
      role="list"
      data-slot="notification-list"
      className={cn("evenform-notification-list", className)}
      {...props}
    />
  )
}
export interface NotificationItemProps extends Omit<
  ComponentProps<"li">,
  "title"
> {
  title: ReactNode
  icon?: ReactNode
  time?: ReactNode
  unread?: boolean
  unreadLabel?: string
  actions?: ReactNode
}
export function NotificationItem({
  title,
  icon,
  time,
  unread,
  unreadLabel = "Unread",
  actions,
  children,
  className,
  ...props
}: NotificationItemProps) {
  return (
    <li
      data-slot="notification-item"
      data-unread={unread || undefined}
      className={cn("evenform-notification-item", className)}
      {...props}
    >
      {icon && (
        <span data-slot="notification-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div data-slot="notification-body">
        <div data-slot="product-meta">
          <span data-slot="notification-title">{title}</span>
          {unread && (
            <span data-slot="notification-unread">
              <span className="sr-only">{unreadLabel}</span>
            </span>
          )}
          {time && <span data-slot="product-time">{time}</span>}
        </div>
        {children && <div data-slot="product-content">{children}</div>}
        {actions && <div data-slot="product-actions">{actions}</div>}
      </div>
    </li>
  )
}
