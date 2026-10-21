import { lazy, Suspense, useEffect, useState } from "react"
import { ChevronRight, Moon, SlidersHorizontal, Search, Sun } from "lucide-react"
import { AppShell, PageHeader, PageSection } from "@/components/patterns/layouts"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useTheme } from "@/components/theme-provider"
import { Workspace } from "@/playground/workspace"
import { TokenPanel } from "@/playground/token-panel"
import { useTokens } from "@/playground/use-tokens"
import { ShowcaseSidebar } from "@/playground/showcase-sidebar"
import { readShowcaseRoute, showcaseGroups, type ShowcaseRoute } from "@/playground/showcase-navigation"
import "@/playground/showcase-navigation.css"

const AppearanceLab = lazy(() => import("@/playground/appearance-lab").then(module => ({ default: module.AppearanceLab })))
const DataDashboard = lazy(() => import("@/playground/application-examples").then(module => ({ default: module.DataDashboard })))
const SupportInbox = lazy(() => import("@/playground/application-examples").then(module => ({ default: module.SupportInbox })))

const Settings = lazy(() => import("@/playground/settings").then(module => ({ default: module.Settings })))
const Gallery = lazy(() => import("@/playground/gallery").then(module => ({ default: module.Gallery })))
const Charts = lazy(() => import("@/playground/charts").then(module => ({ default: module.Charts })))
const PatternGallery = lazy(() => import("@/playground/pattern-gallery").then(module => ({ default: module.PatternGallery })))

function useWideViewport() {
  const [wide, setWide] = useState(() => window.matchMedia("(min-width: 1180px)").matches)
  useEffect(() => { const media = window.matchMedia("(min-width: 1180px)"); const change = () => setWide(media.matches); media.addEventListener("change", change); return () => media.removeEventListener("change", change) }, [])
  return wide
}
export default function App() {
  const [route, setRoute] = useState<ShowcaseRoute>(() => readShowcaseRoute() ?? { page: "foundations", section: "" })
  const wide = useWideViewport()
  const [panelOpen, setPanelOpen] = useState(false)
  const tokens = useTokens()
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === "dark"
  const group = showcaseGroups.find(group => group.page === route.page)
  const entry = group?.entries.find(item => item.id === route.section)
  const example = entry?.examples?.find(example => example.anchor === route.anchor)
  const pageTitle = example?.title ?? entry?.title ?? ({ appearance: "Appearance lab", dashboard: "Data dashboard", inbox: "Support inbox", foundations: "Foundations", workspace: "Workspace", settings: "Settings" } as Record<string,string>)[route.page]
  useEffect(() => {
    const syncHash = () => {
      const next = readShowcaseRoute()
      if (next) { setRoute(next); if (!next.anchor && !next.preview) window.scrollTo({ top: 0 }) }
    }
    window.addEventListener("hashchange", syncHash)
    return () => window.removeEventListener("hashchange", syncHash)
  }, [])
  useEffect(() => { document.title = `${pageTitle} · Evenform Design System` }, [pageTitle])
  return <TooltipProvider delay={600}><AppShell sidebar={<ShowcaseSidebar route={route} />} header={<>
    <nav className="showcase-breadcrumb" aria-label="Breadcrumb"><SidebarTrigger className="md:hidden" aria-label="Open navigation" aria-keyshortcuts="Control+B Meta+B" /><a href="#foundations" className="showcase-breadcrumb-root">Library</a><ChevronRight className="showcase-breadcrumb-root" size={13} aria-hidden="true" />{group && <><a className="showcase-breadcrumb-group" href={`#${group.page}`}>{group.title}</a><ChevronRight className="showcase-breadcrumb-group" size={13} aria-hidden="true" /></>}<span aria-current="page">{pageTitle}</span></nav>
    <div className="toolbar header-actions"><Button render={<a href="https://github.com/le0tan/evenform" target="_blank" rel="noopener noreferrer" />} variant="ghost" size="icon" aria-label="Evenform on GitHub" title="View Evenform on GitHub"><img src={`${import.meta.env.BASE_URL}brand/github-mark.svg`} width="16" height="16" className="dark:invert" alt="" /></Button><Button variant="ghost" size="icon" aria-label="Search library" onClick={() => window.dispatchEvent(new Event("evenform:open-library-search"))}><Search /></Button><Button variant="ghost" size="icon" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => setTheme(dark ? "light" : "dark")}>{dark ? <Sun /> : <Moon />}</Button><Button variant={panelOpen ? "secondary" : "outline"} size="sm" className="showcase-token-toggle" aria-label="Design tokens" title="Design tokens" aria-expanded={panelOpen} onClick={() => setPanelOpen(value => !value)}><SlidersHorizontal aria-hidden="true" /><span className="showcase-token-label">Design tokens</span></Button></div>
  </>} aside={panelOpen && wide ? <aside className="token-panel" aria-label="Token playground"><TokenPanel tokens={tokens} onClose={() => setPanelOpen(false)} /></aside> : undefined}>
    <Suspense fallback={<p className="quiet-meta" role="status">Loading preview…</p>}>{route.page === "appearance" && <AppearanceLab tokens={tokens} />}{route.page === "dashboard" && <DataDashboard />}{route.page === "inbox" && <SupportInbox />}{route.page === "workspace" && <Workspace />}{route.page === "settings" && <Settings tokens={tokens} />}{route.page === "components" && <Gallery />}{route.page === "patterns" && <PatternGallery />}{route.page === "foundations" && <Foundations />}{route.page === "charts" && <Charts />}</Suspense>
    </AppShell>
    {!wide && <Sheet open={panelOpen} onOpenChange={setPanelOpen}><SheetContent className="mobile-token-panel py-0" showCloseButton={false}><SheetHeader className="sr-only"><SheetTitle>Design tokens</SheetTitle><SheetDescription>Configure the design system in real time.</SheetDescription></SheetHeader><SheetBody className="p-0"><TokenPanel tokens={tokens} onClose={() => setPanelOpen(false)} /></SheetBody></SheetContent></Sheet>}
  </TooltipProvider>
}
function Foundations() {
  return <><PageHeader title="Foundations"  description="CSS tokens for spacing, typography and color." />
    <PageSection title="Token layers" ><div className="token-layer"><span className="layer-tag">Primitive</span><div><h3>The raw materials</h3><p>A four-pixel spacing scale, Geist typography, a neutral palette and a restrained radius scale.</p><code>--ds-space-4: 16px;</code></div></div><div className="token-layer"><span className="layer-tag">Semantic</span><div><h3>Values with a purpose</h3><p>Page insets, section rhythm and control heights. Density changes these shared decisions.</p><code>--ds-card-padding: var(--ds-space-4);</code></div></div><div className="token-layer"><span className="layer-tag">Component</span><div><h3>A single place to tune each component</h3><p>Components inherit semantic values and accept a focused override when they need one.</p><code>--ds-card-inset: var(--ds-card-padding);</code></div></div></PageSection>
    <PageSection title="Theme colors" description="Official shadcn colors handle light and dark themes."><div className="swatch-grid">{["background", "foreground", "primary", "muted", "border"].map((name) => <div className="swatch-item" key={name}><div style={{ background: `var(--${name})` }} /><code>{name}</code></div>)}</div></PageSection>
    <PageSection title="Try token overrides"  description="Open Design tokens and adjust Card padding to preview a shared change."><pre className="code-example">{`:root {\n  --ds-card-padding: 24px;\n  --ds-control-height: 36px;\n}`}</pre><p className="field-description">Read DESIGN.md for layout recipes, component contracts, and adoption instructions.</p></PageSection>
  </>
}
