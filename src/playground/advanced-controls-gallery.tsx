import { useState } from "react"
import { Bold, ChevronDown, FileText, Italic, Link, Redo, Underline, Undo } from "lucide-react"
import { PageSection } from "@/components/patterns/layouts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { EditorToolbar, EditorToolbarGroup, EditorToolbarButton, EditorToolbarSeparator } from "@/components/ui/editor-toolbar"
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "@/components/ui/context-menu"
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarCheckboxItem, MenubarShortcut } from "@/components/ui/menubar"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuOverlay, NavigationMenuIcon } from "@/components/ui/navigation-menu"
import { PreviewCard, PreviewCardTrigger, PreviewCardContent } from "@/components/ui/preview-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Meter, MeterLabel, MeterValue, MeterTrack, MeterIndicator } from "@/components/ui/meter"
import { OTPField } from "@/components/ui/otp-field"
import { ToastProvider, Toaster, useToastManager } from "@/components/ui/toast"

function NotificationExamples() {
  const toast = useToastManager()
  const [completed, setCompleted] = useState(false)
  return <div className="catalog-example">
    <div className="toolbar">
      <Button variant="outline" onClick={() => toast.add({ title: "Preview saved", description: "Your draft is available in this example.", type: "success" })}>Show notification</Button>
      <Button variant="outline" onClick={() => toast.add({title: "Example archived", description: "This preview changes no real data.", actionProps: {children: "Undo archive", onClick: () => {setCompleted(true); toast.close()} }})}>Notification with undo</Button>
      <Button variant="ghost" onClick={() => {toast.close(); setCompleted(false)}}>Dismiss all</Button>
    </div>
    <p className="field-description" role="status">{completed ? "Archive undone in this preview." : "Up to three notices remain visible. Hover or focus pauses dismissal; Escape and dismiss buttons close a notice."}</p>
  </div>
}

