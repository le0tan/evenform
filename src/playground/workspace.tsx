import { useState } from "react"
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Circle, CircleCheck, Folder, Plus, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { SortableList } from "@/components/patterns/sortable-list"
import { DescriptionItem, DescriptionList } from "@/components/patterns/description-list"
import { DataListLayout, FormField, PageHeader, PageSection } from "@/components/patterns/layouts"

type Project = { name: string; description: string; status: string; lead: string; due: string; progress: number }
const initialProjects: Project[] = [
  { name: "Website refresh", description: "Brand & experience", status: "In progress", lead: "JD", due: "Oct 28", progress: 72 },
  { name: "Mobile onboarding", description: "First impressions", status: "In review", lead: "AK", due: "Oct 24", progress: 92 },
  { name: "Design system", description: "Foundations & components", status: "In progress", lead: "ML", due: "Nov 02", progress: 56 },
  { name: "Customer insights", description: "Research & discovery", status: "Planned", lead: "SR", due: "Nov 08", progress: 18 },
]
function Status({ value }: { value: string }) { return <Badge variant="outline" className={value === "In review" ? "status-badge text-success bg-success-surface border-success/20 font-normal" : "status-badge font-normal"}><span className="status-dot" />{value}</Badge> }

export function Workspace() {
  const [projects, setProjects] = useState(initialProjects)
  const [activeTab, setActiveTab] = useState("overview")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("All projects")
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<Project | null>(null)
  const [checklist, setChecklist] = useState([
    { id: "workspace", textValue: "Create your workspace", completed: true },
    { id: "invite", textValue: "Invite your teammates", completed: true },
    { id: "project", textValue: "Set up your first project", completed: false },
  ])
  const [notice, setNotice] = useState("")
  const visible = projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase()) && (filter === "All projects" || project.status === filter))
  function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get("name")).trim()
    if (!name) return
    setProjects((current) => [...current, { name, description: String(data.get("description") || "New workspace project"), status: "Planned", lead: "YO", due: "Unscheduled", progress: 0 }])
    setCreateOpen(false); setNotice(`“${name}” created in this preview.`); setQuery(""); setFilter("All projects")
  }
  return <>
    <PageHeader title="Workspace" actions={<Button onClick={() => setCreateOpen(true)}><Plus data-icon="inline-start" />New project</Button>} />
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(String(value))}>
      <div className="workspace-tabs"><TabsList motion="slide" variant="line" aria-label="Workspace views"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList><span className="quiet-meta">Tuesday, October 20</span></div>
      <TabsContent value="overview" className="preview-stack">
        <div className="metrics-grid">
          {[{ title: "Active projects", value: String(projects.length + 8), change: "2 started this week", icon: Folder }, { title: "Tasks completed", value: "148", change: "+12% from last week", icon: CircleCheck }, { title: "Team capacity", value: "84%", change: "A healthy balance", icon: Circle }].map(({ title, value, change, icon: Icon }) => <Card key={title} data-testid={`metric-${title.toLowerCase().replaceAll(" ", "-")}`}><CardHeader><div className="metric-label"><CardTitle className="text-label font-medium">{title}</CardTitle><Icon size={16} /></div></CardHeader><CardContent><div className="metric-value">{value}</div><div className="metric-note">{title === "Tasks completed" && <ArrowUpRight size={13} />}{change}</div></CardContent></Card>)}
        </div>
        <PageSection title="Projects" actions={<Badge variant="secondary">{projects.length} projects</Badge>}>
          <DataListLayout isEmpty={!visible.length} toolbar={<><div className="search-control"><Search size={15} /><Input aria-label="Search projects" placeholder="Search projects…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Select value={filter} onValueChange={(value) => setFilter(value ?? "All projects")}><SelectTrigger aria-label="Filter projects"><SlidersHorizontal size={14} /><SelectValue /></SelectTrigger><SelectContent>{["All projects", "In progress", "In review", "Planned"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></>} empty={<><Search size={24} /><h3>No projects found</h3><p>Try a different name or clear your filters.</p><Button variant="outline" onClick={() => { setQuery(""); setFilter("All projects") }}>Clear filters</Button></>} footer={<><span>Showing {visible.length} of {projects.length} projects</span></>}>
            <Table><TableHeader><TableRow><TableHead>Project <ArrowDown className="inline-icon" /></TableHead><TableHead>Status</TableHead><TableHead>Lead</TableHead><TableHead>Due date</TableHead><TableHead className="text-right"><span className="sr-only">Open project</span></TableHead></TableRow></TableHeader><TableBody>{visible.map((project) => <TableRow key={project.name}><TableCell><button className="project-link" onClick={() => setSelected(project)}><span className="project-icon"><Folder size={16} /></span><span><strong>{project.name}</strong><span>{project.description}</span></span></button></TableCell><TableCell><Status value={project.status} /></TableCell><TableCell><span className="initial-avatar" title={`Project lead ${project.lead}`}>{project.lead}</span></TableCell><TableCell className="muted-cell">{project.due}</TableCell><TableCell><Button variant="ghost" size="icon-sm" aria-label={`Open ${project.name}`} onClick={() => setSelected(project)}><ArrowUpRight /></Button></TableCell></TableRow>)}</TableBody></Table>
          </DataListLayout>
        </PageSection>
        <div className="workspace-bottom">
          <PageSection title="Recent activity" actions={<Button variant="ghost" size="sm" onClick={() => setActiveTab("activity")}>View all<ArrowRight /></Button>}><Activity /></PageSection>
          <PageSection title="Workspace checklist">
            <SortableList motion label="Workspace checklist order" items={checklist} onReorder={setChecklist}>
              {(item) => <label className={item.completed ? "checklist-row is-complete" : "checklist-row"}>
                <Checkbox checked={item.completed} onCheckedChange={(completed) => setChecklist(current => current.map(row => row.id === item.id ? { ...row, completed } : row))} />
                <span>{item.textValue}</span>
              </label>}
            </SortableList>
            <p className="quiet-meta">{checklist.filter(item => item.completed).length} of 3 completed</p>
          </PageSection>
        </div>
      </TabsContent>
      <TabsContent value="activity"><PageSection title="Workspace activity"><Activity /></PageSection></TabsContent>
    </Tabs>
    {notice && <p role="status" className="inline-notice"><Check size={15} />{notice}<button onClick={() => setNotice("")}>Dismiss</button></p>}
    <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent><DialogHeader><DialogTitle>Create a project</DialogTitle><DialogDescription>Saved in this preview.</DialogDescription></DialogHeader><form className="form-stack" onSubmit={createProject}><FormField id="project-name" label="Project name"><Input id="project-name" name="name" placeholder="e.g. Customer portal" required maxLength={80} /></FormField><FormField id="project-description" label="Description"><Textarea id="project-description" name="description" placeholder="What are you working toward?" maxLength={240} /></FormField><DialogFooter><Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit"><Plus />Create project</Button></DialogFooter></form></DialogContent></Dialog>
    <Sheet open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null) }}><SheetContent><SheetHeader><SheetTitle>{selected?.name}</SheetTitle><SheetDescription>{selected?.description}</SheetDescription></SheetHeader>{selected && <SheetBody className="project-details"><Status value={selected.status} /><DescriptionList aria-label="Project details"><DescriptionItem label="Project lead">{selected.lead}</DescriptionItem><DescriptionItem label="Due date">{selected.due}</DescriptionItem><DescriptionItem label="Progress">{selected.progress}% complete</DescriptionItem></DescriptionList></SheetBody>}</SheetContent></Sheet>
  </>
}
function Activity() {
  return <div className="activity-list">{[{ initials: "AK", name: "Alex Kim", action: "moved Mobile onboarding to review", time: "12m ago" }, { initials: "ML", name: "Morgan Lee", action: "updated the component library", time: "48m ago" }, { initials: "JD", name: "Jamie Davis", action: "added 3 tasks to Website refresh", time: "2h ago" }].map(({ initials, name, action, time }) => <div className="activity-row" key={initials}><span className="initial-avatar">{initials}</span><p><strong>{name}</strong><span>{action}</span></p><time>{time}</time></div>)}</div>
}
