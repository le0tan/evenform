import { lazy, Suspense, useState, type CSSProperties } from "react"
import { ArrowRight, Check, CircleAlert, Copy, LoaderCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShowcasePagePanel } from "./showcase-page-panel"
import { componentEntries, componentValues } from "./showcase-navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { DescriptionItem, DescriptionList } from "@/components/patterns/description-list"
import { FormField, PageHeader, PageSection } from "@/components/patterns/layouts"
import { ComponentCatalog } from "@/playground/component-catalog"
import { ButtonGroup } from "@/components/ui/button-group"
import { useShowcaseSection } from "./use-showcase-section"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

const AdvancedControlsGallery = lazy(() => import("./advanced-controls-gallery").then(m => ({ default: m.AdvancedControlsGallery })))
const StructuredDataGallery = lazy(() => import("./structured-data-gallery").then(m => ({ default: m.StructuredDataGallery })))
const DateChoiceGallery = lazy(() => import("./date-choice-gallery").then(m => ({ default: m.DateChoiceGallery })))
const PeriodPickerGallery = lazy(() => import("./period-picker-gallery").then(m => ({ default: m.PeriodPickerGallery })))
const ListInputAidsGallery = lazy(() => import("./list-input-aids-gallery").then(m => ({ default: m.ListInputAidsGallery })))

const DataFormsGallery = lazy(() => import("./data-forms-gallery").then(m => ({default: m.DataFormsGallery})))

const MediaAidsGallery = lazy(() => import("./media-aids-gallery").then(m => ({default: m.MediaAidsGallery})))

const UtilityAidsGallery = lazy(() => import("./utility-aids-gallery").then(m => ({default: m.UtilityAidsGallery})))
const ContentAidsGallery = lazy(() => import("./content-aids-gallery").then(m => ({default: m.ContentAidsGallery})))

const DesignToolsGallery = lazy(() => import("./design-tools-gallery").then(m => ({default: m.DesignToolsGallery})))
const SpecializedAidsGallery = lazy(() => import("./specialized-aids-gallery").then(m => ({default: m.SpecializedAidsGallery})))

