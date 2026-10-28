import { lazy, Suspense, useState, type FormEvent } from "react"
import { ArrowRight, Check, CircleCheck, Clock, Layers, Plus, Search, SlidersHorizontal, UserRound } from "lucide-react"
import { AuthLayout } from "@/components/patterns/auth-layout"
import { DetailLayout } from "@/components/patterns/detail-layout"
import { DescriptionItem, DescriptionList } from "@/components/patterns/description-list"
import { EmptyState } from "@/components/patterns/empty-state"
import { FilterBar, FilterChip } from "@/components/patterns/filter-bar"
import { FormSection } from "@/components/patterns/form-section"
import { FormField, PageHeader, PageSection } from "@/components/patterns/layouts"
import { SelectionBar } from "@/components/patterns/selection-bar"
import { Stat, StatGroup } from "@/components/patterns/stat"
import { StatusMessage } from "@/components/patterns/status-message"
import { Step, Steps } from "@/components/patterns/steps"
import { Timeline, TimelineItem } from "@/components/patterns/timeline"
import { Badge } from "@/components/ui/badge"
import { BreadcrumbPath } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { PaginationControls } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShowcasePagePanel } from "./showcase-page-panel"
import { patternEntries, patternValues } from "./showcase-navigation"
import "./pattern-gallery.css"
import { useShowcaseSection } from "./use-showcase-section"

type Project = { id: string; name: string; owner: string; status: "Active" | "In review" | "Paused"; updated: string }
const initialProjects: Project[] = [
  { id: "PRJ-1042", name: "Product analytics", owner: "Alex Morgan", status: "Active", updated: "2 hours ago" },
  { id: "PRJ-1041", name: "Customer research", owner: "Jordan Lee", status: "In review", updated: "3 hours ago" },
  { id: "PRJ-1040", name: "Design foundations", owner: "Sam Rivera", status: "Active", updated: "Today" },
  { id: "PRJ-1039", name: "Quarterly planning", owner: "Alex Morgan", status: "Paused", updated: "Yesterday" },
  { id: "PRJ-1038", name: "Onboarding experience", owner: "Jordan Lee", status: "Active", updated: "Yesterday" },
  { id: "PRJ-1037", name: "Release operations", owner: "Sam Rivera", status: "In review", updated: "2 days ago" },
  { id: "PRJ-1036", name: "Search quality", owner: "Alex Morgan", status: "Active", updated: "2 days ago" },
  { id: "PRJ-1035", name: "Partner portal", owner: "Jordan Lee", status: "Paused", updated: "3 days ago" },
  { id: "PRJ-1034", name: "Service health", owner: "Sam Rivera", status: "Active", updated: "3 days ago" },
]

function ProjectStatus({ status }: { status: Project["status"] }) {
  return <Badge variant="secondary"><span className="pattern-status-dot" data-status={status} aria-hidden="true" />{status}</Badge>
}

