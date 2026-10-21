import { useId, type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Native fieldset: disabled state, labels and submission stay with native controls. */
export function FormSection({ title, description, children, columns = 1, className, ...props }: Omit<ComponentProps<"fieldset">, "title"> & { title: ReactNode; description?: ReactNode; columns?: 1 | 2 }) {
  const id = useId()
  return <fieldset aria-describedby={description ? id : undefined} className={cn("ds-form-section", className)} {...props}><legend>{title}</legend>{description && <p id={id} className="ds-form-section-description">{description}</p>}<div className="ds-form-section-fields" data-columns={columns}>{children}</div></fieldset>
}
