import { type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export type PageNavigationItem = { id: string; label: ReactNode; href?: string }

/** Native anchors preserve open-in-new-tab and document scrolling. activeId
 * can come from routing or IntersectionObserver in the consuming application. */
export function PageNavigation({ items, activeId, "aria-label": label = "On this page", className, ...props }: ComponentProps<"nav"> & {
  items: PageNavigationItem[]
  activeId?: string
}) {
  return <nav data-slot="page-navigation" aria-label={label} className={cn(className)} {...props}>
    <ul>{items.map((item) => <li key={item.id}><a href={item.href ?? `#${item.id}`} aria-current={item.id === activeId ? "location" : undefined}>{item.label}</a></li>)}</ul>
  </nav>
}