function DataWorkspace({ onInspect }: { onInspect: (project: Project) => void }) {
  const [projects, setProjects] = useState(initialProjects)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [notice, setNotice] = useState("")
  const pageSize = 4
  const filtered = projects.filter((project) => `${project.name} ${project.owner} ${project.id}`.toLowerCase().includes(query.toLowerCase()) && (status === "all" || project.status === status))
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const allVisibleSelected = visible.length > 0 && visible.every((project) => selected.has(project.id))
  const someVisibleSelected = visible.some((project) => selected.has(project.id))
  function clearFilters() { setQuery(""); setStatus("all"); setPage(1) }
  function toggleRow(id: string, checked: boolean) { setSelected((previous) => { const next = new Set(previous); if (checked) next.add(id); else next.delete(id); return next }) }
  function pauseSelected() {
    setProjects((previous) => previous.map((project) => selected.has(project.id) ? { ...project, status: "Paused", updated: "Just now" } : project))
    setNotice(`${selected.size} ${selected.size === 1 ? "project paused" : "projects paused"}.`)
    setSelected(new Set())
  }
  function createProject() {
    const next: Project = { id: `PRJ-${1043 + projects.length - initialProjects.length}`, name: `Untitled project ${projects.length - initialProjects.length + 1}`, owner: "Alex Morgan", status: "In review", updated: "Just now" }
    setProjects((previous) => [next, ...previous]); clearFilters(); setNotice(`${next.name} created.`)
  }
  return <div className="pattern-scenario">
    <div className="pattern-example-heading"><div><h2>Projects</h2></div><Button onClick={createProject}><Plus />Create project</Button></div>
    <StatGroup className="pattern-workspace-stats"><Stat label="Total projects" value={projects.length} /><Stat label="Active" value={projects.filter((project) => project.status === "Active").length} /><Stat label="Awaiting review" value={projects.filter((project) => project.status === "In review").length} /></StatGroup>
    {notice && <StatusMessage tone="success" role="status" icon={<CircleCheck />} actions={<Button size="sm" variant="ghost" onClick={() => setNotice("")}>Dismiss</Button>}>{notice}</StatusMessage>}
    <FilterBar
      search={<InputGroup><InputGroupAddon><Search size={16} aria-hidden="true" /></InputGroupAddon><InputGroupInput aria-label="Search projects" placeholder="Search projects or owners…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /></InputGroup>}
      filters={<Select value={status} onValueChange={(value) => { setStatus(value ?? "all"); setPage(1) }}><SelectTrigger aria-label="Filter project status"><SlidersHorizontal /><SelectValue>{status === "all" ? "All statuses" : status}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="In review">In review</SelectItem><SelectItem value="Paused">Paused</SelectItem></SelectContent></Select>}
      actions={<span className="pattern-caption">{filtered.length} {filtered.length === 1 ? "result" : "results"}</span>}
    >
      {query && <FilterChip removeLabel={`Remove search: ${query}`} onRemove={() => { setQuery(""); setPage(1) }}>Search: {query}</FilterChip>}
      {status !== "all" && <FilterChip removeLabel={`Remove status: ${status}`} onRemove={() => { setStatus("all"); setPage(1) }}>Status: {status}</FilterChip>}
    </FilterBar>
    <SelectionBar selectedCount={selected.size} onClear={() => setSelected(new Set())}><Button variant="outline" size="sm" onClick={pauseSelected}>Pause selected</Button></SelectionBar>
    {filtered.length === 0 ? <EmptyState icon={<Search />} title="No matching projects" description="Try another project name, owner, or status." actions={<Button variant="outline" onClick={clearFilters}>Clear filters</Button>} /> : <>
      <Table><caption className="sr-only">Projects. Select rows for batch actions or open a project to inspect its details.</caption><TableHeader><TableRow><TableHead className="pattern-selection-cell"><Checkbox aria-label="Select all projects on this page" checked={allVisibleSelected} indeterminate={someVisibleSelected && !allVisibleSelected} onCheckedChange={(checked) => setSelected((previous) => { const next = new Set(previous); visible.forEach((project) => { if (checked) next.add(project.id); else next.delete(project.id) }); return next })} /></TableHead><TableHead>Project</TableHead><TableHead>Status</TableHead><TableHead>Owner</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader>
        <TableBody>{visible.map((project) => <TableRow key={project.id} data-state={selected.has(project.id) ? "selected" : undefined}><TableCell><Checkbox aria-label={`Select ${project.name}`} checked={selected.has(project.id)} onCheckedChange={(checked) => toggleRow(project.id, checked)} /></TableCell><TableCell><Button variant="link" className="pattern-record-link" onClick={() => onInspect(project)}>{project.name}<ArrowRight /></Button><div className="pattern-caption">{project.id}</div></TableCell><TableCell><ProjectStatus status={project.status} /></TableCell><TableCell>{project.owner}</TableCell><TableCell className="pattern-caption">{project.updated}</TableCell></TableRow>)}</TableBody>
      </Table>
      <div className="pattern-pagination"><p className="pattern-caption">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} projects</p><PaginationControls page={currentPage} pageCount={pageCount} onPageChange={setPage} aria-label="Project pages" /></div>
    </>}

  </div>
}

