import { type ComponentProps } from "react"
import { cn } from "@/lib/utils"

/** Set local --ds-dashboard-columns / --ds-dashboard-span CSS properties to
 * choose the wide layout. Content stacks in narrow containers, in DOM order. */
export function DashboardLayout({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="dashboard-layout" className={cn(className)} {...props} />
}

export function DashboardGrid({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="dashboard-grid" className={cn(className)} {...props} />
}

export function DashboardItem({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="dashboard-item" className={cn(className)} {...props} />
}
