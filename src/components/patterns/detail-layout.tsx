import { type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** A record's content and supporting panel, composed within a main landmark. */
export function DetailLayout({ header, aside, footer, children, className, ...props }: ComponentProps<"div"> & {
  header?: ReactNode
  aside?: ReactNode
  footer?: ReactNode
}) {
  return <div data-slot="detail-layout" className={cn(className)} {...props}>
    {header && <div data-slot="detail-layout-header">{header}</div>}
    <div data-slot="detail-layout-columns" data-has-aside={aside ? true : undefined}>
      <div data-slot="detail-layout-main">{children}</div>
      {aside && <div data-slot="detail-layout-aside">{aside}</div>}
    </div>
    {footer && <div data-slot="detail-layout-footer">{footer}</div>}
  </div>
}
