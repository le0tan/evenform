import { useEffect, useRef, useState } from "react"
import { Bold, Copy, Italic, Plus } from "lucide-react"
import { PageSection } from "@/components/patterns/layouts"
import { SortableList } from "@/components/patterns/sortable-list"
import { LoadingSwap } from "@/components/patterns/loading-swap"
import { MorphingPopoverContent } from "@/components/patterns/morphing-popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  FeedbackButton,
  type FeedbackState,
} from "@/components/ui/feedback-button"
import { CopyButton } from "@/components/ui/copy-button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverClose,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import "./motion-gallery.css"

const initialItems = ["Research", "Prototype", "Review", "Handoff"].map(
  (textValue, id) => ({ id, textValue })
)
function SampleTabs({
  line = false,
  vertical = false,
  label,
}: {
  line?: boolean
  vertical?: boolean
  label: string
}) {
  return (
    <Tabs
      defaultValue="overview"
      orientation={vertical ? "vertical" : "horizontal"}
    >
      <TabsList
        motion="slide"
        variant={line ? "line" : "default"}
        aria-label={label}
      >
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Your team’s latest work.</TabsContent>
      <TabsContent value="activity">No new updates.</TabsContent>
      <TabsContent value="settings">Workspace preferences.</TabsContent>
    </Tabs>
  )
}

