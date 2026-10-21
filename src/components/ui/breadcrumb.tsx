import { Fragment, type ComponentProps, type ReactNode } from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

export function Breadcrumb({ className, ...props }: ComponentProps<"nav">) {
  return <nav aria-label="Breadcrumb" data-slot="breadcrumb" className={cn("ds-breadcrumb", className)} {...props} />
}
export function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) {
  return <ol className={cn("ds-breadcrumb-list", className)} {...props} />
}
export function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("ds-breadcrumb-item", className)} {...props} />
}
export function BreadcrumbLink({ className, ...props }: ComponentProps<"a">) {
  return <a className={cn("ds-breadcrumb-link", className)} {...props} />
}
export function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) {
  return <span aria-current="page" className={cn("ds-breadcrumb-page", className)} {...props} />
}
export function BreadcrumbSeparator({ children, className, ...props }: ComponentProps<"li">) {
  return <li role="presentation" aria-hidden="true" className={cn("ds-breadcrumb-separator", className)} {...props}>{children ?? <ChevronRight size={13} />}</li>
}
export function BreadcrumbEllipsis({ className, ...props }: ComponentProps<"span">) {
  return <span aria-hidden="true" className={cn("ds-breadcrumb-ellipsis", className)} {...props}><MoreHorizontal size={16} /></span>
}
export type BreadcrumbPathItem = { label: ReactNode; href?: string }
/** Optional convenience composition; router links can use the primitives above. */
export function BreadcrumbPath({ items, ...props }: ComponentProps<typeof Breadcrumb> & { items: BreadcrumbPathItem[] }) {
  return <Breadcrumb {...props}><BreadcrumbList>{items.map((item, index) => <Fragment key={index}>{index > 0 && <BreadcrumbSeparator />}<BreadcrumbItem>{index === items.length - 1 ? <BreadcrumbPage>{item.label}</BreadcrumbPage> : <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>}</BreadcrumbItem></Fragment>)}</BreadcrumbList></Breadcrumb>
}
