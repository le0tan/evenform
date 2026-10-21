import { useShowcasePreview } from "./use-showcase-preview"
import { useState } from "react"
import { CalendarDate } from "@internationalized/date"
import {
  CalendarAgenda,
  AgendaDay,
  AgendaEvent,
} from "@/components/patterns/calendar-agenda"
import { HeaderShell } from "@/components/patterns/header-layout"
import { StepForm } from "@/components/patterns/step-form"
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/patterns/description-list"
import { FormField } from "@/components/patterns/layouts"
import { StatusMessage } from "@/components/patterns/status-message"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const agendaEvents = [
  {
    id: "review",
    day: 21,
    title: "Keyboard review",
    start: "09:30",
    end: "10:00",
    location: "Workspace call",
    description: "Walk through the review checklist and record open questions.",
  },
  {
    id: "handover",
    day: 21,
    title: "Handover checkpoint",
    start: "14:00",
    end: "14:30",
    location: "Review room",
    description: "Confirm ownership and the next milestone.",
  },
  {
    id: "notes",
    day: 22,
    title: "Research notes",
    start: "11:00",
    end: "12:00",
    location: "Workspace call",
    description: "Read the interview summary and agree on follow-up questions.",
  },
]
function AgendaExample() {
  const [date, setDate] = useState(new CalendarDate(2026, 10, 21))
  const [selected, setSelected] = useState<string | null>(null)
  const key = date.toString()
  const events = agendaEvents.filter((item) => key === `2026-10-${item.day}`)
  return (
    <div className="workflow-aids-example">
      <p className="workflow-aids-note">
        Choose a date to view its events. These illustrative entries are shown
        in Singapore time (UTC+08:00); the application supplies date and
        timezone formatting.
      </p>
      <div className="workflow-agenda-columns">
        <div>
          <Calendar
            aria-label="Choose agenda date"
            value={date}
            onChange={(next) => {
              setDate(new CalendarDate(next.year, next.month, next.day))
              setSelected(null)
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDate(new CalendarDate(2026, 10, 21))
              setSelected(null)
            }}
          >
            Return to 21 October
          </Button>
        </div>
        <CalendarAgenda aria-label="Selected date agenda">
          <AgendaDay
            date={
              <time dateTime={key}>
                {new Intl.DateTimeFormat("en-SG", {
                  dateStyle: "full",
                  timeZone: "Asia/Singapore",
                }).format(date.toDate("Asia/Singapore"))}
              </time>
            }
            empty={
              events.length === 0 ? (
                <p className="workflow-aids-note">
                  No events scheduled for this date. Choose 21 or 22 October to
                  explore the example events.
                </p>
              ) : undefined
            }
          >
            {events.map((item) => (
              <AgendaEvent
                key={item.id}
                title={item.title}
                time={
                  <>
                    <time dateTime={`${key}T${item.start}:00+08:00`}>
                      {item.start}
                    </time>
                    –
                    <time dateTime={`${key}T${item.end}:00+08:00`}>
                      {item.end}
                    </time>
                  </>
                }
                meta={item.location}
                actions={
                  <Button
                    size="sm"
                    variant="outline"
                    aria-expanded={selected === item.id}
                    onClick={() =>
                      setSelected(selected === item.id ? null : item.id)
                    }
                  >
                    {selected === item.id ? "Hide details" : "View details"}
                  </Button>
                }
              >
                {selected === item.id ? item.description : undefined}
              </AgendaEvent>
            ))}
          </AgendaDay>
          <p role="status" className="workflow-aids-note">
            {events.length} {events.length === 1 ? "event" : "events"} on the
            selected date.
          </p>
        </CalendarAgenda>
      </div>
    </div>
  )
}
function StepFormExample() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [summary, setSummary] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [complete, setComplete] = useState(false)
  function validate(index: number) {
    const next: Record<string, string> = {}
    if (index === 0) {
      if (!name.trim()) next.name = "Enter the workspace owner’s name."
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        next.email = "Enter a valid owner email address."
    }
    if (index === 1 && summary.trim().length < 12)
      next.summary = "Describe the review scope in at least 12 characters."
    if (index === 2 && !confirmed)
      next.confirmed = "Confirm the handover details before finishing."
    setErrors(next)
    if (Object.keys(next).length)
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>(
            "#workflow-step-preview [aria-invalid='true']"
          )
          ?.focus()
      )
    return Object.keys(next).length === 0
  }
  function changeStep(next: number, direction: "next" | "previous") {
    if (direction === "previous" || validate(step)) {
      setErrors({})
      setStep(next)
    }
  }
  function finish() {
    if (validate(2)) setComplete(true)
  }
  const steps = [
    {
      id: "owner",
      title: "Owner",
      description: "Choose who will receive handover questions.",
    },
    {
      id: "scope",
      title: "Review scope",
      description: "Explain what the next reviewer should check.",
    },
    {
      id: "confirm",
      title: "Confirm",
      description: "Review the details before completing this preview.",
    },
  ]
  return (
    <div className="workflow-aids-example">
      <p className="workflow-aids-note">
        The page controls the current step and validates each transition. Back
        preserves entered data. This preview creates no workspace or invitation.
      </p>
      {complete ? (
        <div className="workflow-aids-example">
          <StatusMessage
            tone="success"
            role="status"
            title="Handover details confirmed"
          >
            {name} is the owner in this preview. No data was sent.
          </StatusMessage>
          <Button
            className="self-start"
            variant="outline"
            onClick={() => {
              setComplete(false)
              setStep(0)
              setConfirmed(false)
              setErrors({})
            }}
          >
            Review details again
          </Button>
        </div>
      ) : (
        <form
          id="workflow-step-preview"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (step < 2) changeStep(step + 1, "next")
            else finish()
          }}
        >
          <StepForm
            steps={steps.map((item, index) => ({
              ...item,
              status:
                index === step && Object.keys(errors).length
                  ? ("error" as const)
                  : undefined,
            }))}
            currentStep={step}
            onStepChange={changeStep}
            onComplete={finish}
            completeLabel="Confirm handover"
            status={
              Object.keys(errors).length ? (
                <span role="alert">
                  Review the highlighted fields to continue.
                </span>
              ) : undefined
            }
          >
            {step === 0 ? (
              <div className="workflow-aids-example">
                <FormField
                  id="workflow-owner-name"
                  label="Owner name"
                  error={errors.name}
                >
                  <Input
                    id="workflow-owner-name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    aria-invalid={Boolean(errors.name) || undefined}
                    aria-describedby={
                      errors.name ? "workflow-owner-name-error" : undefined
                    }
                  />
                </FormField>
                <FormField
                  id="workflow-owner-email"
                  label="Owner email"
                  error={errors.email}
                >
                  <Input
                    id="workflow-owner-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(errors.email) || undefined}
                    aria-describedby={
                      errors.email ? "workflow-owner-email-error" : undefined
                    }
                  />
                </FormField>
              </div>
            ) : step === 1 ? (
              <FormField
                id="workflow-review-scope"
                label="What should the reviewer check?"
                description="Include the main task and any open questions."
                error={errors.summary}
              >
                <Textarea
                  id="workflow-review-scope"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  aria-invalid={Boolean(errors.summary) || undefined}
                  aria-describedby={
                    errors.summary
                      ? "workflow-review-scope-description workflow-review-scope-error"
                      : "workflow-review-scope-description"
                  }
                />
              </FormField>
            ) : (
              <div className="workflow-aids-example">
                <DescriptionList>
                  <DescriptionItem label="Owner">{name}</DescriptionItem>
                  <DescriptionItem label="Email">{email}</DescriptionItem>
                  <DescriptionItem label="Review scope">
                    {summary}
                  </DescriptionItem>
                </DescriptionList>
                <label className="flex items-start gap-field">
                  <Checkbox
                    checked={confirmed}
                    onCheckedChange={(next) => setConfirmed(Boolean(next))}
                    aria-invalid={Boolean(errors.confirmed) || undefined}
                    aria-describedby={
                      errors.confirmed ? "workflow-confirm-error" : undefined
                    }
                  />
                  <span>I have checked the owner and review scope.</span>
                </label>
                {errors.confirmed && (
                  <p
                    id="workflow-confirm-error"
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {errors.confirmed}
                  </p>
                )}
              </div>
            )}
          </StepForm>
        </form>
      )}
    </div>
  )
}
function HeaderExample() {
  const [section, setSection] = useState("overview")
  return (
    <div className="workflow-aids-example">
      <p className="workflow-aids-note">
        A header-based workspace with optional section navigation and footer.
        This embedded preview explicitly uses contentAs="div" because the
        Showcase already owns the page’s main landmark. Standalone HeaderShell
        defaults to one main with a skip link.
      </p>
      <HeaderShell
        className="workflow-shell-preview"
        contentAs="div"
        skipLabel="Skip to header shell preview content"
        header={
          <>
            <span className="font-semibold">Review workspace</span>
            <span className="workflow-aids-note ml-auto">
              Header layout preview
            </span>
          </>
        }
        secondaryNavigation={
          <>
            {[
              { id: "overview", label: "Overview" },
              { id: "checklist", label: "Review checklist" },
            ].map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={section === item.id ? "secondary" : "ghost"}
                aria-pressed={section === item.id}
                onClick={() => setSection(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </>
        }
        secondaryNavigationLabel="Preview workspace sections"
        footer="Illustrative workspace · Content and navigation are supplied by the application."
      >
        {section === "overview" ? (
          <section aria-labelledby="workflow-shell-overview">
            <h3 id="workflow-shell-overview" className="workflow-shell-heading">
              A focused review workspace
            </h3>
            <p className="workflow-shell-copy">
              Use a header layout when navigation fits alongside the workspace
              identity. The main region stays readable, while section navigation
              and supporting footer content share the same content alignment.
            </p>
          </section>
        ) : (
          <section aria-labelledby="workflow-shell-checklist">
            <h3
              id="workflow-shell-checklist"
              className="workflow-shell-heading"
            >
              Review checklist
            </h3>
            <DescriptionList>
              <DescriptionItem label="Ownership">
                Confirm the person receiving questions.
              </DescriptionItem>
              <DescriptionItem label="Keyboard access">
                Check focus order and visible focus.
              </DescriptionItem>
              <DescriptionItem label="Handover">
                Record open questions and the next checkpoint.
              </DescriptionItem>
            </DescriptionList>
          </section>
        )}
      </HeaderShell>
    </div>
  )
}
export function WorkflowAidsGallery() {
  const [preview, setPreview] = useShowcasePreview("patterns", "workflow", ["agenda", "form", "header"], "agenda")
  return (
    <div className="workflow-aids-gallery">
      <div>
        <h2>Schedules and guided work</h2>
        <p className="workflow-aids-note">
          Agenda groups, controlled step navigation, and a header shell for
          focused workspaces.
        </p>
      </div>
      <Tabs value={preview} onValueChange={setPreview}>
        <TabsList>
          <TabsTrigger value="agenda">Calendar agenda</TabsTrigger>
          <TabsTrigger value="form">Step form</TabsTrigger>
          <TabsTrigger value="header">Header layout</TabsTrigger>
        </TabsList>
        <TabsContent value="agenda">
          <div role="group" aria-label="Calendar agenda example" id="example-calendar-agenda" className="showcase-example"><AgendaExample /></div>
        </TabsContent>
        <TabsContent value="form">
          <div role="group" aria-label="Step form example" id="example-step-form" className="showcase-example"><StepFormExample /></div>
        </TabsContent>
        <TabsContent value="header">
          <div role="group" aria-label="Header layout example" id="example-header-layout" className="showcase-example"><HeaderExample /></div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
