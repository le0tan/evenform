import type { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"

export function AppShell({ sidebar, header, aside, children, skipLinkLabel = "Skip to content" }: {
  sidebar: ReactNode; header: ReactNode; aside?: ReactNode; children: ReactNode; skipLinkLabel?: string
}) {
  return <SidebarProvider>
    <a className="skip-link" href="#main-content">{skipLinkLabel}</a>
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
