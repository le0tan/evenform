import { useState, type CSSProperties } from "react"
import { Download, FileText, LayoutGrid, List, Maximize, Minimize, X } from "lucide-react"
import { DescriptionItem, DescriptionList } from "@/components/patterns/description-list"
import { EmptyState } from "@/components/patterns/empty-state"
import { FilterBar } from "@/components/patterns/filter-bar"
import { HeaderShell } from "@/components/patterns/header-layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "./record-browser.css"

const records = [
  { id: "DOC-104", title: "Making complex work easier to find: research findings and recommendations for the next workspace release", owner: "Alex Morgan", category: "Research", updated: "22 Oct 2026", summary: "People find records through the words they remember, then compare context before opening a detail. Keep search, filters and view choices together." },
  { id: "DOC-103", title: "Keyboard navigation review", owner: "Jordan Lee", category: "Review", updated: "21 Oct 2026", summary: "A predictable focus order helps people move between the collection and the full report without losing their place." },
  { id: "DOC-102", title: "A shared vocabulary for project status", owner: "Sam Rivera", category: "Research", updated: "20 Oct 2026", summary: "Use the same status language in filters, list rows and record details. Keep explanatory copy close to the decision it supports." },
  { id: "DOC-101", title: "Release readiness notes", owner: "Alex Morgan", category: "Review", updated: "19 Oct 2026", summary: "Review the complete workflow with real content lengths, a narrow viewport and keyboard input before publishing." },
]
type RecordEntry = typeof records[number]
const findings = [
  ["Finding a record", "Search terms vary between teams and rarely match the exact document title.", "Search titles, owners and summaries; preserve the query when closing details."],
  ["Comparing results", "Long names carry useful context, especially when several documents share a topic.", "Allow names to wrap. Give the entire record one clear interactive boundary."],
  ["Reading evidence", "A long report needs more room than its short metadata summary.", "Place the report across the available width and scroll wide tables locally."],
  ["Returning to work", "Readers expect to continue from the same place after closing a detail.", "Keep the filter state and return keyboard focus to the record that opened the panel."],
]
function reportText(record: RecordEntry) {
  return `# ${record.title}\n\n${record.summary}\n\n${findings.map(([topic, observation, recommendation]) => `## ${topic}\n\n${observation}\n\n${recommendation}`).join("\n\n")}\n`
}
function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function RecordReport({ record }: { record: RecordEntry }) {
  return <article className="record-report" aria-label="Full report">
    <h3>Summary</h3><p>{record.summary}</p>
    <h3>What we observed</h3>
    <p>Participants moved between the collection and individual documents several times. The useful context was usually a combination of the title, owner and a short excerpt, rather than any single field.</p>
    <ul><li>Keep collection controls in one predictable place.</li><li>Let long titles wrap without squeezing the actions.</li><li>Keep the report readable independently of its metadata.</li></ul>
    <div className="record-report-table [&_[data-slot=table-container]]:overflow-visible" tabIndex={0} role="region" aria-label="Findings and recommendations; scroll horizontally for all columns">
      <Table><caption className="sr-only">Research observations and proposed changes</caption><TableHeader><TableRow><TableHead className="whitespace-normal align-top">Topic</TableHead><TableHead className="whitespace-normal align-top">Observation</TableHead><TableHead className="whitespace-normal align-top">Recommendation</TableHead></TableRow></TableHeader><TableBody>{findings.map(([topic, observation, recommendation]) => <TableRow key={topic}><TableCell className="whitespace-normal align-top">{topic}</TableCell><TableCell className="whitespace-normal align-top">{observation}</TableCell><TableCell className="whitespace-normal align-top">{recommendation}</TableCell></TableRow>)}</TableBody></Table>
    </div>
    <h3>Next steps</h3><p>Review the collection with the people who use it most often. Compare a compact list with a card view, then check that both lead to the same report and preserve the same reading position.</p>
    <p className="text-muted-foreground">Illustrative research content for this local preview.</p>
  </article>
}

