import { useShowcasePreview } from "./use-showcase-preview"
import { useRef, useState, type CSSProperties, type FormEvent } from "react"
import { ArrowLeft, Check, CircleCheck, Info, Mail, Save } from "lucide-react"
import { Banner } from "@/components/patterns/banner"
import { ContentLayout } from "@/components/patterns/content-layout"
import { DashboardGrid, DashboardItem, DashboardLayout } from "@/components/patterns/dashboard-layout"
import { DescriptionItem, DescriptionList } from "@/components/patterns/description-list"
import { FormLayout, FormLayoutSection } from "@/components/patterns/form-layout"
import { FormField } from "@/components/patterns/layouts"
import { PageNavigation } from "@/components/patterns/page-navigation"
import { Result } from "@/components/patterns/result"
import { SplitLayout } from "@/components/patterns/split-layout"
import { StatusMessage } from "@/components/patterns/status-message"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

function ReadingExample() {
  const [notice, setNotice] = useState(true)
  return <div className="layout-aids-example">
    {notice ? <Banner tone="info" icon={<Info />} onDismiss={() => setNotice(false)} dismissLabel="Dismiss reading announcement" actions={<a className="underline underline-offset-4" href="#layout-reading-review">Read the review checklist</a>}>The October handover is ready for review. Please confirm open items before Thursday.</Banner> : <Button variant="ghost" className="self-start" onClick={() => setNotice(true)}>Show announcement</Button>}
    <ContentLayout navigation={<PageNavigation items={[{ id: "layout-reading-principles", href: "#patterns/layouts?anchor=layout-reading-principles", label: "Handover ownership" }, { id: "layout-reading-content", href: "#patterns/layouts?anchor=layout-reading-content", label: "Review scope" }, { id: "layout-reading-review", href: "#patterns/layouts?anchor=layout-reading-review", label: "Review checklist" }]} />} aside={<p className="layout-aids-note">Updated 21 October 2026</p>}>
      <h3>October workspace handover</h3>
      <p>The October handover covers active projects, account access and the support rota. Review the checklist and record any outstanding questions before the next team checkpoint.</p>
      <h2 id="layout-reading-principles">Handover ownership</h2>
      <p>Sam Rivera is coordinating the handover. Jordan Lee will confirm account access, and Alex Morgan will review the support rota. Add any questions to the review queue with the project name and the date a response is needed.</p>
      <p>Each outstanding item needs an owner. If a question cannot be resolved before the checkpoint, agree on the next update and record it in the project notes.</p>
      <h2 id="layout-reading-content">Review scope</h2>
      <p>Confirm that team members have access to their assigned projects and know where to find the latest release notes. Check the support rota and agree on the first reporting date before closing the handover.</p>
      <ul><li>Confirm the project owner and backup contact.</li><li>Check access requests and the support rota.</li><li>Agree on the first reporting date.</li></ul>
      <h2 id="layout-reading-review">Review checklist</h2>
      <p>The next checkpoint is Thursday at 10:00 Singapore time. Review the outstanding items and confirm who will follow up on each question. Add the final notes to the handover record after the meeting.</p>
    </ContentLayout>
  </div>
}

const messages = [
  { id: "release", subject: "Release checklist ready", author: "Sam Rivera", body: "The release checklist now includes ownership, accessibility review, and rollout notes. Please confirm the final checks before publishing." },
  { id: "research", subject: "Research notes updated", author: "Jordan Lee", body: "The notes include five interviews and a summary of recurring questions. Review the findings and add any follow-up questions for the next session." },
  { id: "handover", subject: "Workspace handover", author: "Alex Morgan", body: "The workspace has an assigned owner and a documented support process. The handover record is ready for your review." },
]