function RecordDetail({ project }: { project: Project }) {
  const [stage, setStage] = useState(0)
  const [name, setName] = useState(project.name)
  const [owner, setOwner] = useState(project.owner)
  const [saved, setSaved] = useState(false)
  function saveRecord(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaved(true) }
  return <div className="pattern-scenario">
    <BreadcrumbPath items={[{ label: "Patterns", href: "#patterns" }, { label: "Projects", href: "#patterns" }, { label: project.id }]} />
    <DetailLayout
      header={<div className="pattern-example-heading"><div><h2>{name}</h2></div><div className="toolbar"><Badge variant="secondary">{["Draft", "In review", "Approved"][stage]}</Badge>{stage > 0 && <Button variant="ghost" onClick={() => setStage(0)}>Reset review</Button>}<Button disabled={stage === 2} onClick={() => setStage((previous) => Math.min(2, previous + 1))}>{["Request review", "Approve record", "Approved"][stage]}</Button></div></div>}
      aside={<><PageSection title="Record information"><DescriptionList divided><DescriptionItem label="Project ID">{project.id}</DescriptionItem><DescriptionItem label="Owner">{owner}</DescriptionItem><DescriptionItem label="Environment">Production</DescriptionItem><DescriptionItem label="Created"><time dateTime="2026-10-14">14 Oct 2026</time></DescriptionItem><DescriptionItem label="Visibility">Workspace members</DescriptionItem></DescriptionList></PageSection><PageSection title="Activity"><Timeline aria-label="Record activity">{stage === 2 && <TimelineItem title="Review approved" time="Just now" icon={<CircleCheck />}>The record is ready for release.</TimelineItem>}{stage > 0 && <TimelineItem title="Review requested" time={stage === 1 ? "Just now" : "A moment ago"} icon={<UserRound />}>A workspace owner was asked to review.</TimelineItem>}<TimelineItem title="Configuration updated" time="2 hours ago" icon={<SlidersHorizontal />}>Retention and ownership were confirmed.</TimelineItem><TimelineItem title="Project created" time="14 Oct" icon={<Plus />}>Created by {project.owner}.</TimelineItem></Timeline></PageSection></>}
    >
      <Steps aria-label="Record review progress"><Step title="Configure" status={stage === 0 ? "current" : "complete"} /><Step title="Review" status={stage === 0 ? "upcoming" : stage === 1 ? "current" : "complete"} /><Step title="Approved" status={stage === 2 ? "current" : "upcoming"} /></Steps>
      <StatusMessage tone={stage === 2 ? "success" : stage === 1 ? "info" : "neutral"} role="status" icon={stage === 2 ? <CircleCheck /> : <Clock />} title={["Ready for review", "Review in progress", "Review complete"][stage]}>{["Confirm the configuration, then request a review.", "Check the details and approve when everything is ready.", "Configuration approved."][stage]}</StatusMessage>
      <StatGroup className="pattern-detail-stats"><Stat label="Monthly requests" value="128,450" change={{ label: "↑ 12.8% from last month", tone: "neutral" }} /><Stat label="Error rate" value="0.08%" change={{ label: "↓ 0.03 points, improved", tone: "beneficial" }} help="Illustrative data" /></StatGroup>
      <form onSubmit={saveRecord} className="pattern-form"><FormSection title="Configuration" columns={2}><FormField id="pattern-record-name" label="Project name"><Input id="pattern-record-name" value={name} required onChange={(event) => { setName(event.target.value); setSaved(false) }} /></FormField><FormField id="pattern-record-owner" label="Owner"><Input id="pattern-record-owner" value={owner} required onChange={(event) => { setOwner(event.target.value); setSaved(false) }} /></FormField></FormSection><div className="toolbar"><Button type="submit" variant="outline">Save configuration</Button>{saved && <span role="status" className="pattern-save-status"><Check size={14} aria-hidden="true" />Saved in this preview</span>}</div></form>
    </DetailLayout>

  </div>
}