function RecordCard({ record, view }: { record: RecordEntry; view: string }) {
  const [expanded, setExpanded] = useState(false)
  return <Sheet>
    <SheetTrigger render={<button type="button" className="record-browser-item" />}>
      <FileText aria-hidden="true" className="record-browser-icon" />
      <span className="record-browser-item-copy"><span className="record-browser-item-title">{record.title}</span>{view === "grid" && <span className="record-browser-excerpt">{record.summary}</span>}<span className="record-browser-meta">{record.owner} · {record.updated}</span></span>
      <Badge variant="secondary">{record.category}</Badge>
    </SheetTrigger>
    <SheetContent showCloseButton={false} className="record-browser-sheet" style={{ "--ds-sheet-max-width": expanded ? "100vw" : "56rem" } as CSSProperties}>
      <SheetHeader className="record-browser-sheet-header grid">
        <SheetTitle>{record.title}</SheetTitle>
        <div className="record-browser-actions" role="group" aria-label="Report actions">
          <CopyButton value={reportText(record)} size="icon-sm" variant="ghost" aria-label="Copy report"><span className="sr-only">Copy report</span></CopyButton>
          <Button variant="ghost" size="icon-sm" aria-label="Download report" onClick={() => download(`${record.id}.md`, reportText(record))}><Download /></Button>
          <Button variant="ghost" size="icon-sm" aria-label={expanded ? "Restore panel width" : "Expand panel"} aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? <Minimize /> : <Maximize />}</Button>
          <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close report" />}><X /></SheetClose>
        </div>
        <SheetDescription>{record.id} · {record.category}</SheetDescription>
      </SheetHeader>
      <SheetBody className="record-browser-sheet-body">
        <DescriptionList columns={2}><DescriptionItem label="Owner">{record.owner}</DescriptionItem><DescriptionItem label="Updated">{record.updated}</DescriptionItem></DescriptionList>
        <Accordion defaultValue={["report"]}>
          <AccordionItem value="report"><AccordionTrigger>Full report</AccordionTrigger><AccordionContent><RecordReport record={record} /></AccordionContent></AccordionItem>
          <AccordionItem value="notes"><AccordionTrigger>About this preview</AccordionTrigger><AccordionContent className="text-muted-foreground"><p>These documents are illustrative. Search, view selection and panel expansion stay in this example. Copy and download use your browser.</p></AccordionContent></AccordionItem>
        </Accordion>
      </SheetBody>
    </SheetContent>
  </Sheet>
}

/** Composition example only: records and state stay out of reusable components. */
export function RecordBrowser() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [view, setView] = useState("grid")
  const [collection, setCollection] = useState("all")
  const visible = records.filter(record =>
    (collection === "all" || record.owner === "Alex Morgan") &&
    (category === "all" || record.category === category) &&
    `${record.title} ${record.owner} ${record.summary}`.toLowerCase().includes(query.toLowerCase()),
  )
  return <div id="example-record-browser" role="group" aria-label="Record browser example" className="showcase-example">
    <HeaderShell contentAs="div" className="record-browser" header={<>
      <h2>Documents</h2>
      <Select value={collection} onValueChange={value => setCollection(value ?? "all")}><SelectTrigger aria-label="Document collection"><SelectValue>{collection === "all" ? "All documents" : "My documents"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">All documents</SelectItem><SelectItem value="mine">My documents</SelectItem></SelectContent></Select>
      <Button variant="outline" onClick={() => download("document-index.md", visible.map(reportText).join("\n---\n\n"))}><Download />Export index</Button>
    </>}>
      <Tabs value={view} onValueChange={setView}>
        <FilterBar search={<Input aria-label="Search documents" placeholder="Search documents…" value={query} onChange={event => setQuery(event.target.value)} />}
          filters={<Select value={category} onValueChange={value => setCategory(value ?? "all")}><SelectTrigger aria-label="Document category"><SelectValue>{category === "all" ? "All categories" : category}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem><SelectItem value="Research">Research</SelectItem><SelectItem value="Review">Review</SelectItem></SelectContent></Select>}
          actions={<TabsList size="control" motion="slide" aria-label="Document view"><TabsTrigger value="grid"><LayoutGrid />Grid</TabsTrigger><TabsTrigger value="list"><List />List</TabsTrigger></TabsList>} />
        {(["grid", "list"] as const).map(mode => <TabsContent key={mode} value={mode}>
          {visible.length ? <div className="record-browser-results" data-view={mode}>{visible.map(record => <RecordCard key={record.id} record={record} view={mode} />)}</div> : <EmptyState title="No documents found" description="Try another search or clear the filters." actions={<Button variant="outline" onClick={() => { setQuery(""); setCategory("all"); setCollection("all") }}>Clear filters</Button>} />}
        </TabsContent>)}
      </Tabs>
    </HeaderShell>
  </div>
}