function InboxExample() {
  const [selected, setSelected] = useState(messages[0])
  const [activePane, setActivePane] = useState<"list" | "detail">("list")
  const [read, setRead] = useState<string[]>([])
  const detailHeading = useRef<HTMLHeadingElement>(null)
  const listHeading = useRef<HTMLHeadingElement>(null)
  function openMessage(message: typeof messages[number]) {
    setSelected(message); setActivePane("detail")
    requestAnimationFrame(() => detailHeading.current?.focus())
  }
  function returnToList() { setActivePane("list"); requestAnimationFrame(() => listHeading.current?.focus()) }
  return <div className="layout-aids-example">

    <SplitLayout activePane={activePane} listLabel="Message list" detailLabel="Selected message" list={<><h3 ref={listHeading} tabIndex={-1}>Team inbox</h3><div className="layout-aids-records">{messages.map((message) => <Button key={message.id} variant="ghost" aria-pressed={selected.id === message.id} onClick={() => openMessage(message)}><Mail size={16} aria-hidden="true" />{message.subject}{read.includes(message.id) && <Check size={14} aria-label="Read" />}</Button>)}</div></>}>
      <div className="layout-aids-example"><Button variant="ghost" className="self-start" onClick={returnToList}><ArrowLeft />Back to messages</Button><h3 ref={detailHeading} tabIndex={-1}>{selected.subject}</h3><p className="layout-aids-note">From {selected.author}</p><p>{selected.body}</p><div className="toolbar"><Button variant="outline" disabled={read.includes(selected.id)} onClick={() => setRead((previous) => [...previous, selected.id])}>{read.includes(selected.id) ? <><CircleCheck />Marked as read</> : "Mark as read"}</Button><span role="status" className="layout-aids-note">{read.length} of {messages.length} messages read</span></div></div>
    </SplitLayout>
  </div>
}

function FormExample() {
  const [name, setName] = useState("Design workspace")
  const [summary, setSummary] = useState("Shared design resources, decisions, and implementation notes.")
  const [notify, setNotify] = useState(true)
  const [saved, setSaved] = useState(false)
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaved(true) }
  function reset() { setName("Design workspace"); setSummary("Shared design resources, decisions, and implementation notes."); setNotify(true); setSaved(false) }
  return <FormLayout aria-label="Workspace preferences" onSubmit={submit} header={<div><h3>Workspace preferences</h3></div>} footer={<><Button type="submit"><Save />Save preferences</Button><Button type="button" variant="outline" onClick={reset}>Reset form</Button>{saved && <span role="status" className="layout-aids-note">Preferences saved in this preview.</span>}</>}>
    <FormLayoutSection title="Workspace identity">
      <FormField id="layout-workspace-name" label="Workspace name"><Input id="layout-workspace-name" value={name} required onChange={(event) => { setName(event.target.value); setSaved(false) }} /></FormField>
      <FormField id="layout-workspace-summary" label="Summary" description="Use a short description of what belongs here."><Textarea id="layout-workspace-summary" aria-describedby="layout-workspace-summary-description" value={summary} onChange={(event) => { setSummary(event.target.value); setSaved(false) }} /></FormField>
    </FormLayoutSection>
    <FormLayoutSection title="Notifications"><label className="flex items-start gap-field"><Checkbox checked={notify} onCheckedChange={(value) => { setNotify(value); setSaved(false) }} /><span>Notify me when a review is requested</span></label></FormLayoutSection>
  </FormLayout>
}

