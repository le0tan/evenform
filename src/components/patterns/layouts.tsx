import { useId, type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Label } from "@/components/ui/label"

export function AppShell({ sidebar, header, aside, children }: {
  sidebar: ReactNode; header: ReactNode; aside?: ReactNode; children: ReactNode
}) {
  return <SidebarProvider>
    <a className="skip-link" href="#main-content">Skip to content</a>
    {sidebar}
    <div className="app-shell-body">
      <header className="app-shell-header">{header}</header>
      <div className="app-shell-workspace">
        <main id="main-content" className="app-shell-main" tabIndex={-1}>
          <div className="page-content">{children}</div>
        </main>
        {aside}
      </div>
    </div>
  </SidebarProvider>
}

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
    {title && <div className="section-header"><div><h2 id={id}>{title}</h2>{description && <p>{description}</p>}</div>{actions}</div>}
    {children}
  </section>
}

export function SettingsLayout({ navigation, children }: { navigation: ReactNode; children: ReactNode }) {
  return <div className="settings-layout"><nav aria-label="Settings sections" className="settings-navigation">{navigation}</nav><div className="settings-content">{children}</div></div>
}

export function SettingsGroup({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <PageSection title={title} description={description} className="settings-group">{children}</PageSection>
}

export function Toolbar({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("toolbar", className)} {...props} />
}

/** Associate label, description and invalid state at the call site using id.
 * Native and Base UI controls keep their normal APIs. */
export function FormField({ id, label, description, error, children }: {
  id: string; label: string; description?: string; error?: string; children: ReactNode
}) {
  return <div className="form-field" data-invalid={Boolean(error) || undefined}>
    <Label htmlFor={id}>{label}</Label>{children}
    {description && <p id={`${id}-description`} className="field-description">{description}</p>}
    {error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}
  </div>
}

export function DataListLayout({ toolbar, children, empty, isEmpty, footer }: {
  toolbar: ReactNode; children: ReactNode; empty: ReactNode; isEmpty: boolean; footer?: ReactNode
}) {
  return <div className="data-list-layout"><Toolbar className="data-list-toolbar">{toolbar}</Toolbar>
    {isEmpty ? <div className="empty-state">{empty}</div> : children}
    {footer && <div className="data-list-footer">{footer}</div>}
  </div>
}
