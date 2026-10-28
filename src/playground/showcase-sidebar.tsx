import { useEffect, useRef, useState, type MouseEvent } from "react"
import { ArrowUpRight, Blocks, ChevronRight, Palette, Search, X } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, useCommandState } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { ShowcaseSidebarShortcut } from "./sidebar-shortcut"
import { navigateShowcase, showcaseGroups, showcaseHref, type ShowcasePage, type ShowcaseRoute } from "./showcase-navigation"

const exampleEntries = [
  { id: "dashboard" as const, title: "Data dashboard", description: "Acquisition trends, conversion metrics and source data.", keywords: "analytics traffic report chart csv export" },
  { id: "inbox" as const, title: "Support inbox", description: "Customer requests and reply drafts.", keywords: "tickets customer support conversation resolve" },
  { id: "workspace" as const, title: "Workspace", description: "A dashboard and project management example.", keywords: "projects home dashboard sidebar sheet tabs" },
  { id: "settings" as const, title: "Settings", description: "A configurable settings page example.", keywords: "preferences theme density" },
]
function libraryFilter(value: string, search: string) {
  const normalized = value.toLowerCase().replace(/[_-]/g, " ")
  const compact = normalized.replace(/\s/g, "")
  const query = search.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().trim()
  if (!query.split(/[\s_-]+/).every(term => normalized.includes(term) || compact.includes(term))) return 0
  return value.split(" ")[0].replace(/[\s_-]/g, "") === query.replace(/[\s_-]/g, "") ? 3 : 1
}
function followLink(event: MouseEvent<HTMLAnchorElement>, closeNavigation: () => void) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  closeNavigation()
  if (event.currentTarget.hash === location.hash) {
    event.preventDefault()
    window.dispatchEvent(new Event("evenform:reveal-example"))
  }
}
function SidebarCategory({ page, entry, route, onNavigate }: { page: ShowcasePage; entry: typeof showcaseGroups[number]["entries"][number]; route: ShowcaseRoute; onNavigate: () => void }) {
  const active = route.page === page && route.section === entry.id
  const selected = active && entry.examples?.some(example => example.anchor === route.anchor)
  const context = `${route.page}/${route.section}/${route.anchor ?? ""}`
  const [expansion, setExpansion] = useState<{ context: string; open: boolean } | null>(null)
  const open = expansion?.context === context ? expansion.open : active
  const links = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const reveal = () => setExpansion(null)
    window.addEventListener("evenform:reveal-example", reveal)
    return () => window.removeEventListener("evenform:reveal-example", reveal)
  }, [])
  useEffect(() => { if (open && selected) links.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" }) }, [open, selected, route.anchor])
  // A single destination needs a direct link, not a duplicate nested example.
  if (!entry.examples || entry.examples.length < 2) return <li><a className="showcase-nav-link" href={showcaseHref(page, entry.id)} aria-current={active ? "page" : undefined} onClick={event => followLink(event, onNavigate)}>{entry.title}</a></li>
  return <li><Collapsible open={open} onOpenChange={open => setExpansion({ context, open })}>
    <div className="showcase-category-row"><a className="showcase-nav-link" href={showcaseHref(page, entry.id)} aria-current={active && !selected ? "page" : undefined} data-active={active || undefined} onClick={event => followLink(event, onNavigate)}>{entry.title}</a><CollapsibleTrigger className="showcase-category-toggle" aria-label={`Toggle ${entry.title} examples`}><ChevronRight size={12} aria-hidden="true" /></CollapsibleTrigger></div>
    <CollapsibleContent><ul ref={links} className="showcase-nav-items showcase-example-links">{entry.examples.map(example => <li key={example.id}><a className="showcase-nav-link" href={showcaseHref(page, entry.id, example)} aria-current={active && route.anchor === example.anchor ? "page" : undefined} onClick={event => followLink(event, onNavigate)}>{example.title}</a></li>)}</ul></CollapsibleContent>
  </Collapsible></li>
}
function SidebarSection({ group, route, onNavigate }: { group: typeof showcaseGroups[number]; route: ShowcaseRoute; onNavigate: () => void }) {
  return <Collapsible defaultOpen={group.page === route.page || group.page === "components"} className="showcase-nav-group">
    <CollapsibleTrigger className="showcase-nav-heading">{group.title}<ChevronRight size={13} aria-hidden="true" /></CollapsibleTrigger>
    <CollapsibleContent><ul className="showcase-nav-items">{group.entries.map(entry => <SidebarCategory key={entry.id} page={group.page} entry={entry} route={route} onNavigate={onNavigate} />)}</ul></CollapsibleContent>
  </Collapsible>
}
function SearchFooter() {
  const count = useCommandState(state => state.filtered.count)
  return <div className="showcase-search-footer">
    <span>{count} {count === 1 ? "result" : "results"}</span>
    <span className="showcase-search-keys" aria-hidden="true"><span><Kbd>↑ ↓</Kbd> Navigate</span><span><Kbd>↵</Kbd> Open</span><span><Kbd>Esc</Kbd> Close</span></span>
  </div>
}
export function ShowcaseSidebar({ route }: { route: ShowcaseRoute }) {
  const { setOpenMobile, openMobile } = useSidebar()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const searchInput = useRef<HTMLInputElement>(null)
  const selectedFromSearch = useRef(false)
  const selectedFromNavigation = useRef(false)
  useEffect(() => { if (openMobile) selectedFromNavigation.current = false }, [openMobile])
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform)
  useEffect(() => {
    const openSearch = () => { selectedFromSearch.current = false; setQuery(""); setSearchOpen(true) }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.altKey || event.shiftKey || event.repeat || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return
      if (event.composedPath().some(target => target instanceof HTMLElement && (target.isContentEditable || target.matches('input,textarea,select,[role="textbox"],[role="combobox"]')))) return
      event.preventDefault(); openSearch()
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("evenform:open-library-search", openSearch)
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("evenform:open-library-search", openSearch) }
  }, [])
  const closeNavigation = () => { selectedFromNavigation.current = true; setOpenMobile(false) }
  function choose(page: ShowcasePage, section = "", target?: { anchor?: string; preview?: string }) { selectedFromSearch.current = true; setSearchOpen(false); closeNavigation(); navigateShowcase(page, section, target) }
  return <>
    <Sidebar collapsible="offcanvas" className="showcase-sidebar" mobileFinalFocus={() => !selectedFromNavigation.current} onMobileOpenChangeComplete={open => {
      if (!open && selectedFromNavigation.current) {
        if (new URLSearchParams(location.hash.split("?")[1]).has("anchor")) window.dispatchEvent(new Event("evenform:reveal-example"))
        else document.getElementById("main-content")?.focus({ preventScroll: true })
      }
    }}><ShowcaseSidebarShortcut />
      <SidebarHeader className="showcase-sidebar-header"><a href="#foundations" className="showcase-brand" aria-label="Evenform design system foundations" onClick={event => followLink(event, closeNavigation)}><img src={`${import.meta.env.BASE_URL}brand/evenform-logo-compact.svg`} className="showcase-brand-logo dark:hidden" width="128" height="30" alt="" /><img src={`${import.meta.env.BASE_URL}brand/evenform-logo-compact-dark.svg`} className="showcase-brand-logo hidden dark:block" width="128" height="30" alt="" /></a>
        <button type="button" className="showcase-library-search" aria-haspopup="dialog" aria-expanded={searchOpen} aria-keyshortcuts="Control+K Meta+K" onClick={() => { selectedFromSearch.current = false; setQuery(""); setSearchOpen(true) }}><Search size={15} aria-hidden="true" /><span>Search library</span><Kbd>{isMac ? "⌘ K" : "Ctrl K"}</Kbd></button>
      </SidebarHeader>
      <SidebarContent><nav aria-label="Library navigation" className="showcase-library-nav">
        <div className="showcase-intro-links">
          <a href="#foundations" className="showcase-nav-link showcase-intro-link" aria-current={route.page === "foundations" ? "page" : undefined} onClick={event => followLink(event, closeNavigation)}><Blocks size={15} aria-hidden="true" />Foundations</a>
          <a href="#appearance" className="showcase-nav-link" aria-current={route.page === "appearance" ? "page" : undefined} onClick={event => followLink(event, closeNavigation)}><Palette size={15} aria-hidden="true" />Appearance lab</a>
        </div>
        {showcaseGroups.map(group => <SidebarSection key={`${group.page}:${route.page === group.page}`} group={group} route={route} onNavigate={closeNavigation} />)}
        <Collapsible defaultOpen={exampleEntries.some(item => item.id === route.page)} key={`examples:${exampleEntries.some(item => item.id === route.page)}`} className="showcase-nav-group"><CollapsibleTrigger className="showcase-nav-heading">Application examples<ChevronRight size={13} aria-hidden="true" /></CollapsibleTrigger><CollapsibleContent><ul className="showcase-nav-items">{exampleEntries.map(item => <li key={item.id}><a href={showcaseHref(item.id)} className="showcase-nav-link" aria-current={route.page === item.id ? "page" : undefined} onClick={event => followLink(event, closeNavigation)}>{item.title}</a></li>)}</ul></CollapsibleContent></Collapsible>
      </nav></SidebarContent>
      <SidebarFooter><a href={`${import.meta.env.BASE_URL}starter.html`} target="_blank" rel="noreferrer" className="showcase-starter-link">Open Starter<ArrowUpRight size={13} aria-hidden="true" /></a></SidebarFooter>
    </Sidebar>
    <CommandDialog finalFocus={() => !selectedFromSearch.current} open={searchOpen} onOpenChange={setSearchOpen} onOpenChangeComplete={open => { if (!open && selectedFromSearch.current) { if (new URLSearchParams(location.hash.split("?")[1]).has("anchor")) window.dispatchEvent(new Event("evenform:reveal-example")); else document.getElementById("main-content")?.focus({ preventScroll: true }) } }} commandProps={{ filter: libraryFilter, className: "showcase-search", loop: true }} title="Search library" description="Search components, layouts and examples.">
      <div className="showcase-search-field">
        <CommandInput ref={searchInput} value={query} onValueChange={setQuery} placeholder="Search components, patterns, charts…" />
        {query && <Button variant="ghost" size="sm" onClick={() => { setQuery(""); searchInput.current?.focus() }}>Clear</Button>}
        <Button variant="ghost" size="icon-sm" aria-label="Close search" onClick={() => setSearchOpen(false)}><X aria-hidden="true" /></Button>
      </div>
      <CommandList><CommandEmpty><Search size={24} aria-hidden="true" /><strong>No results found</strong><p>Try a component name, like “Button”, or a task, like “Upload”.</p></CommandEmpty>
        <CommandGroup heading="Documentation">
          <CommandItem value="foundations tokens design theme density" onSelect={() => choose("foundations")}><span>Foundations<span className="showcase-search-description"></span></span><ChevronRight size={14} aria-hidden="true" /></CommandItem>
          <CommandItem value="appearance lab customize palette color elevation density theme" onSelect={() => choose("appearance")}><span>Appearance lab<span className="showcase-search-description"></span></span><ChevronRight size={14} aria-hidden="true" /></CommandItem>
        </CommandGroup>
        {showcaseGroups.map(group => <CommandGroup heading={group.title} key={group.page}>{group.entries.map(entry => <CommandItem key={entry.id} value={`${group.page} ${entry.title} overview`} onSelect={() => choose(group.page, entry.id)}><span>{entry.title}<span className="showcase-search-description">All examples · {group.title}</span></span><ChevronRight size={14} aria-hidden="true" /></CommandItem>)}{group.entries.flatMap(entry => (entry.examples ?? []).map(example => <CommandItem key={example.id} value={`${example.id} ${example.title} ${example.keywords}`} onSelect={() => choose(group.page, entry.id, example)}><span>{example.title}<span className="showcase-search-description">{entry.title} · {group.title}</span></span><ChevronRight size={14} aria-hidden="true" /></CommandItem>))}</CommandGroup>)}
        <CommandGroup heading="Application examples">{exampleEntries.map(item => <CommandItem key={item.id} value={`${item.title} ${item.keywords}`} onSelect={() => choose(item.id)}><span>{item.title}<span className="showcase-search-description">{item.description}</span></span><ChevronRight size={14} aria-hidden="true" /></CommandItem>)}</CommandGroup>
      </CommandList>
      <SearchFooter />
    </CommandDialog>
  </>
}
