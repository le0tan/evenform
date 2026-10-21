import { useShowcasePreview } from "./use-showcase-preview"
import { useEffect, useRef, useState } from "react"
import type { EventInput } from "@fullcalendar/react"
import {
  GradientPicker,
  gradientToCss,
  type GradientValue,
} from "@/components/ui/gradient-picker"
import {
  ImageEditor,
  type ImageEditorValue,
} from "@/components/ui/image-editor"
import { EventCalendar, type CalendarRef } from "@/components/ui/event-calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const initialGradient: GradientValue = {
  type: "linear",
  angle: 135,
  stops: [
    { id: "start", color: "#275DAD", offset: 0 },
    { id: "end", color: "#75C8AE", offset: 100 },
  ],
}
function GradientExample() {
  const [value, setValue] = useState(initialGradient)
  const [disabled, setDisabled] = useState(false)
  return (
    <div className="design-tools-example">
      <p className="design-tools-note">
        Edit each color and position, add or remove stops, reverse the gradient,
        or switch to a radial blend. These colors belong to the document being
        edited.
      </p>
      <div className="toolbar">
        <Button
          variant="outline"
          aria-pressed={disabled}
          onClick={() => setDisabled(!disabled)}
        >
          Disable gradient controls
        </Button>
        <Button variant="ghost" onClick={() => setValue(initialGradient)}>
          Reset gradient
        </Button>
      </div>
      <div className="design-tools-columns">
        <GradientPicker
          label="Background gradient"
          value={value}
          onValueChange={setValue}
          disabled={disabled}
        />
        <div className="design-tools-example">
          <h3 className="font-medium">CSS result</h3>
          <output className="design-tools-output" aria-label="Gradient CSS">
            {gradientToCss(value)}
          </output>
          <p className="design-tools-note">
            The editor emits a structured model. Applications can use the CSS
            helper for a preview or save the model with their own document.
          </p>
        </div>
      </div>
    </div>
  )
}
const sampleGraphic = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#e8edf1"/><rect x="32" y="32" width="576" height="336" rx="8" fill="#fbfcfd"/><circle cx="190" cy="200" r="112" fill="#275dad"/><rect x="290" y="96" width="192" height="208" fill="#75c8ae"/><circle cx="478" cy="200" r="64" fill="#e7a45e"/><path d="M64 336H576" stroke="#334155" stroke-width="2"/></svg>')}`
const initialImage: ImageEditorValue = {
  mode: "fit",
  rotation: 0,
  brightness: 1,
  contrast: 1,
  saturation: 1,
  blur: 0,
  crop: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
  position: { x: 0.5, y: 0.5 },
  tileSize: 35,
}
function ImageExample() {
  const [value, setValue] = useState(initialImage)
  const [source, setSource] = useState({
    src: sampleGraphic,
    alt: "Local vector color study: blue circle, green rectangle and orange circle",
  })
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [disabled, setDisabled] = useState(false)
  const ownedUrl = useRef<string | null>(null)
  useEffect(
    () => () => {
      if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current)
    },
    []
  )
  function selectFile(file: File) {
    const url = URL.createObjectURL(file)
    if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current)
    ownedUrl.current = url
    setSource({ src: url, alt: `Selected image: ${file.name}` })
    setFileName(file.name)
    setError("")
  }
  function resetSource() {
    if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current)
    ownedUrl.current = null
    setSource({
      src: sampleGraphic,
      alt: "Local vector color study: blue circle, green rectangle and orange circle",
    })
    setFileName("")
    setError("")
    setValue(initialImage)
  }
  return (
    <div className="design-tools-example">
      <p className="design-tools-note">
        A local vector color study demonstrates fit, fill, source-relative crop,
        tile, rotation and CSS adjustments. Choose your own image to try the
        same controls. This page owns and revokes its object URLs.
      </p>
      <div className="toolbar">
        <Button
          variant="outline"
          aria-pressed={disabled}
          onClick={() => setDisabled(!disabled)}
        >
          Disable image controls
        </Button>
        <Button variant="ghost" onClick={() => setValue(initialImage)}>
          Reset adjustments
        </Button>
        <Button variant="ghost" onClick={resetSource}>
          Use local color study
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="design-tools-columns">
        <ImageEditor
          value={value}
          onValueChange={setValue}
          src={source.src}
          alt={source.alt}
          disabled={disabled}
          maxFileSize={10 * 1024 * 1024}
          onFileSelect={selectFile}
          onFilesRejected={(rejections) =>
            setError(
              rejections
                .map((item) => `${item.file.name}: ${item.message}`)
                .join(" ")
            )
          }
        />
        <div className="design-tools-example">
          <h3 className="font-medium">Rendering configuration</h3>
          <p className="design-tools-note">
            {fileName
              ? `Selected locally: ${fileName}`
              : "Source: inline SVG geometry."}{" "}
            Nothing is uploaded or exported.
          </p>
          <output
            aria-label="Image configuration"
            className="design-tools-output"
          >
            {JSON.stringify(value, null, 2)}
          </output>
          <p className="design-tools-note">
            Crop coordinates are normalized to the source image. Width and
            height stay within the source bounds; CSS filters and rotation apply
            to the rendered result.
          </p>
        </div>
      </div>
    </div>
  )
}
const initialEvents: EventInput[] = [
  {
    id: "review",
    title: "Keyboard review",
    start: "2026-10-21T09:30:00Z",
    end: "2026-10-21T10:30:00Z",
  },
  {
    id: "handover",
    title: "Handover checkpoint",
    start: "2026-10-22T14:00:00Z",
    end: "2026-10-22T15:00:00Z",
  },
  {
    id: "notes",
    title: "Research notes",
    start: "2026-10-20",
    end: "2026-10-22",
    allDay: true,
  },
]
function EventCalendarExample() {
  const calendar = useRef<CalendarRef>(null)
  const [events, setEvents] = useState(initialEvents)
  const [title, setTitle] = useState("")
  const [start, setStart] = useState("2026-10-21T11:00")
  const [selected, setSelected] = useState<string | null>(null)
  const [message, setMessage] = useState("Events stay in this page’s memory.")
  const current = events.find((event) => event.id === selected)
  function addEvent() {
    const parsed = new Date(`${start}Z`)
    if (!title.trim() || !Number.isFinite(parsed.getTime())) return
    const event = {
      id: crypto.randomUUID(),
      title: title.trim(),
      start: parsed.toISOString(),
      end: new Date(parsed.getTime() + 60 * 60 * 1000).toISOString(),
    }
    setEvents([...events, event])
    setTitle("")
    setSelected(event.id)
    setMessage("Event added to this preview.")
  }
  return (
    <div className="design-tools-example">
      <p className="design-tools-note">
        A FullCalendar event grid with month, week and day views. Dates are
        shown in UTC. Activate an event with Enter or Space to show its details;
        drag or resize timed events to update page-owned state.
      </p>
      <form
        className="design-tools-calendar-form"
        onSubmit={(event) => {
          event.preventDefault()
          addEvent()
        }}
      >
        <label>
          Event title
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <label>
          Start time (UTC)
          <Input
            type="datetime-local"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            required
          />
        </label>
        <Button type="submit" disabled={!title.trim() || !start}>
          Add one-hour event
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => calendar.current?.getApi().gotoDate("2026-10-21")}
        >
          Return to sample dates
        </Button>
      </form>
      <EventCalendar
        ref={calendar}
        label="Review workspace event calendar"
        events={events}
        initialDate="2026-10-21"
        timeZone="UTC"
        editable
        selectable
        slotMinTime="07:00:00"
        slotMaxTime="19:00:00"
        eventClick={(info) => {
          info.jsEvent.preventDefault()
          setSelected(info.event.id)
          setMessage(`Selected ${info.event.title}.`)
        }}
        dateClick={(info) => {
          setStart(
            info.allDay
              ? `${info.dateStr.slice(0, 10)}T11:00`
              : info.dateStr.slice(0, 16)
          )
          setMessage(`New event date set to ${info.dateStr.slice(0, 10)}.`)
        }}
        eventChange={(info) => {
          setEvents((previous) =>
            previous.map((event) =>
              event.id === info.event.id
                ? {
                    ...event,
                    start: info.event.startStr,
                    end: info.event.endStr || undefined,
                    allDay: info.event.allDay,
                  }
                : event
            )
          )
          setMessage(`${info.event.title} updated in this preview.`)
        }}
        select={(info) => {
          setStart(
            info.allDay
              ? `${info.startStr.slice(0, 10)}T11:00`
              : info.startStr.slice(0, 16)
          )
          setMessage("Selected date range. Choose a title to add an event.")
          calendar.current?.getApi().unselect()
        }}
      />
      <p role="status" className="design-tools-note">
        {message}
      </p>
      {current && (
        <section
          className="design-tools-example"
          aria-label="Selected calendar event"
        >
          <h3 className="font-medium">{current.title}</h3>
          <p className="design-tools-note">
            {String(current.start)}
            {current.end ? ` → ${String(current.end)}` : ""}
          </p>
          <div className="toolbar">
            <Button
              variant="outline"
              onClick={() => {
                setEvents((previous) =>
                  previous.filter((event) => event.id !== selected)
                )
                setSelected(null)
                setMessage("Event removed from this preview.")
              }}
            >
              Remove selected event
            </Button>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Close event details
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
export function DesignToolsGallery() {
  const [preview, setPreview] = useShowcasePreview("components", "tools", ["gradient", "image", "calendar"], "gradient")
  return (
    <div className="design-tools-gallery">
      <div>
        <h2>Visual editing and event planning</h2>
        <p className="design-tools-note">
          Controlled document values, genuine preview rendering, and a mature
          event calendar.
        </p>
      </div>
      <Tabs value={preview} onValueChange={setPreview}>
        <TabsList>
          <TabsTrigger value="gradient">Gradient picker</TabsTrigger>
          <TabsTrigger value="image">Image editor</TabsTrigger>
          <TabsTrigger value="calendar">Event calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="gradient">
          <div role="group" aria-label="Gradient picker example" id="example-gradient-picker" className="showcase-example"><GradientExample /></div>
        </TabsContent>
        <TabsContent value="image">
          <div role="group" aria-label="Image editor example" id="example-image-editor" className="showcase-example"><ImageExample /></div>
        </TabsContent>
        <TabsContent value="calendar">
          <div role="group" aria-label="Event calendar example" id="example-event-calendar" className="showcase-example"><EventCalendarExample /></div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
