import { Home, Moon, Sun } from "lucide-react"
import { AppShell, PageHeader, PageSection } from "@/components/patterns/layouts"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useTheme } from "@/components/theme-provider"

/** Replace this small entry with product pages. No Showcase modules are imported. */
export default function App() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === "dark"
  return <TooltipProvider><AppShell
    sidebar={<Sidebar><SidebarHeader><span className="px-control-x py-2 font-medium">Workspace</span></SidebarHeader><SidebarContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton isActive render={<a href="#home" aria-current="page" />}><Home /><span>Home</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarContent></Sidebar>}
    header={<><div className="toolbar"><SidebarTrigger className="md:hidden" /><span className="text-label">Home</span></div><Button variant="ghost" size="icon" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => setTheme(dark ? "light" : "dark")}>{dark ? <Sun /> : <Moon />}</Button></>}
  ><PageHeader title="Workspace" description="A place for your work." /><PageSection title="Welcome"><p className="text-sm text-muted-foreground">Your workspace is ready.</p></PageSection></AppShell></TooltipProvider>
}