function AccountAccess() {
  const [email, setEmail] = useState("alex@example.com")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 8) { setPasswordError("Use at least 8 characters."); return }
    setPasswordError(""); setSubmitted(true); setPassword("")
  }
  return <div className="pattern-scenario">
    <AuthLayout className="pattern-auth-preview min-h-0" brand={<div className="pattern-auth-brand"><Layers size={20} aria-hidden="true" /><span>Evenform workspace</span></div>}
      footer={<p>Use sample credentials.</p>}
    >
      {submitted ? <div role="status"><EmptyState icon={<CircleCheck />} title="Preview complete" headingLevel={2} description={<>The form was validated for <strong>{email}</strong>.{remember ? " Remember me selected." : ""}</>} actions={<Button variant="outline" onClick={() => setSubmitted(false)}>Return to sign in</Button>} /></div> : <>
        <div className="pattern-auth-heading"><h2>Welcome back</h2></div>
        <form onSubmit={signIn} className="pattern-form">
          <FormSection title="Sign-in details"><FormField id="pattern-auth-email" label="Email address"><Input id="pattern-auth-email" type="email" autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} required /></FormField><FormField id="pattern-auth-password" label="Password" error={passwordError || undefined} description="At least 8 characters."><Input id="pattern-auth-password" type="password" autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setPasswordError("") }} aria-invalid={Boolean(passwordError)} aria-describedby={`pattern-auth-password-description${passwordError ? " pattern-auth-password-error" : ""}`} required /></FormField></FormSection>
          <label className="pattern-remember"><Checkbox checked={remember} onCheckedChange={setRemember} />Remember me</label>
          <Button type="submit">Preview sign in<ArrowRight /></Button>
        </form>
      </>}
    </AuthLayout>

  </div>
}

const OperationsExample = lazy(() => import("./operations-example").then(m => ({ default: m.OperationsExample })))

const RecordBrowser = lazy(() => import("./record-browser").then(m => ({ default: m.RecordBrowser })))

const LayoutAidsGallery = lazy(() => import("./layout-aids-gallery").then(m => ({default: m.LayoutAidsGallery})))

const ProductPatternsGallery = lazy(() => import("./product-patterns-gallery").then(m => ({default: m.ProductPatternsGallery})))

const WorkflowAidsGallery = lazy(() => import("./workflow-aids-gallery").then(m => ({default: m.WorkflowAidsGallery})))

export function PatternGallery() {
  const [tab, setTab] = useShowcaseSection("patterns", patternValues, patternValues[0])
  const [project, setProject] = useState(initialProjects[0])
  const current = patternEntries.find(item => item.id === tab) ?? patternEntries[0]
  return <div className="pattern-gallery">
    <PageHeader title={current.title} />
    <div>
      <ShowcasePagePanel active={tab === "operations"}><Suspense fallback={<p role="status">Loading review…</p>}><OperationsExample /></Suspense></ShowcasePagePanel>
      <ShowcasePagePanel active={tab === "records"}><Suspense fallback={<p role="status">Loading documents…</p>}><RecordBrowser /></Suspense></ShowcasePagePanel>
      <ShowcasePagePanel active={tab === "workspace"} keepMounted><DataWorkspace onInspect={(next) => { setProject(next); setTab("detail") }} /></ShowcasePagePanel>
      <ShowcasePagePanel active={tab === "detail"} keepMounted><RecordDetail key={project.id} project={project} /></ShowcasePagePanel>
      <ShowcasePagePanel active={tab === "access"} keepMounted><AccountAccess /></ShowcasePagePanel><ShowcasePagePanel active={tab === "product"}><Suspense fallback={<p role="status">Loading patterns…</p>}><ProductPatternsGallery /></Suspense></ShowcasePagePanel><ShowcasePagePanel active={tab === "workflow"}><Suspense fallback={<p role="status">Loading workflows…</p>}><WorkflowAidsGallery /></Suspense></ShowcasePagePanel><ShowcasePagePanel active={tab === "layouts"}><Suspense fallback={<p role="status">Loading layout patterns…</p>}><LayoutAidsGallery /></Suspense></ShowcasePagePanel>
    </div>
  </div>
}
