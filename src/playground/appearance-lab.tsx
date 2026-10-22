import { useRef, useState } from "react"
import {
  Check,
  ChevronDown,
  RotateCcw,
  Pencil,
  ClipboardCheck,
} from "lucide-react"
import { PageHeader, FormField } from "@/components/patterns/layouts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useTheme } from "@/components/theme-provider"
import type { TokenPlayground } from "./use-tokens"
import { AppearanceControls } from "./appearance-controls"
import { TokenAdjustments, TokenExport } from "./token-editors"

export function AppearanceLab({ tokens }: { tokens: TokenPlayground }) {
  const nameInput = useRef<HTMLInputElement>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const configuration = useRef<HTMLElement>(null)
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState("Design workspace")
  const [description, setDescription] = useState(
    "A shared space for design reviews and product decisions."
  )
  const [team, setTeam] = useState("design")
  const [summary, setSummary] = useState(true)
  const [saved, setSaved] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  function discard() {
    setName("Design workspace")
    setDescription("A shared space for design reviews and product decisions.")
    setTeam("design")
    setSummary(true)
    setSaved(false)
  }
  return (
    <div className="appearance-lab">
      <PageHeader title="Appearance lab" />
      <div className="appearance-workbench">
        <section
          ref={configuration}
          className="appearance-config"
          aria-label="Appearance settings"
        >
          <div className="appearance-pane-heading">
            <h2>Settings</h2>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Reset appearance"
              title="Reset appearance"
              onClick={() => tokens.reset()}
            >
              <RotateCcw />
            </Button>
          </div>
          <Tabs defaultValue="appearance" className="appearance-settings-tabs">
            <TabsList
              motion="slide"
              variant="line"
              className="w-full"
              aria-label="Settings category"
            >
              <TabsTrigger value="appearance">General</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            <TabsContent
              value="appearance"
              className="appearance-settings-content"
            >
              <fieldset>
                <legend>Mode</legend>
                <Tabs
                  value={theme}
                  onValueChange={(value) =>
                    setTheme(value as "light" | "dark" | "system")
                  }
                >
                  <TabsList motion="slide" className="w-full" aria-label="Color mode">
                    <TabsTrigger value="light">Light</TabsTrigger>
                    <TabsTrigger value="dark">Dark</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                  </TabsList>
                </Tabs>
              </fieldset>
              <fieldset>
                <legend>Density</legend>
                <Tabs
                  value={tokens.density}
                  onValueChange={(value) =>
                    tokens.setDensity(value as "compact" | "comfortable")
                  }
                >
                  <TabsList motion="slide" className="w-full" aria-label="Preview density">
                    <TabsTrigger value="compact">Compact</TabsTrigger>
                    <TabsTrigger value="comfortable">Comfortable</TabsTrigger>
                  </TabsList>
                </Tabs>
              </fieldset>
              <AppearanceControls tokens={tokens} />
            </TabsContent>
            <TabsContent value="tokens" className="appearance-token-content">
              <TokenAdjustments tokens={tokens} />
            </TabsContent>
            <TabsContent value="export">
              <TokenExport tokens={tokens} />
            </TabsContent>
          </Tabs>
        </section>
        <section className="appearance-preview" aria-label="Live preview">
          <div className="appearance-pane-heading">
            <h2>Preview</h2>
          </div>
          <div className="appearance-elevation-stage">
            <div
              className="appearance-floating-sample"
              role="group"
              aria-label="Quick actions preview"
            >
              <Button
                variant="ghost"
                onClick={() => nameInput.current?.focus()}
              >
                <Pencil />
                Edit workspace
              </Button>
              <Button variant="ghost" onClick={() => setReviewOpen(true)}>
                <ClipboardCheck />
                Review changes
              </Button>
            </div>
          </div>
          <div className="appearance-preview-surface">
            <div className="appearance-preview-heading">
              <h3>Workspace settings</h3>
              <Badge className="bg-success-surface text-success">Active</Badge>
            </div>
            <form
              className="appearance-demo"
              onSubmit={(event) => {
                event.preventDefault()
                setSaved(true)
              }}
            >
              <FormField id="appearance-name" label="Workspace name">
                <Input
                  ref={nameInput}
                  id="appearance-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setSaved(false)
                  }}
                  required
                />
              </FormField>
              <FormField id="appearance-team" label="Team">
                <Select
                  value={team}
                  onValueChange={(value) => {
                    if (value) {
                      setTeam(value)
                      setSaved(false)
                    }
                  }}
                >
                  <SelectTrigger id="appearance-team" className="w-full">
                    <SelectValue>
                      {team === "design" ? "Design team" : "Product team"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">Design team</SelectItem>
                    <SelectItem value="product">Product team</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="appearance-description" label="Description">
                <Textarea
                  id="appearance-description"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value)
                    setSaved(false)
                  }}
                />
              </FormField>
              <label className="toolbar">
                <Checkbox
                  checked={summary}
                  onCheckedChange={(value) => {
                    setSummary(value)
                    setSaved(false)
                  }}
                />
                Email me a weekly summary
              </label>
              <div className="toolbar">
                <Button type="submit">
                  <Check />
                  Save changes
                </Button>
                <Button type="button" variant="outline" onClick={discard}>
                  Discard
                </Button>
              </div>
              {saved && (
                <p role="status" className="quiet-meta">
                  Saved locally.
                </p>
              )}
            </form>
            <div className="appearance-preview-actions">
              <Popover
                open={popoverOpen}
                onOpenChange={(open, details) => {
                  const target =
                    details.reason === "focus-out" &&
                    details.event instanceof FocusEvent
                      ? details.event.relatedTarget
                      : details.event.target
                  if (
                    !open &&
                    target instanceof Node &&
                    configuration.current?.contains(target) &&
                    (details.reason === "outside-press" ||
                      details.reason === "focus-out")
                  ) {
                    details.cancel()
                    return
                  }
                  setPopoverOpen(open)
                }}
              >
                <PopoverTrigger render={<Button variant="outline" />}>
                  Quick edit
                  <ChevronDown />
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverTitle>Quick edit</PopoverTitle>
                  <FormField id="appearance-short-name" label="Short name">
                    <Input id="appearance-short-name" defaultValue="Evenform" />
                  </FormField>
                </PopoverContent>
              </Popover>
              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger render={<Button variant="outline" />}>
                  Review changes
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review changes</DialogTitle>
                    <DialogDescription>
                      {name} ·{" "}
                      {team === "design" ? "Design team" : "Product team"}
                    </DialogDescription>
                  </DialogHeader>
                  <p>{description}</p>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>
                      Back
                    </DialogClose>
                    <DialogClose
                      render={<Button onClick={() => setSaved(true)} />}
                    >
                      Confirm locally
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
