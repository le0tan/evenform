import { useId, type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Native form semantics and event handling remain with the caller. */
export function FormLayout({ header, footer, children, className, ...props }: ComponentProps<"form"> & {
  header?: ReactNode
  footer?: ReactNode
}) {
  return <form data-slot="form-layout" className={cn(className)} {...props}>
    {header && <div data-slot="form-layout-header">{header}</div>}
    <div data-slot="form-layout-body">{children}</div>
    {footer && <div data-slot="form-layout-footer">{footer}</div>}
  </form>
}

/** A fieldset with a side label on wide containers. Controls keep their own
 * labels, ids, descriptions and error associations. */
export function FormLayoutSection({ title, description, children, className, ...props }: Omit<ComponentProps<"fieldset">, "title"> & {
  title: ReactNode
  description?: ReactNode
}) {
  const descriptionId = useId()
  return <fieldset data-slot="form-layout-section" className={cn(className)} aria-describedby={description ? descriptionId : undefined} {...props}>
    <legend data-slot="form-layout-section-title">{title}</legend>
    <div data-slot="form-layout-section-columns">
      {description && <div data-slot="form-layout-section-description" id={descriptionId}>{description}</div>}
      <div data-slot="form-layout-section-fields">{children}</div>
    </div>
  </fieldset>
}