export function Gallery() {
  const [section] = useShowcaseSection("components", componentValues, "catalog")
  const current = componentEntries.find(item => item.id === section) ?? componentEntries[0]
  const [publish, setPublish] = useState(false)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("alex@")
  const [inviteEmailInvalid, setInviteEmailInvalid] = useState(true)
  return <><PageHeader title={current.title} description={current.description} />
    <div className="component-browser">
      <ShowcasePagePanel active={section === "catalog"}><ComponentCatalog /></ShowcasePagePanel>
      <ShowcasePagePanel active={section === "advanced"}><Suspense fallback={<p role="status">Loading controls…</p>}><AdvancedControlsGallery /></Suspense></ShowcasePagePanel>
      <ShowcasePagePanel active={section === "structured"}><Suspense fallback={<p role="status">Loading data controls…</p>}><StructuredDataGallery /></Suspense></ShowcasePagePanel>
      <ShowcasePagePanel active={section === "dates"}><Suspense fallback={<p role="status">Loading date controls…</p>}><DateChoiceGallery /><PeriodPickerGallery /></Suspense></ShowcasePagePanel>
      <ShowcasePagePanel active={section === "lists"}><Suspense fallback={<p role="status">Loading lists and tag controls…</p>}><ListInputAidsGallery /></Suspense></ShowcasePagePanel>
      <ShowcasePagePanel active={section === "dataforms"}><Suspense fallback={<p role="status">Loading components…</p>}><DataFormsGallery /></Suspense></ShowcasePagePanel>
      <ShowcasePagePanel active={section === "media"}><Suspense fallback={<p role="status">Loading components…</p>}><MediaAidsGallery /></Suspense></ShowcasePagePanel>
      <ShowcasePagePanel active={section === "utilities"}><Suspense fallback={<p role="status">Loading components…</p>}><UtilityAidsGallery /><ContentAidsGallery /></Suspense></ShowcasePagePanel>
      <ShowcasePagePanel active={section === "tools"}><Suspense fallback={<p role="status">Loading design tools…</p>}><DesignToolsGallery /></Suspense></ShowcasePagePanel>
      <ShowcasePagePanel active={section === "specialized"}><Suspense fallback={<p role="status">Loading design tools…</p>}><SpecializedAidsGallery /></Suspense></ShowcasePagePanel>
      <ShowcasePagePanel active={section === "compose"} className="preview-stack">
        <div className="gallery-grid">
          <Card id="example-card" data-testid="compose-card"><CardHeader><CardTitle>Project brief</CardTitle></CardHeader><CardContent><form id="brief-form" className="form-stack" onSubmit={(event) => { event.preventDefault(); setMessage("Project brief saved in this preview.") }}><div role="group" aria-label="Input example" id="example-input" className="showcase-example"><FormField id="brief-title" label="Project name"><Input id="brief-title" required placeholder="Customer experience" /></FormField></div><div role="group" aria-label="Select example" id="example-select" className="showcase-example"><FormField id="brief-team" label="Team"><Select defaultValue="design"><SelectTrigger id="brief-team" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="design">Design</SelectItem><SelectItem value="engineering">Engineering</SelectItem><SelectItem value="product">Product</SelectItem></SelectContent></Select></FormField></div><div role="group" aria-label="Textarea example" id="example-textarea" className="showcase-example"><FormField id="brief-description" label="Brief"><Textarea id="brief-description" placeholder="Describe what success looks like…" /></FormField></div></form></CardContent><CardFooter><Button type="submit" form="brief-form">Save brief<ArrowRight /></Button></CardFooter></Card>
          <div className="form-stack"><Card data-testid="sharing-card"><CardHeader><CardTitle>Sharing & access</CardTitle></CardHeader><CardContent className="form-stack"><div role="group" aria-label="Switch example" id="example-switch" className="preference-row"><div><label htmlFor="public-access">Public link</label><p>Anyone with the link can view.</p></div><Switch id="public-access" checked={publish} onCheckedChange={setPublish} /></div><div role="group" aria-label="Tooltip example" id="example-tooltip" className="share-link"><Input aria-label="Share link" value={publish ? "example.com/p/customer-experience" : "Public link is disabled"} readOnly disabled={!publish} /><Tooltip><TooltipTrigger render={<Button variant="outline" size="icon" aria-label="Copy share link" disabled={!publish} onClick={async () => { try { await navigator.clipboard.writeText("https://example.com/p/customer-experience"); setMessage("Example link copied.") } catch { setMessage("Clipboard unavailable. Select the link to copy it.") } }} />}><Copy /></TooltipTrigger><TooltipContent>Copy example link</TooltipContent></Tooltip></div><div role="group" aria-label="Checkbox example" id="example-checkbox" className="showcase-example"><label className="checklist-row"><Checkbox defaultChecked /><span>Allow comments from teammates</span></label></div></CardContent></Card>
          <Card id="example-dialog" data-testid="review-card"><CardHeader><CardTitle>Ready for review</CardTitle></CardHeader><CardContent><div className="review-people"><div className="avatar-stack"><span className="initial-avatar">JD</span><span className="initial-avatar">AK</span><span className="initial-avatar">ML</span></div><span className="quiet-meta">3 reviewers</span><Badge variant="secondary">Draft</Badge></div></CardContent><CardFooter><Dialog><DialogTrigger render={<Button variant="outline" />}><Plus />Request review</DialogTrigger><DialogContent><DialogHeader><DialogTitle>Request a review</DialogTitle><DialogDescription>No notifications are sent in this preview.</DialogDescription></DialogHeader><p>Jamie, Alex and Morgan will be selected as reviewers.</p><DialogFooter><DialogClose render={<Button variant="outline" />}>Cancel</DialogClose><DialogClose render={<Button onClick={() => setMessage("Review requested in this preview.")} />}>Request review</DialogClose></DialogFooter></DialogContent></Dialog></CardFooter></Card></div>
        </div>
        <PageSection id="example-description-list" title="Run details"  actions={<Badge variant="secondary">Completed</Badge>}>
          <DescriptionList columns={2} aria-label="Run information" data-testid="run-properties">
            <DescriptionItem label="Model">GPT-6.1-Sol</DescriptionItem>
            <DescriptionItem label="Provider">pangle-sol</DescriptionItem>
            <DescriptionItem label="Clock">Turn based</DescriptionItem>
            <DescriptionItem label="Stop condition">agent_finished</DescriptionItem>
            <DescriptionItem label="Action budget">80 actions</DescriptionItem>
            <DescriptionItem label="Reasoning effort">Low</DescriptionItem>
            <DescriptionItem label="Harness">0.2.1-rc.2</DescriptionItem>
            <DescriptionItem label="Started at"><time dateTime="2026-10-20T14:08:44+08:00">Oct 20, 2026 · 14:08:44 SGT</time></DescriptionItem>
            <DescriptionItem label="Result" className="col-span-full">Core loop demonstrated. The board resets after all 12 tiles are filled; secondary mechanics and level completion were not evaluated.</DescriptionItem>
            <DescriptionItem label="Artifact" className="col-span-full"><code>runs/2026-10-20/amaze/core-loop-verification/run-02/screenshots/frame-000006.png</code></DescriptionItem>
          </DescriptionList>
        </PageSection>
        <PageSection title="Review history" >
          <DescriptionList divided aria-label="Review information" data-testid="review-properties">
            <DescriptionItem label="Reviewed by">Jamie Davis</DescriptionItem>
            <DescriptionItem label="Review note">Two swipes exposed the fill loop. A further turn confirmed the remaining path before the board reset.</DescriptionItem>
          </DescriptionList>
        </PageSection>
        <PageSection id="example-button" title="Actions" ><div className="toolbar"><Button onClick={() => setMessage("Primary action selected.")}>Primary action</Button><Button variant="outline" onClick={() => setMessage("Secondary action selected.")}>Secondary</Button><Button variant="ghost" onClick={() => setMessage("Quiet action selected.")}>Ghost</Button><Button disabled>Unavailable</Button><Button variant="destructive" onClick={() => setMessage("Destructive styling preview; nothing was deleted.")}>Destructive</Button></div><div className="toolbar"><Button size="sm" variant="outline" onClick={() => setMessage("Small button selected.")}>Small</Button><Button variant="outline" onClick={() => setMessage("Default button selected.")}>Default</Button><Button size="lg" variant="outline" onClick={() => setMessage("Large button selected.")}>Large</Button></div></PageSection>
      </ShowcasePagePanel>
      <ShowcasePagePanel active={section === "states"} className="preview-stack"><PageSection id="example-field" title="Field states" ><div className="gallery-grid"><Card><CardHeader><CardTitle>Form feedback</CardTitle></CardHeader><CardContent className="form-stack"><FormField id="invalid-email" label="Invite by email" error={inviteEmailInvalid ? "Enter a complete email address, such as alex@example.com." : undefined}><Input id="invalid-email" type="email" required value={inviteEmail} onChange={(event) => { setInviteEmail(event.currentTarget.value); setInviteEmailInvalid(!event.currentTarget.validity.valid) }} aria-invalid={inviteEmailInvalid} aria-describedby={inviteEmailInvalid ? "invalid-email-error" : undefined} /></FormField><FormField id="disabled-input" label="Organization ID" description="Managed by your administrator."><Input id="disabled-input" defaultValue="org_acme" disabled aria-describedby="disabled-input-description" /></FormField></CardContent></Card><Card><CardHeader><CardTitle>Profile fields</CardTitle></CardHeader><CardContent><FieldGroup><Field><FieldLabel htmlFor="field-example">Display name</FieldLabel><Input id="field-example" placeholder="Your name" aria-describedby="field-help" /><FieldDescription id="field-help">Shown to your teammates.</FieldDescription></Field><Field orientation="horizontal"><Checkbox id="field-confirm" /><FieldLabel htmlFor="field-confirm">Send me project updates</FieldLabel></Field></FieldGroup></CardContent></Card></div></PageSection><PageSection id="example-skeleton" title="Loading & feedback"><div className="toolbar"><Button disabled={busy} onClick={() => { setBusy(true); setTimeout(() => { setBusy(false); setMessage("Preview sync completed.") }, 900) }}>{busy && <LoaderCircle className="animate-spin" />}{busy ? "Syncing…" : "Preview loading state"}</Button><Badge variant="secondary">Draft</Badge><Badge variant="outline">In review</Badge></div><div className="feedback-example" role="note"><CircleAlert size={17} /><div><strong>Your connection needs attention</strong><p>Example error state. Check your connection and try again.</p></div></div><div className="skeleton-example" aria-label="Loading content example"><Skeleton className="skeleton-avatar" /><div><Skeleton className="skeleton-line" /><Skeleton className="skeleton-line short" /></div></div></PageSection></ShowcasePagePanel>
      <ShowcasePagePanel active={section === "overrides"} className="preview-stack">
        <PageSection id="example-override-cascade" title="Predictable local overrides" >
          <div className="form-stack">
            <div className="toolbar"><Button data-testid="cascade-default">Token default</Button><Button data-testid="cascade-token" style={{ "--ds-button-height": "44px" } as CSSProperties}>Local token · 44px</Button><Button data-testid="cascade-utility" className="h-12">Utility · 48px</Button><Button data-testid="cascade-both" className="h-12" style={{ "--ds-button-height": "44px" } as CSSProperties}>Token + utility · 48px</Button><Button data-testid="cascade-inline" className="h-12" style={{ height: 52 }}>Inline property · 52px</Button></div>

            <div className="gallery-grid"><Card data-testid="cascade-card" style={{ "--ds-card-inset": "24px" } as CSSProperties}><CardHeader><CardTitle>One local card token</CardTitle></CardHeader><CardContent>24px inset</CardContent></Card><Card><CardHeader><CardTitle>One local property override</CardTitle></CardHeader><CardContent data-testid="cascade-card-content" className="px-8">32px content padding</CardContent></Card></div>
            <div className="gallery-grid"><div className="form-stack"><h3>Joined controls</h3><ButtonGroup orientation="vertical" aria-label="Vertical action group" data-testid="cascade-vertical-group"><Button variant="outline">First action</Button><Button variant="outline">Last action</Button></ButtonGroup><ButtonGroup aria-label="Square action group" data-testid="cascade-square-group"><Button variant="outline" className="rounded-none">Square by choice</Button><Button variant="outline" className="rounded-none">Utility wins</Button></ButtonGroup></div><FormField id="cascade-group-addon" label="Independent addon state" description="The input stays enabled while its secondary action is unavailable."><InputGroup data-testid="cascade-input-group"><InputGroupInput id="cascade-group-addon" aria-describedby="cascade-group-addon-description" placeholder="Enter a reference…" /><InputGroupAddon align="end"><Button size="sm" variant="ghost" disabled>Copy</Button></InputGroupAddon></InputGroup></FormField></div>
          </div>
        </PageSection>
      </ShowcasePagePanel>
    </div>
    {message && <p className="inline-notice" role="status"><Check size={15} />{message}<button onClick={() => setMessage("")}>Dismiss</button></p>}
  </>
}
