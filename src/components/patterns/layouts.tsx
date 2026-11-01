import { cloneElement, isValidElement, useId, type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

// AppShell lives in app-shell.tsx so page patterns do not pull in the sidebar.

export function PageHeader({ title, description, actions }: {
  title: string; description?: ReactNode; actions?: ReactNode
}) {
  return <div className="page-header">
    <div className="page-heading"><h1>{title}</h1>{description && <p>{description}</p>}</div>
    {actions && <div className="toolbar">{actions}</div>}
  </div>
}

export function PageSection({ title, description, actions, children, className, ...props }: ComponentProps<"section"> & {
  title?: string; description?: ReactNode; actions?: ReactNode
}) {
  const id = useId()
  return <section className={cn("page-section", className)} aria-labelledby={title ? id : undefined} {...props}>
    {(title || description || actions) && <div className="section-header">{(title || description) && <div>{title && <h2 id={id}>{title}</h2>}{description && <p>{description}</p>}</div>}{actions}</div>}
    {children}
  </section>
}

export function SettingsLayout({ navigation, children, navigationLabel = "Settings sections" }: { navigation: ReactNode; children: ReactNode; navigationLabel?: string }) {
  return <div className="settings-layout"><nav aria-label={navigationLabel} className="settings-navigation">{navigation}</nav><div className="settings-content">{children}</div></div>
}

export function SettingsGroup({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <PageSection title={title} description={description} className="settings-group">{children}</PageSection>
}

export function Toolbar({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("toolbar", className)} {...props} />
}

type ControlProps = { id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean | "true" | "false" }

/** Label, description and error layout for one control. When the only child is
 * the control with the same id, its aria-describedby and aria-invalid are wired
 * here; wrapped controls (InputGroup, Select) receive `${id}-description` and
 * `${id}-error` at the call site. For Base UI validation use ui/form FormField. */
export function LabeledField({ id, label, description, error, children }: {
  id: string; label: string; description?: ReactNode; error?: ReactNode; children: ReactNode
}) {
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(" ")
  const control = isValidElement<ControlProps>(children) && children.props.id === id
    ? cloneElement(children, {
      "aria-describedby": [children.props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined,
      "aria-invalid": children.props["aria-invalid"] ?? (error ? true : undefined),
    })
    : children
  return <div className="form-field" data-invalid={Boolean(error) || undefined}>
    <Label htmlFor={id}>{label}</Label>{control}
    {description && <p id={`${id}-description`} className="field-description">{description}</p>}
    {error && <p id={`${id}-error`} className="field-error">{error}</p>}
  </div>
}

/** @deprecated Renamed to LabeledField; ui/form exports the Base UI FormField. */
export const FormField = LabeledField

export function DataListLayout({ toolbar, children, empty, isEmpty, footer }: {
  toolbar: ReactNode; children: ReactNode; empty: ReactNode; isEmpty: boolean; footer?: ReactNode
}) {
  return <div className="data-list-layout"><Toolbar className="data-list-toolbar">{toolbar}</Toolbar>
    {isEmpty ? <div className="empty-state">{empty}</div> : children}
    {footer && <div className="data-list-footer">{footer}</div>}
  </div>
}
