import { type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Full-page centered or split composition. Forms, headings, authentication,
 * loading and error state belong to the application. */
export function AuthLayout({ brand, aside, footer, children, className, ...props }: ComponentProps<"div"> & {
  brand?: ReactNode
  aside?: ReactNode
  footer?: ReactNode
}) {
  return <div data-slot="auth-layout" className={cn(className)} {...props}>
    <div data-slot="auth-layout-columns" data-has-aside={aside ? true : undefined}>
      <div data-slot="auth-layout-primary">
        {brand && <div data-slot="auth-layout-brand">{brand}</div>}
        <div data-slot="auth-layout-content">{children}</div>
        {footer && <div data-slot="auth-layout-footer">{footer}</div>}
      </div>
      {aside && <div data-slot="auth-layout-aside">{aside}</div>}
    </div>
  </div>
}