export function AdvancedControlsGallery() {
  const [notice, setNotice] = useState("")
  const [guides, setGuides] = useState(true)
  const [format, setFormat] = useState({bold: false, italic: false, underline: false})
  const [pinned, setPinned] = useState(false)
  const [usage, setUsage] = useState(64)
  const [otp, setOtp] = useState("")
  return <ToastProvider limit={3} timeout={6000}><div className="preview-stack catalog" data-testid="advanced-controls-gallery">
    <PageSection title="Commands & application navigation" >
      <div className="catalog-grid">
        <div className="catalog-example">
          <div role="group" aria-label="Menubar example" id="example-menubar" className="showcase-example"><Menubar aria-label="Document commands">
            <MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem onClick={() => setNotice("New document selected in this preview.")}>New document<MenubarShortcut>⌘ N</MenubarShortcut></MenubarItem><MenubarItem onClick={() => setNotice("A copy was created in this preview.")}>Create a copy</MenubarItem><MenubarSeparator /><MenubarItem disabled>Print document</MenubarItem></MenubarContent></MenubarMenu>
            <MenubarMenu><MenubarTrigger>Edit</MenubarTrigger><MenubarContent><MenubarItem onClick={() => setNotice("Undo selected in this preview.")}><Undo />Undo</MenubarItem><MenubarItem disabled><Redo />Redo</MenubarItem></MenubarContent></MenubarMenu>
            <MenubarMenu><MenubarTrigger>View</MenubarTrigger><MenubarContent><MenubarCheckboxItem checked={guides} onCheckedChange={setGuides}>Show layout guides</MenubarCheckboxItem></MenubarContent></MenubarMenu>
          </Menubar></div>
          <div role="group" aria-label="Context menu example" id="example-context-menu" className="showcase-example"><ContextMenu><ContextMenuTrigger tabIndex={0} className="rounded-lg border border-border p-card outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex items-center gap-toolbar"><FileText size={20} aria-hidden="true" /><span className="font-medium">Design review.doc</span></div>
            <p className="field-description mt-2">Right-click or press Shift + F10 for document commands.</p>
          </ContextMenuTrigger><ContextMenuContent><ContextMenuItem onClick={() => setNotice("Document opened in this preview.")}>Open document</ContextMenuItem><ContextMenuCheckboxItem checked={pinned} onCheckedChange={setPinned}>Pin document</ContextMenuCheckboxItem><ContextMenuSub><ContextMenuSubTrigger>Export document</ContextMenuSubTrigger><ContextMenuSubContent><ContextMenuItem onClick={() => setNotice("PDF export selected in this preview.")}>PDF document</ContextMenuItem><ContextMenuItem onClick={() => setNotice("Markdown export selected in this preview.")}>Markdown</ContextMenuItem></ContextMenuSubContent></ContextMenuSub><ContextMenuSeparator /><ContextMenuItem disabled>Move to trash</ContextMenuItem></ContextMenuContent></ContextMenu></div>
          <div className="toolbar"><div role="group" aria-label="Toggle example" id="example-toggle" className="showcase-example"><Toggle pressed={pinned} onPressedChange={setPinned}>Pin document</Toggle></div><Badge variant={guides ? "secondary" : "outline"}>Guides {guides ? "visible" : "hidden"}</Badge></div>
        </div>
        <div className="catalog-example">
          <div role="group" aria-label="Navigation menu example" id="example-navigation-menu" className="showcase-example"><NavigationMenu aria-label="Library navigation"><NavigationMenuList><NavigationMenuItem value="library"><NavigationMenuTrigger>Explore library<NavigationMenuIcon><ChevronDown size={14} /></NavigationMenuIcon></NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="#components"><strong>Components</strong><span className="text-muted-foreground text-label">Inputs, navigation, overlays and feedback.</span></NavigationMenuLink><NavigationMenuLink href="#patterns"><strong>Application patterns</strong><span className="text-muted-foreground text-label">Workspaces, details, settings and account access.</span></NavigationMenuLink><NavigationMenuLink href="#charts"><strong>Charts</strong><span className="text-muted-foreground text-label">Interactive data visualization with VChart.</span></NavigationMenuLink></NavigationMenuContent></NavigationMenuItem><NavigationMenuItem><NavigationMenuLink href="#foundations">Foundations</NavigationMenuLink></NavigationMenuItem></NavigationMenuList><NavigationMenuOverlay /></NavigationMenu></div>
          <p className="field-description">Arrow keys move between menu triggers; Escape closes the panel.</p>
          <p className="text-body">Built with <span role="group" aria-label="Preview card example" id="example-preview-card" className="showcase-example"><PreviewCard><PreviewCardTrigger href="#patterns" className="font-medium underline underline-offset-4">reusable application patterns</PreviewCardTrigger><PreviewCardContent><strong>Application patterns</strong><p className="text-label text-muted-foreground">Workspaces, detail pages, settings and account access.</p><a href="#patterns" className="text-label underline underline-offset-4">Browse the patterns</a></PreviewCardContent></PreviewCard></span>.</p>
          <p className="field-description">Hover or focus the link for a preview.</p>
        </div>
      </div>
      <p className="field-description" role="status">{notice || "Choose a document command to see feedback here."}</p>
    </PageSection>
    <PageSection title="Editing & contained content" >
      <div className="catalog-grid">
        <div className="catalog-example">
          <div role="group" aria-label="Editor toolbar example" id="example-editor-toolbar" className="showcase-example"><EditorToolbar aria-label="Text formatting"><EditorToolbarGroup aria-label="Formatting"><Toggle pressed={format.bold} onPressedChange={bold => setFormat({...format, bold})} render={<EditorToolbarButton />} aria-label="Bold"><Bold /></Toggle><Toggle pressed={format.italic} onPressedChange={italic => setFormat({...format, italic})} render={<EditorToolbarButton />} aria-label="Italic"><Italic /></Toggle><Toggle pressed={format.underline} onPressedChange={underline => setFormat({...format, underline})} render={<EditorToolbarButton />} aria-label="Underline"><Underline /></Toggle></EditorToolbarGroup><EditorToolbarSeparator /><EditorToolbarGroup aria-label="Document actions"><EditorToolbarButton onClick={() => setNotice("Link insertion selected in this preview.")} aria-label="Insert link"><Link /></EditorToolbarButton><EditorToolbarButton disabled aria-label="Undo formatting"><Undo /></EditorToolbarButton></EditorToolbarGroup></EditorToolbar></div>
          <p className="rounded-lg bg-muted p-card text-body" style={{fontWeight: format.bold ? 600 : undefined, fontStyle: format.italic ? "italic" : undefined, textDecoration: format.underline ? "underline" : undefined}}>Select a formatting control to change this preview. Arrow keys move through the toolbar; Tab continues to the next task.</p>
          <div role="group" aria-label="Meter example" id="example-meter" className="showcase-example"><Meter value={usage} getAriaValueText={(_, value) => `${value} GB of 100 GB used`}><MeterLabel>Storage used</MeterLabel><MeterValue>{(_, value) => `${value} / 100 GB`}</MeterValue><MeterTrack><MeterIndicator /></MeterTrack></Meter></div>
          <div className="toolbar"><Button variant="outline" size="sm" disabled={usage <= 0} onClick={() => setUsage(Math.max(0, usage - 8))}>Free 8 GB</Button><Button variant="outline" size="sm" disabled={usage >= 100} onClick={() => setUsage(Math.min(100, usage + 8))}>Use 8 GB</Button></div>
        </div>
        <div className="catalog-example">
          <div role="group" aria-label="Scroll area example" id="example-scroll-area" className="showcase-example"><ScrollArea className="h-64 rounded-lg border border-border" viewportProps={{"aria-label": "Recent document activity", tabIndex: 0}}><ol className="divide-y divide-border px-card">{Array.from({length: 14}, (_, index) => <li key={index} className="flex items-start justify-between gap-toolbar py-3 text-label"><span><strong className="block font-medium">{["Design review updated", "Comment resolved", "Version published", "Reviewer added"][index % 4]}</strong><span className="text-muted-foreground">{["Alex Kim", "Morgan Lee", "Jamie Davis"][index % 3]}</span></span><span className="text-muted-foreground shrink-0">{index + 1}h ago</span></li>)}</ol></ScrollArea></div>

        </div>
      </div>
    </PageSection>
    <PageSection title="Verification & notifications" >
      <div className="catalog-grid"><div className="catalog-example">
        <label htmlFor="advanced-verification-code" className="catalog-label">Verification code</label>
        <div role="group" aria-label="OTP field example" id="example-otp-field" className="showcase-example"><OTPField id="advanced-verification-code" length={6} value={otp} onValueChange={setOtp} aria-describedby="advanced-code-description" /></div>
        <p id="advanced-code-description" className="field-description">Enter or paste any six digits. No authentication request is sent.</p>
        <p className="field-description" role="status">{otp.length === 6 ? "Code complete. No verification request was sent." : `${otp.length} of 6 digits entered.`}</p>
        <div><Button variant="outline" size="sm" disabled={!otp} onClick={() => setOtp("")}>Clear code</Button></div>
      </div><div role="group" aria-label="Toast example" id="example-toast" className="showcase-example"><NotificationExamples /></div></div>
    </PageSection>
  </div><Toaster /></ToastProvider>
}
