import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import "./input-adoption-example.css"

type LoadSuggestions = (signal: AbortSignal) => Promise<string[]>

const loadSampleRecords: LoadSuggestions = (signal) =>
  new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", abort)
      resolve(["record-101", "record-102", "saved-record"])
    }, 250)
    function abort() {
      window.clearTimeout(timer)
      reject(new DOMException("Cancelled", "AbortError"))
    }
    if (signal.aborted) abort()
    else signal.addEventListener("abort", abort, { once: true })
  })

/** Host-owned recipe: suggestions are optional; the input is the submitted ID.
 * Request timing, persistence and validation do not belong to Combobox. */
export function FreeEntryComboboxExample({
  loadSuggestions = loadSampleRecords,
  initialValue = "saved-record",
}: {
  loadSuggestions?: LoadSuggestions
  initialValue?: string
}) {
  const id = useId()
  const [draft, setDraft] = useState(initialValue)
  const [items, setItems] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  )
  const request = useRef<AbortController | null>(null)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => () => request.current?.abort(), [])
  const load = async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setStatus("loading")
    try {
      const values = await loadSuggestions(controller.signal)
      if (!controller.signal.aborted) {
        setItems([...new Set(values)])
        setStatus("ready")
      }
    } catch {
      if (!controller.signal.aborted) setStatus("error")
    }
  }
  return (
    <section
      className="input-adoption-section"
      aria-labelledby={`${id}-heading`}
    >
      <h3 id={`${id}-heading`}>Find a record</h3>
      <div className="input-adoption-field">
        <Label htmlFor={id}>Record ID</Label>
        <Combobox
          items={items}
          value={items.includes(draft) ? draft : null}
          inputValue={draft}
          open={open}
          autoHighlight
          filter={(item, query) =>
            item.toLowerCase().includes(query.trim().toLowerCase())
          }
          onOpenChange={(next) => {
            setOpen(next)
            if (next) void load()
            else request.current?.abort()
          }}
          onInputValueChange={(text, details) => {
            if (details.reason === "input-change") setDraft(text)
          }}
          onValueChange={(selected) => {
            // A null selection on blur must not erase an unmatched draft.
            if (selected !== null) setDraft(selected)
          }}
        >
          <ComboboxInputGroup>
            <ComboboxInput ref={input} id={id} aria-label="Record ID" />
            {draft && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Clear record ID"
                onClick={() => {
                  setDraft("")
                  input.current?.focus()
                }}
              >
                <X />
              </Button>
            )}
            <ComboboxTrigger aria-label="Show records" />
          </ComboboxInputGroup>
          <ComboboxContent>
            {status === "loading" && <p role="status">Loading records…</p>}
            {status === "error" && (
              <div className="input-adoption-error">
                <p role="alert">Could not load records.</p>
                <Button variant="outline" size="sm" onClick={() => void load()}>
                  Retry
                </Button>
              </div>
            )}
            {status === "ready" && (
              <ComboboxEmpty>No suggestions.</ComboboxEmpty>
            )}
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <Button variant="outline" onClick={() => setDraft(initialValue)}>
        Restore saved ID
      </Button>
    </section>
  )
}

const steps = ["Collect", "Review"]

/** Controlled Dialog with SVG openers; keep this integration in the host. */
export function SvgDialogExample() {
  const id = useId()
  const [visible, setVisible] = useState(steps)
  const [selected, setSelected] = useState(steps[0])
  const [open, setOpen] = useState(false)
  const opener = useRef<SVGRectElement | null>(null)
  const fallback = useRef<HTMLButtonElement>(null)
  const inspect = (step: string, element: SVGRectElement) => {
    opener.current = element
    setSelected(step)
    setOpen(true)
  }
  const onKeyDown = (event: KeyboardEvent<SVGRectElement>, step: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      inspect(step, event.currentTarget)
    }
  }
  return (
    <section
      className="input-adoption-section"
      aria-labelledby={`${id}-heading`}
    >
      <h3 id={`${id}-heading`}>Review a sequence</h3>
      {/* SVG geometry requires an SVG root; the group exposes its interactive parts. */}
      <svg
        viewBox="0 0 320 100"
        role="group"
        aria-label="Sample sequence"
        className="input-adoption-sequence"
      >
        {visible.map((step) => {
          const x = steps.indexOf(step) * 160 + 8
          return (
            <g key={step}>
              <rect
                x={x}
                y={12}
                width={144}
                height={72}
                rx={6}
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${step}`}
                onClick={(event) => inspect(step, event.currentTarget)}
                onKeyDown={(event) => onKeyDown(event, step)}
              />
              <text x={x + 72} y={54} textAnchor="middle" aria-hidden="true">
                {step}
              </text>
            </g>
          )
        })}
      </svg>
      <Button
        ref={fallback}
        variant="outline"
        onClick={() => setVisible(steps)}
      >
        Reset sequence
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          finalFocus={() => {
            // Base UI's default focus target is HTML. Focus connected SVG targets
            // explicitly, returning false to prevent a second default focus move.
            if (opener.current?.isConnected) {
              opener.current.focus()
              return false
            }
            return fallback.current?.isConnected ? fallback.current : true
          }}
        >
          <DialogHeader>
            <DialogTitle>{selected}</DialogTitle>
            <DialogDescription>
              Review this step in the sequence.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                setVisible((current) =>
                  current.filter((step) => step !== selected)
                )
                setOpen(false)
              }}
            >
              Remove step
            </Button>
            <DialogClose render={<Button variant="outline" />}>
              Done
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export function InputAdoptionExample() {
  return (
    <div className="input-adoption-examples">
      <FreeEntryComboboxExample />
      <SvgDialogExample />
    </div>
  )
}
