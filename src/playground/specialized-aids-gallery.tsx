import { useRef, useState, type CSSProperties } from "react"
import { PageSection } from "@/components/patterns/layouts"
import { Button } from "@/components/ui/button"
import { Countdown } from "@/components/ui/countdown"
import { Input } from "@/components/ui/input"
import {
  Mention,
  Mentions,
  type MentionSearchContext,
  type MentionsInputHandle,
} from "@/components/ui/mentions"
import { Text } from "@/components/ui/typography"
import { Watermark } from "@/components/ui/watermark"

const reviewers = [
  { id: "sam", display: "Sam Rivera", team: "Design" },
  { id: "jordan", display: "Jordan Lee", team: "Engineering" },
  { id: "alex", display: "Alex Morgan", team: "Research" },
  { id: "taylor", display: "Taylor Chen", team: "Product" },
]
async function findReviewers(query: string, { signal }: MentionSearchContext) {
  await new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason)
      return
    }
    const finish = () => {
      signal.removeEventListener("abort", abort)
      resolve()
    }
    const timer = setTimeout(finish, 180)
    const abort = () => {
      clearTimeout(timer)
      reject(signal.reason)
    }
    signal.addEventListener("abort", abort, { once: true })
  })
  return reviewers.filter((person) =>
    person.display.toLowerCase().includes(query.toLowerCase())
  )
}
const mentionDisplay = (id: string | number, display?: string | null) =>
  `@${display ?? id}`

function MentionsExample() {
  const [value, setValue] = useState("Please review ")
  const [plainText, setPlainText] = useState("Please review ")
  const [selected, setSelected] = useState<string[]>([])
  const input = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const handle = useRef<MentionsInputHandle>(null)
  return (
    <div className="evenform-specialized-stack">
      <label htmlFor="specialized-mentions">Review note</label>
      <Mentions<{ team: string }>
        ref={handle}
        inputRef={(element) => {
          input.current = element
        }}
        id="specialized-mentions"
        value={value}
        aria-describedby="specialized-mentions-help"
        placeholder="Type @ to find a reviewer"
        onMentionsChange={(change) => {
          setValue(change.value)
          setPlainText(change.plainTextValue)
          setSelected(change.mentions.map((mention) => mention.display))
        }}
      >
        <Mention<{ team: string }>
          trigger="@"
          data={findReviewers}
          debounceMs={120}
          appendSpaceOnAdd
          displayTransform={mentionDisplay}
          renderSuggestion={(person, _query, highlighted) => (
            <span className="evenform-specialized-person">
              <span>{highlighted}</span>
              <span className="text-caption text-muted-foreground">
                {person.team}
              </span>
            </span>
          )}
          renderEmpty={(query) => `No reviewers match “${query}”.`}
          renderError={() =>
            "Reviewers could not be loaded. Type @ to try again."
          }
        />
      </Mentions>
      <Text id="specialized-mentions-help" tone="muted" size="caption">
        Type @ to mention a reviewer. Use arrow keys to choose and Enter to insert.
      </Text>
      <div>
        <Button
          size="sm"
          variant="outline"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            input.current?.focus()
            handle.current?.insertText("Please check the reference. ")
          }}
        >
          Insert text at caret
        </Button>
      </div>
      <dl className="evenform-specialized-output">
        <div>
          <dt>Plain text</dt>
          <dd>{plainText || "Empty note"}</dd>
        </div>
        <div>
          <dt>Mention markup</dt>
          <dd>
            <code>{value || "Empty note"}</code>
          </dd>
        </div>
        <div>
          <dt>Selected reviewers</dt>
          <dd>{selected.length ? selected.join(", ") : "None selected"}</dd>
        </div>
      </dl>
    </div>
  )
}
function CountdownExample() {
  const [target, setTarget] = useState(() => Date.now() + 15000)
  const [running, setRunning] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [completionCount, setCompletionCount] = useState(0)
  return (
    <div className="evenform-specialized-stack">
      <div className="evenform-specialized-countdown">
        <span>Local review window</span>
        <Countdown
          target={target}
          running={running}
          onComplete={() => {
            setCompleted(true)
            setCompletionCount((count) => count + 1)
          }}
          aria-label="Local review time remaining"
        />
      </div>
      <div className="flex flex-wrap gap-toolbar">
        <Button
          variant="outline"
          disabled={completed}
          onClick={() => setRunning((value) => !value)}
        >
          {running ? "Pause" : "Resume"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setTarget(Date.now() + 15000)
            setRunning(true)
            setCompleted(false)
          }}
        >
          Restart 15 seconds
        </Button>
        <Button
          variant="ghost"
          disabled={completed}
          onClick={() => {
            setTarget(Date.now() - 1)
            setRunning(true)
          }}
        >
          Finish now
        </Button>
      </div>
      <Text role="status" size="caption" tone="muted">
        {completed
          ? "Review window complete."
          : running
            ? "Countdown running."
            : "Countdown paused."}{" "}
        Completed cycles: {completionCount}.
      </Text>
    </div>
  )
}
function WatermarkExample() {
  const [text, setText] = useState("Review copy")
  const [acknowledged, setAcknowledged] = useState(false)
  const [opacity, setOpacity] = useState(12)
  return (
    <div className="evenform-specialized-stack">
      <div className="evenform-specialized-grid">
        <label className="evenform-specialized-stack">
          Visible watermark text
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={80}
          />
        </label>
        <label className="evenform-specialized-stack">
          Opacity: {opacity}%
          <Input
            type="range"
            style={{ accentColor: "var(--primary)" }}
            min={0}
            max={30}
            step={1}
            value={opacity}
            onChange={(event) => setOpacity(Number(event.target.value))}
          />
        </label>
      </div>
      <Watermark
        text={[text, "Local reference"]}
        className="evenform-specialized-watermark"
        style={{ "--ds-watermark-opacity": opacity / 100 } as CSSProperties}
      >
        <div className="evenform-specialized-stack">
          <h3>Reviewing a shared reference</h3>
          <p>
            Add a review note before sharing this reference with your team.
          </p>
          <label className="evenform-specialized-stack">
            Your review note
            <Input placeholder="Add a review note…" />
          </label>
          <div>
            <Button
              variant="outline"
              onClick={() => setAcknowledged((value) => !value)}
            >
              {acknowledged ? "Clear acknowledgment" : "Acknowledge reference"}
            </Button>
          </div>
          <Text role="status" tone="muted" size="caption">
            {acknowledged
              ? "Reference acknowledged in this preview."
              : "Awaiting acknowledgment."}
          </Text>
        </div>
      </Watermark>
      <Watermark image={`${import.meta.env.BASE_URL}favicon.svg`} className="evenform-specialized-watermark">
        <div className="evenform-specialized-stack">
          <h3>Image watermark</h3>

        </div>
      </Watermark>
    </div>
  )
}
function SpecializedAidsGallery() {
  return (
    <div className="evenform-specialized-gallery">
      <PageSection
        title="Mentions at the caret"

      >
        <div role="group" aria-label="Mentions example" id="example-mentions" className="showcase-example"><MentionsExample /></div>
      </PageSection>
      <PageSection
        title="Countdown with a target"

      >
        <div role="group" aria-label="Countdown example" id="example-countdown" className="showcase-example"><CountdownExample /></div>
      </PageSection>
      <PageSection
        title="Visual watermarks"

      >
        <div role="group" aria-label="Watermark example" id="example-watermark" className="showcase-example"><WatermarkExample /></div>
      </PageSection>
    </div>
  )
}

export { SpecializedAidsGallery }