export function MotionGallery() {
  const morphTrigger = useRef<HTMLButtonElement>(null)
  const [tab, setTab] = useState("all")
  const [feedback, setFeedback] = useState<FeedbackState>("idle")
  const [fail, setFail] = useState(false)
  const [ready, setReady] = useState(true)
  const [items, setItems] = useState(initialItems)
  const nextId = useRef(initialItems.length)
  const pending = useRef(false)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  function later(action: () => void, delay: number) {
    const timer = setTimeout(() => {
      timers.current.delete(timer)
      action()
    }, delay)
    timers.current.add(timer)
  }
  function save(delay: number) {
    if (pending.current) return
    pending.current = true
    setFeedback("loading")
    later(() => {
      setFeedback(fail ? "error" : "success")
      pending.current = false
    }, delay)
  }
  return (
    <div className="preview-stack motion-gallery">
      <PageSection
        id="example-motion-tabs"
        title="Selection"
        actions={
          <a
            href="#appearance"
            className="text-primary underline underline-offset-4"
          >
            Customize motion
          </a>
        }
      >
        <div className="gallery-grid">
          <div className="form-stack">
            <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
              <TabsList motion="slide" aria-label="Project filter">
                <TabsTrigger value="all">All projects</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
              <TabsContent value="all">12 projects</TabsContent>
              <TabsContent value="active">8 active projects</TabsContent>
              <TabsContent value="archived">4 archived projects</TabsContent>
            </Tabs>
            <SampleTabs line label="Project views" />
          </div>
          <SampleTabs vertical label="Vertical project views" />
        </div>
      </PageSection>
      <PageSection id="example-motion-tooltips" title="Tooltips">
        <TooltipProvider>
          <div className="toolbar" role="group" aria-label="Formatting tools">
            {[
              { label: "Bold", Icon: Bold },
              { label: "Italic", Icon: Italic },
              { label: "Copy text", Icon: Copy },
            ].map(({ label, Icon }) => (
              <Tooltip key={label}>
                <TooltipTrigger
                  render={
                    <Button variant="outline" size="icon" aria-label={label} />
                  }
                >
                  <Icon />
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" />}>
                Formatting help
              </TooltipTrigger>
              <TooltipContent>
                <a href="#components/compose" className="underline">
                  View examples
                </a>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </PageSection>
      <PageSection id="example-motion-feedback" title="Action feedback">
        <div className="form-stack">
          <div className="toolbar">
            <FeedbackButton
              data-testid="motion-save"
              state={feedback}
              onClick={() => save(800)}
              loadingLabel="Saving…"
              successLabel="Saved"
              errorLabel="Retry save"
            >
              Save changes
            </FeedbackButton>
            <Button
              variant="outline"
              disabled={feedback === "loading"}
              onClick={() => save(20)}
            >
              Quick save
            </Button>
            <CopyButton value="Evenform" />
            <Button
              variant="ghost"
              onClick={() => {
                if (!pending.current) setFeedback("idle")
              }}
            >
              Reset feedback
            </Button>
          </div>
          <label className="toolbar">
            <Checkbox checked={fail} onCheckedChange={setFail} />
            Fail next save
          </label>
        </div>
      </PageSection>
      <PageSection id="example-motion-overlays" title="Overlays">
        <div className="toolbar">
          <Popover>
            <PopoverTrigger render={<Button variant="outline" />}>
              Quick edit
            </PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>Workspace access</PopoverTitle>
              <p>3 teammates can edit this workspace.</p>
              <PopoverClose render={<Button variant="outline" />}>
                Done
              </PopoverClose>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Project actions
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Duplicate project</DropdownMenuItem>
              <DropdownMenuItem>Archive project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Review changes
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Review changes</DialogTitle>
              <DialogDescription>
                Your changes are ready. This is a local preview.
              </DialogDescription>
              <DialogClose render={<Button />}>Confirm</DialogClose>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger render={<Button variant="outline" />}>
              Open details
            </SheetTrigger>
            <SheetContent>
              <div className="motion-sheet-content">
                <SheetTitle>Project details</SheetTitle>
                <SheetDescription>Design system · In review</SheetDescription>
                <SheetClose render={<Button variant="outline" />}>
                  Done
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </PageSection>
      <PageSection id="example-motion-morph" title="Morphing popover">
        <div className="toolbar">
          <Popover>
            <PopoverTrigger
              ref={morphTrigger}
              render={<Button variant="outline" />}
            >
              Edit project
            </PopoverTrigger>
            <MorphingPopoverContent
              anchorRef={morphTrigger}
              align="start"
              sideOffset={8}
            >
              <PopoverTitle>Edit project</PopoverTitle>
              <label className="form-stack">
                Project name
                <Input defaultValue="Design system" />
              </label>
              <div className="toolbar">
                <PopoverClose render={<Button />}>Save project</PopoverClose>
                <PopoverClose render={<Button variant="ghost" />}>
                  Cancel
                </PopoverClose>
              </div>
            </MorphingPopoverContent>
          </Popover>
        </div>
      </PageSection>
      <PageSection
        id="example-motion-list"
        title="List updates"
        actions={
          <div className="toolbar">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const id = nextId.current++
                setItems((current) => [
                  ...current,
                  { id, textValue: `Task ${id + 1}` },
                ])
              }}
            >
              <Plus />
              Add item
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!items.length}
              onClick={() => setItems((current) => current.slice(0, -1))}
            >
              Remove last
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setItems((current) => [...current].reverse())}
            >
              Reverse
            </Button>
          </div>
        }
      >
        <SortableList
          motion
          items={items}
          onReorder={setItems}
          label="Project stages"
        >
          {(item) => item.textValue}
        </SortableList>
      </PageSection>
      <PageSection
        id="example-motion-loading"
        title="Loading content"
        actions={
          <Button
            variant="outline"
            disabled={!ready}
            onClick={() => {
              setReady(false)
              later(() => setReady(true), 650)
            }}
          >
            Reload summary
          </Button>
        }
      >
        <LoadingSwap
          ready={ready}
          label="Project summary"
          skeleton={
            <div className="form-stack">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          }
        >
          <div className="form-stack">
            <h3>October review</h3>
            <p>4 projects completed. 2 are ready for review.</p>
            <a
              href="#workspace"
              className="text-primary underline underline-offset-4"
            >
              Open workspace
            </a>
          </div>
        </LoadingSwap>
      </PageSection>
      <PageSection id="example-motion-reduced" title="Reduced motion">
        <div className="gallery-grid">
          <fieldset className="form-stack">
            <legend>System preference</legend>
            <SampleTabs label="System motion preview" />
          </fieldset>
          <fieldset className="form-stack" data-motion="reduce">
            <legend>Reduced motion</legend>
            <SampleTabs label="Reduced motion preview" />
          </fieldset>
        </div>
      </PageSection>
    </div>
  )
}