function AdaptiveExample() {
  const [result, setResult] = useState<"success" | "error" | "forbidden" | "not-found">("success")
  const resultCopy = {
    success: { title: "Export prepared", description: "Your export preview is ready." },
    error: { title: "Export could not be prepared", description: "Review the selected records and try the export again." },
    forbidden: { title: "Access is restricted", description: "Ask a workspace owner for access to these records." },
    "not-found": { title: "Record could not be found", description: "The record may have moved. Return to the workspace to find it." },
  }
  return <DashboardLayout>
    <div><h3>Adaptable workspace regions</h3><p className="layout-aids-note">Drag the divider or focus it and use arrow keys to resize.</p></div>
    <DashboardGrid style={{ "--ds-dashboard-columns": 3 } as CSSProperties}>
      <DashboardItem style={{ "--ds-dashboard-span": 2 } as CSSProperties}><div className="layout-aids-panel"><h4>Review queue</h4><DescriptionList divided><DescriptionItem label="Ready for review">8 records</DescriptionItem><DescriptionItem label="Assigned to you">3 records</DescriptionItem><DescriptionItem label="Next checkpoint">Tomorrow, 10:00</DescriptionItem></DescriptionList></div></DashboardItem>
      <DashboardItem><div className="layout-aids-panel"><h4>Completion</h4><p className="layout-aids-numbers">18 / 24</p><p className="layout-aids-note">Reviewed this week.</p><Badge variant="secondary">6 remaining</Badge></div></DashboardItem>
    </DashboardGrid>
    <div className="layout-aids-resizable"><ResizablePanelGroup orientation="horizontal" aria-label="Resizable review workspace"><ResizablePanel id="review-notes" defaultSize="40%" minSize="25%"><div className="layout-aids-pane"><h4>Review notes</h4><p>Resize the panes to give more room to a long record or its supporting context.</p></div></ResizablePanel><ResizableHandle withHandle aria-label="Resize review notes and details" /><ResizablePanel id="review-record" defaultSize="60%" minSize="30%"><div className="layout-aids-pane"><h4>Selected record</h4><DescriptionList><DescriptionItem label="Project">Design foundations</DescriptionItem><DescriptionItem label="Owner">Sam Rivera</DescriptionItem><DescriptionItem label="Status">Awaiting review</DescriptionItem></DescriptionList><StatusMessage tone="info">Check the record and confirm its owner before requesting a review.</StatusMessage></div></ResizablePanel></ResizablePanelGroup></div>
    <p className="layout-aids-note layout-aids-resizable-small">Widen the window to resize the panes.</p>
    <div><h4>Task outcomes</h4><div className="toolbar mt-field">{(["success", "error", "forbidden", "not-found"] as const).map((status) => <Button key={status} variant={result === status ? "secondary" : "ghost"} aria-pressed={result === status} onClick={() => setResult(status)}>{({ success: "Complete", error: "Error", forbidden: "Restricted", "not-found": "Not found" })[status]}</Button>)}</div><Result status={result} title={resultCopy[result].title} description={resultCopy[result].description} actions={<Button variant="outline" onClick={() => setResult(result === "success" ? "error" : "success")}>{result === "success" ? "Preview a failed export" : "Preview completed export"}</Button>} /></div>
  </DashboardLayout>
}

export function LayoutAidsGallery() {
  const [preview, setPreview] = useShowcasePreview("patterns", "layouts", ["reading", "inbox", "form", "adaptive"], "reading")
  return <div className="layout-aids-gallery"><Tabs value={preview} onValueChange={setPreview}><TabsList className="layout-aids-gallery-tabs"><TabsTrigger value="reading">Reading</TabsTrigger><TabsTrigger value="inbox">List & detail</TabsTrigger><TabsTrigger value="form">Form layout</TabsTrigger><TabsTrigger value="adaptive">Adaptable regions</TabsTrigger></TabsList><TabsContent value="reading"><div role="group" aria-label="Content layout example" id="example-content-layout" className="showcase-example"><ReadingExample /></div></TabsContent><TabsContent value="inbox"><div role="group" aria-label="Split layout example" id="example-split-layout" className="showcase-example"><InboxExample /></div></TabsContent><TabsContent value="form"><div role="group" aria-label="Form layout example" id="example-form-layout" className="showcase-example"><FormExample /></div></TabsContent><TabsContent value="adaptive"><div role="group" aria-label="Dashboard & resizable regions example" id="example-dashboard-layout" className="showcase-example"><AdaptiveExample /></div></TabsContent></Tabs></div>
}
