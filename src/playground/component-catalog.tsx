import { useState } from "react"
import { AlignCenter, AlignLeft, AlignRight, Check, ChevronDown, Copy, Search, Settings2 } from "lucide-react"
import { PageSection, FormField } from "@/components/patterns/layouts"
import { StatusMessage } from "@/components/patterns/status-message"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ButtonGroup } from "@/components/ui/button-group"
import { Kbd } from "@/components/ui/kbd"
import { Tag } from "@/components/ui/tag"
import { BreadcrumbPath } from "@/components/ui/breadcrumb"
import { PaginationControls } from "@/components/ui/pagination"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { NumberField, NumberFieldGroup, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } from "@/components/ui/number-field"
import { Slider } from "@/components/ui/slider"
import { Combobox, ComboboxInputGroup, ComboboxInput, ComboboxTrigger, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty, ComboboxChips, ComboboxChip, ComboboxChipRemove, ComboboxValue } from "@/components/ui/combobox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose } from "@/components/ui/popover"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import "./component-catalog.css"

const teams = ["Design", "Engineering", "Product", "Research", "Support"]
const people = ["Alex Kim", "Jamie Davis", "Morgan Lee", "Sam Taylor"]

export function ComponentCatalog() {
  const [team, setTeam] = useState<string | null>("Design")
  const [reviewers, setReviewers] = useState<string[]>(["Alex Kim", "Jamie Davis"])
  const [visibility, setVisibility] = useState("team")
  const [seats, setSeats] = useState<number | null>(8)
  const [range, setRange] = useState<readonly number[]>([20, 70])
  const [tags, setTags] = useState(["Design system", "Q4 planning"])
  const [updates, setUpdates] = useState(true)
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState("")
  return <div className="preview-stack catalog" data-testid="component-catalog">
    <PageSection title="Input & selection">
      <div className="catalog-grid">
        <div className="catalog-example">
          <div role="group" aria-label="Combobox example" id="example-combobox" className="showcase-example"><FormField id="catalog-team" label="Team">
            <Combobox items={teams} value={team} onValueChange={setTeam}>
              <ComboboxInputGroup><ComboboxInput id="catalog-team" /><ComboboxTrigger aria-label="Show teams" /></ComboboxInputGroup>
              <ComboboxContent><ComboboxEmpty>No teams found.</ComboboxEmpty><ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent>
            </Combobox>
          </FormField></div>
          <FormField id="catalog-reviewers" label="Reviewers" description="Select one or more reviewers.">
            <Combobox multiple items={people} value={reviewers} onValueChange={setReviewers}>
              <ComboboxChips>
                <ComboboxValue>{(values: string[]) => <>{values.map(value => <ComboboxChip key={value}>{value}<ComboboxChipRemove aria-label={`Remove ${value}`} /></ComboboxChip>)}<ComboboxInput id="catalog-reviewers" placeholder="Add reviewer…" aria-describedby="catalog-reviewers-description" /></>}</ComboboxValue>
              </ComboboxChips>
              <ComboboxContent><ComboboxEmpty>No people found.</ComboboxEmpty><ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent>
            </Combobox>
          </FormField>
          <div role="group" aria-label="Input group example" id="example-input-group" className="showcase-example"><FormField id="catalog-search" label="Input group" >
            <InputGroup><InputGroupAddon><Search size={16} aria-hidden="true" /></InputGroupAddon><InputGroupInput id="catalog-search" placeholder="Search projects…" /><InputGroupAddon align="end"><Kbd>⌘ K</Kbd></InputGroupAddon></InputGroup>
          </FormField></div>
        </div>
        <div className="catalog-example">
          <fieldset className="catalog-fieldset"><legend>Visibility</legend><div role="group" aria-label="Radio group example" id="example-radio-group" className="showcase-example"><RadioGroup value={visibility} onValueChange={setVisibility} aria-label="Project visibility"><label className="catalog-choice"><RadioGroupItem value="team" /><span>Team only<small>Everyone in your workspace</small></span></label><label className="catalog-choice"><RadioGroupItem value="invited" /><span>Invited people<small>Only people you add</small></span></label><label className="catalog-choice"><RadioGroupItem value="public" disabled /><span>Public<small>Unavailable on this plan</small></span></label></RadioGroup></div></fieldset>
          <div role="group" aria-label="Number field example" id="example-number-field" className="showcase-example"><FormField id="catalog-seats" label="Seats" description="1–50 seats.">
            <NumberField value={seats} onValueChange={setSeats} min={1} max={50}>
              <NumberFieldGroup><NumberFieldDecrement aria-label="Remove one seat" /><NumberFieldInput id="catalog-seats" aria-describedby="catalog-seats-description" /><NumberFieldIncrement aria-label="Add one seat" /></NumberFieldGroup>
            </NumberField>
          </FormField></div>
          <div className="catalog-range"><span id="catalog-range-label" className="catalog-label">Capacity range <output>{range[0]}–{range[1]}%</output></span><div role="group" aria-label="Slider example" id="example-slider" className="showcase-example"><Slider value={range} onValueChange={setRange} min={0} max={100} step={5} aria-labelledby="catalog-range-label" getAriaLabel={(index) => index === 0 ? "Minimum capacity" : "Maximum capacity"} getAriaValueText={(value) => `${value}%`} /></div></div>
        </div>
      </div>
    </PageSection>
    <PageSection title="Actions & overlays" >
      <div className="catalog-grid">
        <div className="catalog-example">
          <div className="toolbar">
            <div role="group" aria-label="Dropdown menu example" id="example-dropdown-menu" className="showcase-example"><DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" />}>Project actions<ChevronDown /></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuGroup><DropdownMenuLabel>Customer experience</DropdownMenuLabel><DropdownMenuItem onClick={() => setNotice("Project duplicated in this preview.")}><Copy size={16} />Duplicate project</DropdownMenuItem><DropdownMenuItem disabled>Move to archive</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuCheckboxItem checked={updates} onCheckedChange={setUpdates}>Receive updates</DropdownMenuCheckboxItem><DropdownMenuSub><DropdownMenuSubTrigger>Export as</DropdownMenuSubTrigger><DropdownMenuSubContent><DropdownMenuItem onClick={() => setNotice("CSV export selected in this preview.")}>CSV spreadsheet</DropdownMenuItem><DropdownMenuItem onClick={() => setNotice("JSON export selected in this preview.")}>JSON data</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuSub></DropdownMenuContent></DropdownMenu></div>
            <div role="group" aria-label="Popover example" id="example-popover" className="showcase-example"><Popover><PopoverTrigger render={<Button variant="outline" />}><Settings2 />Quick edit</PopoverTrigger><PopoverContent className="form-stack"><div><PopoverTitle>Project nickname</PopoverTitle><PopoverDescription>A short label for your sidebar.</PopoverDescription></div><Input aria-label="Project nickname" defaultValue="Customer experience" /><PopoverClose render={<Button onClick={() => setNotice("Nickname updated in this preview.")} />}>Apply changes</PopoverClose></PopoverContent></Popover></div>
            <div role="group" aria-label="Alert dialog example" id="example-alert-dialog" className="showcase-example"><AlertDialog><AlertDialogTrigger render={<Button variant="outline" />}>Archive project</AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Archive this project?</AlertDialogTitle><AlertDialogDescription>Team members will lose access until you restore the project from the archive.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep project</AlertDialogCancel><AlertDialogAction onClick={() => setNotice("Project archived in this preview.")}>Archive project</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
          </div>

          <div className="toolbar"><div role="group" aria-label="Button group example" id="example-button-group" className="showcase-example"><ButtonGroup aria-label="Preview actions"><Button variant="outline" onClick={() => setNotice("Changes saved in this preview.")}>Save changes</Button><Button variant="outline" onClick={() => setNotice("Draft saved in this preview.")}>Save draft</Button></ButtonGroup></div></div>
        </div>
        <div className="catalog-example">
          <div><span className="catalog-label" id="alignment-label">Text alignment</span><div role="group" aria-label="Toggle group example" id="example-toggle-group" className="showcase-example"><ToggleGroup defaultValue={["left"]} aria-labelledby="alignment-label"><ToggleGroupItem value="left" aria-label="Align left"><AlignLeft size={16} /></ToggleGroupItem><ToggleGroupItem value="center" aria-label="Align center"><AlignCenter size={16} /></ToggleGroupItem><ToggleGroupItem value="right" aria-label="Align right"><AlignRight size={16} /></ToggleGroupItem></ToggleGroup></div></div>
          <div role="group" aria-label="Tag example" id="example-tag"><span className="catalog-label">Removable tags</span><div className="toolbar">{tags.map(tag => <Tag key={tag} onRemove={() => setTags(tags.filter(value => value !== tag))}>{tag}</Tag>)}{tags.length < 2 && <Button variant="ghost" size="sm" onClick={() => setTags(["Design system", "Q4 planning"])}>Reset tags</Button>}</div></div>
          <div role="group" id="example-badge" className="toolbar" aria-label="Status badges"><Badge variant="info">In review</Badge><Badge variant="success">Published</Badge><Badge variant="warning">Needs attention</Badge><Badge variant="destructive">Failed</Badge></div>
        </div>
      </div>
      {notice && <StatusMessage tone="success" role="status" icon={<Check size={17} />} actions={<Button variant="ghost" size="sm" onClick={() => setNotice("")}>Dismiss message</Button>}>{notice}</StatusMessage>}
    </PageSection>
    <PageSection title="Navigation & disclosure" >
      <div className="catalog-grid">
        <div className="catalog-example">
          <div role="group" aria-label="Breadcrumb example" id="example-breadcrumb" className="showcase-example"><BreadcrumbPath items={[{label: "Playground", href: "#workspace"}, {label: "Components"}]} /></div>
          <div role="group" aria-label="Pagination example" id="example-pagination" className="catalog-pagination"><PaginationControls page={page} pageCount={8} onPageChange={setPage} /><p className="field-description" role="status">Page {page} of 8</p></div>
          <div role="group" aria-label="Collapsible example" id="example-collapsible" className="showcase-example"><Collapsible><CollapsibleTrigger render={<Button variant="ghost" />}>Show project note<ChevronDown /></CollapsibleTrigger><CollapsibleContent><p className="field-description">This project is ready for a final review. Confirm the owner and due date before publishing.</p></CollapsibleContent></Collapsible></div>
        </div>
        <div role="group" aria-label="Accordion example" id="example-accordion" className="showcase-example"><Accordion defaultValue={["tokens"]} className="catalog-example">
          <AccordionItem value="tokens"><AccordionTrigger>Who can update this project?</AccordionTrigger><AccordionContent>Project owners and editors can update the brief, schedule and review checklist.</AccordionContent></AccordionItem>
          <AccordionItem value="composition"><AccordionTrigger>Can I invite another reviewer?</AccordionTrigger><AccordionContent>Open Sharing & access to add a teammate and choose their access level.</AccordionContent></AccordionItem>
          <AccordionItem value="unavailable" disabled><AccordionTrigger>Enterprise policy (unavailable)</AccordionTrigger><AccordionContent>This policy is unavailable.</AccordionContent></AccordionItem>
        </Accordion></div>
      </div>
    </PageSection>
  </div>
}
